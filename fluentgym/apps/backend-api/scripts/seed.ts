/**
 * Seed the database with initial skill packs
 */

import dotenv from 'dotenv';
import { getDb, schema } from '../src/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function upsertUser(email: string, role: 'learner' | 'creator' | 'admin', password: string, profile?: Partial<typeof schema.userProfiles.$inferInsert>) {
  const db = getDb();
  const existing = await db!.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length > 0) {
    console.log(`User exists: ${email}`);
    return existing[0];
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [inserted] = await db!.insert(schema.users).values({
    email,
    passwordHash,
    role,
    emailVerified: true,
  }).returning();

  await db!.insert(schema.userProfiles).values({
    userId: inserted.id,
    displayName: profile?.displayName || email.split('@')[0],
    avatarUrl: profile?.avatarUrl,
    targetLanguage: (profile as any)?.targetLanguage || 'english',
    nativeLanguage: (profile as any)?.nativeLanguage || 'portuguese',
    timezone: (profile as any)?.timezone || 'UTC',
  }).onConflictDoNothing({ target: [schema.userProfiles.userId] });

  console.log(`User created: ${email}`);
  return inserted;
}

async function upsertSkillPack(slug: string, data: Omit<typeof schema.skillPacks.$inferInsert, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string }) {
  const db = getDb();
  const existing = await db!.select().from(schema.skillPacks).where(eq(schema.skillPacks.slug, slug));
  if (existing.length > 0) {
    console.log(`Skill pack exists: ${slug}`);
    return existing[0];
  }
  const [inserted] = await db!.insert(schema.skillPacks).values({
    slug,
    name: data.name,
    domain: data.domain,
    version: data.version,
    config: data.config,
    tags: data.tags || [],
    isActive: data.isActive ?? true,
    authorId: data.authorId,
  }).returning();
  console.log(`Skill pack created: ${slug}`);
  return inserted;
}

async function upsertAchievement(name: string, data: Omit<typeof schema.achievements.$inferInsert, 'id' | 'name' | 'createdAt'>) {
  const db = getDb();
  const existing = await db!.select().from(schema.achievements).where(eq(schema.achievements.name, name));
  if (existing.length > 0) {
    console.log(`Achievement exists: ${name}`);
    return existing[0];
  }
  const [inserted] = await db!.insert(schema.achievements).values({
    name,
    ...data,
  }).returning();
  console.log(`Achievement created: ${name}`);
  return inserted;
}

async function upsertMarketplacePack(skillPackId: string, creatorId: string, price: number) {
  const db = getDb();
  const existing = await db!.select().from(schema.marketplacePacks).where(eq(schema.marketplacePacks.skillPackId, skillPackId));
  if (existing.length > 0) {
    console.log(`Marketplace pack exists for skill pack: ${skillPackId}`);
    return existing[0];
  }
  const [inserted] = await db!.insert(schema.marketplacePacks).values({
    skillPackId,
    creatorId,
    price,
    currency: 'USD',
    status: 'approved',
    description: 'Starter pack with practical speaking scenarios',
  }).returning();
  console.log(`Marketplace pack created for skill pack: ${skillPackId}`);
  return inserted;
}

async function seed() {
  const db = getDb();
  if (!db) throw new Error('Database connection failed');
  console.log('Seeding users, skill packs, marketplace packs, achievements...');

  // Users
  const admin = await upsertUser('admin@fluentgym.com', 'admin', 'Admin123!');
  const creator = await upsertUser('creator@fluentgym.com', 'creator', 'Creator123!', { displayName: 'Fluent Creator' });
  const learner = await upsertUser('learner@fluentgym.com', 'learner', 'Learner123!', { displayName: 'Fluent Learner' });

  // Skill Packs
  const englishBasics = await upsertSkillPack('english-basics', {
    name: 'English Basics',
    domain: 'language',
    version: '1.0.0',
    authorId: creator.id,
    config: {
      language: 'en',
      lessons: [
        { id: 'greetings', title: 'Greetings', objectives: ['Hello', 'Nice to meet you'] },
        { id: 'ordering', title: 'Ordering Food', objectives: ['Restaurant phrases', 'Politeness'] },
      ],
    },
    tags: ['beginner', 'conversation'],
  });
  const travelPack = await upsertSkillPack('travel-english', {
    name: 'Travel English',
    domain: 'language',
    version: '1.0.0',
    authorId: creator.id,
    config: {
      language: 'en',
      lessons: [
        { id: 'airport', title: 'At the Airport', objectives: ['Check-in', 'Security', 'Boarding'] },
        { id: 'hotel', title: 'At the Hotel', objectives: ['Check-in', 'Complaints', 'Requests'] },
      ],
    },
    tags: ['travel', 'practical'],
  });

  // Marketplace packs
  await upsertMarketplacePack(englishBasics.id, creator.id, 999); // $9.99
  await upsertMarketplacePack(travelPack.id, creator.id, 1299); // $12.99

  // Achievements
  await upsertAchievement('First Session', {
    description: 'Complete your first practice session',
    iconUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    category: 'sessions',
    requirement: { type: 'sessions_completed', count: 1 },
    xpReward: 50,
  });
  await upsertAchievement('Streak: 3 Days', {
    description: 'Practice 3 days in a row',
    iconUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    category: 'streak',
    requirement: { type: 'streak_days', count: 3 },
    xpReward: 100,
  });
  await upsertAchievement('XP: 1,000', {
    description: 'Earn 1,000 XP total',
    iconUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    category: 'xp',
    requirement: { type: 'total_xp', count: 1000 },
    xpReward: 200,
  });

  console.log('Seeding complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
