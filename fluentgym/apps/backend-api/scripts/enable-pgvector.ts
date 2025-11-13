/**
 * Enable pgvector extension in Supabase
 * Run this before pushing the schema
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function enablePgVector() {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const sql = postgres(connectionString);

  try {
    console.log('Enabling pgvector extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    console.log('✓ pgvector extension enabled successfully');
  } catch (error) {
    console.error('Error enabling pgvector:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

enablePgVector().catch(console.error);
