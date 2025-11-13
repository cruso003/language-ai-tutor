/**
 * JWT Authentication Middleware
 * Verify JWT tokens and attach user to request
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * JWT Authentication middleware
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    // Attach user to request
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    reply.code(401).send({ error: 'Invalid or expired token' });
  }
}

/**
 * Register authentication decorator
 */
export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', authenticate);
}
