import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AvatarService } from '../services/AvatarService';
import { fileStorage } from '../services/FileStorageService';
import { isAuthEnabled } from '../plugins/auth';

const avatarService = new AvatarService();

export async function registerAvatarRoutes(app: FastifyInstance) {
  // Get avatar creation URL
  app.get('/api/v1/avatars/create-url', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    try {
      const url = avatarService.getAvatarCreationUrl(req.auth?.userId!);
      return reply.send({ url });
    } catch (err: any) {
      req.log.error({ err }, 'avatar_url_error');
      return reply.status(500).send({ error: 'Failed to generate avatar URL' });
    }
  });

  // Get own avatar
  app.get('/api/v1/avatars/me', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    try {
      const avatar = await avatarService.getAvatar(req.auth?.userId!);
      return reply.send({ avatar });
    } catch (err: any) {
      req.log.error({ err }, 'avatar_get_error');
      return reply.status(500).send({ error: 'Failed to fetch avatar' });
    }
  });

  // Save avatar (after creation via Ready Player Me)
  const SaveSchema = z.object({
    glbUrl: z.string().url(),
    config: z.record(z.any()).optional(),
    thumbnailBase64: z.string().optional(), // Optional avatar thumbnail
  });
  app.post('/api/v1/avatars/save', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const parsed = SaveSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    try {
      // Upload thumbnail to Cloudinary if provided
      let thumbnailUrl: string | undefined;
      if (parsed.data.thumbnailBase64 && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const buffer = Buffer.from(parsed.data.thumbnailBase64, 'base64');
          const upload = await fileStorage.uploadAvatar(buffer, req.auth?.userId!);
          thumbnailUrl = upload.secureUrl;
        } catch (uploadErr) {
          req.log.warn({ err: uploadErr }, 'avatar_thumbnail_upload_failed');
        }
      }

      const result = await avatarService.saveAvatar({
        userId: req.auth?.userId!,
        glbUrl: parsed.data.glbUrl,
        config: parsed.data.config,
      });
      return reply.send({ ...result, thumbnailUrl });
    } catch (err: any) {
      req.log.error({ err }, 'avatar_save_error');
      return reply.status(500).send({ error: 'Failed to save avatar' });
    }
  });

  // Customize avatar
  const CustomizeSchema = z.object({
    customization: z.object({
      skinColor: z.string().optional(),
      hairStyle: z.string().optional(),
      hairColor: z.string().optional(),
      eyeColor: z.string().optional(),
      outfit: z.string().optional(),
      accessories: z.array(z.string()).optional(),
    }),
  });
  app.post('/api/v1/avatars/customize', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const parsed = CustomizeSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    try {
      const result = await avatarService.customizeAvatar({
        userId: req.auth?.userId!,
        customization: parsed.data.customization,
      });
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'avatar_customize_error');
      return reply.status(500).send({ error: 'Failed to customize avatar' });
    }
  });

  // Get available animations
  app.get('/api/v1/avatars/animations', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const animations = avatarService.getAnimations();
      return reply.send({ animations });
    } catch (err: any) {
      req.log.error({ err }, 'avatar_animations_error');
      return reply.status(500).send({ error: 'Failed to fetch animations' });
    }
  });

  // Delete avatar
  app.delete('/api/v1/avatars/me', async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && !req.auth?.userId) return reply.status(401).send({ error: 'Unauthorized' });
    try {
      const result = await avatarService.deleteAvatar(req.auth?.userId!);
      return reply.send(result);
    } catch (err: any) {
      req.log.error({ err }, 'avatar_delete_error');
      return reply.status(500).send({ error: 'Failed to delete avatar' });
    }
  });
}
