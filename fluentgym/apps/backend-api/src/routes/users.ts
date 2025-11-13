/**
 * Users API - User registration, profiles, preferences, and privacy
 * Migrated from Supabase to Drizzle ORM
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { badRequest, notFound, internal, unauthorized } from '../utils/errors.js';

// Validation schemas
const CreateUserSchema = z.object({
  email: z.string().email(),
  authProviderId: z.string().min(1),
  displayName: z.string().min(1).optional(),
  targetLanguage: z.string().optional(),
  nativeLanguage: z.string().optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'fluent']).optional(),
  interests: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

const UpdateUserProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  targetLanguage: z.string().optional(),
  nativeLanguage: z.string().optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'fluent']).optional(),
  interests: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

const MigrateSchema = z.object({
  anonymousUserId: z.string().uuid(),
});

export async function registerUserRoutes(app: FastifyInstance) {
  const db = getDb();
  if (!db) {
    app.log.error('Database not initialized in users routes');
    return;
  }

  /**
   * POST /api/v1/users
   * Create a new user with profile
   */
  app.post('/api/v1/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateUserSchema.safeParse(request.body);
    if (!parsed.success) {
      throw badRequest('Invalid user data', parsed.error.format());
    }

    const { email, authProviderId, displayName, targetLanguage, nativeLanguage, proficiencyLevel, interests, timezone } = parsed.data;

    try {
      // Check if user already exists
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (existing.length > 0) {
        throw badRequest('User with this email already exists', { email });
      }

      // Create user
      const [newUser] = await db.insert(schema.users).values({
        email,
        authProviderId,
        totalXp: 0,
        sessionsCompleted: 0,
      }).returning();

      // Create profile if any profile fields provided
      if (displayName || targetLanguage || nativeLanguage || proficiencyLevel || interests || timezone) {
        await db.insert(schema.userProfiles).values({
          userId: newUser.id,
          displayName,
          targetLanguage,
          nativeLanguage,
          proficiencyLevel,
          interests: interests || [],
          timezone,
        });
      }

      // Fetch user with profile
      const userWithProfile = await db.select({
        id: schema.users.id,
        email: schema.users.email,
        authProviderId: schema.users.authProviderId,
        totalXp: schema.users.totalXp,
        sessionsCompleted: schema.users.sessionsCompleted,
        createdAt: schema.users.createdAt,
        profile: {
          displayName: schema.userProfiles.displayName,
          targetLanguage: schema.userProfiles.targetLanguage,
          nativeLanguage: schema.userProfiles.nativeLanguage,
          proficiencyLevel: schema.userProfiles.proficiencyLevel,
          interests: schema.userProfiles.interests,
          timezone: schema.userProfiles.timezone,
        },
      })
        .from(schema.users)
        .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
        .where(eq(schema.users.id, newUser.id))
        .limit(1);

      return reply.status(201).send({
        user: userWithProfile[0],
        message: 'User created successfully',
      });
    } catch (error: any) {
      if (error.status) throw error; // Re-throw AppError
      app.log.error({ error, email }, 'user_creation_failed');
      throw internal('Failed to create user');
    }
  });

  /**
   * GET /api/v1/users/:id
   * Get user profile
   */
  app.get<{ Params: { id: string } }>('/api/v1/users/:id', async (request, reply) => {
    const { id } = request.params;

    if (!id) {
      throw badRequest('User ID required');
    }

    try {
      const userWithProfile = await db.select({
        id: schema.users.id,
        email: schema.users.email,
        authProviderId: schema.users.authProviderId,
        totalXp: schema.users.totalXp,
        sessionsCompleted: schema.users.sessionsCompleted,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        profile: {
          displayName: schema.userProfiles.displayName,
          targetLanguage: schema.userProfiles.targetLanguage,
          nativeLanguage: schema.userProfiles.nativeLanguage,
          proficiencyLevel: schema.userProfiles.proficiencyLevel,
          interests: schema.userProfiles.interests,
          timezone: schema.userProfiles.timezone,
        },
      })
        .from(schema.users)
        .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
        .where(eq(schema.users.id, id))
        .limit(1);

      if (!userWithProfile.length) {
        throw notFound('User not found', { userId: id });
      }

      return reply.status(200).send({ user: userWithProfile[0] });
    } catch (error: any) {
      if (error.status) throw error;
      app.log.error({ error, userId: id }, 'user_fetch_failed');
      throw internal('Failed to fetch user');
    }
  });

  /**
   * PATCH /api/v1/users/:id
   * Update user profile
   */
  app.patch<{ Params: { id: string } }>('/api/v1/users/:id', async (request, reply) => {
    const { id } = request.params;
    const parsed = UpdateUserProfileSchema.safeParse(request.body);

    if (!parsed.success) {
      throw badRequest('Invalid profile data', parsed.error.format());
    }

    const updates = parsed.data;

    try {
      // Check if user exists
      const existing = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      if (!existing.length) {
        throw notFound('User not found', { userId: id });
      }

      // Update user timestamp
      await db.update(schema.users)
        .set({ updatedAt: new Date() })
        .where(eq(schema.users.id, id));

      // Upsert profile
      const profileExists = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, id)).limit(1);

      if (profileExists.length) {
        await db.update(schema.userProfiles)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(schema.userProfiles.userId, id));
      } else {
        await db.insert(schema.userProfiles).values({
          userId: id,
          ...updates,
        });
      }

      // Fetch updated user with profile
      const userWithProfile = await db.select({
        id: schema.users.id,
        email: schema.users.email,
        totalXp: schema.users.totalXp,
        sessionsCompleted: schema.users.sessionsCompleted,
        updatedAt: schema.users.updatedAt,
        profile: {
          displayName: schema.userProfiles.displayName,
          targetLanguage: schema.userProfiles.targetLanguage,
          nativeLanguage: schema.userProfiles.nativeLanguage,
          proficiencyLevel: schema.userProfiles.proficiencyLevel,
          interests: schema.userProfiles.interests,
          timezone: schema.userProfiles.timezone,
        },
      })
        .from(schema.users)
        .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
        .where(eq(schema.users.id, id))
        .limit(1);

      return reply.status(200).send({
        user: userWithProfile[0],
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      if (error.status) throw error;
      app.log.error({ error, userId: id }, 'profile_update_failed');
      throw internal('Failed to update profile');
    }
  });

  /**
   * GET /api/v1/users/:id/export
   * Export all user data (GDPR compliance)
   */
  app.get<{ Params: { id: string } }>('/api/v1/users/:id/export', async (request, reply) => {
    const { id } = request.params;

    try {
      // Fetch all user data
      const user = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      if (!user.length) {
        throw notFound('User not found', { userId: id });
      }

      const profile = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, id));
      const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.userId, id));
      const memories = await db.select().from(schema.memoryEntries).where(eq(schema.memoryEntries.userId, id));
      const tokenUsage = await db.select().from(schema.tokenUsage).where(eq(schema.tokenUsage.userId, id));

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: user[0],
        profile: profile[0] || null,
        sessions: sessions.map(s => ({
          ...s,
          // Remove sensitive internal fields if needed
        })),
        memories: memories.map(m => ({
          id: m.id,
          summary: m.summary,
          tags: m.tags,
          createdAt: m.createdAt,
          // Exclude embedding vector for size
        })),
        tokenUsage: {
          totalRecords: tokenUsage.length,
          totalTokens: tokenUsage.reduce((sum, t) => sum + (t.totalTokens || 0), 0),
          records: tokenUsage,
        },
      };

      return reply.status(200).send(exportData);
    } catch (error: any) {
      if (error.status) throw error;
      app.log.error({ error, userId: id }, 'user_export_failed');
      throw internal('Failed to export user data');
    }
  });

  /**
   * DELETE /api/v1/users/:id
   * Delete user (cascades to sessions, memories, etc. via DB constraints)
   */
  app.delete<{ Params: { id: string } }>('/api/v1/users/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const deleted = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();

      if (!deleted.length) {
        throw notFound('User not found', { userId: id });
      }

      return reply.status(200).send({
        message: 'User deleted successfully',
        userId: id,
        deletedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.status) throw error;
      app.log.error({ error, userId: id }, 'user_deletion_failed');
      throw internal('Failed to delete user');
    }
  });

  /**
   * GET /api/v1/users/me - Authenticated identity info
   */
  app.get('/api/v1/users/me', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.SUPABASE_JWT_SECRET) {
      throw internal('Auth not configured');
    }
    if (!req.auth?.userId) {
      throw unauthorized('Missing or invalid token');
    }
    return reply.send({ userId: req.auth.userId, claims: req.auth.claims });
  });

  /**
   * POST /api/v1/users/migrate - Link anonymous UUID data to authenticated user
   */
  app.post('/api/v1/users/migrate', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.SUPABASE_JWT_SECRET) {
      throw internal('Auth not configured');
    }
    if (!req.auth?.userId) {
      throw unauthorized('Missing or invalid token');
    }

    const parsed = MigrateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest('Invalid payload', parsed.error.format());
    }

    const toUserId = req.auth!.userId;
    const fromUserId = parsed.data.anonymousUserId;

    try {
      // Reassign sessions and memories to authenticated user using Drizzle
      await db.update(schema.sessions)
        .set({ userId: toUserId })
        .where(eq(schema.sessions.userId, fromUserId));

      await db.update(schema.memoryEntries)
        .set({ userId: toUserId })
        .where(eq(schema.memoryEntries.userId, fromUserId));

      return reply.send({ migrated: true });
    } catch (err: any) {
      req.log.error({ err }, 'users_migrate_error');
      throw internal('Failed to migrate user data');
    }
  });
}
