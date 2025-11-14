# FluentGym Architecture Overview (Initial Skeleton)

Phases
- Phase 0: Secure Language Core (backend-api, auth, sessions)
- Phase 1: Skill Pack Framework (dynamic scenario loading, memory)
- Phase 2: Multi-Domain Expansion (additional packs, AI router)
- Phase 3: Real-Time & Advanced Feedback (LiveKit, speech analysis)
- Phase 4: Immersive & Marketplace (avatars, community packs)

High-Level Diagram
Mobile App (React Native) <-> Backend API (Fastify + Supabase) <-> AI Router
                                                   |-> Memory (pgvector)
                                                   |-> Storage (Supabase Storage)
Web Dashboard (Next.js) <-> Backend API

Key Modules
- Auth Module: Supabase Auth integration + JWT verification
- Conversation Module: scenario execution + AI prompt assembly
- Session Module: persistence + metrics + feedback summaries
- Skill Pack Loader: parses JSON/YAML definitions into runtime config
- Memory Service: embedding generation & retrieval
- AI Router: (Phase 2) cost/latency-based model selection

Data Stores
- Postgres: users, sessions, metrics, skill_packs, memory_entries
- pgvector: embedding column in memory_entries
- Storage: media uploads (audio, transcripts) if needed later

Observability
- Metrics: request count, AI token usage, latency per endpoint
- Logs: structured JSON (pino) with requestId correlation

Security Guardrails
- No direct model keys on clients
- Rate limiting per user & IP
- HMAC signing planned for future webhooks

Extensibility Goal
Every new domain implemented via Skill Pack definition + optional evaluation plugin without changing core modules.
