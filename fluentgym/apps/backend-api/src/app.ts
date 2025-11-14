import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { loadSkillPacks } from './utils/skillPackLoader';
import OpenAI from 'openai';
import { registerSessionRoutes } from './routes/sessions';
import { registerMemoryRoutes } from './routes/memories';
import { registerLiveKitRoutes } from './routes/livekit';
import { registerSpeechRoutes } from './routes/speech';
import { registerUserRoutes } from './routes/users';
import { registerAvatarRoutes } from './routes/avatar';
import { registerMarketplaceRoutes } from './routes/marketplace';
import { registerProgressRoutes } from './routes/progress';
import { registerCalendarRoutes } from './routes/calendar';
import { authRoutes } from './routes/auth';
import { skillPacksRoutes } from './routes/skill-packs';
import { dailyPlanRoutes } from './routes/daily-plan';
import { sessionStartRoutes } from './routes/session-start';
import { getPersonality, getAllPersonalities } from './config/personalities';
import { searchMemories } from './services/memoryService';
import { OpenAIChatProvider } from './providers/OpenAIChatProvider';
import { GeminiChatProvider } from './providers/GeminiChatProvider';
import { getDb, schema } from './db';
import type { ChatProvider } from './providers/ChatProvider';
import { isAuthEnabled, verifyAndAttachAuth, assertUserIdMatches } from './plugins/auth';
import { AppError } from './utils/errors';

