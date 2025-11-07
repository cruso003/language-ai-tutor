# Unified AI Learning Platform — Design Blueprint

**Project name:** FluentGym / Unified AI Learning Companion

**Purpose:** A single adaptive AI-powered platform that teaches any skill (language learning, ethical hacking, content creation, IoT, etc.) via modular skill packs, personalized plans, and integrated progress tracking. The system includes a mobile-focused learning app (primary interaction), a web/desktop dashboard for planning and analytics, and modular integrations (calendar, Notion, TryHackMe, YouTube, GitHub).

---

## 1. Executive Summary

Build a unified, extensible learning platform that behaves like a personal tutor: it creates daily challenges, guides step-by-step, accepts multiple media types (text, audio, video, code), scores and gives feedback, stores a lifelong memory of the learner's progress, and integrates with existing tools. The product supports both short micro-lessons and deep project-based learning.

Core value: **one AI brain that adapts to whatever you decide to learn next**.

---

## 2. Goals & Success Metrics

**Primary goals**
- Enable daily practice with minimal friction.
- Provide AI tutoring tailored to each skill.
- Track measurable outcomes (streaks, XP, portfolio items).
- Connect with ecosystems (calendar, Notion, TryHackMe, YouTube).

**Success metrics (KPIs)**
- DAU/MAU ratio for active learners.
- Average streak length per user.
- Content output per user (videos/posts created) per month.
- Completion rate for daily tasks.
- NPS / user satisfaction for AI tutoring sessions.

---

## 3. User Personas

- **Solo Learner (Crusoe)** — multi-disciplinary learner; wants daily structure and portfolio.
- **Creator** — focuses on turning learning into content; needs repurposing tools + analytics.
- **Polyglot** — primary interest in languages; needs conversation practice + pronunciation feedback.
- **Security Student** — focuses on safe hacking labs and task scaffolding.
- **Instructor / Mentor** — uploads curriculum and reviews students.

---

## 4. Product Concept & Feature List

### Must-have (MVP)
- Auth & profile (SSO using Supabase/Auth0)
- Daily Plan & Scheduler
- AI Tutor Chat (multi-domain) with context-aware prompts
- Session logging (text/audio/video/code) and media upload
- Progress visualization (streaks, heatmap, charts)
- Notifications (mobile push + web push)
- Basic integrations: Google Calendar + Notion export
- Webhooks for external apps (language app / TryHackMe)

### High-priority nice-to-have
- Deep links to open mobile lessons from dashboard
- Gamification: XP, badges, leveling
- AI-generated micro-tasks & assessments
- Auto-summary + suggested follow-ups (AI)
- Media transcription & searchable transcripts

### Future / Advanced
- Live practice rooms (LiveKit) with recording
- Custom skill store (upload community skill packs)
- AI-assessed portfolio review (grading code, videos)
- Offline mode with conflict-resolution

---

## 5. System Architecture (High-level)

**Overview:**
- Frontends: Mobile app (React Native / Expo) for learning interactions; Web app (Next.js) for dashboard, planning, and analytics; Optional Desktop wrapper (Tauri/Electron).
- Backend: Supabase (Postgres) + Edge Functions or Node.js microservices for business logic.
- AI Layer: OpenAI GPT-5 for core tutoring + embeddings for memory/recall. Optionally run smaller local models as fallback for offline.
- Media storage: Supabase Storage or Cloudinary / S3.
- Notifications: OneSignal or Firebase Cloud Messaging.
- Real-time media: LiveKit for audio/video rooms.

```
Mobile App (React Native) <--> API (Supabase + Edge Functions) <--> AI (OpenAI)
                                         |
                                      Storage (Cloudinary/S3)
                                         |
                           Web Dashboard (Next.js) <--> Integrations (Google, Notion, TryHackMe)
```

---

## 6. Data Model & Core Tables

### `users`
- id UUID
- email
- display_name
- preferences (jsonb)
- created_at, updated_at

### `sessions`
- id UUID
- user_id
- date
- skill_type ENUM ('language','hacking','content','iot',...)
- source ENUM ('mobile','web')
- title
- description
- duration_minutes
- media_url (nullable)
- transcript_url (nullable)
- ai_summary (nullable)
- xp_points
- completed BOOLEAN
- metadata JSONB

