# Migration Guide: token_usage Table & Session Column Alignment

This guide helps apply the schema changes introduced for Drizzle ORM usage and new token logging.

## 1. New Table: token_usage

Drizzle schema added:
```
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  cost_usd INT, -- stored as micro-dollars (1e-6 USD) placeholder
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_provider ON token_usage(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model);
CREATE INDEX IF NOT EXISTS idx_token_usage_user ON token_usage(user_id);
```

## 2. Sessions Table Alignment

If using previous Supabase schema, ensure these columns exist or are renamed:
- `adaptive_difficulty` INT NULL
- `next_session_recommendation` TEXT NULL

SQL to add if missing:
```
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS adaptive_difficulty INT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS next_session_recommendation TEXT;
```

## 3. Optional Memory Embeddings

`memory_entries` already expected to have:
```
embedding VECTOR(1536)
summary TEXT
session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```
If `embedding` column not present:
```
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE memory_entries ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);
```

## 4. Applying Migrations

If you use SQL files, create a migration file like `2025-11-09_add_token_usage.sql` with the above statements. Then run your migration runner or Supabase SQL console.

For Supabase (manual):
1. Open Project → SQL Editor.
2. Paste the CREATE TABLE + ALTER statements.
3. Run and verify table appears.

## 5. Drizzle Push (Optional)
Drizzle doesn't auto-migrate Postgres. You can use a tool like `drizzle-kit` to generate SQL. If not installed, add to dev deps:
```
npm install -D drizzle-kit
```
Create `drizzle.config.ts` (already present) and run (if desired):
```
npx drizzle-kit generate:pg
```
This emits SQL based on schema; review & apply manually.

## 6. Backfilling Historical Usage (Optional)
If you have historical token usage logs in application logs and want to backfill:
1. Export relevant lines containing `token_usage` from logs.
2. Transform into CSV with columns: user_id, session_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost_usd.
3. Use `COPY token_usage (...) FROM STDIN WITH CSV` or Supabase table import.

## 7. Query Examples
Latest usage per user:
```
SELECT * FROM token_usage
WHERE user_id = '<UUID>'
ORDER BY created_at DESC
LIMIT 20;
```
Total cost estimate (micro-dollars → USD):
```
SELECT SUM(cost_usd) / 1000000.0 AS total_cost_usd
FROM token_usage
WHERE created_at > NOW() - INTERVAL '30 days';
```
Model distribution:
```
SELECT model, COUNT(*) AS calls, SUM(total_tokens) AS tokens
FROM token_usage
GROUP BY model
ORDER BY calls DESC;
```

## 8. Rollback
To remove the table:
```
DROP TABLE IF EXISTS token_usage;
ALTER TABLE sessions DROP COLUMN IF EXISTS adaptive_difficulty;
ALTER TABLE sessions DROP COLUMN IF EXISTS next_session_recommendation;
```

## 9. Environment Checklist
Ensure `.env` includes:
- `OPENAI_API_KEY` for embeddings
- `POSTGRES_URL` or Supabase connection variables.

## 10. Verification Checklist
After applying migrations:
- `SELECT * FROM token_usage LIMIT 1;` → returns 0 or >0 rows.
- Insert a test record manually: `INSERT INTO token_usage (provider, model) VALUES ('openai','gpt-4o-mini');`
- Confirm new columns in `sessions` influence PATCH logic (adaptive difficulty updated).

---
Questions or follow-ups: create additional migration for indexing or partitioning if usage grows large.
