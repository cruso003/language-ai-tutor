/**
 * Google Calendar Service - Complete OAuth2 integration
 * Features: OAuth flow, token management, event CRUD
 */

import { google } from 'googleapis';
import { getDb } from '../db';
import { integrations, calendarEvents } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

export class CalendarService {
  /**
   * Create OAuth2 client
   */
  private getOAuthClient(redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Google Calendar not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(redirectUri: string, state?: string): string {
    const oauth2Client = this.getOAuthClient(redirectUri);
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      state: state,
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode({ 
    code, 
    redirectUri, 
    userId 
  }: { 
    code: string; 
    redirectUri: string; 
    userId: string; 
  }): Promise<{ connected: boolean }> {
    const oauth2Client = this.getOAuthClient(redirectUri);
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('Failed to obtain access token');
    }

    const db = getDb();
    if (!db) throw new Error('Database not available');

    // Check if integration already exists
    const existing = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'google-calendar')
        )
      )
      .limit(1);

    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    if (existing.length > 0) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existing[0].refreshToken,
          expiresAt,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existing[0].id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'google-calendar',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        config: {},
        isActive: true,
      });
    }

    return { connected: true };
  }

  /**
   * Get authenticated calendar client for user
   */
  private async getAuthedCalendar(userId: string) {
    const db = getDb();
    if (!db) throw new Error('Database not available');

    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'google-calendar'),
          eq(integrations.isActive, true)
        )
      )
      .limit(1);

    if (!integration || !integration.accessToken) {
      return null;
    }

    const oauth2Client = this.getOAuthClient(
      process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/calendar/callback` : 'http://localhost:3000/calendar/callback'
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken || undefined,
      expiry_date: integration.expiresAt ? integration.expiresAt.getTime() : undefined,
    });

    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        await db
          .update(integrations)
          .set({
            accessToken: tokens.access_token || integration.accessToken,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      } else if (tokens.access_token) {
        await db
          .update(integrations)
          .set({
            accessToken: tokens.access_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      }
    });

    return oauth2Client;
  }

  /**
   * List calendar events
   */
  async listEvents(
    userId: string, 
    { 
      timeMin, 
      timeMax, 
      maxResults = 20 
    }: { 
      timeMin?: string; 
      timeMax?: string; 
      maxResults?: number; 
    }
  ): Promise<any[]> {
    const auth = await this.getAuthedCalendar(userId);
    if (!auth) {
      throw new Error('Google Calendar not connected. Please connect your calendar first.');
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  /**
   * Create calendar event
   */
  async createEvent(
    userId: string, 
    evt: { 
      title: string; 
      description?: string; 
      start: string; 
      end: string;
      skillPackId?: string;
    }
  ): Promise<any> {
    const auth = await this.getAuthedCalendar(userId);
    if (!auth) {
      throw new Error('Google Calendar not connected. Please connect your calendar first.');
    }

    const calendar = google.calendar({ version: 'v3', auth });

    // Create event in Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: evt.title,
        description: evt.description,
        start: {
          dateTime: evt.start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: evt.end,
          timeZone: 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 1440 }, // 1 day before
          ],
        },
      },
    });

    // Store event reference in local database
    const db = getDb();
    if (db) {
      try {
        await db.insert(calendarEvents).values({
          userId,
          externalEventId: response.data.id || null,
          title: evt.title,
          description: evt.description || null,
          startTime: new Date(evt.start),
          endTime: new Date(evt.end),
          skillPackId: evt.skillPackId || null,
        });
      } catch (err) {
        console.warn('Failed to store calendar event locally:', err);
      }
    }

    return response.data;
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const auth = await this.getAuthedCalendar(userId);
    if (!auth) {
      throw new Error('Google Calendar not connected');
    }

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    // Remove from local database
    const db = getDb();
    if (db) {
      try {
        await db
          .delete(calendarEvents)
          .where(
            and(
              eq(calendarEvents.userId, userId),
              eq(calendarEvents.externalEventId, eventId)
            )
          );
      } catch (err) {
        console.warn('Failed to delete calendar event from local database:', err);
      }
    }
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnect(userId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new Error('Database not available');

    await db
      .update(integrations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'google-calendar')
        )
      );
  }
}
