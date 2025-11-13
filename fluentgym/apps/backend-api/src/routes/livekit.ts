import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AccessToken, VideoGrant, RoomServiceClient } from 'livekit-server-sdk';
import { authGuard, isAuthEnabled } from '../plugins/auth';

// LiveKit server integration using the official SDK:
// - AccessToken + VideoGrant for minting room tokens
// - RoomServiceClient for room lifecycle (create/list/end)
// Notes:
// - Admin API uses https/http; we derive it from the public wss/ws URL.
// - Optional gateway auth via `LIVEKIT_TOKEN_GATEWAY_KEY` protects these endpoints.

const TokenRequestSchema = z.object({
  userId: z.string().uuid(),
  roomName: z.string().min(1).optional(),
  role: z.enum(['speaker', 'listener']).default('speaker'),
  metadata: z.record(z.any()).optional()
});

export async function registerLiveKitRoutes(app: FastifyInstance) {
  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
  const gatewayKey = process.env.LIVEKIT_TOKEN_GATEWAY_KEY; // Optional gateway auth key

  const tokenMax = Number(process.env.LIVEKIT_TOKEN_RATE_LIMIT_MAX || '5');
  const tokenWindow = process.env.LIVEKIT_TOKEN_RATE_LIMIT_WINDOW || '1 minute';

  app.post('/api/v1/livekit/token', {
    schema: {
      tags: ['LiveKit'],
      security: [{ GatewayKey: [] }, { bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          roomName: { type: 'string' },
          role: { type: 'string', enum: ['speaker', 'listener'] },
          metadata: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            url: { type: 'string' },
            expiresIn: { type: 'number' }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    config: {
      rateLimit: {
        max: tokenMax,
        timeWindow: tokenWindow
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    // Enforce user auth if enabled
    if (isAuthEnabled() && (!req.auth || !req.auth.userId)) {
      return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
    }
    // Optional auth guard: only enforced if LIVEKIT_TOKEN_GATEWAY_KEY is set
    if (gatewayKey) {
      const headerKey = (req.headers['x-livekit-gateway-key'] || req.headers['x-livekit-token-key'] || '') as string;
      if (!headerKey || headerKey !== gatewayKey) {
        return reply.status(401).send({ error: 'Unauthorized: invalid or missing gateway key' });
      }
    }
    const parsed = TokenRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    }
    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      return reply.status(500).send({ error: 'LiveKit configuration missing' });
    }

    const { userId, roomName, role, metadata } = parsed.data;
    const room = roomName || `practice-${userId}`;

    // Build grant using official SDK
    const grant: VideoGrant = {
      room,
      roomJoin: true,
      canPublish: role === 'speaker',
      canSubscribe: true,
      canPublishData: true
    };

    const identity = `user-${userId}`;
    const ttlSeconds = 3600; // 1 hour

    try {
      const at = new AccessToken(livekitApiKey!, livekitApiSecret!, {
        identity,
        ttl: ttlSeconds,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      });
      at.addGrant(grant);
      const token = await at.toJwt();
      return reply.send({ token, url: livekitUrl, expiresIn: ttlSeconds });
    } catch (err: any) {
      req.log.error({ err }, 'livekit_token_error');
      return reply.status(500).send({ error: 'Failed to generate LiveKit token' });
    }
  });

  // Helper: admin client (derived from wss/ws to https/http)
  function getRoomService(): RoomServiceClient | null {
    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) return null;
    const adminBase = livekitUrl
      .replace(/^wss:/, 'https:')
      .replace(/^ws:/, 'http:');
    return new RoomServiceClient(adminBase, livekitApiKey, livekitApiSecret);
  }

  // Shared: simple gateway auth check
  function checkGatewayAuth(req: FastifyRequest, reply: FastifyReply): boolean {
    if (!gatewayKey) return true; // not enforced when unset
    const headerKey = (req.headers['x-livekit-gateway-key'] || req.headers['x-livekit-token-key'] || '') as string;
    if (!headerKey || headerKey !== gatewayKey) {
      reply.status(401).send({ error: 'Unauthorized: invalid or missing gateway key' });
      return false;
    }
    return true;
  }

  // Create or ensure a room exists
  const CreateRoomSchema = z.object({
    roomName: z.string().min(1),
    maxParticipants: z.number().int().positive().optional(),
    emptyTimeout: z.number().int().nonnegative().optional(),
    metadata: z.record(z.any()).optional()
  });

  app.post('/api/v1/livekit/rooms', {
    schema: {
      tags: ['LiveKit'],
      security: [{ GatewayKey: [] }, { bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['roomName'],
        properties: {
          roomName: { type: 'string' },
          maxParticipants: { type: 'number' },
          emptyTimeout: { type: 'number' },
          metadata: { type: 'object' }
        }
      },
      response: {
        200: { type: 'object', properties: { room: { type: 'object' } } },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    config: { rateLimit: { max: tokenMax, timeWindow: tokenWindow } }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && (!req.auth || !req.auth.userId)) {
      return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
    }
    if (!checkGatewayAuth(req, reply)) return;
    const parsed = CreateRoomSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    const svc = getRoomService();
    if (!svc) return reply.status(500).send({ error: 'LiveKit configuration missing' });
    const { roomName, maxParticipants, emptyTimeout, metadata } = parsed.data;
    try {
      const room = await svc.createRoom({ name: roomName, maxParticipants, emptyTimeout, metadata: metadata ? JSON.stringify(metadata) : undefined });
      return reply.send({ room });
    } catch (err: any) {
      req.log.error({ err }, 'livekit_create_room_error');
      return reply.status(500).send({ error: 'Failed to create room' });
    }
  });

  // End a room (terminate)
  const EndRoomSchema = z.object({
    roomName: z.string().min(1),
    reason: z.string().optional()
  });

  app.post('/api/v1/livekit/rooms/end', {
    schema: {
      tags: ['LiveKit'],
      security: [{ GatewayKey: [] }, { bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['roomName'],
        properties: {
          roomName: { type: 'string' },
          reason: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { success: { type: 'boolean' } } },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    config: { rateLimit: { max: tokenMax, timeWindow: tokenWindow } }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && (!req.auth || !req.auth.userId)) {
      return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
    }
    if (!checkGatewayAuth(req, reply)) return;
    const parsed = EndRoomSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid payload', issues: parsed.error.issues });
    const svc = getRoomService();
    if (!svc) return reply.status(500).send({ error: 'LiveKit configuration missing' });
    const { roomName, reason } = parsed.data;
    try {
      if (reason) {
        app.log.info({ roomName, reason }, 'livekit_end_room_reason');
      }
      await svc.deleteRoom(roomName);
      return reply.send({ success: true });
    } catch (err: any) {
      req.log.error({ err }, 'livekit_end_room_error');
      return reply.status(500).send({ error: 'Failed to end room' });
    }
  });

  // List active rooms
  app.get('/api/v1/livekit/rooms', {
    schema: {
      tags: ['LiveKit'],
      security: [{ GatewayKey: [] }, { bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { rooms: { type: 'array', items: { type: 'object' } } } },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    config: { rateLimit: { max: tokenMax, timeWindow: tokenWindow } }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    if (isAuthEnabled() && (!req.auth || !req.auth.userId)) {
      return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
    }
    if (!checkGatewayAuth(req, reply)) return;
    const svc = getRoomService();
    if (!svc) return reply.status(500).send({ error: 'LiveKit configuration missing' });
    try {
      const rooms = await svc.listRooms();
      return reply.send({ rooms });
    } catch (err: any) {
      req.log.error({ err }, 'livekit_list_rooms_error');
      return reply.status(500).send({ error: 'Failed to list rooms' });
    }
  });
}
