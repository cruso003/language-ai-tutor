import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CalendarService } from '../services/CalendarService';
import { isAuthEnabled } from '../plugins/auth';

const calendar = new CalendarService();

export async function registerCalendarRoutes(app: FastifyInstance) {
  app.get('/api/v1/calendar/google/auth-url', async (req: FastifyRequest, reply: FastifyReply) => {
    const redirectUri = (req.query as any)?.redirectUri as string | undefined;
    if (!redirectUri) return reply.status(400).send({ error: 'Missing redirectUri' });
    try {
      const url = calendar.getAuthUrl(redirectUri, (req.headers['x-csrf-state'] as string | undefined));
      return reply.send({ url });
    } catch (err: any) {
      req.log.error({ err }, 'calendar_auth_url_error');
      return reply.status(500).send({ error: 'Calendar not configured' });
    }
  });

  app.post('/api/v1/calendar/google/exchange', async (req: FastifyRequest, reply: FastifyReply) => {
    const BodySchema = z.object({ code: z.string().min(10), redirectUri: z.string().url() });
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });

    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userId = (req.auth?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) return reply.status(400).send({ error: 'Missing user context' });

    try {
      const result = await calendar.exchangeCode({ ...parsed.data, userId });
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'calendar_exchange_error');
      return reply.status(500).send({ error: 'Failed to connect Google Calendar' });
    }
  });

  app.get('/api/v1/calendar/events', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userId = (req.auth?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) return reply.status(400).send({ error: 'Missing user context' });
    const { timeMin, timeMax, maxResults } = (req.query as any) || {};
    try {
      const items = await calendar.listEvents(userId, { timeMin, timeMax, maxResults: maxResults ? Number(maxResults) : undefined });
      return reply.send({ items });
    } catch (err: any) {
      req.log.error({ err }, 'calendar_list_error');
      return reply.status(500).send({ error: err.message || 'Failed to list events' });
    }
  });

  app.post('/api/v1/calendar/schedule', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userId = (req.auth?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) return reply.status(400).send({ error: 'Missing user context' });

    const BodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      start: z.string().datetime(),
      end: z.string().datetime(),
      skillPackId: z.string().uuid().optional(),
    });
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });

    try {
      const created = await calendar.createEvent(userId, parsed.data);
      return reply.send({ event: created });
    } catch (err: any) {
      req.log.error({ err }, 'calendar_create_error');
      return reply.status(500).send({ error: err.message || 'Failed to create event' });
    }
  });

  // Delete calendar event
  app.delete('/api/v1/calendar/events/:eventId', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userId = (req.auth?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) return reply.status(400).send({ error: 'Missing user context' });

    const { eventId } = req.params as { eventId: string };
    if (!eventId) return reply.status(400).send({ error: 'Missing eventId' });

    try {
      await calendar.deleteEvent(userId, eventId);
      return reply.send({ deleted: true });
    } catch (err: any) {
      req.log.error({ err }, 'calendar_delete_error');
      return reply.status(500).send({ error: err.message || 'Failed to delete event' });
    }
  });

  // Disconnect Google Calendar
  app.post('/api/v1/calendar/disconnect', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userId = (req.auth?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) return reply.status(400).send({ error: 'Missing user context' });

    try {
      await calendar.disconnect(userId);
      return reply.send({ disconnected: true });
    } catch (err: any) {
      req.log.error({ err }, 'calendar_disconnect_error');
      return reply.status(500).send({ error: 'Failed to disconnect calendar' });
    }
  });
}