### `skill_packs`
- id
- slug
- name
- config JSONB (lesson tree, assessments)
- public BOOLEAN

### `achievements`
- id
- user_id
- type (badge, xp_milestone)
- data JSONB
- created_at

### `integrations`
- id
- user_id
- type (google_calendar, notion, tryhackme, youtube)
- token_meta JSONB

### `webhooks`
- id
- user_id
- event_type
- target_url
- secret
- last_status

---

## 7. API Design (Example endpoints)

- `POST /api/v1/auth/login` — standard JWT auth
- `GET /api/v1/recommendations/today` — returns daily plan
- `POST /api/v1/sessions` — create session (body: session payload)
- `GET /api/v1/sessions?user_id=&date=` — list sessions
- `POST /api/v1/webhooks/register` — register a webhook
- `POST /api/v1/integrations/google/sync` — trigger calendar sync
- `POST /webhooks/session_completed` — external service posts when session done

**Security:** Bearer tokens (JWT), HMAC signatures for webhooks.

---

## 8. AI Layer & Prompting Strategy

**Components:**
- **Prompt templates** per skill type (e.g. language conversation, hacking challenge, content script). Templates include: user profile context, last N sessions, difficulty level, learning preference.
- **Memory store**: use embeddings (Supabase / Pinecone) to store session summaries and user preferences; recall top-k similar memories when generating prompts.
- **Evaluation templates**: sample rubrics for grading code, scripts, or conversation fluency.

**Example prompt skeleton**
- system: role + constraints (safety + legality — NO unauthorized hacking advice)
- user: current objective + context (skill pack, resources)
- assistant: plan (3 steps), practice exercise, and 1-minute micro-feedback template

**Safety:** For hacking content, the AI only provides defensive, educational, lab-based instructions and refuses to assist in attacking live targets. Provide explicit safety instructions in the system prompt.

---

## 9. Integrations & 3rd Party Services

**Priority integrations (MVP)**
- Google Calendar (schedule & sync)
- Notion (export daily logs)
- TryHackMe / HackTheBox (read-only stats via APIs or manual linking)

**Media & storage**
- Cloudinary (thumbnails, video hosting) or Supabase Storage
- Whisper or OpenAI speech-to-text for transcripts (server-side)

**Notifications**
- OneSignal or Firebase Cloud Messaging (web + mobile pushes)

**Analytics**
- Supabase + Metabase / Postgres queries for product analytics

---

## 10. Auth, Privacy & Security

- Use Supabase Auth (or Auth0) with JWT tokens.
- Access control: per-user records, role-based for anything shared.
- Webhook signatures: HMAC SHA256 with rotating keys.
- Media privacy: allow users to mark session media as private/public and to opt-in to sharing transcripts with AI for coaching.
- Data retention policy and export: users can download their full data.

---

## 11. UX & UI — Key Screens

- **Onboarding** — set learning goals, daily time budget, preferred notification times, and initial skills of interest.
- **Today / Focus** — immediate plan: 1–3 micro-tasks, timer, start button, AI hint.
- **Session View** — chat with AI or open interactive lesson; record audio/video; submit; ask for feedback.
- **Progress** — calendar heatmap, streak counter, XP, charts by skill.
- **Skill Library** — list of installed skill packs with progress.
- **Integrations** — connect Google, Notion, TryHackMe.
- **Settings** — privacy, notification times, AI preferences.

---

## 12. Deep Links & Cross-App Flows

- **Deep link format:** `fluentgym://practice?skill=hacking&lesson=abc&source=dashboard`
- Clicking from web opens mobile app if installed; fallback to web lesson.
- Webhooks: mobile app POSTs `/webhooks/session_completed` with payload to update dashboard in near-real-time.

---

## 13. Notification Strategy

- Daily reminder at scheduled time.
- Smart nudge if user misses a planned session.
- Weekly summary (email + push) with highlights and suggestions.
- Achievement notifications (badges, streak milestones).

**Implementation:** Use server-side scheduler (cron or Supabase Scheduled Functions) to queue notifications via OneSignal/FCM.

---

## 14. Deployment & DevOps

