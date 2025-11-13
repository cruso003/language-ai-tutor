import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Prefer non-pooling URL for schema introspection/migrations to avoid PgBouncer issues
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || ''
  }
} satisfies Config;
