/**
 * Drizzle ORM Schema - Type-safe database models
 * Replaces raw Supabase queries with typed ORM
 */

import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, vector, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const domainEnum = pgEnum('domain', ['language', 'hacking', 'content-creation', 'music', 'fitness']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'paused', 'completed', 'abandoned']);
export const userRoleEnum = pgEnum('user_role', ['learner', 'creator', 'admin']);
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'github', 'apple']);
export const packStatusEnum = pgEnum('pack_status', ['draft', 'pending_review', 'approved', 'rejected', 'archived']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const recordingStatusEnum = pgEnum('recording_status', ['recording', 'processing', 'completed', 'failed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authProviderId: text('auth_provider_id').unique(),
  authProvider: text('auth_provider').default('email'), // email, google, github, apple
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'), // null for OAuth users
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpires: timestamp('email_verification_expires'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  role: text('role').default('learner'), // learner, creator, admin
  totalXp: integer('total_xp').default(0),
  sessionsCompleted: integer('sessions_completed').default(0),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  authProviderIdx: index('idx_users_auth_provider').on(table.authProvider),
}));

// User profiles
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  avatarGlbUrl: text('avatar_glb_url'), // Ready Player Me avatar
  avatarConfig: jsonb('avatar_config'), // Avatar customization data
  targetLanguage: text('target_language'),
  nativeLanguage: text('native_language'),
  proficiencyLevel: text('proficiency_level'),
  interests: text('interests').array().default([]),
  timezone: text('timezone'),
  notificationPreferences: jsonb('notification_preferences'),
  privacySettings: jsonb('privacy_settings'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Skill packs
export const skillPacks = pgTable('skill_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  domain: text('domain').notNull(),
  version: text('version').notNull(),
  config: jsonb('config').notNull(),
  tags: text('tags').array().default([]),
  isActive: boolean('is_active').default(true),
  authorId: uuid('author_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('idx_skill_packs_slug').on(table.slug),
  domainIdx: index('idx_skill_packs_domain').on(table.domain),
}));

// Sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  skillPackId: uuid('skill_pack_id').references(() => skillPacks.id, { onDelete: 'set null' }),
  scenarioId: text('scenario_id'),
  status: text('status').default('active'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  durationMinutes: integer('duration_minutes'),
  xpEarned: integer('xp_earned').default(0),
  config: jsonb('config'),
  metadata: jsonb('metadata'),
  adaptiveDifficulty: integer('adaptive_difficulty'),
  nextSessionRecommendation: text('next_session_recommendation'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_sessions_user').on(table.userId),
  skillPackIdx: index('idx_sessions_skill_pack').on(table.skillPackId),
  statusIdx: index('idx_sessions_status').on(table.status),
}));

// Session metrics (polymorphic per domain)
export const sessionMetrics = pgTable('session_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  completionPercentage: integer('completion_percentage'),
  accuracyScore: integer('accuracy_score'),
  engagementScore: integer('engagement_score'),
  metrics: jsonb('metrics'), // Domain-specific metrics
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sessionIdx: index('idx_session_metrics_session').on(table.sessionId),
}));

// Memory entries (pgvector for embeddings)
export const memoryEntries = pgTable('memory_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  embedding: vector('embedding', { dimensions: 1536 }),
  summary: text('summary'),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_memory_entries_user').on(table.userId),
  embeddingIdx: index('idx_memory_entries_embedding').using('ivfflat', table.embedding.op('vector_cosine_ops')),
}));

// Token usage logging
export const tokenUsage = pgTable('token_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  sessionId: uuid('session_id'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').default(0),
  completionTokens: integer('completion_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  costUsd: integer('cost_usd'), // store in micro-dollars? can refine later
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  providerIdx: index('idx_token_usage_provider').on(table.provider),
  modelIdx: index('idx_token_usage_model').on(table.model),
  userIdx: index('idx_token_usage_user').on(table.userId),
}));

// ============= NEW TABLES FOR COMPLETE FUNCTIONALITY =============

// Refresh tokens for JWT auth
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  revokedAt: timestamp('revoked_at'),
}, (table) => ({
  tokenIdx: index('idx_refresh_tokens_token').on(table.token),
  userIdx: index('idx_refresh_tokens_user').on(table.userId),
}));

// LiveKit rooms
export const livekitRooms = pgTable('livekit_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomName: text('room_name').notNull().unique(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  status: text('status').default('active'), // active, ended
  maxParticipants: integer('max_participants').default(2),
  createdAt: timestamp('created_at').defaultNow(),
  endedAt: timestamp('ended_at'),
}, (table) => ({
  roomNameIdx: index('idx_livekit_rooms_name').on(table.roomName),
  sessionIdx: index('idx_livekit_rooms_session').on(table.sessionId),
}));

// Session recordings
export const sessionRecordings = pgTable('session_recordings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id').references(() => livekitRooms.id),
  status: text('status').default('recording'), // recording, processing, completed, failed
  recordingUrl: text('recording_url'),
  transcriptUrl: text('transcript_url'),
  duration: integer('duration'), // seconds
  fileSize: integer('file_size'), // bytes
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  sessionIdx: index('idx_recordings_session').on(table.sessionId),
}));

// Speech transcriptions
export const speechTranscriptions = pgTable('speech_transcriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  audioUrl: text('audio_url'),
  transcript: text('transcript'),
  confidence: integer('confidence'), // 0-100
  language: text('language'),
  duration: integer('duration'), // seconds
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sessionIdx: index('idx_transcriptions_session').on(table.sessionId),
  userIdx: index('idx_transcriptions_user').on(table.userId),
}));

