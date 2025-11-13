/**
 * Role-Based Access Control (RBAC) Middleware
 * Protect endpoints based on user roles: learner, creator, admin
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { unauthorized, forbidden } from '../utils/errors.js';

export type UserRole = 'learner' | 'creator' | 'admin';

export interface RBACOptions {
  roles: UserRole[];
  checkOwnership?: boolean; // Check if userId in request matches authenticated user
}

/**
 * RBAC middleware factory
 * Usage: app.get('/admin/endpoint', { preHandler: requireRoles(['admin']) }, handler)
 */
export function requireRoles(roles: UserRole | UserRole[], checkOwnership = false) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    if (!db) {
      throw forbidden('Database not configured');
    }

    // Check if user is authenticated (if JWT auth is enabled)
    const userId = (request as any).auth?.userId || (request.body as any)?.userId || (request.params as any)?.userId;
    
    if (!userId) {
      throw unauthorized('Authentication required');
    }

    // Fetch user with role
    const users = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

    if (!users.length) {
      throw unauthorized('User not found');
    }

    const user = users[0];
    const userRole = (user.role || 'learner') as UserRole;

    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      throw forbidden(`Access denied. Required role(s): ${allowedRoles.join(', ')}`);
    }

    // Optionally check ownership
    if (checkOwnership) {
      const requestUserId = (request.body as any)?.userId || (request.params as any)?.userId;
      if (requestUserId && requestUserId !== userId) {
        throw forbidden('Access denied. You can only access your own resources.');
      }
    }

    // Attach user role to request for downstream handlers
    (request as any).userRole = userRole;
    (request as any).userId = userId;
  };
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const users = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!users.length) return false;

  return users[0].role === 'admin';
}

/**
 * Check if user is creator or admin
 */
export async function isCreatorOrAdmin(userId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const users = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!users.length) return false;

  const role = users[0].role || 'learner';
  return role === 'creator' || role === 'admin';
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRoles('admin');

/**
 * Middleware to require creator or admin role
 */
export const requireCreator = requireRoles(['creator', 'admin']);

/**
 * Middleware to require learner role (any authenticated user)
 */
export const requireAuth = requireRoles(['learner', 'creator', 'admin']);
