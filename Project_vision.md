# Project Vision: FluentGym Unified AI Learning Companion

> "One adaptive AI brain that can teach you any skill — language, hacking labs, content creation, negotiation — and remembers how you learn."  
> This document merges the existing FluentAI (language-focused) materials with the broader multi‑skill blueprint to form a single, actionable vision.

## 1. North Star

Build an extensible, skill‑agnostic AI learning platform (FluentGym) that delivers daily adaptive practice loops: Plan → Practice (multi‑modal) → AI Feedback → Memory → Progress. Language tutoring is the first vertical (existing prototype). All other domains (ethical hacking, content creation, IoT, professional communication) plug in as "Skill Packs" sharing common primitives.

## 2. Scope Layers

| Layer | Description | Status |
|-------|-------------|--------|
| Core Loop | Daily plan, session execution, feedback, logging | Partially implemented (conversation only) |
| Skill Packs | Pluggable domain definitions (scenarios, rubrics, generators) | Language only (hardcoded) |
| Memory & Personalization | Embeddings store, user preferences, adaptive difficulty | Missing |
| Multi-Modal Input | Text, audio (partial), vision, code, media attachments | Audio prototype only |
| Progress Intelligence | XP alternatives, competency maps, predictive analytics | Not implemented |
| Integrations | Calendar, Notion, TryHackMe, GitHub, YouTube | Not started |
| Real-Time / Live | LiveKit rooms, multi-user, recording | Planned (no backend) |
| Security & Compliance | Auth, RBAC, encryption, privacy dashboards | Missing (docs only) |

## 3. Unification Gaps (Prototype vs Blueprint)

| Gap | Current State | Required Shift |
|-----|---------------|----------------|
| Hardcoded language scenarios | `SCENARIOS` constant in client | Move to server-side Skill Pack repository + CRUD + versioning |
| Direct OpenAI usage in client | `dangerouslyAllowBrowser` in `AIConversationService` | Secure backend orchestration layer (Fastify/Supabase Edge) |
| No auth / profiles | Local state only | Supabase/Auth0 user + profile + preferences + roles |
| Single domain metrics | Fluency metrics only | Generic session metrics interface per skill pack |
| Lack of memory | No retrieval of past sessions | Embedding store + contextual recall (top-K) |
| Feedback loop | Grammar corrections + final JSON | Modular evaluators (pronunciation, code quality, content clarity, hacking report) |
| Absence of planning | User manually chooses scenario | Daily Plan generator (schedule + adaptive selection) |
| Security posture | Docs describe, code ignores | Implement E2E secure API, key management, rate limiting |
| Tech divergence | Docs mention multi-model (GPT, Gemini, Claude) | Introduce AI Router microservice incrementally |
| Roadmaps duplicated | Multiple month/quarter plans | Single consolidated milestone ladder |

## 4. Core Domain Model (Unified Abstractions)

### Entities
1. User
2. Session (generic) — links to a Skill Pack + scenario template
3. SkillPack — metadata + config + scenario definitions + evaluation rubrics
4. MemoryEntry — embedding vector + classification tags (skill, difficulty, outcome)
5. Integration — external service tokens / sync state
6. Achievement — cross-skill milestones (competency, streak quality, mastery proof)

### Session Lifecycle (Any Skill)
Plan (AI selects scenario + objectives) → Execute (multi-modal interaction) → Evaluate (skill-specific rubric + generic metrics) → Store (summary + embedding + metrics) → Adapt (update difficulty + next recommendations).

### Generic Metrics Interface
```typescript
interface BaseSessionMetrics {
  durationMinutes: number;
  startTime: string;
  endTime?: string;
  objectiveCompletionRate: number; // 0-1
  engagementScore?: number;        // heuristic across modalities
  aiAssistCount: number;           // hints / clarifications
  errorEvents: number;             // domain-specific errors
}

interface LanguageMetrics extends BaseSessionMetrics {
  responseLatencyAvg: number;
  hesitationCount: number;
  vocabularyVariety: number;
  fluencyScore: number; // 0-100
}

interface HackingMetrics extends BaseSessionMetrics {
  labStepsCompleted: number;
  exploitAttemptsBlocked: number; // safety counter
  reasoningDepthScore: number;    // chain-of-thought quality proxy
}
```

Skill packs extend `BaseSessionMetrics` via composition.

## 5. Architectural Spine (Incremental)

### Phase 0 (Now → 2 Weeks)
"Secure Language Core"
1. Introduce backend API (Fastify + Supabase Postgres). 
2. Move OpenAI calls to `/api/ai/conversation`. 
3. Add Auth (Supabase) + user profile + language prefs. 
4. Persist sessions (language only) + store JSON summary. 
5. Implement environment separation + key rotation.

