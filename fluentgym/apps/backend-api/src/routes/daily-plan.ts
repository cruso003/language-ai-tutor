/**
 * Daily Plan Routes - AI-driven adaptive session recommendations
 * Phase 1: Analyze user progress, skill gaps, and preferences → recommend optimal practice sessions
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDb, schema } from '../db';
import { and, desc, eq, gte } from 'drizzle-orm';
import { getAIRouter } from '../utils/AIRouter';
import { isAuthEnabled, assertUserIdMatches } from '../plugins/auth';

// Schemas
const GetDailyPlanSchema = z.object({
  userId: z.string().uuid(),
  // Accept numeric strings from query as numbers
  targetDuration: z.coerce.number().min(5).max(120).optional(), // minutes
  difficulty: z.enum(['adaptive', 'easy', 'medium', 'hard']).optional(),
  domain: z.string().optional(), // Filter by domain (language, hacking, etc.)
});

export async function dailyPlanRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/daily-plan
   * Generate personalized daily practice plan
   *
   * Algorithm:
   * 1. Fetch user's recent sessions + metrics
   * 2. Identify skill gaps (low accuracy, incomplete sessions)
   * 3. Check user preferences (favorite domains, difficulty)
   * 4. Use AI Router to recommend 3-5 sessions
   * 5. Return ranked list with difficulty, XP potential, estimated duration
   */
  fastify.get(
    '/daily-plan',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = GetDailyPlanSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid query parameters',
          details: parsed.error.issues,
        });
      }

      const { userId, targetDuration = 30, difficulty = 'adaptive', domain } = parsed.data;

      // Enforce auth when enabled
      if (isAuthEnabled()) {
        if (!(request as any).auth?.userId) {
          return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
        }
        const check = assertUserIdMatches(request as any, userId);
        if (!check.ok) return reply.status(check.error!.status).send(check.error!.payload);
      }

      const db = getDb();
      if (!db) {
        return reply.code(500).send({ error: 'Database not configured', code: 'INTERNAL' });
      }

      try {
        // 1. Fetch user's recent sessions (last 30 days)
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentSessions = await db
          .select()
          .from(schema.sessions)
          .where(and(eq(schema.sessions.userId, userId as any), gte(schema.sessions.startedAt, since)))
          .orderBy(desc(schema.sessions.startedAt))
          .limit(50);

        // 2. Fetch available skill packs
        const skillPacks = domain
          ? await db.select().from(schema.skillPacks).where(and(eq(schema.skillPacks.isActive, true), eq(schema.skillPacks.domain, domain)))
          : await db.select().from(schema.skillPacks).where(eq(schema.skillPacks.isActive, true));

        if (!skillPacks || skillPacks.length === 0) {
          return reply.send({
            userId,
            generatedAt: new Date().toISOString(),
            recommendations: [],
            totalXpPotential: 0,
            totalEstimatedDuration: 0,
          });
        }

        // 3. Analyze user progress and skill gaps
        const userStats = analyzeUserProgress(recentSessions || []);

        // 4. Use AI to generate recommendations
        const aiRouter = getAIRouter();
        const recommendations = await generateRecommendations(
          aiRouter,
          userStats,
          skillPacks,
          {
            targetDuration,
            difficulty,
            domain,
          },
        );

        // 5. Calculate totals
        const totalXpPotential = recommendations.reduce((sum: number, r: any) => sum + r.xpPotential, 0);
        const totalEstimatedDuration = recommendations.reduce(
          (sum: number, r: any) => sum + r.estimatedDuration,
          0,
        );

        const payload = {
          userId,
          generatedAt: new Date().toISOString(),
          recommendations,
          totalXpPotential,
          totalEstimatedDuration,
        };

        // Minimal token/cost log when available from AIRouter
        try {
          (request as any).log?.info({
            route: '/api/v1/daily-plan',
            userId,
            recommendations: recommendations.length,
          }, 'daily_plan_generated');
        } catch {}

        return reply.send(payload);
      } catch (error: any) {
        request.log.error(error, 'Error generating daily plan');
        return reply.code(500).send({
          error: 'Failed to generate daily plan',
          code: 'INTERNAL',
          details: error.message,
        });
      }
    },
  );
}

/**
 * Analyze user's recent sessions to identify patterns and gaps
 */
