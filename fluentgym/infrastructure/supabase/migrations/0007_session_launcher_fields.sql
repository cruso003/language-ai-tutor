-- Migration: Add session launcher fields
-- Support for real-time session state, messages, and completion tracking

-- Add new columns for session launcher
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS scenario_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scenario_id ON sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions(user_id, status);

-- Comments
COMMENT ON COLUMN sessions.scenario_id IS 'ID of the scenario from skill pack config being practiced';
COMMENT ON COLUMN sessions.status IS 'Current session state: active, paused, completed, or abandoned';
COMMENT ON COLUMN sessions.config IS 'Session configuration (personality, scenario details, domain)';
COMMENT ON COLUMN sessions.metadata IS 'Session metadata (messages history, completion stats, etc.)';
COMMENT ON COLUMN sessions.xp_earned IS 'XP points earned upon completion';