### Phase 1 (Weeks 3–6)
"Skill Pack Framework"
1. Define `skill_packs` table + ingestion pipeline (YAML/JSON). 
2. Convert language scenarios into a `language-basic` pack. 
3. Build Daily Plan endpoint combining user prefs + pack difficulty. 
4. Add embedding memory (pgvector) storing session summaries. 
5. Basic retrieval augmentation for conversation prompts.

### Phase 2 (Weeks 7–10)
"Multi-Domain Expansion"
1. Add hacking & content creation sample packs. 
2. Generalize evaluation: load rubric template from pack. 
3. Introduce AI Router (OpenAI + Gemini fallback). 
4. Launch progress dashboard (cross-skill heatmap). 
5. Integrations: Google Calendar (session scheduling), Notion export.

### Phase 3 (Weeks 11–16)
"Real-Time & Advanced Feedback"
1. LiveKit rooms for live conversation / pair practice. 
2. Speech analysis pipeline server-side (Whisper + prosody heuristics). 
3. Cross-skill achievement engine (competency badges). 
4. Privacy controls & data export portal. 
5. Cost optimization (token budgeting + model selection).

### Phase 4 (Months 5–6)
"Immersive & Marketplace"
1. Community skill pack submission flow + moderation. 
2. AI-generated micro-tasks & adaptive difficulty tuning. 
3. Optional 3D avatar layer (progressively enhanced). 
4. Marketplace monetization + pack versioning.

## 6. Decision Log (Initial Canonical Choices)
| Topic | Decision | Rationale | Revisit |
|-------|----------|-----------|---------|
| Auth | Supabase Auth | Fast iteration, integrated with Postgres | If enterprise SSO needed |
| DB | Supabase Postgres + pgvector | Unified store, embedding support | Scale-out / read replicas |
| Backend Style | Single Fastify service (modular) | Lower ops overhead early | Split into microservices post traction |
| AI Models | Start single provider (OpenAI GPT-4.x) | Simplicity; measure usage & cost | Add Gemini/Claude at Phase 2 |
| Memory | pgvector in DB | Co-located data reduces latency | External vector DB if >10M embeddings |
| State Mgmt (Client) | Zustand + React Query | Already adopted, ergonomic | Keep unless concurrency complexity grows |
| Deploy | Vercel (web) + Supabase + EAS (mobile) | Fast shipping | Move to multi-region HA after scale |

## 7. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Cost overruns from AI tokens | High | Implement token accounting per session + route low complexity to cheaper models |
| Feature creep (3D/AR too early) | Velocity loss | Enforce phased roadmap; 3D only after stable multi-skill core |
| Security lag (API keys/leaks) | Critical | Backend proxy requirement gate for any new AI feature |
| Skill pack quality variance | User frustration | Validation schema + automated lint + manual review flow |
| Data privacy compliance slip | Regulatory risk | Early implementation of export/delete; log access events |
| Model dependency lock-in | Strategic | Abstract AI Router interface now, even if single provider |
| Memory bloat / relevance decay | Performance | Periodic embedding pruning + recency + semantic diversity scoring |

## 8. Unified Prompt Strategy (Pattern)
```text
SYSTEM: Role = Adaptive Tutor (Skill: <skill_type>); Safety constraints; Domain guardrails.
CONTEXT BLOCKS:
  - User Profile (level, prefs, goals)
  - Current Scenario (objectives, difficulty)
  - Retrieved Memory (top-K summaries)
  - Evaluation Rubric (lightweight hints for structured feedback)
INSTRUCTION: Provide next step: (1) Natural response / guidance (2) Micro-challenge (3) Minimal feedback from last user turn.
POLICIES: Refuse unsafe hacking, avoid leaking PII, minimize tokens.
```

## 9. Minimal Data Schema Delta (Extending Existing Prototype)
Add tables: `skill_packs`, `sessions` (generic), `session_metrics`, `memory_entries`, `integrations`, `achievements`.

## 10. Migration Plan (Prototype → Phase 0)
1. Introduce env var gating: disallow direct OpenAI in client if `SECURE_MODE=1`.  
2. Backend endpoint `/api/v1/conversation` replicates current logic; client swaps service implementation.  
3. Add Supabase auth integration in app startup; store JWT securely.  
4. Persist session start/end + raw transcript & final feedback.  
5. Instrument token usage logging per request.

## 11. Immediate Action Checklist (First Sprint)
| Item | Owner | Status |
|------|-------|--------|
| Fastify boilerplate + health endpoint | Backend | Pending |
| Supabase auth integration (mobile) | Mobile | Pending |
| Move `AIConversationService` to server | Backend | Pending |
| Session persistence (language) | Backend | Pending |
| Environment + secrets rotation docs | DevOps | Pending |
| Define `skill_packs` JSON schema (v0) | Backend | Pending |
| Token usage logging middleware | Backend | Pending |

