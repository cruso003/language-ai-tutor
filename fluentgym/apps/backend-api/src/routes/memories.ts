import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { storeMemory, searchMemories, getRecentMemories } from '../services/memoryService';
import OpenAI from 'openai';
import { assertUserIdMatches, isAuthEnabled } from '../plugins/auth';

const StoreMemorySchema = z.object({
  userId: z.string().uuid(),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  sessionId: z.string().uuid().optional()
});

const SearchMemoriesSchema = z.object({
  userId: z.string().uuid(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(5),
  sessionId: z.string().uuid().optional()
});

const GetRecentMemoriesSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(50).default(10),
  sessionId: z.string().uuid().optional()
});

export async function registerMemoryRoutes(app: FastifyInstance, openai: OpenAI | null) {
  // POST /api/v1/memories - Store a new memory
  app.post('/api/v1/memories', {
    schema: {
      tags: ['Memories'],
      body: {
        type: 'object',
        required: ['userId', 'summary'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          summary: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          sessionId: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            summary: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = StoreMemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    if (isAuthEnabled()) {
      const check = assertUserIdMatches(req, (parsed.data as any).userId);
      if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
    }

    if (!openai) {
      return reply.status(500).send({ error: 'OpenAI not configured for memory embeddings' });
    }

    try {
      const { userId, summary, tags, sessionId } = parsed.data;
      const memory = await storeMemory(userId, summary, tags, openai, sessionId);

      if (!memory) {
        return reply.status(500).send({ error: 'Failed to store memory' });
      }

      return reply.status(201).send(memory);
    } catch (err: any) {
      req.log.error({ err }, 'memory_store_error');
      return reply.status(500).send({ error: 'Failed to store memory' });
    }
  });

  // POST /api/v1/memories/search - Search memories by semantic similarity
  app.post('/api/v1/memories/search', {
    schema: {
      tags: ['Memories'],
      body: {
        type: 'object',
        required: ['userId', 'query'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          query: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 20 },
          sessionId: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            memories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  summary: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string' }
                }
              }
            }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = SearchMemoriesSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    if (isAuthEnabled()) {
      const check = assertUserIdMatches(req, (parsed.data as any).userId);
      if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
    }

    if (!openai) {
      return reply.status(500).send({ error: 'OpenAI not configured for memory search' });
    }

    try {
      const memories = await searchMemories(parsed.data, openai);
      return reply.send({ memories });
    } catch (err: any) {
      req.log.error({ err }, 'memory_search_error');
      return reply.status(500).send({ error: 'Failed to search memories' });
    }
  });

  // GET /api/v1/memories/recent - Get recent memories
  app.get('/api/v1/memories/recent', {
    schema: {
      tags: ['Memories'],
      querystring: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          limit: { type: 'number', minimum: 1, maximum: 50 },
          sessionId: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            memories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  summary: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string' }
                }
              }
            }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = GetRecentMemoriesSchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query parameters', issues: parsed.error.issues });
    }

    if (isAuthEnabled()) {
      const check = assertUserIdMatches(req, (parsed.data as any).userId);
      if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
    }

    try {
      const { userId, limit, sessionId } = parsed.data;
      const memories = await getRecentMemories(userId, limit, sessionId);
      return reply.send({ memories });
    } catch (err: any) {
      req.log.error({ err }, 'memory_recent_error');
      return reply.status(500).send({ error: 'Failed to get recent memories' });
    }
  });
}
