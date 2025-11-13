CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google', 'github', 'apple');--> statement-breakpoint
CREATE TYPE "public"."domain" AS ENUM('language', 'hacking', 'content-creation', 'music', 'fitness');--> statement-breakpoint
CREATE TYPE "public"."pack_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."recording_status" AS ENUM('recording', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'paused', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('learner', 'creator', 'admin');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text,
	"category" text,
	"requirement" jsonb,
	"xp_reward" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"integration_id" uuid,
	"external_event_id" text,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"skill_pack_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"quest_date" timestamp NOT NULL,
	"quests" jsonb,
	"completed_quests" text[] DEFAULT '{}',
	"xp_earned" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"provider" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"config" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "livekit_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_name" text NOT NULL,
	"session_id" uuid,
	"user_id" uuid,
	"status" text DEFAULT 'active',
	"max_participants" integer DEFAULT 2,
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	CONSTRAINT "livekit_rooms_room_name_unique" UNIQUE("room_name")
);
--> statement-breakpoint
CREATE TABLE "marketplace_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_pack_id" uuid,
	"creator_id" uuid,
	"price" integer,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'draft',
	"downloads" integer DEFAULT 0,
	"revenue" integer DEFAULT 0,
	"description" text,
	"thumbnail_url" text,
	"preview_url" text,
	"created_at" timestamp DEFAULT now(),
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "memory_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid,
	"embedding" vector(1536),
	"summary" text,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pack_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_id" uuid,
	"user_id" uuid,
	"rating" integer NOT NULL,
	"review" text,
	"helpful" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"pack_id" uuid,
	"stripe_payment_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "payments_stripe_payment_id_unique" UNIQUE("stripe_payment_id")
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"stripe_transfer_id" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pronunciation_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcription_id" uuid,
	"session_id" uuid,
	"user_id" uuid,
	"word" text,
	"phonemes" jsonb,
	"accuracy_score" integer,
	"fluency_score" integer,
	"prosody_score" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"token" text NOT NULL,
	"platform" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"token" text NOT NULL,
	"device_info" text,
	"ip_address" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"domain" text NOT NULL,
	"completion_percentage" integer,
	"accuracy_score" integer,
	"engagement_score" integer,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"room_id" uuid,
	"status" text DEFAULT 'recording',
	"recording_url" text,
	"transcript_url" text,
	"duration" integer,
	"file_size" integer,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"skill_pack_id" uuid,
	"scenario_id" text,
	"status" text DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration_minutes" integer,
	"xp_earned" integer DEFAULT 0,
	"config" jsonb,
	"metadata" jsonb,
	"adaptive_difficulty" integer,
	"next_session_recommendation" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skill_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"version" text NOT NULL,
	"config" jsonb NOT NULL,
	"tags" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"author_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "skill_packs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "speech_transcriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"user_id" uuid,
	"audio_url" text,
	"transcript" text,
	"confidence" integer,
	"language" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"streak_start_date" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_tokens" integer DEFAULT 0,
	"completion_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"cost_usd" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"achievement_id" uuid,
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"avatar_glb_url" text,
	"avatar_config" jsonb,
	"target_language" text,
	"native_language" text,
	"proficiency_level" text,
	"interests" text[] DEFAULT '{}',
	"timezone" text,
	"notification_preferences" jsonb,
	"privacy_settings" jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_provider_id" text,
	"auth_provider" text DEFAULT 'email',
	"email" text NOT NULL,
	"password_hash" text,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"two_factor_secret" text,
	"two_factor_enabled" boolean DEFAULT false,
	"role" text DEFAULT 'learner',
	"total_xp" integer DEFAULT 0,
	"sessions_completed" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_auth_provider_id_unique" UNIQUE("auth_provider_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_skill_pack_id_skill_packs_id_fk" FOREIGN KEY ("skill_pack_id") REFERENCES "public"."skill_packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_quests" ADD CONSTRAINT "daily_quests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livekit_rooms" ADD CONSTRAINT "livekit_rooms_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livekit_rooms" ADD CONSTRAINT "livekit_rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_packs" ADD CONSTRAINT "marketplace_packs_skill_pack_id_skill_packs_id_fk" FOREIGN KEY ("skill_pack_id") REFERENCES "public"."skill_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_packs" ADD CONSTRAINT "marketplace_packs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_entries" ADD CONSTRAINT "memory_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_entries" ADD CONSTRAINT "memory_entries_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_reviews" ADD CONSTRAINT "pack_reviews_pack_id_marketplace_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."marketplace_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_reviews" ADD CONSTRAINT "pack_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_pack_id_marketplace_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."marketplace_packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_analyses" ADD CONSTRAINT "pronunciation_analyses_transcription_id_speech_transcriptions_id_fk" FOREIGN KEY ("transcription_id") REFERENCES "public"."speech_transcriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_analyses" ADD CONSTRAINT "pronunciation_analyses_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_analyses" ADD CONSTRAINT "pronunciation_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_metrics" ADD CONSTRAINT "session_metrics_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_room_id_livekit_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."livekit_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_skill_pack_id_skill_packs_id_fk" FOREIGN KEY ("skill_pack_id") REFERENCES "public"."skill_packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_transcriptions" ADD CONSTRAINT "speech_transcriptions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_transcriptions" ADD CONSTRAINT "speech_transcriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_user" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_quests_user" ON "daily_quests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_quests_date" ON "daily_quests" USING btree ("quest_date");--> statement-breakpoint
CREATE INDEX "idx_integrations_user" ON "integrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_integrations_provider" ON "integrations" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_livekit_rooms_name" ON "livekit_rooms" USING btree ("room_name");--> statement-breakpoint
CREATE INDEX "idx_livekit_rooms_session" ON "livekit_rooms" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_creator" ON "marketplace_packs" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_status" ON "marketplace_packs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_memory_entries_user" ON "memory_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_memory_entries_embedding" ON "memory_entries" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_pack" ON "pack_reviews" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_user" ON "pack_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_user" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_stripe" ON "payments" USING btree ("stripe_payment_id");--> statement-breakpoint
CREATE INDEX "idx_payouts_creator" ON "payouts" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "idx_pronunciation_session" ON "pronunciation_analyses" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_push_tokens_user" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_metrics_session" ON "session_metrics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_recordings_session" ON "session_recordings" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_skill_pack" ON "sessions" USING btree ("skill_pack_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_status" ON "sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_skill_packs_slug" ON "skill_packs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_skill_packs_domain" ON "skill_packs" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_transcriptions_session" ON "speech_transcriptions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_transcriptions_user" ON "speech_transcriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_streaks_user" ON "streaks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_token_usage_provider" ON "token_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_token_usage_model" ON "token_usage" USING btree ("model");--> statement-breakpoint
CREATE INDEX "idx_token_usage_user" ON "token_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_achievement" ON "user_achievements" USING btree ("achievement_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_auth_provider" ON "users" USING btree ("auth_provider");