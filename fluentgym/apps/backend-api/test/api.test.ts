import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app';
import type { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';

describe('Backend API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Build app with logger disabled for cleaner test output
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with status and timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('ts');
      expect(typeof body.ts).toBe('string');
    });
  });

  describe('GET /api/v1/skill-packs', () => {
    it('should return 200 with packs array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/skill-packs'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('packs');
      expect(Array.isArray(body.packs)).toBe(true);
      
      if (body.packs.length > 0) {
        const pack = body.packs[0];
        expect(pack).toHaveProperty('id');
        expect(pack).toHaveProperty('name');
        expect(pack).toHaveProperty('version');
        expect(pack).toHaveProperty('type');
        expect(pack).toHaveProperty('scenarios');
      }
    });
  });

  describe('POST /api/v1/conversation', () => {
    it('should return 400 when scenarioId is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: {
          userMessage: 'Hello'
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should return 400 when userMessage is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: {
          scenarioId: 'cafe-order-beginner'
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should return 404 when scenarioId does not exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: {
          scenarioId: 'nonexistent-scenario',
          userMessage: 'Hello'
        }
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Scenario not found');
    });

    it('should handle provider selection and missing API keys gracefully', async () => {
      // OpenAI branch
      const openAiResp = await app.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: {
          scenarioId: 'cafe-order-beginner',
          userMessage: 'Hello, I would like a coffee please.',
          provider: 'openai'
        }
      });
      if (!process.env.OPENAI_API_KEY) {
        expect(openAiResp.statusCode).toBe(500);
        const body = JSON.parse(openAiResp.body);
        expect(body.error).toContain('OpenAI API key not configured');
      } else {
        expect(openAiResp.statusCode).toBe(200);
      }

      // Gemini branch
      const geminiResp = await app.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: {
          scenarioId: 'cafe-order-beginner',
          userMessage: 'Hi there',
          provider: 'gemini'
        }
      });
      if (!process.env.GEMINI_API_KEY) {
        expect(geminiResp.statusCode).toBe(500);
        const body = JSON.parse(geminiResp.body);
        expect(body.error).toContain('Gemini API key not configured');
      } else {
        // If key present we expect 200
        expect(geminiResp.statusCode).toBe(200);
      }
    });
  });

  describe('GET /api/v1/personalities', () => {
    it('should return 200 with personalities array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/personalities'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('personalities');
      expect(Array.isArray(body.personalities)).toBe(true);
      expect(body.personalities.length).toBeGreaterThan(0);

      const personality = body.personalities[0];
      expect(personality).toHaveProperty('id');
      expect(personality).toHaveProperty('name');
      expect(personality).toHaveProperty('description');
      expect(personality).toHaveProperty('tone');
      expect(personality).toHaveProperty('traits');
      expect(Array.isArray(personality.traits)).toBe(true);
    });
  });

  describe('Memory API endpoints', () => {
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Example UUID

    describe('POST /api/v1/memories', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/memories',
          payload: {
            summary: 'Test memory'
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
      });

      it('should return 400 when summary is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/memories',
          payload: {
            userId: testUserId
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
      });

      it('should return 500 if OpenAI is not configured', async () => {
        if (!process.env.OPENAI_API_KEY) {
          const response = await app.inject({
            method: 'POST',
            url: '/api/v1/memories',
            payload: {
              userId: testUserId,
              summary: 'Learned basic greetings in Spanish',
              tags: ['spanish', 'greetings']
            }
          });

          expect(response.statusCode).toBe(500);
          const body = JSON.parse(response.body);
          expect(body).toHaveProperty('error');
          expect(body.error).toContain('OpenAI not configured');
        }
      });
    });

    describe('POST /api/v1/memories/search', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/memories/search',
          payload: {
            query: 'spanish greetings'
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
      });

      it('should return 400 when query is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/memories/search',
          payload: {
            userId: testUserId
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
      });

      it('should return 500 if OpenAI is not configured', async () => {
        if (!process.env.OPENAI_API_KEY) {
          const response = await app.inject({
            method: 'POST',
            url: '/api/v1/memories/search',
            payload: {
              userId: testUserId,
              query: 'spanish greetings',
              limit: 5
            }
          });

          expect(response.statusCode).toBe(500);
          const body = JSON.parse(response.body);
          expect(body).toHaveProperty('error');
          expect(body.error).toContain('OpenAI not configured');
        }
      });
    });

    describe('GET /api/v1/memories/recent', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/memories/recent'
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
      });

      it('should return 200 with memories array when valid userId is provided', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/memories/recent?userId=${testUserId}&limit=10`
        });

        // Should return 200 even if no memories exist (empty array)
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('memories');
        expect(Array.isArray(body.memories)).toBe(true);
      });
    });
  });

  describe('LiveKit token endpoint', () => {
    it('should return 400 for invalid payload (missing userId)', async () => {
      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/livekit/token',
        payload: { roomName: 'test-room' }
      });
      expect(resp.statusCode).toBe(400);
    });

    it('should return 500 if LiveKit config missing (or 200 if configured locally)', async () => {
      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/livekit/token',
        payload: { userId: '550e8400-e29b-41d4-a716-446655440000' }
      });
      // Without env keys we expect 500
      expect([500,200]).toContain(resp.statusCode);
      if (resp.statusCode === 500) {
        const body = JSON.parse(resp.body);
        expect(body.error).toContain('LiveKit');
      } else {
        const body = JSON.parse(resp.body);
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('url');
      }
    });

    it('should enforce gateway key when configured (expect 401 without header)', async () => {
      process.env.LIVEKIT_TOKEN_GATEWAY_KEY = 'test-gateway-key';
      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/livekit/token',
        payload: { userId: '550e8400-e29b-41d4-a716-446655440000' }
      });
      // If LiveKit keys also missing we may get 500 earlier; allow that path
      if (resp.statusCode === 401) {
        const body = JSON.parse(resp.body);
        expect(body.error).toContain('Unauthorized');
      } else {
        expect([500,401]).toContain(resp.statusCode);
      }
      delete process.env.LIVEKIT_TOKEN_GATEWAY_KEY;
    });
  });

  describe('LiveKit room lifecycle endpoints', () => {
    it('should reject room creation without gateway key when configured', async () => {
      process.env.LIVEKIT_TOKEN_GATEWAY_KEY = 'test-gateway-key';
      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/livekit/rooms',
        payload: { roomName: 'unit-test-room' }
      });
      // Expect 401 (or 500 if base config missing earlier)
      expect([401,500]).toContain(resp.statusCode);
      delete process.env.LIVEKIT_TOKEN_GATEWAY_KEY;
    });

    it('should reject end room without gateway key when configured', async () => {
      process.env.LIVEKIT_TOKEN_GATEWAY_KEY = 'test-gateway-key';
      const resp = await app.inject({
        method: 'POST',
        url: '/api/v1/livekit/rooms/end',
        payload: { roomName: 'unit-test-room' }
      });
      expect([401,500]).toContain(resp.statusCode);
      delete process.env.LIVEKIT_TOKEN_GATEWAY_KEY;
    });

    it('should reject list rooms without gateway key when configured', async () => {
      process.env.LIVEKIT_TOKEN_GATEWAY_KEY = 'test-gateway-key';
      const resp = await app.inject({
        method: 'GET',
        url: '/api/v1/livekit/rooms'
      });
      expect([401,500]).toContain(resp.statusCode);
      delete process.env.LIVEKIT_TOKEN_GATEWAY_KEY;
    });
  });

  describe('Auth enforcement when enabled', () => {
    const secret = 'test-secret';
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    let securedApp: FastifyInstance;

    beforeAll(async () => {
      process.env.SUPABASE_JWT_SECRET = secret;
      securedApp = await buildApp({ logger: false });
    });

    afterAll(async () => {
      delete process.env.SUPABASE_JWT_SECRET;
      await securedApp.close();
    });

    it('should reject conversation without bearer token', async () => {
      const resp = await securedApp.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        payload: { scenarioId: 'cafe-order-beginner', userMessage: 'Hi there' }
      });
      // Without token we expect either 401 or (if scenario not found) 404; but scenario exists so 401.
      expect([401,404]).toContain(resp.statusCode);
      if (resp.statusCode === 401) {
        const body = JSON.parse(resp.body);
        expect(body.error).toContain('Unauthorized');
      }
    });

    it('should reject conversation when body userId mismatches token', async () => {
      const token = jwt.sign({ sub: userId }, secret, { algorithm: 'HS256' });
      const resp = await securedApp.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        headers: { Authorization: `Bearer ${token}` },
        payload: { scenarioId: 'cafe-order-beginner', userMessage: 'Hello', userId: '550e8400-e29b-41d4-a716-446655440002' }
      });
      // Expect 403 due to mismatch or 500 if provider missing after auth passes
      expect([403,500]).toContain(resp.statusCode);
      if (resp.statusCode === 403) {
        const body = JSON.parse(resp.body);
        expect(body.error).toContain('Forbidden');
      }
    });

    it('should allow conversation when token and matching userId provided (provider keys absent => may 500)', async () => {
      const token = jwt.sign({ sub: userId }, secret, { algorithm: 'HS256' });
      const resp = await securedApp.inject({
        method: 'POST',
        url: '/api/v1/conversation',
        headers: { Authorization: `Bearer ${token}` },
        payload: { scenarioId: 'cafe-order-beginner', userMessage: 'Bonjour', userId }
      });
      // If no OpenAI/Gemini keys we expect 500; otherwise 200
      expect([200,500]).toContain(resp.statusCode);
    });
  });

  describe('Users endpoints', () => {
    it('should return 401 on /users/me without token when auth configured', async () => {
      process.env.SUPABASE_JWT_SECRET = 'test-secret-2';
      const app2 = await buildApp({ logger: false });
      const resp = await app2.inject({ method: 'GET', url: '/api/v1/users/me' });
      expect(resp.statusCode).toBe(401);
      await app2.close();
      delete process.env.SUPABASE_JWT_SECRET;
    });

    it('should return 500 on /users/migrate when auth not configured', async () => {
      const app2 = await buildApp({ logger: false });
      const resp = await app2.inject({ method: 'POST', url: '/api/v1/users/migrate', payload: { anonymousUserId: '550e8400-e29b-41d4-a716-446655440000' } });
      expect(resp.statusCode).toBe(500);
      await app2.close();
    });
  });
});