## 12. Success Metrics (Unified)
| Metric | Definition | Early Target |
|--------|------------|--------------|
| Daily Active Learners | Users with ≥1 completed session | 30% of registered |
| Session Completion Rate | Objectives fully met / sessions | ≥65% |
| Adaptive Scenario Match | % sessions using memory/context retrieval | ≥50% after Phase 1 |
| Cross-Skill Adoption | Users engaging ≥2 skill packs | 20% after Phase 2 |
| AI Cost per Active User | Monthly AI spend / DAU | <$3 |
| Privacy Compliance Coverage | Implemented features from checklist | 80% by Phase 3 |

## 13. Guiding Principles
1. Skill‑agnostic first: avoid language-only patterns in new code.
2. Secure by default: no client-side model keys; all AI behind auth.
3. Memory enhances, never confuses: limit retrieval noise.
4. Fast shipping over perfection: vertical slice each phase.
5. Observability early: metrics > guesses.
6. User trust is an asset: transparency in data usage.

## 14. Glossary (Shared Vocabulary)
| Term | Meaning |
|------|---------|
| Skill Pack | Package defining scenarios, rubrics, config for a domain |
| Memory Entry | Embedded summary of prior user session or preference |
| Daily Plan | Generated ordered list of recommended sessions/micro-tasks |
| Evaluation Rubric | Structured criteria for generating feedback |
| Adaptive Difficulty | Dynamic adjustment of task complexity based on metrics |

## 15. Essential "Nice-to-Have" Features (NOW REQUIRED)

### Authentication & User Management
| Feature | Description | Priority |
|---------|-------------|----------|
| Email/Password Registration | Standard signup with email verification | CRITICAL |
| OAuth Providers | Google, GitHub, Apple Sign-In | HIGH |
| Forgot Password Flow | Email-based password reset with secure tokens | CRITICAL |
| Password Reset | Secure token validation + new password setting | CRITICAL |
| Email Verification | Confirm email ownership before full access | HIGH |
| Two-Factor Authentication (2FA) | TOTP-based (Google Authenticator) | MEDIUM |
| Session Management | JWT refresh tokens, device tracking, revocation | CRITICAL |
| Account Deletion | GDPR-compliant full account + data removal | HIGH |
| Profile Management | Avatar upload, display name, bio, preferences | HIGH |

### Real-Time Communication
| Feature | Description | Priority |
|---------|-------------|----------|
| LiveKit Integration | Real-time audio/video rooms for practice | CRITICAL |
| Room Creation API | Generate LiveKit rooms per session | CRITICAL |
| Token Generation | Secure access tokens for room joining | CRITICAL |
| Recording Sessions | Server-side recording of practice sessions | HIGH |
| Screen Sharing | Share screen during hacking/coding sessions | MEDIUM |
| Multi-User Rooms | Pair practice, group conversations | MEDIUM |

### Speech & Audio Processing
| Feature | Description | Priority |
|---------|-------------|----------|
| Speech-to-Text (Whisper) | Transcribe audio in real-time | CRITICAL |
| Text-to-Speech (ElevenLabs/OpenAI) | Generate natural AI voice responses | CRITICAL |
| Voice Cloning | Personalized AI tutor voices | MEDIUM |
| Pronunciation Analysis | Phoneme-level feedback on speech | HIGH |
| Accent Detection | Identify and adapt to user's accent | MEDIUM |
| Background Noise Filtering | Clean audio before processing | MEDIUM |

### 3D Avatar System
| Feature | Description | Priority |
|---------|-------------|----------|
| Ready Player Me Integration | 3D avatar creation and customization | HIGH |
| Avatar Animations | Lip-sync with TTS, idle animations | HIGH |
| Emotion Display | Happy/confused/encouraging expressions | MEDIUM |
| Avatar Customization API | Save/load avatar configurations | MEDIUM |
| Web3D Rendering | Three.js/Babylon.js browser rendering | HIGH |

### Marketplace & Content
| Feature | Description | Priority |
|---------|-------------|----------|
| Skill Pack Marketplace | Browse, purchase, download packs | HIGH |
| Creator Dashboard | Upload skill packs, set pricing | HIGH |
| Pack Versioning | Semantic versioning for packs | MEDIUM |
| Reviews & Ratings | User feedback on skill packs | MEDIUM |
| Revenue Sharing | Stripe integration for payments | HIGH |
| Pack Analytics | Downloads, completion rates for creators | MEDIUM |
| Content Moderation | Automated + manual review queue | HIGH |

