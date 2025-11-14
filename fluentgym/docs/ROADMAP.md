# FluentGym Monorepo Roadmap (Delta from PROJECT_VISION)

Immediate (Phase 0)
- [ ] Scaffold backend-api with Fastify, health check
- [ ] Supabase Auth verification middleware
- [ ] POST /api/v1/conversation (server-side proxy of current AI)
- [ ] Persist sessions (language only) in Postgres
- [ ] Token usage logging & basic cost metrics

Phase 1
- [ ] Skill pack JSON schema & loader
- [ ] Convert language scenarios into language-basic pack
- [ ] Daily plan generator endpoint
- [ ] Embedding memory (pgvector) + retrieval in prompts

Phase 2
- [ ] AI Router interface + Gemini fallback
- [ ] Notion export + Google Calendar integration
- [ ] Progress dashboard APIs

Phase 3
- [ ] LiveKit integration (rooms, recordings)
- [ ] Server-side speech analysis pipeline
- [ ] Cross-skill achievements

Tracking
- Keep `PROJECT_VISION.md` as the canonical source; this file tracks monorepo-specific execution tasks.
