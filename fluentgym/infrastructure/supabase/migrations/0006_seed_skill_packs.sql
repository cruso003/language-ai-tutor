-- Migration: Seed initial skill packs from file-based packs
-- One-time migration to convert existing JSON skill packs to database records

-- Spanish Beginner Pack
INSERT INTO skill_packs (slug, name, domain, version, config, tags, is_active)
VALUES (
  'spanish-beginner',
  'Spanish for Beginners',
  'language',
  '1.0.0',
  '{
    "language": "es",
    "level": "beginner",
    "description": "Learn Spanish through everyday conversations",
    "personalities": [
      {
        "id": "friendly-teacher",
        "name": "María",
        "tone": "encouraging",
        "traits": ["patient", "enthusiastic", "clear"]
      }
    ],
    "scenarios": [
      {
        "id": "coffee-shop",
        "name": "Ordering at a Coffee Shop",
        "setting": "café",
        "goal": "Order a coffee in Spanish",
        "difficulty": 1,
        "vocabulary": ["café", "por favor", "gracias", "leche", "azúcar"]
      },
      {
        "id": "restaurant",
        "name": "Ordering at a Restaurant",
        "setting": "restaurante",
        "goal": "Order a meal in Spanish",
        "difficulty": 2,
        "vocabulary": ["menú", "plato", "bebida", "cuenta"]
      },
      {
        "id": "directions",
        "name": "Asking for Directions",
        "setting": "street",
        "goal": "Ask for and understand directions",
        "difficulty": 3,
        "vocabulary": ["dónde", "derecha", "izquierda", "recto"]
      }
    ]
  }'::jsonb,
  ARRAY['language', 'spanish', 'beginner'],
  true
) ON CONFLICT (slug) DO NOTHING;

-- French Intermediate Pack
INSERT INTO skill_packs (slug, name, domain, version, config, tags, is_active)
VALUES (
  'french-intermediate',
  'French Intermediate Conversations',
  'language',
  '1.0.0',
  '{
    "language": "fr",
    "level": "intermediate",
    "description": "Practice intermediate French conversations",
    "personalities": [
      {
        "id": "parisian-native",
        "name": "Pierre",
        "tone": "casual",
        "traits": ["witty", "cultural", "expressive"]
      }
    ],
    "scenarios": [
      {
        "id": "job-interview",
        "name": "Job Interview",
        "setting": "office",
        "goal": "Conduct a job interview in French",
        "difficulty": 5,
        "vocabulary": ["compétences", "expérience", "salaire", "entreprise"]
      },
      {
        "id": "doctor-appointment",
        "name": "Doctor Appointment",
        "setting": "clinic",
        "goal": "Describe symptoms and understand medical advice",
        "difficulty": 6,
        "vocabulary": ["symptômes", "douleur", "médicament", "rendez-vous"]
      }
    ]
  }'::jsonb,
  ARRAY['language', 'french', 'intermediate'],
  true
) ON CONFLICT (slug) DO NOTHING;

-- Hacking Beginner Pack (Multi-domain example)
INSERT INTO skill_packs (slug, name, domain, version, config, tags, is_active)
VALUES (
  'hacking-web-basics',
  'Web Hacking Fundamentals',
  'hacking',
  '1.0.0',
  '{
    "level": "beginner",
    "description": "Learn web application security fundamentals",
    "personalities": [
      {
        "id": "security-mentor",
        "name": "Cipher",
        "tone": "technical",
        "traits": ["precise", "methodical", "encouraging"]
      }
    ],
    "scenarios": [
      {
        "id": "sql-injection",
        "name": "SQL Injection Lab",
        "setting": "vulnerable web app",
        "goal": "Identify and exploit SQL injection vulnerability",
        "difficulty": 4,
        "tools": ["sqlmap", "burp suite"],
        "concepts": ["SQL syntax", "input validation", "authentication bypass"]
      },
      {
        "id": "xss-challenge",
        "name": "Cross-Site Scripting (XSS)",
        "setting": "comment form",
        "goal": "Inject and execute JavaScript in victim context",
        "difficulty": 3,
        "tools": ["browser devtools"],
        "concepts": ["DOM manipulation", "script injection", "sanitization"]
      }
    ]
  }'::jsonb,
  ARRAY['hacking', 'web-security', 'beginner'],
  true
) ON CONFLICT (slug) DO NOTHING;

-- Content Creation Pack (Multi-domain example)
INSERT INTO skill_packs (slug, name, domain, version, config, tags, is_active)
VALUES (
  'content-writing-basics',
  'Content Writing Fundamentals',
  'content-creation',
  '1.0.0',
  '{
    "level": "beginner",
    "description": "Master the art of engaging content writing",
    "personalities": [
      {
        "id": "editor-mentor",
        "name": "Alex",
        "tone": "constructive",
        "traits": ["detail-oriented", "creative", "supportive"]
      }
    ],
    "scenarios": [
      {
        "id": "blog-post",
        "name": "Write a Blog Post",
        "setting": "blogging platform",
        "goal": "Create an engaging 500-word blog post",
        "difficulty": 3,
        "topics": ["headline", "hook", "structure", "call-to-action"]
      },
      {
        "id": "social-media",
        "name": "Craft Social Media Copy",
        "setting": "social media",
        "goal": "Write compelling short-form content",
        "difficulty": 2,
        "topics": ["engagement", "brevity", "hashtags", "tone"]
      }
    ]
  }'::jsonb,
  ARRAY['content-creation', 'writing', 'beginner'],
  true
) ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE skill_packs IS 'Seeded with initial skill packs from file-based loader. Ready for multi-domain FluentGym vision.';
