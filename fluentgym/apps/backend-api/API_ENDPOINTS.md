# FluentGym Backend API - Endpoints Reference

**Base URL:** `http://localhost:3001`  
**API Version:** v1

## 🔐 Authentication

All authenticated endpoints require either:
- JWT token in `Authorization: Bearer <token>` header
- Or no auth if `SUPABASE_JWT_SECRET` is not configured (development mode)

---

## 📋 Available Endpoints

### **Auth Routes** (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | Login with email/password | ❌ |
| POST | `/api/v1/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/v1/auth/logout` | Logout (revoke tokens) | ✅ |
| POST | `/api/v1/auth/2fa/setup` | Setup 2FA | ✅ |
| POST | `/api/v1/auth/2fa/verify` | Verify 2FA code | ✅ |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA | ✅ |
| POST | `/api/v1/auth/password/forgot` | Request password reset | ❌ |
| POST | `/api/v1/auth/password/reset` | Reset password with token | ❌ |
| POST | `/api/v1/auth/verify-email` | Verify email with token | ❌ |
| GET | `/api/v1/auth/google` | Google OAuth redirect | ❌ |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback | ❌ |
| GET | `/api/v1/auth/github` | GitHub OAuth redirect | ❌ |
| GET | `/api/v1/auth/github/callback` | GitHub OAuth callback | ❌ |

### **Speech Routes** (`/api/v1/speech`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/speech/voices` | List OpenAI TTS voices | ❌ |
| POST | `/api/v1/speech/transcribe` | Transcribe audio (Whisper) | ✅ |
| POST | `/api/v1/speech/synthesize` | Text-to-speech (OpenAI TTS) | ✅ |
| POST | `/api/v1/speech/analyze` | Pronunciation analysis | ✅ |

**Transcribe/Analyze:** Supports `audioBase64` or file buffer. Uploads to Cloudinary if configured.

### **Avatar Routes** (`/api/v1/avatars`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/avatars/create-url` | Get Ready Player Me creation URL | ✅ |
| GET | `/api/v1/avatars/me` | Get user's avatar | ✅ |
| POST | `/api/v1/avatars/save` | Save avatar GLB URL | ✅ |
| POST | `/api/v1/avatars/customize` | Customize avatar appearance | ✅ |
| GET | `/api/v1/avatars/animations` | List available animations | ❌ |
| DELETE | `/api/v1/avatars/me` | Delete user's avatar | ✅ |

**Save endpoint:** Optionally accepts `thumbnailBase64` for Cloudinary upload.

### **Marketplace Routes** (`/api/v1/marketplace`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/marketplace/packs` | List approved skill packs | ❌ |
| GET | `/api/v1/marketplace/packs/:id` | Get pack details + reviews | ❌ |
| POST | `/api/v1/marketplace/packs` | Create new pack listing | ✅ (creator) |
| POST | `/api/v1/marketplace/purchase` | Create Stripe checkout session | ✅ |
| POST | `/api/v1/marketplace/reviews` | Add pack review | ✅ |

**Purchase:** Requires `STRIPE_SECRET_KEY` configured.

### **Calendar Routes** (`/api/v1/calendar`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/calendar/google/auth-url` | Get Google OAuth URL | ✅ |
| POST | `/api/v1/calendar/google/exchange` | Exchange OAuth code for tokens | ✅ |
| GET | `/api/v1/calendar/events` | List calendar events | ✅ |
| POST | `/api/v1/calendar/schedule` | Schedule practice session | ✅ |

**Status:** Stubbed implementation - returns mock data until real OAuth configured.

### **LiveKit Routes** (`/api/v1/livekit`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/livekit/token` | Generate LiveKit access token | ✅ |
| POST | `/api/v1/livekit/rooms` | Create LiveKit room | ✅ |
| POST | `/api/v1/livekit/rooms/:roomName/end` | End room session | ✅ |
| GET | `/api/v1/livekit/rooms` | List active rooms | ✅ |

**Requires:** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` env vars.

### **Session Routes** (`/api/v1/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/sessions` | List user sessions | ✅ |
| POST | `/api/v1/sessions` | Create new session | ✅ |
| GET | `/api/v1/sessions/:id` | Get session details | ✅ |
| PATCH | `/api/v1/sessions/:id` | Update session | ✅ |
| DELETE | `/api/v1/sessions/:id` | Delete session | ✅ |

### **Memory Routes** (`/api/v1/memories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/memories` | List user memories | ✅ |
| POST | `/api/v1/memories` | Create memory entry | ✅ |
| GET | `/api/v1/memories/search` | Semantic search (pgvector) | ✅ |
| DELETE | `/api/v1/memories/:id` | Delete memory | ✅ |

### **User Routes** (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/me` | Get current user profile | ✅ |
| PATCH | `/api/v1/users/me` | Update user profile | ✅ |
| DELETE | `/api/v1/users/me` | Delete account | ✅ |

### **Skill Pack Routes** (`/api/v1/skill-packs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/skill-packs` | List skill packs | ❌ |
| GET | `/api/v1/skill-packs/:slug` | Get pack by slug | ❌ |
| POST | `/api/v1/skill-packs` | Create skill pack | ✅ (creator/admin) |
| PATCH | `/api/v1/skill-packs/:id` | Update skill pack | ✅ (author/admin) |

---

## 🗄️ Database

**Schema:** 24 tables (PostgreSQL + pgvector)
- Users, profiles, sessions, memories
- Skill packs, marketplace packs, reviews, payments
- Achievements, streaks, daily quests
- Speech transcriptions, pronunciation analyses
- LiveKit rooms, recordings
- Integrations, calendar events
- Audit logs, push tokens

**Migrations:** Applied via Drizzle ORM  
**Seed Data:** 3 users, 2 skill packs, 3 achievements, 2 marketplace packs

---

## 🔧 Environment Variables

### Required
- `OPENAI_API_KEY` - For GPT-4, Whisper, TTS
- `POSTGRES_URL` - PostgreSQL connection (with pgvector)

### Optional
- `GEMINI_API_KEY` - Google Gemini (alternative LLM)
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` - Real-time audio/video
- `STRIPE_SECRET_KEY` - Marketplace payments
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - File storage
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Calendar integration
- `SMTP_*` - Email delivery
- `REDIS_URL` - Job queues (Bull)

---

## 🧪 Testing Seed Accounts

```bash
# Admin
Email: admin@fluentgym.com
Password: Admin123!

# Creator
Email: creator@fluentgym.com
Password: Creator123!

# Learner
Email: learner@fluentgym.com
Password: Learner123!
```

---

## 📊 API Documentation

**Swagger UI:** `http://localhost:3001/docs`  
**OpenAPI JSON:** `http://localhost:3001/docs/json`

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run db:push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

Server runs on `http://localhost:3001` 🎉