export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV === 'production' ? undefined : {
        target: 'pino-pretty',
        options: { translateTime: 'SYS:standard' }
      }
    },
    ...opts
  });

  // Register shared JSON Schemas for reuse across routes
  app.addSchema({
    $id: 'ErrorResponse',
    type: 'object',
    properties: {
      error: { type: 'string' },
      code: { type: 'string' }
    },
    required: ['error']
  });

  // Initialize LLM clients
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
  const openaiChat: ChatProvider | null = openaiApiKey ? new OpenAIChatProvider(openaiApiKey) : null;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let geminiChat: ChatProvider | null = null;
  if (geminiApiKey) {
    try {
      geminiChat = new GeminiChatProvider(geminiApiKey);
    } catch (err: any) {
      // Dependency missing or other init error; log and keep null
      app.log.warn({ err }, 'gemini_provider_init_failed');
    }
  }

  // Security & basics
  await app.register(cors, {
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean) || true,
    credentials: true
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Swagger UI sets its own CSP; disable here to avoid conflicts
    crossOriginEmbedderPolicy: false
  });

  // Rate limiting
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || '100');
  const timeWindow = process.env.RATE_LIMIT_TIME_WINDOW_MS
    ? Number(process.env.RATE_LIMIT_TIME_WINDOW_MS)
    : (process.env.RATE_LIMIT_TIME_WINDOW || '1 minute');
  await app.register(rateLimit, {
    max: rateLimitMax,
    timeWindow
  });

  // Multipart file upload support
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 1, // Max 1 file per request
    },
  });

  // Swagger setup
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'FluentGym Backend API',
        version: '0.1.0'
      },
      components: {
        securitySchemes: {
          GatewayKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-livekit-gateway-key',
            description: 'Optional gateway header required for LiveKit admin/token endpoints when LIVEKIT_TOKEN_GATEWAY_KEY is set'
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enabled when SUPABASE_JWT_SECRET is configured. Pass user JWT from Supabase Auth.'
          }
        },
        schemas: {
          ErrorResponse: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'string' }
            },
            required: ['error']
          }
        }
      },
      tags: [
        { name: 'Health', description: 'Service health' },
        { name: 'Conversation', description: 'AI conversation endpoints' },
        { name: 'Skill Packs', description: 'Scenario packs and metadata' },
        { name: 'Personalities', description: 'Tutor personas' },
        { name: 'Sessions', description: 'Learning session lifecycle' },
        { name: 'Memories', description: 'Semantic memory store/search' },
        { name: 'Users', description: 'User accounts and migration' },
        { name: 'LiveKit', description: 'Real-time audio/video token & room management' }
      ]
    }
  });
  await app.register(swaggerUI, {
    routePrefix: '/docs',
    staticCSP: true
  });

  // Token usage & timing middleware
  app.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Attach auth context when enabled
    try { verifyAndAttachAuth(request); } catch {}
    (request as any).startHrTime = process.hrtime.bigint();
  });
  app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    const start = (request as any).startHrTime as bigint | undefined;
    if (start) {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const routeUrl = (request as any).routeOptions?.url || request.url;
      app.log.info({ route: routeUrl, method: request.method, durationMs }, 'request_timing');
    }
    return payload;
  });

  // Health route
  app.get('/health', {
    schema: {
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            ts: { type: 'string' }
          },
          required: ['status', 'ts']
        }
      }
    }
  }, async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // Conversation route
  const ConversationSchema = z.object({
    scenarioId: z.string().min(1),
    userMessage: z.string().min(1),
    personalityId: z.string().optional(),
    userId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    language: z.string().optional(),
    proficiency: z.string().optional(),
    model: z.string().optional(),
    provider: z.enum(['openai', 'gemini']).optional()
  });

  app.post('/api/v1/conversation', {
    // Note: runtime validation with zod below; omitting Fastify JSON schema to avoid zod mismatch
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = ConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', code: 'BAD_REQUEST', issues: parsed.error.issues });
    }
    
    try {
  const { userMessage, model, scenarioId, language, proficiency, personalityId, userId, sessionId, provider } = parsed.data;

      // Enforce auth if enabled
      if (isAuthEnabled()) {
        if (!req.auth?.userId) {
          return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
        }
        const check = assertUserIdMatches(req, userId);
        if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
      }

      // Enrich system prompt using skill pack data
      const allPacks = loadSkillPacks(process.cwd());
      const scenario = allPacks.flatMap(p => p.scenarios.map(s => ({ ...s, __pack: { id: p.id, name: p.name, version: p.version, type: p.type } })))
        .find(s => s.id === scenarioId);

      if (!scenario) {
        return reply.status(404).send({ error: `Scenario not found: ${scenarioId}`, code: 'NOT_FOUND' });
      }

      // Select chat provider (default from env; allow override per request)
      const defaultProvider = (process.env.LLM_CHAT_PROVIDER === 'gemini') ? 'gemini' : 'openai';
      const chosen = (provider ?? defaultProvider);
      let chatProvider: ChatProvider | null = null;
      if (chosen === 'openai') {
        chatProvider = openaiChat;
        if (!chatProvider) {
          return reply.status(500).send({ error: 'OpenAI API key not configured', code: 'INTERNAL' });
        }
      } else if (chosen === 'gemini') {
        chatProvider = geminiChat;
        if (!chatProvider) {
          return reply.status(500).send({ error: 'Gemini API key not configured', code: 'INTERNAL' });
        }
      }

      // Load personality profile if specified
      const personality = getPersonality(personalityId);

      const objectives = Array.isArray(scenario.objectives) ? `Objectives: ${scenario.objectives.join('; ')}` : '';
      const vocab = Array.isArray(scenario.vocabulary) ? `Key vocabulary: ${scenario.vocabulary.join(', ')}` : '';
      const culture = Array.isArray(scenario.culturalNotes) ? `Cultural notes: ${scenario.culturalNotes.join(' | ')}` : '';
      const level = proficiency ? `Learner proficiency: ${proficiency}.` : '';
      const targetLang = language ? `Target language: ${language}.` : '';
      const packInfo = scenario.__pack ? `Skill pack: ${scenario.__pack.name} (${scenario.__pack.id}) v${scenario.__pack.version}.` : '';

      // Build base system prompt
      const basePrompt = [
        `You are a supportive language tutor running a role-play for scenario '${scenario.title || scenarioId}'.`,
        `Scenario description: ${scenario.description || 'N/A'}`,
        `Difficulty: ${scenario.difficulty || 'unknown'}.`,
        objectives,
        vocab,
        culture,
        level,
        targetLang,
        packInfo,
        'Be concise, natural, and keep replies within 2-3 sentences unless more detail is requested.',
        'Encourage improvement with gentle guidance, and avoid giving away answers unless asked.'
      ].filter(Boolean).join('\n');

      // Enhance with personality if specified
      let systemPrompt = personality
        ? `${personality.systemPromptModifier}\n\n${basePrompt}\n\nPersonality: ${personality.name} (${personality.tone}). Traits: ${personality.traits.join(', ')}.`
        : basePrompt;

      // Retrieve and add relevant memories if userId is provided
      if (userId && openai) {
        try {
          const relevantMemories = await searchMemories(
            { userId, query: userMessage, limit: 3, sessionId },
            openai
          );
          
          if (relevantMemories && relevantMemories.length > 0) {
            const memoryContext = relevantMemories
              .map((m, idx) => `${idx + 1}. ${m.summary}`)
              .join('\n');
            systemPrompt += `\n\nRelevant past learner context:\n${memoryContext}`;
          }
        } catch (err: any) {
          req.log.warn({ err }, 'memory_retrieval_failed');
          // Continue without memory context if retrieval fails
        }
      }

      const { reply: replyText, usage } = await (chatProvider as ChatProvider).generateReply({
        systemPrompt,
        userMessage,
        model
      });
      const payload = {
        scenarioId,
        model: model ?? (chosen === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'),
        reply: replyText,
        usage: usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };

      // Token usage persistence (best-effort)
      try {
        const db = getDb();
        if (db && payload.usage.totalTokens) {
          const microCost = Math.round((payload.usage.totalTokens / 1000) * 1000); // placeholder cost scaling
          await db.insert(schema.tokenUsage).values({
            provider: chosen,
            model: payload.model,
            promptTokens: payload.usage.promptTokens,
            completionTokens: payload.usage.completionTokens,
            totalTokens: payload.usage.totalTokens,
            costUsd: microCost,
            userId: userId as any,
            sessionId: sessionId as any,
          });
        }
        req.log.info({
          route: '/api/v1/conversation',
          provider: chosen,
          model: payload.model,
          usage: payload.usage
        }, 'token_usage');
      } catch (err: any) {
        req.log.warn({ err }, 'token_usage_persist_failed');
      }

      return reply.send(payload);
    } catch (err: any) {
      req.log.error({ err }, 'chat_provider_error');
      if (err instanceof AppError) {
        return reply.status(err.status).send({ error: err.message, code: err.code, details: err.details });
      }
      return reply.status(500).send({ error: 'Failed to generate AI reply', code: 'INTERNAL' });
    }
  });

  // NOTE: File-based skill packs endpoint removed in favor of DB-backed routes in routes/skill-packs.ts

  // Personalities endpoint
  app.get('/api/v1/personalities', {
    schema: {
      tags: ['Personalities'],
      response: {
        200: {
          type: 'object',
          properties: {
            personalities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  tone: { type: 'string' },
                  traits: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  examplePhrases: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['id', 'name', 'description', 'tone', 'traits']
              }
            }
          },
          required: ['personalities']
        }
      }
    }
  }, async () => {
    const allPersonalities = getAllPersonalities();
    return { 
      personalities: allPersonalities.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tone: p.tone,
        traits: p.traits,
        examplePhrases: p.examplePhrases
      }))
    };
  });

  // Register session routes
  await registerSessionRoutes(app);

  // Register memory routes
  await registerMemoryRoutes(app, openai);

  // Register LiveKit routes (only functional if env vars provided)
  await registerLiveKitRoutes(app);
  await registerSpeechRoutes(app);

  // Register Calendar integration routes (Google Calendar)
  await registerCalendarRoutes(app);

    // Register authentication routes
    await app.register(authRoutes);

  // Register user routes (auth-driven operations)
  await registerUserRoutes(app);
  await registerAvatarRoutes(app);
  await registerMarketplaceRoutes(app);

  // Progress aggregation routes
  await registerProgressRoutes(app);

  // Register Skill Pack CRUD routes (Phase 1: DB-managed packs)
  await app.register(skillPacksRoutes, { prefix: '/api/v1' });

  // Register Daily Plan generator (Phase 1: AI-driven recommendations)
  await app.register(dailyPlanRoutes, { prefix: '/api/v1' });

  // Register Session Start routes (Phase 1: Session launcher & AI conversation)
  await app.register(sessionStartRoutes);

  // Global normalized error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, 'unhandled_error');
    if (error instanceof AppError) {
      return reply.status(error.status).send({ error: error.message, code: error.code, details: error.details });
    }
    const status = (error as any)?.statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message || 'Error';
    return reply.status(status).send({ error: message, code: status === 500 ? 'INTERNAL' : undefined });
  });

  return app;
}
