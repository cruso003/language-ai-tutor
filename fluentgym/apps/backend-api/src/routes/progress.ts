import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getDb, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { isAuthEnabled, assertUserIdMatches } from '../plugins/auth';
import { AppError } from '../utils/errors';

const ParamsSchema = z.object({ userId: z.string().uuid() });

export async function registerProgressRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/progress/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = ParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid userId', code: 'BAD_REQUEST' });
    }
    const { userId } = parsed.data;

    if (isAuthEnabled()) {
      if (!(request as any).auth?.userId) {
        return reply.status(401).send({ error: 'Unauthorized: missing or invalid token', code: 'UNAUTHORIZED' });
      }
      const check = assertUserIdMatches(request as any, userId);
      if (!check.ok) return reply.status(check.error!.status).send({ ...check.error!.payload, code: check.error!.status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED' });
    }

    const db = getDb();
  if (!db) return reply.status(500).send({ error: 'Database not configured', code: 'INTERNAL' });

    try {
      // Using Drizzle ORM - type-safe queries!
      const [userStats] = await db
        .select({
          totalXp: schema.users.totalXp,
          sessionsCompleted: schema.users.sessionsCompleted,
        })
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      const recentSessions = await db
        .select({
          id: schema.sessions.id,
          skillPackId: schema.sessions.skillPackId,
          scenarioId: schema.sessions.scenarioId,
          startedAt: schema.sessions.startedAt,
          completedAt: schema.sessions.completedAt,
          status: schema.sessions.status,
          xpEarned: schema.sessions.xpEarned,
        })
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId))
        .orderBy(desc(schema.sessions.startedAt))
        .limit(10);

      return reply.send({
        totalXP: userStats?.totalXp ?? 0,
        sessionsCompleted: userStats?.sessionsCompleted ?? 0,
        recentSessions: recentSessions ?? [],
      });
    } catch (err: any) {
      request.log.error({ err }, 'progress_fetch_failed');
      if (err instanceof AppError) {
        return reply.status(err.status).send({ error: err.message, code: err.code, details: err.details });
      }
      return reply.status(500).send({ error: 'Failed to fetch progress', code: 'INTERNAL' });
    }
  });
}
