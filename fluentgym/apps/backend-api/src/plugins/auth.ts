import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

export interface AuthContext {
  userId: string;
  claims: any;
}

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.SUPABASE_JWT_SECRET);
}

function parseBearer(req: FastifyRequest): string | null {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (!h || Array.isArray(h)) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

export function verifyAndAttachAuth(req: FastifyRequest): void {
  if (!isAuthEnabled()) return; // no-op when disabled
  const token = parseBearer(req);
  if (!token) return; // let guard determine enforcement
  try {
    const secret = process.env.SUPABASE_JWT_SECRET as string;
    const claims = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const sub = (claims as any).sub as string | undefined;
    if (sub) {
      req.auth = { userId: sub, claims };
    }
  } catch {
    // invalid token; leave req.auth undefined, guard will handle if required
  }
}

export function authGuard(_app: FastifyInstance) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!isAuthEnabled()) return; // not enforced when disabled
    verifyAndAttachAuth(req);
    if (!req.auth?.userId) {
      return reply.status(401).send({ error: 'Unauthorized: missing or invalid token' });
    }
  };
}

/**
 * Helper to assert that body.userId, if present, matches the authenticated user when auth is enabled.
 */
export function assertUserIdMatches(req: FastifyRequest, bodyUserId?: string): { ok: boolean; error?: { status: number; payload: any } } {
  if (!isAuthEnabled()) return { ok: true };
  const authUserId = req.auth?.userId;
  if (!authUserId) return { ok: false, error: { status: 401, payload: { error: 'Unauthorized: missing or invalid token' } } };
  if (bodyUserId && bodyUserId !== authUserId) {
    return { ok: false, error: { status: 403, payload: { error: 'Forbidden: userId mismatch' } } };
  }
  return { ok: true };
}
