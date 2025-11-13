/**
 * Migration: Add RBAC role column to users table
 * Run with: tsx scripts/migrate-rbac.ts
 */

import { config } from 'dotenv';
config();

import { getDb } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

async function migrateRBAC() {
  const db = getDb();
  if (!db) {
    console.error('❌ Database not initialized. Check POSTGRES_URL or SUPABASE_URL environment variables.');
    process.exit(1);
  }

  try {
    console.log('🔄 Adding role column to users table...');

    // Add role column with default value 'learner'
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'learner'
    `);

    console.log('✅ Role column added');

    // Update super_admin to have admin role
    console.log('🔄 Updating super_admin role...');
    
    await db.execute(sql`
      UPDATE users 
      SET role = 'admin' 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    `);

    console.log('✅ Super admin role updated');

    // Create index for role lookups
    console.log('🔄 Creating role index...');
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);

    console.log('✅ Role index created');

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    
    const result = await db.execute(sql`
      SELECT id, email, role 
      FROM users 
      WHERE id = '00000000-0000-0000-000000000001'
    `);

    // db.execute can return either an array of rows or an object containing `.rows`
    const rows = Array.isArray(result) ? result : (result as any)?.rows ?? [];
    console.log('📋 Super Admin:', rows[0] ?? null);
    
    console.log('\n🎉 RBAC migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateRBAC();
