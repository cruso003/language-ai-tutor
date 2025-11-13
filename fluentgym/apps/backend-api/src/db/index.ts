/**
 * Drizzle DB connection
 * Typed database client using connection pooling
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || buildSupabaseConnectionString();
  
  if (!connectionString) {
    console.warn('No POSTGRES_URL or DATABASE_URL configured. Database operations will fail.');
    return null;
  }

  const queryClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  _db = drizzle(queryClient, { schema });
  return _db;
}

function buildSupabaseConnectionString(): string | null {
  const url = process.env.SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  
  if (!url || !password) return null;

  // Extract project ref from URL (e.g., https://PROJECT.supabase.co)
  const projectRef = url.replace('https://', '').replace('.supabase.co', '');
  
  return `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

export { schema };

// Lazy-initialized db instance - call getDb() to access
// This prevents "No POSTGRES_URL" warning during module load
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error('Database not configured. Please set POSTGRES_URL or DATABASE_URL environment variable.');
    }
    return (instance as any)[prop];
  }
});
