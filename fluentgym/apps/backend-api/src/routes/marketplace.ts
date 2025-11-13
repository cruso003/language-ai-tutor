import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { MarketplaceService } from '../services/MarketplaceService';
import { isAuthEnabled } from '../plugins/auth';

const svc = new MarketplaceService();

export async function registerMarketplaceRoutes(app: FastifyInstance) {
  // List approved packs
  app.get('/api/v1/marketplace/packs', async (req: FastifyRequest, reply: FastifyReply) => {
    const { sortBy } = (req.query as any) || {};
    try {
      const packs = await svc.listPacks({ sortBy });
      return reply.send({ packs });
    } catch (err: any) {
      req.log.error({ err }, 'marketplace_list_error');
      return reply.status(500).send({ error: 'Failed to list packs' });
    }
  });

  // Get single pack
  app.get('/api/v1/marketplace/packs/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (req.params as any).id as string;
      const pack = await svc.getPack(id);
      return reply.send({ pack });
    } catch (err: any) {
      req.log.error({ err }, 'marketplace_get_error');
      return reply.status(404).send({ error: 'Pack not found' });
    }
  });

  // Create pack listing (creator)
  const CreateSchema = z.object({
    creatorId: z.string().uuid(),
    skillPackId: z.string().uuid(),
    price: z.number().int().nonnegative(),
    description: z.string().default(''),
    thumbnailUrl: z.string().url().optional(),
  });
  app.post('/api/v1/marketplace/packs', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    try {
      const result = await svc.createPack(parsed.data);
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'marketplace_create_error');
      return reply.status(500).send({ error: 'Failed to create pack' });
    }
  });

  // Start purchase (Stripe checkout session)
  const PurchaseSchema = z.object({ userId: z.string().uuid(), packId: z.string().uuid() });
  app.post('/api/v1/marketplace/purchase', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const parsed = PurchaseSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    try {
      const result = await svc.purchasePack(parsed.data);
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'marketplace_purchase_error');
      return reply.status(500).send({ error: 'Failed to create checkout session' });
    }
  });

  // Add review
  const ReviewSchema = z.object({ userId: z.string().uuid(), packId: z.string().uuid(), rating: z.number().min(1).max(5), review: z.string().optional() });
  app.post('/api/v1/marketplace/reviews', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const parsed = ReviewSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    try {
      const result = await svc.addReview(parsed.data);
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'marketplace_review_error');
      return reply.status(400).send({ error: err.message || 'Failed to add review' });
    }
  });
}
