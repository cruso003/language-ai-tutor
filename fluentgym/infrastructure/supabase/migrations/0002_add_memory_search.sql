-- Add search_memories function for vector similarity search
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding VECTOR(1536),
  query_user_id UUID,
  query_session_id UUID DEFAULT NULL,
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  session_id UUID,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.session_id,
    m.summary,
    m.tags,
    m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memory_entries m
  WHERE m.user_id = query_user_id
    AND (query_session_id IS NULL OR m.session_id = query_session_id)
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