function analyzeUserProgress(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgCompletionRate: 0,
      avgDifficulty: 5,
      strongDomains: [],
      weakDomains: [],
      lastSessionDate: null,
      streakDays: 0,
    };
  }

  const metrics = sessions
    .map((s) => s.session_metrics?.[0])
    .filter(Boolean);

  const avgCompletionRate =
    metrics.reduce((sum, m) => sum + (m.completion_percentage || 0), 0) / metrics.length || 0;

  const domainPerformance = metrics.reduce((acc, m) => {
    if (!acc[m.domain]) {
      acc[m.domain] = [];
    }
    acc[m.domain].push(m.completion_percentage || 0);
    return acc;
  }, {} as Record<string, number[]>);

  const domainAvgs = Object.entries(domainPerformance).map(([domain, scores]) => ({
    domain,
    avgScore: (scores as number[]).reduce((a: number, b: number) => a + b, 0) / (scores as number[]).length,
  }));

  const strongDomains = domainAvgs
    .filter((d) => d.avgScore >= 80)
    .map((d) => d.domain);

  const weakDomains = domainAvgs
    .filter((d) => d.avgScore < 60)
    .map((d) => d.domain);

  return {
    totalSessions: sessions.length,
    avgCompletionRate,
    avgDifficulty: 5, // Default to medium
    strongDomains,
    weakDomains,
    lastSessionDate: sessions[0]?.started_at,
    streakDays: 0, // TODO: Calculate actual streak
  };
}

/**
 * Use AI Router to generate smart recommendations
 */
async function generateRecommendations(
  aiRouter: any,
  userStats: any,
  skillPacks: any[],
  options: any,
) {
  // Build AI prompt for recommendations
  const prompt = `You are an adaptive learning AI. Generate 3-5 practice session recommendations.

User Profile:
- Total sessions: ${userStats.totalSessions}
- Average completion: ${userStats.avgCompletionRate}%
- Strong domains: ${userStats.strongDomains.join(', ') || 'None yet'}
- Weak domains: ${userStats.weakDomains.join(', ') || 'None yet'}
- Last session: ${userStats.lastSessionDate || 'Never'}

Available Skill Packs:
${skillPacks.map((p) => `- ${p.name} (${p.domain}, ${p.version})`).join('\n')}

Target Duration: ${options.targetDuration} minutes
Difficulty Preference: ${options.difficulty}

Generate recommendations in JSON format:
{
  "recommendations": [
    {
      "skillPackId": "<uuid>",
      "scenarioIndex": 0,
      "difficulty": 1-10,
      "estimatedDuration": <minutes>,
      "xpPotential": <number>,
      "rationale": "<why this session>",
      "priority": 1-5
    }
  ]
}

Prioritize:
1. Weak domains to improve gaps
2. Variety across domains
3. Progressive difficulty
4. Match target duration`;

  try {
    const response = await aiRouter.routeChat(
      [
        {
          role: 'system',
          content:
            'You are an expert learning coach. Generate personalized practice recommendations.',
        },
        { role: 'user', content: prompt },
      ],
      { task: 'daily-plan', priority: 'quality' },
    );

    // Parse AI response
    const aiRecommendations = JSON.parse(response.content);

    // Map AI recommendations to skill pack scenarios
    return aiRecommendations.recommendations.map((rec: any, idx: number) => {
      const pack = skillPacks.find((p) => p.id === rec.skillPackId);
      if (!pack) {
        // Fallback to first pack
        const fallback = skillPacks[idx % skillPacks.length];
        const scenario = fallback.config.scenarios[0];
        return {
          sessionId: `rec-${Date.now()}-${idx}`,
          skillPackId: fallback.id,
          skillPackName: fallback.name,
          scenarioId: scenario.id,
          scenarioName: scenario.name || scenario.setting,
          domain: fallback.domain,
          difficulty: rec.difficulty || 5,
          estimatedDuration: rec.estimatedDuration || 15,
          xpPotential: rec.xpPotential || 50,
          rationale: rec.rationale || 'Recommended for skill development',
          priority: rec.priority || 3,
        };
      }

      const scenario = pack.config.scenarios[rec.scenarioIndex || 0];
      return {
        sessionId: `rec-${Date.now()}-${idx}`,
        skillPackId: pack.id,
        skillPackName: pack.name,
        scenarioId: scenario.id,
        scenarioName: scenario.name || scenario.setting,
        domain: pack.domain,
        difficulty: rec.difficulty,
        estimatedDuration: rec.estimatedDuration,
        xpPotential: rec.xpPotential,
        rationale: rec.rationale,
        priority: rec.priority,
      };
    });
  } catch (error) {
    // Fallback to rule-based recommendations if AI fails
    return generateFallbackRecommendations(skillPacks, options, userStats);
  }
}

/**
 * Rule-based fallback recommendations
 */
function generateFallbackRecommendations(skillPacks: any[], options: any, userStats: any) {
  const recommendations = [];
  const numRecs = Math.min(3, skillPacks.length);

  for (let i = 0; i < numRecs; i++) {
    const pack = skillPacks[i];
    const scenario = pack.config.scenarios[0];

    recommendations.push({
      sessionId: `rec-${Date.now()}-${i}`,
      skillPackId: pack.id,
      skillPackName: pack.name,
      scenarioId: scenario.id,
      scenarioName: scenario.name || scenario.setting,
      domain: pack.domain,
      difficulty: 5,
      estimatedDuration: 15,
      xpPotential: 50,
      rationale: 'Recommended for skill development',
      priority: i + 1,
    });
  }

  return recommendations;
}