// Pronunciation analysis
export const pronunciationAnalyses = pgTable('pronunciation_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  transcriptionId: uuid('transcription_id').references(() => speechTranscriptions.id),
  sessionId: uuid('session_id').references(() => sessions.id),
  userId: uuid('user_id').references(() => users.id),
  word: text('word'),
  phonemes: jsonb('phonemes'), // Array of phoneme scores
  accuracyScore: integer('accuracy_score'), // 0-100
  fluencyScore: integer('fluency_score'),
  prosodyScore: integer('prosody_score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sessionIdx: index('idx_pronunciation_session').on(table.sessionId),
}));

// Marketplace skill packs (extended from skill_packs)
export const marketplacePacks = pgTable('marketplace_packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  skillPackId: uuid('skill_pack_id').references(() => skillPacks.id, { onDelete: 'cascade' }),
  creatorId: uuid('creator_id').references(() => users.id),
  price: integer('price'), // cents
  currency: text('currency').default('USD'),
  status: text('status').default('draft'), // draft, pending_review, approved, rejected, archived
  downloads: integer('downloads').default(0),
  revenue: integer('revenue').default(0), // cents
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  previewUrl: text('preview_url'),
  createdAt: timestamp('created_at').defaultNow(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  creatorIdx: index('idx_marketplace_creator').on(table.creatorId),
  statusIdx: index('idx_marketplace_status').on(table.status),
}));

// Pack reviews
export const packReviews = pgTable('pack_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  packId: uuid('pack_id').references(() => marketplacePacks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  rating: integer('rating').notNull(), // 1-5
  review: text('review'),
  helpful: integer('helpful').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  packIdx: index('idx_reviews_pack').on(table.packId),
  userIdx: index('idx_reviews_user').on(table.userId),
}));

// Payments (Stripe)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  packId: uuid('pack_id').references(() => marketplacePacks.id),
  stripePaymentId: text('stripe_payment_id').unique(),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').default('USD'),
  status: text('status').default('pending'), // pending, completed, failed, refunded
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdx: index('idx_payments_user').on(table.userId),
  stripeIdx: index('idx_payments_stripe').on(table.stripePaymentId),
}));

// Creator payouts
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').references(() => users.id),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  stripeTransferId: text('stripe_transfer_id'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  creatorIdx: index('idx_payouts_creator').on(table.creatorId),
}));

// Achievements
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  category: text('category'), // streak, xp, sessions, skill-specific
  requirement: jsonb('requirement'), // Conditions to unlock
  xpReward: integer('xp_reward').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// User achievements
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id').references(() => achievements.id),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_user_achievements_user').on(table.userId),
  achievementIdx: index('idx_user_achievements_achievement').on(table.achievementId),
}));

// Streaks
export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  streakStartDate: timestamp('streak_start_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_streaks_user').on(table.userId),
}));

// External integrations
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // google-calendar, notion, github, etc.
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  config: jsonb('config'), // Provider-specific settings
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_integrations_user').on(table.userId),
  providerIdx: index('idx_integrations_provider').on(table.provider),
}));

// Calendar events (for scheduled practice)
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  integrationId: uuid('integration_id').references(() => integrations.id),
  externalEventId: text('external_event_id'),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  skillPackId: uuid('skill_pack_id').references(() => skillPacks.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_calendar_events_user').on(table.userId),
}));

// Audit logs (security)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  action: text('action').notNull(), // login, logout, delete_account, etc.
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_audit_logs_user').on(table.userId),
  actionIdx: index('idx_audit_logs_action').on(table.action),
}));

// Push notification tokens (mobile)
export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  platform: text('platform'), // ios, android
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_push_tokens_user').on(table.userId),
}));

// Daily quests (gamification)
export const dailyQuests = pgTable('daily_quests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  questDate: timestamp('quest_date').notNull(),
  quests: jsonb('quests'), // Array of quest definitions
  completedQuests: text('completed_quests').array().default([]),
  xpEarned: integer('xp_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_daily_quests_user').on(table.userId),
  dateIdx: index('idx_daily_quests_date').on(table.questDate),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(sessions),
  memories: many(memoryEntries),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  skillPack: one(skillPacks, {
    fields: [sessions.skillPackId],
    references: [skillPacks.id],
  }),
  metrics: many(sessionMetrics),
}));

export const skillPacksRelations = relations(skillPacks, ({ many }) => ({
  sessions: many(sessions),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SkillPack = typeof skillPacks.$inferSelect;
export type NewSkillPack = typeof skillPacks.$inferInsert;
export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type NewMemoryEntry = typeof memoryEntries.$inferInsert;
export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type LivekitRoom = typeof livekitRooms.$inferSelect;
export type NewLivekitRoom = typeof livekitRooms.$inferInsert;
export type SessionRecording = typeof sessionRecordings.$inferSelect;
export type NewSessionRecording = typeof sessionRecordings.$inferInsert;
export type SpeechTranscription = typeof speechTranscriptions.$inferSelect;
export type NewSpeechTranscription = typeof speechTranscriptions.$inferInsert;
export type PronunciationAnalysis = typeof pronunciationAnalyses.$inferSelect;
export type NewPronunciationAnalysis = typeof pronunciationAnalyses.$inferInsert;
export type MarketplacePack = typeof marketplacePacks.$inferSelect;
export type NewMarketplacePack = typeof marketplacePacks.$inferInsert;
export type PackReview = typeof packReviews.$inferSelect;
export type NewPackReview = typeof packReviews.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type PushToken = typeof pushTokens.$inferSelect;
export type NewPushToken = typeof pushTokens.$inferInsert;
export type DailyQuest = typeof dailyQuests.$inferSelect;
export type NewDailyQuest = typeof dailyQuests.$inferInsert;
