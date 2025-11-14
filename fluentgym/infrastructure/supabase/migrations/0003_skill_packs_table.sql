-- Migration: Add skill_packs table for DB-managed skill packs
-- Phase 1: Skill Pack Framework
-- Replaces file-based skill pack loading with database-backed versioned packs

CREATE TABLE IF NOT EXISTS skill_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pack identity
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly identifier (e.g., 'spanish-beginner')
  domain VARCHAR(100) NOT NULL, -- 'language', 'hacking', 'content-creation', etc.
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  
  -- Pack configuration (JSON schema matching existing file-based packs)
  config JSONB NOT NULL,
  -- config structure:
  -- {
  --   "language": "es" (for language domain),
  --   "level": "beginner",
  --   "description": "...",
  --   "personalities": [...],
  --   "scenarios": [...]
  -- }
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skill_packs_domain ON skill_packs(domain);
CREATE INDEX idx_skill_packs_slug ON skill_packs(slug);
CREATE INDEX idx_skill_packs_is_active ON skill_packs(is_active);
CREATE INDEX idx_skill_packs_tags ON skill_packs USING GIN(tags);

-- Unique constraint: one active version per slug
CREATE UNIQUE INDEX idx_skill_packs_active_slug 
  ON skill_packs(slug) 
  WHERE is_active = true;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_skill_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skill_packs_updated_at
  BEFORE UPDATE ON skill_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_packs_updated_at();

-- Comments
COMMENT ON TABLE skill_packs IS 'Database-managed skill packs replacing file-based loading. Each pack defines a learning domain with scenarios, personalities, and progression logic.';
COMMENT ON COLUMN skill_packs.config IS 'JSONB config matching existing skill pack schema. Validates against domain-specific schemas (language, hacking, etc.)';
COMMENT ON COLUMN skill_packs.is_active IS 'Only one version per slug can be active. Allows versioning without breaking existing user progress.';