### Advanced AI Features
| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-Model Router | GPT-4, Gemini, Claude fallback logic | CRITICAL |
| Context Window Management | Smart truncation for long conversations | HIGH |
| AI Cost Optimization | Route cheap tasks to smaller models | HIGH |
| Custom AI Personalities | Upload personality prompts per skill pack | MEDIUM |
| AI Memory Persistence | Remember user across sessions (RAG) | HIGH |
| Adaptive Difficulty Engine | ML-based difficulty adjustment | HIGH |

### Integrations
| Feature | Description | Priority |
|---------|-------------|----------|
| Google Calendar Sync | Schedule practice, reminders | HIGH |
| Notion Export | Export progress to Notion databases | MEDIUM |
| GitHub Integration | Code submission for coding packs | MEDIUM |
| TryHackMe Integration | Sync hacking lab progress | MEDIUM |
| YouTube Content Ingestion | Learn from videos (transcripts) | MEDIUM |
| Slack/Discord Notifications | Daily reminders, achievements | LOW |

### Analytics & Progress
| Feature | Description | Priority |
|---------|-------------|----------|
| XP Progression Charts | Line charts showing XP over time | HIGH |
| Skill Heatmaps | Visual competency maps per domain | HIGH |
| Session History | Detailed log of all sessions | HIGH |
| Streak Tracking | Daily/weekly practice streaks | HIGH |
| Leaderboards | Optional competitive rankings | MEDIUM |
| Achievement Badges | Unlock badges for milestones | MEDIUM |
| Predictive Analytics | Forecast proficiency timelines | MEDIUM |
| Export Reports (PDF/CSV) | Download progress reports | MEDIUM |

### Security & Compliance
| Feature | Description | Priority |
|---------|-------------|----------|
| Rate Limiting | Prevent API abuse (per user/IP) | CRITICAL |
| RBAC (Roles) | Learner, Creator, Admin permissions | HIGH |
| API Key Rotation | Automated credential refresh | HIGH |
| Audit Logs | Track all sensitive operations | HIGH |
| Data Encryption (at rest) | Encrypt DB sensitive fields | HIGH |
| GDPR Data Export | User data download endpoint | HIGH |
| Privacy Dashboard | Control what data is stored/shared | MEDIUM |
| CORS & CSP Headers | Secure frontend communication | HIGH |

### Infrastructure
| Feature | Description | Priority |
|---------|-------------|----------|
| WebSocket Support | Real-time updates (typing, presence) | HIGH |
| File Upload (S3/Cloudinary) | Audio, images, documents | HIGH |
| CDN Integration | Fast media delivery globally | MEDIUM |
| Background Jobs (Bull) | Async tasks (email, transcription) | HIGH |
| Caching Layer (Redis) | Speed up frequent queries | MEDIUM |
| Database Backups | Automated daily backups | CRITICAL |
| Health Checks | `/health` endpoint for monitoring | HIGH |
| Metrics & Logging | Prometheus, Grafana, Sentry | MEDIUM |

### Mobile-Specific
| Feature | Description | Priority |
|---------|-------------|----------|
| Push Notifications | Daily reminders, achievements | HIGH |
| Offline Mode | Practice without internet | MEDIUM |
| Biometric Auth | Face ID, Touch ID login | MEDIUM |
| Voice Commands | Hands-free navigation | LOW |

### Gamification
| Feature | Description | Priority |
|---------|-------------|----------|
| Daily Quests | Micro-challenges for bonus XP | MEDIUM |
| Challenges | Compete with friends | LOW |
| Customizable Avatars | Unlock cosmetics with XP | LOW |
| Power-Ups | Boosters (2x XP days, hints) | LOW |

## 16. Deferred (Explicitly Out of Scope for Now)
| Feature | Reason |
|---------|--------|
| AR Object Labeling | Requires CV pipeline not justified early |
| Quantum / BCI | Research-only; track as inspiration, not execution |
| Advanced Computer Vision Pronunciation | Start audio-only metrics |
| Blockchain NFT Certificates | Wait for market validation |

## 16. Open Questions
| Question | Resolution Path |
|----------|----------------|
| Supabase vs Auth0 long-term? | Benchmark auth features after Phase 1 usage |
| Embedding model choice? | Start OpenAI text-embedding-3-small; evaluate cost/recall metrics |
| Pack versioning strategy? | Git-tagged JSON packs + semantic version column |
| Monetization gating? | Flag columns in skill packs + feature entitlement table |
| Offline mode sync conflicts? | CRDT evaluation post Phase 3 |

## 17. Next Document Artifacts
1. Skill Pack JSON schema draft.  
2. OpenAPI spec (v0) for conversation + sessions endpoints.  
3. Migration script for initial tables.  
4. AI Router interface stub.  
5. Token accounting middleware spec.  

---
_Version: 0.1 (Unified Vision)_  
_Generated: ${new Date().toISOString().split('T')[0]}_  
_Review Cycle: 30 days_