- **Frontend Web:** Next.js deployed on Vercel.
- **Mobile App:** React Native (Expo) with EAS builds; app store deployments for iOS/Android.
- **Backend:** Supabase for Postgres + Edge Functions; optionally Node microservices in Render/Heroku.
- **CI/CD:** GitHub Actions for tests, linting, and deployments.
- **Secrets management:** GitHub secrets + Supabase secrets store.

---

## 15. Roadmap & Milestones

**Month 0 (Planning)**
- Finalize data model, API contracts, and UX wireframes.
- Create monorepo scaffolding and initial CI pipeline.

**Month 1 (MVP)**
- Auth, user onboarding, daily planner, session logging, AI chat basic integration.
- Mobile app skeleton + web dashboard skeleton.
- Push notifications basic.

**Month 2**
- Media uploads & transcription, calendar & Notion integrations, progress charts.
- Add skill pack system and a few sample packs (language, hacking, content).

**Month 3**
- LiveKit integration for voice/video practice, webhooks reliability, gamification.
- Polish UX + testing + beta testers.

**Month 4–6**
- Expand integrations, community features, AI evaluation rubrics, marketplace for skill packs.

---

## 16. Folder Structure (Monorepo suggestion)

```
/monorepo
  /apps
    /mobile-app (React Native)
    /web-dashboard (Next.js)
  /packages
    /ui (shared components)
    /api-client (shared client SDK)
    /skill-packs (json/yaml modules)
  /infrastructure
    /supabase (migrations)
    /scripts (deploy tools)
  README.md
```

---

## 17. Sample API Payloads

**Create session** `POST /api/v1/sessions`
```json
{
  "user_id": "uuid-123",
  "date": "2025-11-08T14:00:00Z",
  "skill_type": "language",
  "source": "mobile",
  "title": "French: Ordering at a cafe",
  "description": "20-minute conversation practice",
  "duration_minutes": 20,
  "media_url": "https://cdn.example.com/audio/abc.mp3",
  "transcript_url": "https://cdn.example.com/transcripts/abc.vtt",
  "xp_points": 20
}
```

**Webhook (mobile -> dashboard)** `POST /webhooks/session_completed`
```json
{
  "session_id": "uuid-123",
  "user_id": "uuid-123",
  "type": "language",
  "lesson_id": "fr-lesson-11",
  "duration_minutes": 20,
  "score": 85,
  "transcript_url": "https://...",
  "audio_preview_url": "https://...",
  "created_at": "2025-11-08T14:20:00Z"
}
```

---

## 18. Ethics & Safety (particularly for hacking content)

- Explicit system prompt rules forbidding real-world attack guidance or steps to exploit live systems.
- Provide only lab-based practice with clear disclaimers.
- Offer resources on legal and ethical guidelines.
- Detect and refuse malicious intents in prompts.

---

## 19. Testing & QA

- Unit tests for API, integration tests for webhooks.
- E2E tests for common flows (signup, start session, complete session).
- Automated accessibility checks and mobile responsiveness checks.
- Penetration testing for auth and storage.

---

## 20. Estimated Team & Effort

**Core team (lean)**
- 1 Backend engineer (Supabase / Node) — 0.5–1.0 FTE
- 1 Full-stack engineer (Next.js + React Native) — 0.5–1.0 FTE
- 1 ML/AI Engineer (prompt engineering + embeddings) — 0.25–0.5 FTE
- 1 Product/Designer — 0.25–0.5 FTE
- 1 QA / DevOps — part-time

**Estimated timeline**
- MVP: 8–12 weeks with a 2-person sprint focus.

---

## 21. Next Deliverables (I can generate)
1. System architecture diagram (SVG/PNG)
2. Postgres ERD + migration scripts (SQL)
3. API spec (OpenAPI/Swagger YAML)
4. Starter monorepo scaffolding (folder structure + example components)
5. Prompt templates for 3 skill packs (language, hacking, content)
6. Sample Edge Function / webhook handler code (Supabase Functions)

---

### Final notes
This blueprint is intentionally modular: start small with the MVP learning loop (plan → practice → feedback → log) and gradually expand the AI capabilities, integrations, and community features. Treat the language tutor, hacking labs, and content coaching as **skill packs** rather than separate apps — but keep a separate mobile-first language app only if you prefer distinct mobile-first UX for conversation practice. Either way, the unified approach scales better in the long run.

---

*Prepared for: Geitodyu Crusoe*

