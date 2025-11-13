# FluentGym Backend API

A Fastify-based API that proxies AI calls securely, persists sessions, and exposes endpoints for apps.

## Quick start
1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` and any origin values.
2. Install dependencies.
3. Run the dev server.

```bash
npm install
npm run dev
```

Swagger UI: http://localhost:3001/docs

### API docs grouping & security

- Endpoints are grouped in Swagger by tags: Health, Conversation, Skill Packs, Personalities, Sessions, Memories, LiveKit.
 - Endpoints are grouped in Swagger by tags: Health, Conversation, Skill Packs, Personalities, Sessions, Memories, Users, LiveKit.
- LiveKit routes (token and room admin) define an API key security scheme in Swagger using the `x-livekit-gateway-key` header. When `LIVEKIT_TOKEN_GATEWAY_KEY` is set on the server, clients must include this header for those endpoints.
- User authentication (JWT/Bearer) is planned per the project roadmap and not yet enforced on general endpoints. Until then, requests that include a `userId` must pass a UUID; personalization and memory features rely on that identifier.

## Environment variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key for server calls (chat + embeddings) | `sk-...` |
| `GEMINI_API_KEY` | Gemini API key (optional alternate chat provider) | `ya29....` |
| `LLM_CHAT_PROVIDER` | Default chat provider (`openai` or `gemini`) | `openai` |
| `RATE_LIMIT_MAX` | Max requests per time window | `100` |
| `RATE_LIMIT_TIME_WINDOW` | Time window for rate limit | `1 minute` |
| `RATE_LIMIT_TIME_WINDOW_MS` | Alternative: time window in milliseconds | `60000` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) Supabase service role key | `eyJhbG...` |
| `LIVEKIT_URL` | LiveKit server URL (wss) | `wss://xxx.livekit.cloud` |
| `LIVEKIT_API_KEY` | LiveKit API key for token minting | `LKxxx...` |
| `LIVEKIT_API_SECRET` | LiveKit API secret for token minting | `xxxxxxxx` |
| `LIVEKIT_TOKEN_GATEWAY_KEY` | Optional gateway header for LiveKit endpoints | `your-strong-shared-key` |
| `SUPABASE_JWT_SECRET` | Enables JWT auth enforcement (must match Supabase signing secret) | `your-secret` |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Basic health check |
| GET | `/api/v1/skill-packs` | List loaded skill packs summary |
| GET | `/api/v1/personalities` | List available tutor personalities |
| POST | `/api/v1/conversation` | Generate AI tutor reply (multi-provider: OpenAI or Gemini) |
| POST | `/api/v1/sessions` | Start a new learning session |
| PATCH | `/api/v1/sessions/:id` | Update/end a session |
| GET | `/api/v1/sessions/:id` | Retrieve session details |
| POST | `/api/v1/memories` | Store a new memory with embeddings |
| POST | `/api/v1/memories/search` | Search memories by semantic similarity |
| GET | `/api/v1/memories/recent` | Get recent memories chronologically |
| POST | `/api/v1/livekit/token` | Mint a LiveKit room token for a user |
| POST | `/api/v1/livekit/rooms` | Create/ensure a LiveKit room exists |
| POST | `/api/v1/livekit/rooms/end` | End a room (terminate) |
| GET | `/api/v1/livekit/rooms` | List active rooms |
| POST | `/api/v1/users/migrate` | Migrate anonymous data to authenticated user |
| GET | `/api/v1/users/me` | Get authenticated user identity |
### LiveKit token endpoint

`POST /api/v1/livekit/token`

Request body:
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "roomName": "practice-123",        
  "role": "speaker",                 
  "metadata": { "displayName": "Alice" }
}
```

Response:
```json
{ "token": "<jwt>", "url": "wss://xxx.livekit.cloud", "expiresIn": 3600 }
```

Notes:
- Requires `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` envs.
- `role`: `speaker` can publish audio/video/data; `listener` subscribes only.
- Client should use `{ url, token }` to connect via LiveKit SDK.
- Optional gateway auth: set `LIVEKIT_TOKEN_GATEWAY_KEY` and include header `X-Livekit-Gateway-Key` in requests.

### LiveKit room lifecycle endpoints

Create or ensure room: `POST /api/v1/livekit/rooms`
```json
{ "roomName": "practice-123", "maxParticipants": 2, "emptyTimeout": 300, "metadata": {"topic": "cafe"} }
```
Response: `{ "room": { /* LiveKit room object */ } }`

End room: `POST /api/v1/livekit/rooms/end`
```json
{ "roomName": "practice-123", "reason": "completed" }
```
Response: `{ "success": true }`

List rooms: `GET /api/v1/livekit/rooms`
Response: `{ "rooms": [ /* active rooms */ ] }`

Auth & limits:
- If `LIVEKIT_TOKEN_GATEWAY_KEY` is set, include header `X-Livekit-Gateway-Key` for all LiveKit routes (token and room admin). This is surfaced as a header-based API key scheme in Swagger.
- Rate limiting applied per-route; override with `LIVEKIT_TOKEN_RATE_LIMIT_MAX` and `LIVEKIT_TOKEN_RATE_LIMIT_WINDOW`.

### Conversation request body (multi-provider)
```json
{
  "scenarioId": "airport-checkin",
  "userMessage": "Hi, I'd like to check in for my flight.",
  "language": "en",
  "proficiency": "B1",
  "model": "gpt-4o-mini",
  "provider": "openai",
  "personalityId": "encouraging-mentor",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "sessionId": "987e6543-e21b-45f6-b123-556677889900"
}
```

**Optional fields**:
- `personalityId` — Select tutor personality (see available personalities below)
- `userId` — Enable memory retrieval for personalized context
- `sessionId` — Filter memories to specific session
- `provider` — Override default provider (`openai` or `gemini`). Falls back to env `LLM_CHAT_PROVIDER`.

**Available personalities**:
- `encouraging-mentor` — Warm, supportive, celebrates small wins
- `professional-coach` — Direct, goal-oriented, focuses on measurable improvement
- `friendly-peer` — Casual, relatable, like chatting with a friend
- `patient-guide` — Calm, unhurried, explains thoroughly
- `playful-storyteller` — Creative, uses stories and humor to teach
- `cultural-expert` — Shares cultural context and real-world usage

Use `GET /api/v1/personalities` to see full details including example phrases.### Conversation response body (example)
```json
{
	"scenarioId": "airport-checkin",
	"model": "gpt-4o-mini",
	"reply": "Hello! I'd be happy to help you check in. May I have your passport, please?",
	"usage": {
		"promptTokens": 54,
		"completionTokens": 22,
		"totalTokens": 76
	}
}
```

### Session endpoints

**Start session**: `POST /api/v1/sessions`
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "scenarioId": "cafe-order-beginner",
  "skillPackId": "language-basic",
  "language": "en",
  "proficiencyLevel": "beginner",
  "source": "mobile-app"
}
```

