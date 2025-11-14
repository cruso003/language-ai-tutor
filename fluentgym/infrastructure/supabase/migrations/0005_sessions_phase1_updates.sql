-- Migration: Update sessions table for Phase 1
-- Link to skill_packs (FK), session_metrics, add adaptive difficulty

-- Add new columns
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS skill_pack_id_fk UUID REFERENCES skill_packs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS adaptive_difficulty INTEGER CHECK (adaptive_difficulty >= 1 AND adaptive_difficulty <= 10),
  ADD COLUMN IF NOT EXISTS next_session_recommendation TEXT;

-- Migrate existing skill_pack_id (string) to skill_pack_id_fk (UUID FK)
-- Note: This requires manual data migration since existing IDs are strings from file-based packs
-- For now, we'll keep both columns and deprecate skill_pack_id later

-- Index for FK lookup
CREATE INDEX IF NOT EXISTS idx_sessions_skill_pack_id_fk ON sessions(skill_pack_id_fk);
CREATE INDEX IF NOT EXISTS idx_sessions_adaptive_difficulty ON sessions(adaptive_difficulty);

-- Comments
COMMENT ON COLUMN sessions.skill_pack_id_fk IS 'Foreign key to skill_packs table. Replaces string-based skill_pack_id.';
COMMENT ON COLUMN sessions.adaptive_difficulty IS 'AI-calculated difficulty for next session (1-10). Updated after each session based on performance.';
COMMENT ON COLUMN sessions.next_session_recommendation IS 'AI-generated recommendation for next practice (scenario, skill focus, etc.)';
