/**
 * Auth Routes - Authentication endpoints
 */

import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twoFactorCode: z.string().optional(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  // Register
  fastify.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await authService.register(body);
    reply.code(201).send(result);
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const deviceInfo = request.headers['user-agent'];
    const ipAddress = request.ip;
    
    const result = await authService.login(body, deviceInfo, ipAddress);
    reply.send(result);
  });

  // Verify email
  fastify.get('/auth/verify-email', async (request, reply) => {
    const { token } = request.query as { token: string };
    const result = await authService.verifyEmail(token);
    reply.send(result);
  });

  // Request password reset
  fastify.post('/auth/forgot-password', async (request, reply) => {
    const { email } = request.body as { email: string };
    const result = await authService.requestPasswordReset(email);
    reply.send(result);
  });

  // Reset password
  fastify.post('/auth/reset-password', async (request, reply) => {
    const body = resetPasswordSchema.parse(request.body);
    const result = await authService.resetPassword(body.token, body.newPassword);
    reply.send(result);
  });

  // Change password (authenticated)
  fastify.post('/auth/change-password', {
    preHandler: [fastify.authenticate as any],
  }, async (request, reply) => {
    const body = changePasswordSchema.parse(request.body);
    const userId = (request.user as any).userId;
    
    const result = await authService.changePassword(userId, body.currentPassword, body.newPassword);
    reply.send(result);
  });

  // Enable 2FA
  fastify.post('/auth/enable-2fa', {
    preHandler: [fastify.authenticate as any],
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const result = await authService.enable2FA(userId);
    reply.send(result);
  });

  // Verify and activate 2FA
  fastify.post('/auth/verify-2fa', {
    preHandler: [fastify.authenticate as any],
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { code } = request.body as { code: string };
    
    const result = await authService.verify2FA(userId, code);
    reply.send(result);
  });

  // Disable 2FA
  fastify.post('/auth/disable-2fa', {
    preHandler: [fastify.authenticate as any],
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { code } = request.body as { code: string };
    
    const result = await authService.disable2FA(userId, code);
    reply.send(result);
  });

  // Refresh token
  fastify.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    const result = await authService.refreshAccessToken(refreshToken);
    reply.send(result);
  });

  // Logout
  fastify.post('/auth/logout', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    const result = await authService.logout(refreshToken);
    reply.send(result);
  });
}
