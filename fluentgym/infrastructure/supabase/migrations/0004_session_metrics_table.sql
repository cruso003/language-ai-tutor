-- Migration: Add session_metrics table for polymorphic session metrics
-- Phase 1: Generic metrics framework supporting domain-specific extensions
-- BaseSessionMetrics -> LanguageMetrics, HackingMetrics, etc.

CREATE TABLE IF NOT EXISTS session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Base metrics (all domains)
  duration_seconds INTEGER NOT NULL,
  completion_percentage INTEGER NOT NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  
  -- Domain-specific metrics (polymorphic JSONB)
  domain VARCHAR(100) NOT NULL, -- 'language', 'hacking', 'content-creation', etc.
  domain_metrics JSONB NOT NULL DEFAULT '{}',
  -- domain_metrics examples:
  -- Language: { "accuracy": 0.85, "fluency_score": 7.5, "vocabulary_used": 45, "grammar_errors": 3 }
  -- Hacking: { "vulnerabilities_found": 12, "exploitation_success": true, "tools_used": ["nmap", "sqlmap"], "difficulty_overcome": "hard" }
  -- Content: { "word_count": 850, "readability_score": 68, "originality_percentage": 92 }
  
  -- XP and progression
  xp_earned INTEGER NOT NULL DEFAULT 0,
  achievements_unlocked TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_metrics_session_id ON session_metrics(session_id);
CREATE INDEX idx_session_metrics_domain ON session_metrics(domain);
CREATE INDEX idx_session_metrics_created_at ON session_metrics(created_at DESC);

-- One metrics record per session
CREATE UNIQUE INDEX idx_session_metrics_unique_session ON session_metrics(session_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_session_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_metrics_updated_at
  BEFORE UPDATE ON session_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_session_metrics_updated_at();

-- Comments
COMMENT ON TABLE session_metrics IS 'Polymorphic session metrics framework. Base metrics (duration, completion, satisfaction) + domain-specific metrics (JSONB) for language, hacking, content creation, etc.';
COMMENT ON COLUMN session_metrics.domain_metrics IS 'Domain-specific metrics as JSONB. Validated against domain schema on insert/update.';
COMMENT ON COLUMN session_metrics.xp_earned IS 'Experience points earned in this session. Used for cross-skill progression and achievements.';
