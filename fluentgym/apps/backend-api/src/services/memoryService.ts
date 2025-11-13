import { getSupabaseClient } from './supabase';
import { getDb } from '../db/index.js';
import { sql } from 'drizzle-orm';
import OpenAI from 'openai';

export type MemoryEntry = {
  id: string;
  userId: string;
  sessionId?: string;
  summary: string;
  tags: string[];
  createdAt: string;
};

export type MemorySearchOptions = {
  userId: string;
  query: string;
  limit?: number;
  sessionId?: string;
};

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string, openai: OpenAI): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Store a memory entry with embedding
 */
export async function storeMemory(
  userId: string,
  summary: string,
  tags: string[],
  openai: OpenAI,
  sessionId?: string
): Promise<MemoryEntry | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase not configured. Memory storage disabled.');
    return null;
  }

  try {
    const embedding = await generateEmbedding(summary, openai);

    const { data, error } = await supabase
      .from('memory_entries')
      .insert({
        user_id: userId,
        session_id: sessionId,
        embedding,
        summary,
        tags
      })
      .select('id, user_id, session_id, summary, tags, created_at')
      .single();

    if (error) {
      console.error('Error storing memory:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      summary: data.summary,
      tags: data.tags,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error in storeMemory:', error);
    return null;
  }
}

/**
 * Search for relevant memories using semantic similarity (pgvector)
 */
export async function searchMemories(
  options: MemorySearchOptions,
  openai: OpenAI
): Promise<MemoryEntry[]> {
  const db = getDb();
  if (!db) {
    console.warn('Database not configured. Memory search disabled.');
    return [];
  }

  try {
    const { userId, query, limit = 5, sessionId } = options;
    const queryEmbedding = await generateEmbedding(query, openai);

    // Use pgvector cosine similarity search with Drizzle
    // SQL: SELECT * FROM memory_entries WHERE user_id = ? ORDER BY embedding <=> ? LIMIT ?
    const results = await db.execute(sql`
      SELECT 
        id, 
        user_id, 
        session_id, 
        summary, 
        tags, 
        created_at,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM memory_entries
      WHERE user_id = ${userId}
      ${sessionId ? sql`AND session_id != ${sessionId}` : sql``}
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
    `);

    // Normalize the result to an array of rows — some Drizzle return types expose rows differently,
    // so we handle both array returns and objects with a `rows` property by casting to any.
    const rows = Array.isArray(results) ? results : ((results as any).rows ?? []);

    return (rows || []).map((entry: any) => ({
      id: entry.id,
      userId: entry.user_id,
      sessionId: entry.session_id,
      summary: entry.summary,
      tags: entry.tags || [],
      createdAt: entry.created_at,
      similarity: entry.similarity
    }));
  } catch (error) {
    console.error('Error in searchMemories:', error);
    return [];
  }
}

/**
 * Get recent memories for a user
 */
export async function getRecentMemories(
  userId: string,
  limit: number = 10,
  sessionId?: string
): Promise<MemoryEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('memory_entries')
      .select('id, user_id, session_id, summary, tags, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting recent memories:', error);
      return [];
    }

    return (data || []).map((entry: any) => ({
      id: entry.id,
      userId: entry.user_id,
      sessionId: entry.session_id,
      summary: entry.summary,
      tags: entry.tags,
      createdAt: entry.created_at
    }));
  } catch (error) {
    console.error('Error in getRecentMemories:', error);
    return [];
  }
}
