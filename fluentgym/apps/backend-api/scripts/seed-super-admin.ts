/**
 * Seed super_admin user for system administration
 * Run with: tsx scripts/seed-super-admin.ts
 */

import { config } from 'dotenv';
config(); // Load .env file

import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001'; // Stable UUID
const SUPER_ADMIN_EMAIL = 'crusoehenrique3@gmail.com';
const SUPER_ADMIN_AUTH_PROVIDER_ID = 'system-admin-001';

async function seedSuperAdmin() {
  const db = getDb();
  if (!db) {
    console.error('❌ Database not initialized. Check POSTGRES_URL or SUPABASE_URL environment variables.');
    process.exit(1);
  }

  try {
    console.log('🔍 Checking for existing super_admin...');

    // Check if super_admin already exists
    const existing = await db.select().from(schema.users).where(eq(schema.users.id, SUPER_ADMIN_ID)).limit(1);

    if (existing.length > 0) {
      console.log('✅ Super admin already exists:', {
        id: existing[0].id,
        email: existing[0].email,
        totalXp: existing[0].totalXp,
        sessionsCompleted: existing[0].sessionsCompleted,
      });
      return;
    }

    console.log('🌱 Seeding super_admin user...');

    // Insert super_admin user with stable ID and admin role
    const [superAdmin] = await db.insert(schema.users).values({
      id: SUPER_ADMIN_ID,
      email: SUPER_ADMIN_EMAIL,
      authProviderId: SUPER_ADMIN_AUTH_PROVIDER_ID,
      role: 'admin', // Set admin role
      totalXp: 0,
      sessionsCompleted: 0,
    }).returning();

    console.log('✅ Super admin user created:', {
      id: superAdmin.id,
      email: superAdmin.email,
    });

    // Create profile for super_admin
    await db.insert(schema.userProfiles).values({
      userId: SUPER_ADMIN_ID,
      displayName: 'System Administrator',
      targetLanguage: 'en',
      nativeLanguage: 'en',
      proficiencyLevel: 'advanced',
      interests: ['system-administration', 'platform-management'],
      timezone: 'UTC',
    });

    console.log('✅ Super admin profile created');
    console.log('\n🎉 Super admin seeding complete!');
    console.log('\n📋 Super Admin Details:');
    console.log('   ID:', SUPER_ADMIN_ID);
    console.log('   Email:', SUPER_ADMIN_EMAIL);
    console.log('   Auth Provider ID:', SUPER_ADMIN_AUTH_PROVIDER_ID);
    console.log('\n💡 Use this ID when creating sessions or testing the system');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed super_admin:', error);
    process.exit(1);
  }
}

// Run seeder
seedSuperAdmin();
