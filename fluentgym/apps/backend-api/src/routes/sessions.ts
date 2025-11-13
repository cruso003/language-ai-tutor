import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authGuard, assertUserIdMatches, isAuthEnabled } from '../plugins/auth';
import { getDb, schema } from '../db';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { searchMemories } from '../services/memoryService';
import { z } from 'zod';
import { getSupabaseClient } from '../services/supabase';

const StartSessionSchema = z.object({
  userId: z.string().uuid(),
  skillPackId: z.string().optional(),
  scenarioId: z.string(),
  proficiencyLevel: z.string().optional(),
  language: z.string().optional(),
  source: z.string().optional()
});

const UpdateSessionSchema = z.object({
  ended: z.boolean().optional(),
  completed: z.boolean().optional(),
  summary: z.record(z.any()).optional(),
  metrics: z.record(z.any()).optional()
});

export async function registerSessionRoutes(app: FastifyInstance) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
  // POST /api/v1/sessions - Start a new session
  app.post('/api/v1/sessions', {
    schema: {
      tags: ['Sessions'],
      body: {
        type: 'object',
        required: ['userId', 'scenarioId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          skillPackId: { type: 'string' },
          scenarioId: { type: 'string' },
          proficiencyLevel: { type: 'string' },
          language: { type: 'string' },
          source: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            scenarioId: { type: 'string' },
            startedAt: { type: 'string' }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = StartSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    // Enforce userId match when auth enabled
    if (isAuthEnabled()) {
      const check = assertUserIdMatches(req, (parsed.data as any).userId);
      if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
    }

    const db = getDb();
    if (!db) {
      return reply.status(500).send({ error: 'Session persistence not configured', code: 'INTERNAL' });
    }

    try {
      const { userId, skillPackId, scenarioId } = parsed.data as any;
      const inserted = await db.insert(schema.sessions).values({
        userId: userId as any,
        skillPackId: skillPackId as any,
        scenarioId,
        status: 'active'
      }).returning({ id: schema.sessions.id, userId: schema.sessions.userId, scenarioId: schema.sessions.scenarioId, startedAt: schema.sessions.startedAt });

      const row = inserted[0];
      return reply.status(201).send(row);
    } catch (err: any) {
      req.log.error({ err }, 'session_create_error');
      return reply.status(500).send({ error: 'Failed to create session', code: 'INTERNAL' });
    }
  });

  // PATCH /api/v1/sessions/:id - Update/end a session
  app.patch('/api/v1/sessions/:id', {
    schema: {
      tags: ['Sessions'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          ended: { type: 'boolean' },
          completed: { type: 'boolean' },
          summary: { type: 'object' },
          metrics: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            updated: { type: 'boolean' }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parsed = UpdateSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    const db = getDb();
    if (!db) {
      return reply.status(500).send({ error: 'Session persistence not configured', code: 'INTERNAL' });
    }

    try {
      const updates: any = {};
  const justCompleted = parsed.data.completed === true;
  if (parsed.data.ended !== undefined) updates.completedAt = parsed.data.ended ? new Date() : null;
  if (parsed.data.completed !== undefined) updates.status = parsed.data.completed ? 'completed' : 'active';
      if (parsed.data.summary) updates.metadata = { ...(updates.metadata || {}), summary: parsed.data.summary };
      if (parsed.data.metrics) updates.metadata = { ...(updates.metadata || {}), metrics: parsed.data.metrics };

      // Update session row
      const updatedRows = await db.update(schema.sessions).set(updates).where(eq(schema.sessions.id, id as any)).returning({
        id: schema.sessions.id,
        userId: schema.sessions.userId,
        scenarioId: schema.sessions.scenarioId,
        skillPackId: schema.sessions.skillPackId,
        metadata: schema.sessions.metadata,
        adaptiveDifficulty: schema.sessions.adaptiveDifficulty,
        status: schema.sessions.status
      });
      if (!updatedRows.length) {
        return reply.status(404).send({ error: 'Session not found', code: 'NOT_FOUND' });
      }
      const sessionRow = updatedRows[0];

      // On completion: generate memory embedding & adaptive difficulty adjustment
      if (justCompleted && openai) {
        try {
          const summary = (sessionRow.metadata as any)?.summary || `Session ${sessionRow.scenarioId} completed.`;
          // Basic embedding generation via text-embedding-3-small (adjust if different model desired)
          const embeddingRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: summary
          });
          const vector = embeddingRes.data[0]?.embedding;
          if (vector) {
            await db.insert(schema.memoryEntries).values({
              userId: sessionRow.userId as any,
              sessionId: sessionRow.id as any,
              summary,
              embedding: vector as any,
              tags: ['session-summary']
            });
          }

          // Adaptive difficulty: simple heuristic
          // If metrics accuracy_score high -> increase difficulty slightly, else reduce/increase modestly.
          const metrics = (sessionRow.metadata as any)?.metrics;
            const accuracy = metrics?.accuracy_score ?? 50;
            let nextDifficulty = (sessionRow.adaptiveDifficulty || 5);
            if (accuracy >= 85) nextDifficulty = Math.min(nextDifficulty + 1, 10);
            else if (accuracy < 50) nextDifficulty = Math.max(nextDifficulty - 1, 1);

            await db.update(schema.sessions)
              .set({ adaptiveDifficulty: nextDifficulty, nextSessionRecommendation: `Focus scenario related to ${sessionRow.scenarioId}` })
              .where(eq(schema.sessions.id, sessionRow.id as any));
        } catch (err: any) {
          req.log.warn({ err }, 'session_completion_enrichment_failed');
        }
      }

      return reply.send({ id: sessionRow.id, updated: true });
    } catch (err: any) {
      req.log.error({ err }, 'session_update_error');
      return reply.status(500).send({ error: 'Failed to update session', code: 'INTERNAL' });
    }
  });

  // GET /api/v1/sessions/:id - Retrieve a session
  app.get('/api/v1/sessions/:id', {
    schema: {
      tags: ['Sessions'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            skillPackId: { type: 'string' },
            scenarioId: { type: 'string' },
            startedAt: { type: 'string' },
            endedAt: { type: 'string' },
            completed: { type: 'boolean' },
            summary: { type: 'object' },
            metrics: { type: 'object' }
          }
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };

    const db = getDb();
    if (!db) {
      return reply.status(500).send({ error: 'Session persistence not configured', code: 'INTERNAL' });
    }

    try {
      const rows = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id as any));
      const row = rows[0];
      if (!row) return reply.status(404).send({ error: 'Session not found', code: 'NOT_FOUND' });
      return reply.send({
        id: row.id,
        userId: row.userId,
        skillPackId: row.skillPackId,
        scenarioId: row.scenarioId,
        startedAt: row.startedAt,
        endedAt: row.completedAt,
        completed: row.status === 'completed',
        summary: (row.metadata as any)?.summary,
        metrics: (row.metadata as any)?.metrics
      });
    } catch (err: any) {
      req.log.error({ err }, 'session_get_error');
      return reply.status(500).send({ error: 'Failed to retrieve session', code: 'INTERNAL' });
    }
  });
}
