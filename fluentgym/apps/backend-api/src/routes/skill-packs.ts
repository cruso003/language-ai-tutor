/**
 * Skill Packs Routes - DB-managed skill pack CRUD
 * Phase 1: Replace file-based loading with database-backed versioned packs
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getSupabaseClient } from '../services/supabase';
import { assertUserIdMatches, isAuthEnabled } from '../plugins/auth';
import { requireCreator } from '../middleware/rbac.js';

// Schemas
const PersonalitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  voiceId: z.string().optional(),
  systemPrompt: z.string().min(10).optional(),
});

const ScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(5),
  difficulty: z.string().min(1),
  estimatedMinutes: z.number().min(1),
  xpReward: z.number().min(1),
});

const SkillPackConfigSchema = z.object({
  language: z.string().optional(),
  level: z.string().optional(),
  description: z.string().min(5),
  personalities: z.array(PersonalitySchema).min(1),
  scenarios: z.array(ScenarioSchema).min(1),
  vocabularyBank: z.array(z.string()).optional(),
});

const CreateSkillPackSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  domain: z.enum(['language', 'hacking', 'content-creation', 'music', 'fitness']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  config: SkillPackConfigSchema,
  tags: z.array(z.string()).optional(),
});

const UpdateSkillPackSchema = CreateSkillPackSchema.partial().omit({ slug: true });

const ListSkillPacksSchema = z.object({
  domain: z.string().optional(),
  is_active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export async function skillPacksRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/skill-packs
   * Create a new skill pack (admin only)
   */
  fastify.post(
    '/skill-packs',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = CreateSkillPackSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid payload', code: 'BAD_REQUEST', details: parsed.error.issues });
      }

      // TODO: Add admin role check when auth is fully implemented
      // For now, just require authentication
      if (isAuthEnabled()) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
      }

      const body = parsed.data;
      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      try {
        const { data, error } = await supabase
          .from('skill_packs')
          .insert({
            name: body.name,
            slug: body.slug,
            domain: body.domain,
            version: body.version,
            config: body.config as any,
            tags: body.tags || [],
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation
            return reply.code(409).send({
              error: `Skill pack with slug '${body.slug}' already exists`,
            });
          }
          throw error;
        }

        return reply.code(201).send({
          id: data.id,
          name: data.name,
          slug: data.slug,
          domain: data.domain,
          version: data.version,
          is_active: data.is_active,
          created_at: data.created_at,
        });
      } catch (error: any) {
        request.log.error(error, 'Error creating skill pack');
        return reply.code(500).send({
          error: 'Failed to create skill pack',
          details: error.message,
        });
      }
    },
  );

  /**
   * GET /api/v1/skill-packs
   * List all skill packs (with filters)
   */
  fastify.get(
    '/skill-packs',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = ListSkillPacksSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid query parameters' });
      }
      const query = parsed.data;

      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      let supabaseQuery = supabase
        .from('skill_packs')
        .select('id, name, slug, domain, version, is_active, tags, created_at', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
        .range(query.offset, query.offset + query.limit - 1);

      if (query.domain) {
        supabaseQuery = supabaseQuery.eq('domain', query.domain);
      }

      if (query.is_active !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
      }

      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.contains('tags', query.tags);
      }

      const { data, error, count } = await supabaseQuery;

      if (error) {
        request.log.error(error, 'Error fetching skill packs');
        return reply.code(500).send({ error: 'Failed to fetch skill packs' });
      }

      return reply.send({
        skill_packs: data || [],
        total: count || 0,
        limit: query.limit,
        offset: query.offset,
      });
    },
  );

  /**
   * GET /api/v1/skill-packs/:id
   * Get a specific skill pack by ID
   */
  fastify.get(
    '/skill-packs/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      const { data, error } = await supabase
        .from('skill_packs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return reply.code(404).send({ error: 'Skill pack not found' });
      }

      return reply.send(data);
    },
  );

  /**
   * GET /api/v1/skill-packs/:id/scenarios
   * Get scenarios for a specific skill pack
   */
  fastify.get(
    '/skill-packs/:id/scenarios',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      const { data, error } = await supabase
        .from('skill_packs')
        .select('config')
        .eq('id', id)
        .single();

      if (error || !data) {
        return reply.code(404).send({ error: 'Skill pack not found' });
      }

      const scenarios = (data.config as any)?.scenarios || [];
      return reply.send({ scenarios });
    },
  );

  /**
   * PATCH /api/v1/skill-packs/:id
   * Update a skill pack (admin only)
   */
  fastify.patch(
    '/skill-packs/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (isAuthEnabled()) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
      }

      const { id } = request.params as { id: string };
      const parsed = UpdateSkillPackSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid payload', code: 'BAD_REQUEST', details: parsed.error.issues });
      }
      const body = parsed.data;

      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      const { data, error } = await supabase
        .from('skill_packs')
        .update(body as any)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return reply.code(404).send({ error: 'Skill pack not found' });
      }

      return reply.send({
        id: data.id,
        name: data.name,
        domain: data.domain,
        version: data.version,
        updated_at: data.updated_at,
      });
    },
  );

  /**
   * DELETE /api/v1/skill-packs/:id
   * Soft-delete a skill pack (set is_active = false)
   */
  fastify.delete(
    '/skill-packs/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (isAuthEnabled()) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
      }

      const { id } = request.params as { id: string };

      const supabase = getSupabaseClient();
      if (!supabase) {
        return reply.code(500).send({ error: 'Database not configured' });
      }

      const { data, error } = await supabase
        .from('skill_packs')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return reply.code(404).send({ error: 'Skill pack not found' });
      }

      return reply.send({ message: 'Skill pack deactivated successfully' });
    },
  );
}
