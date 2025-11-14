# FluentGym Monorepo (Unified Project)

This folder houses the unified AI learning platform described in `PROJECT_VISION.md`.

Structure
- apps/
  - mobile-app/ — React Native (Expo) learning app (primary interaction)
  - web-dashboard/ — Next.js dashboard for planning/analytics
  - backend-api/ — Fastify API for AI orchestration, sessions, auth proxy
- packages/
  - ui/ — shared components
  - api-client/ — typed SDK used by apps
  - skill-packs/ — declarative skill pack definitions (JSON/YAML)
- infrastructure/
  - supabase/ — SQL/migrations and Edge Functions
  - scripts/ — dev & deploy tooling
- docs/ — architecture notes and roadmap deltas for this monorepo

Notes
- Start with Phase 0: secure backend proxy + move AI calls server-side.
- Language pack migrates from current prototype into `packages/skill-packs`.
- Keep the existing prototype intact while we build this.

See also: `../PROJECT_VISION.md`.

Helpful docs
- Monorepo roadmap: `docs/ROADMAP.md`
- Architecture: `docs/ARCHITECTURE.md`
- Copilot execution checklist (operate autonomously): `docs/COPILOT_CHECKLIST.md`
