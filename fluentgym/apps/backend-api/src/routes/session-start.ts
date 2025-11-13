import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getAIRouter } from '../utils/AIRouter.js';
import { getSupabaseClient } from '../services/supabase';

// Request schema
const startSessionSchema = z.object({
  skillPackId: z.string().uuid(),
  scenarioId: z.string(),
  userId: z.string().uuid(),
});

// Response types
interface SessionStartResponse {
  sessionId: string;
  greeting: string;
  instructions: string;
  personality: {
    name: string;
    tone: string;
    traits: string[];
  };
  scenario: {
    id: string;
    name: string;
    setting: string;
    goal: string;
    difficulty: number;
    vocabulary?: string[];
  };
}

export const sessionStartRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/v1/sessions/start - Initialize a new practice session
  fastify.post<{
    Body: z.infer<typeof startSessionSchema>;
  }>('/api/v1/sessions/start', {
    schema: {
      description: 'Start a new practice session with AI tutor',
      tags: ['sessions'],
      body: {
        type: 'object',
        required: ['skillPackId', 'scenarioId', 'userId'],
        properties: {
          skillPackId: { type: 'string', format: 'uuid' },
          scenarioId: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { skillPackId, scenarioId, userId } = startSessionSchema.parse(request.body);

      // 0. Ensure Supabase client
      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.status(500).send({ error: 'Supabase not configured' });
      }

      // 1. Fetch skill pack from database
      const { data: skillPack, error: packError } = await supabase
        .from('skill_packs')
        .select('*')
        .eq('id', skillPackId)
        .single();

      if (packError || !skillPack) {
        return reply.status(404).send({
          error: 'Skill pack not found',
        });
      }

      // 2. Extract scenario from config
      const scenarios = skillPack.config.scenarios || [];
      const scenario = scenarios.find((s: any) => s.id === scenarioId);

      if (!scenario) {
        return reply.status(404).send({
          error: 'Scenario not found in skill pack',
        });
      }

      // 3. Extract personality from config
      const personalities = skillPack.config.personalities || [];
      const personality = personalities[0]; // Use first personality by default

      if (!personality) {
        return reply.status(400).send({
          error: 'No personality defined in skill pack',
        });
      }

      // 4. Create session record
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          skill_pack_id: skillPackId,
          scenario_id: scenarioId,
          status: 'active',
          started_at: new Date().toISOString(),
          config: {
            personality,
            scenario,
            domain: skillPack.domain,
          },
        })
        .select()
        .single();

      if (sessionError || !session) {
        fastify.log.error({ error: sessionError }, 'Failed to create session');
        return reply.status(500).send({
          error: 'Failed to create session',
        });
      }

      // 5. Generate AI greeting using AIRouter
      const systemPrompt = `You are ${personality.name}, a ${personality.tone} ${skillPack.domain} tutor.
Your personality traits: ${personality.traits.join(', ')}.
You are helping a student practice: ${scenario.name}.
Setting: ${scenario.setting}
Goal: ${scenario.goal}
Difficulty: ${scenario.difficulty}/10

Start the conversation with a warm greeting and brief introduction to the scenario. Keep it natural and encouraging.
${scenario.vocabulary ? `Focus vocabulary: ${scenario.vocabulary.join(', ')}` : ''}`;

      const userPrompt = 'Greet the student and introduce the practice scenario.';

      const aiRouter = getAIRouter();
      const aiResponse = await aiRouter.routeChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          task: 'conversation',
          priority: 'quality', // Use best model for initial greeting
        }
      );

      // 6. Store initial AI message in session
      await supabase
        .from('sessions')
        .update({
          metadata: {
            messages: [
              {
                role: 'assistant',
                content: aiResponse.content,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        })
        .eq('id', session.id);

      // 7. Return session start data
      const response: SessionStartResponse = {
        sessionId: session.id,
        greeting: aiResponse.content,
        instructions: `Practice ${scenario.name}. Your goal: ${scenario.goal}`,
        personality: {
          name: personality.name,
          tone: personality.tone,
          traits: personality.traits,
        },
        scenario: {
          id: scenario.id,
          name: scenario.name,
          setting: scenario.setting,
          goal: scenario.goal,
          difficulty: scenario.difficulty,
          vocabulary: scenario.vocabulary,
        },
      };

      return reply.status(201).send(response);
    } catch (error) {
      fastify.log.error({ error }, 'Error starting session');
      return reply.status(500).send({
        error: 'Failed to start session',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // POST /api/v1/sessions/:sessionId/message - Send message in active session
  fastify.post<{
    Params: { sessionId: string };
    Body: { message: string; userId: string };
  }>('/api/v1/sessions/:sessionId/message', {
    schema: {
      description: 'Send a message in an active session and get AI response',
      tags: ['sessions'],
      params: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['message', 'userId'],
        properties: {
          message: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params;
      const { message, userId } = request.body;

      // 0. Ensure Supabase client
      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.status(500).send({ error: 'Supabase not configured' });
      }

      // 1. Fetch session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        return reply.status(404).send({
          error: 'Session not found or unauthorized',
        });
      }

      if (session.status !== 'active') {
        return reply.status(400).send({
          error: 'Session is not active',
        });
      }

      // 2. Get conversation history
      const messages = session.metadata?.messages || [];

      // 3. Build AI conversation context
      const personality = session.config.personality;
      const scenario = session.config.scenario;
      const domain = session.config.domain;

      const systemPrompt = `You are ${personality.name}, a ${personality.tone} ${domain} tutor.
Your personality traits: ${personality.traits.join(', ')}.
You are helping a student practice: ${scenario.name}.
Setting: ${scenario.setting}
Goal: ${scenario.goal}

Respond naturally as ${personality.name}. Provide gentle corrections when needed. Keep responses concise and conversational.
${scenario.vocabulary ? `Focus vocabulary: ${scenario.vocabulary.join(', ')}` : ''}`;

      const conversationHistory = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      // 4. Get AI response
      const aiRouter = getAIRouter();
      const aiResponse = await aiRouter.routeChat(conversationHistory, {
        task: 'conversation',
        priority: 'speed', // Prioritize fast responses during conversation
      });

      // 5. Update session with new messages
      const updatedMessages = [
        ...messages,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
        },
      ];

      await supabase
        .from('sessions')
        .update({
          metadata: {
            ...session.metadata,
            messages: updatedMessages,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return reply.send({
        response: aiResponse.content,
        messageCount: updatedMessages.length,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Error processing message');
      return reply.status(500).send({
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // POST /api/v1/sessions/:sessionId/complete - Complete a session
  fastify.post<{
    Params: { sessionId: string };
    Body: { userId: string };
  }>('/api/v1/sessions/:sessionId/complete', {
    schema: {
      description: 'Complete an active session and calculate results',
      tags: ['sessions'],
      params: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params;
      const { userId } = request.body;

      // 0. Ensure Supabase client
      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.status(500).send({ error: 'Supabase not configured' });
      }

      // 1. Fetch session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        return reply.status(404).send({
          error: 'Session not found or unauthorized',
        });
      }

      // 2. Calculate session duration
      const startedAt = new Date(session.started_at);
      const completedAt = new Date();
      const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);

      // 3. Calculate XP based on difficulty and message count
      const messages = session.metadata?.messages || [];
      const messageCount = messages.length;
      const scenario = session.config.scenario;
      const baseXP = scenario.difficulty * 10;
      const engagementBonus = Math.min(messageCount * 2, 50); // Max 50 bonus XP
      const totalXP = baseXP + engagementBonus;

      // 4. Update session as completed
      await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: completedAt.toISOString(),
          duration_minutes: durationMinutes,
          xp_earned: totalXP,
          metadata: {
            ...session.metadata,
            messageCount,
            completionStats: {
              totalMessages: messageCount,
              durationMinutes,
              xpEarned: totalXP,
            },
          },
        })
        .eq('id', sessionId);

      // 5. Update user stats
      const { data: user } = await supabase
        .from('users')
        .select('total_xp, sessions_completed')
        .eq('id', userId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            total_xp: (user.total_xp || 0) + totalXP,
            sessions_completed: (user.sessions_completed || 0) + 1,
          })
          .eq('id', userId);
      }

      return reply.send({
        success: true,
        results: {
          durationMinutes,
          messageCount,
          xpEarned: totalXP,
          scenario: scenario.name,
          difficulty: scenario.difficulty,
        },
      });
    } catch (error) {
      fastify.log.error({ error }, 'Error completing session');
      return reply.status(500).send({
        error: 'Failed to complete session',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};
