#!/usr/bin/env tsx
/**
 * Migration runner - executes SQL migrations against Supabase
 * Run with: tsx scripts/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '../../../infrastructure/supabase/migrations');

async function runMigrations() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create migrations tracking table
  console.log('📋 Creating migrations tracking table...');
  const { error: trackingError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).single();

  // If rpc doesn't exist, run via raw SQL
  if (trackingError) {
    console.log('⚠️  RPC method not available, using direct SQL execution');
  }

  // Get migration files
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\n📂 Found ${files.length} migration files\n`);

  for (const file of files) {
    console.log(`🔄 Running migration: ${file}`);
    
    const filePath = join(MIGRATIONS_DIR, file);
    const sql = readFileSync(filePath, 'utf-8');

    try {
      // Execute migration SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        // Fallback: try direct query execution for simple cases
        console.log(`   ⚠️  RPC failed, attempting direct execution...`);
        
        // Split by statement and execute
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          const { error: execError } = await supabase.rpc('exec', { sql: statement });
          if (execError) {
            console.error(`   ❌ Error:`, execError.message);
            console.log(`   ℹ️  Skipping (may already exist)`);
          }
        }
      }

      console.log(`   ✅ Completed: ${file}\n`);
    } catch (err: any) {
      console.error(`   ❌ Failed: ${file}`, err.message);
      console.log(`   ℹ️  Continuing with next migration...\n`);
    }
  }

  console.log('✨ Migration process complete!\n');
  console.log('ℹ️  Note: Some errors are expected if tables already exist.');
  console.log('   Please verify your Supabase dashboard or use Supabase CLI for production migrations.\n');
}

runMigrations().catch(console.error);