**Update session**: `PATCH /api/v1/sessions/:id`
```json
{
  "ended": true,
  "completed": true,
  "summary": { "turns": 12, "duration": 300 },
  "metrics": { "fluencyScore": 0.85 }
}
```

**Get session**: `GET /api/v1/sessions/:id`

### Memory endpoints

**Store memory**: `POST /api/v1/memories`
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "summary": "Learned Spanish greetings and basic café vocabulary",
  "tags": ["spanish", "greetings", "cafe"],
  "sessionId": "987e6543-e21b-45f6-b123-556677889900"
}
```
Response: Memory object with `id`, `userId`, `summary`, `tags`, `createdAt`.

**Search memories**: `POST /api/v1/memories/search`
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "query": "how to order coffee in Spanish",
  "limit": 5,
  "sessionId": "987e6543-e21b-45f6-b123-556677889900"
}
```
Response: Array of relevant memories ranked by semantic similarity.

**Get recent memories**: `GET /api/v1/memories/recent?userId={uuid}&limit=10&sessionId={uuid}`
Response: Array of memories in chronological order (newest first).

**Memory features**:
- Uses OpenAI `text-embedding-3-small` model (1536 dimensions)
- Stores vector embeddings in Postgres with pgvector extension
- Semantic search via cosine similarity
- Automatic context retrieval in conversation endpoint when `userId` provided
- Optional session filtering for context isolation
  - (Gemini currently used only for chat; embeddings remain on OpenAI for consistency.)

### User migration endpoint

Link previously anonymous user data (sessions, memories) to the authenticated account once the user signs in.

`POST /api/v1/users/migrate`

Body:
```json
{ "anonymousUserId": "550e8400-e29b-41d4-a716-446655440000" }
```

Requirements:
- Bearer JWT (Authorization: Bearer <token>) must be present when `SUPABASE_JWT_SECRET` is set.
- The server will update `sessions.user_id` and `memory_entries.user_id` from the anonymous id to the authenticated `sub`.
- Idempotent: re-running after migration results in zero net changes.

Response:
```json
{ "migrated": true }
```
- `GET /api/v1/users/me` returns `{ "userId": "...", "claims": { /* JWT claims */ } }` when authenticated.
- Returns `401` if token missing or invalid; `500` if auth not configured.

Errors:
- `401` Missing/invalid token (when auth enabled)
- `500` Supabase not configured or update failure

## Development notes
- **Security**: Helmet provides security headers; rate limiting throttles requests per IP.
- **Session persistence**: Supabase/Postgres stores sessions (start/update/retrieve). Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` to enable.
- **Personality system**: 6 tutor personalities (encouraging-mentor, professional-coach, friendly-peer, patient-guide, playful-storyteller, cultural-expert). Pass `personalityId` in conversation requests to customize tone and teaching style.
- **Memory embeddings**: pgvector-based semantic memory storage. When `userId` is included in conversation requests, the system automatically retrieves up to 3 relevant past memories to personalize responses. Use memory endpoints to manually store/search learner context.
- Multi-provider chat: OpenAI or Gemini chosen by `provider` field or `LLM_CHAT_PROVIDER` env.
- OpenAI must be present for memory retrieval (embeddings); if missing, personalization is skipped.
- Skill packs auto-load from `packages/skill-packs/*.json`.
- Logging: pino (pretty in dev) with per-request duration metrics.
- Swagger schemas defined for all endpoints.
- **Tests**: Integration tests with vitest covering core endpoints (run `npm test`).
- Next enhancements: Mobile app development (Expo/React Native).

## Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with tsx watch |
| `npm run build` | TypeScript build |
| `npm start` | Run compiled JS from `dist/` |
| `npm run typecheck` | Type-only check |
| `npm run lint` | Lint source files |
| `npm test` | Run integration tests |
| `npm run test:watch` | Watch mode for tests |

