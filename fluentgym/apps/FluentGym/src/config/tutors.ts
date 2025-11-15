/**
 * Tutor Configuration
 *
 * Simple 2D character system using colors and personalities
 * No dependencies, no complexity - just effective personality representation
 */

export interface Tutor {
  id: string;
  name: string;
  initial: string;
  color: string;
  role: string;
  personality: string;
  description: string;
  voiceStyle: 'encouraging' | 'professional' | 'patient' | 'intellectual' | 'supportive';
}

export const TUTORS: Record<string, Tutor> = {
  sofia: {
    id: 'sofia',
    name: 'Sofia',
    initial: 'S',
    color: '#F97316', // Orange
    role: 'Encouraging Mentor',
    personality: 'encouraging-mentor',
    description: 'Warm and patient. Celebrates your progress and keeps you motivated.',
    voiceStyle: 'encouraging',
  },

  marcus: {
    id: 'marcus',
    name: 'Marcus',
    initial: 'M',
    color: '#0284c7', // Blue
    role: 'Professional Coach',
    personality: 'professional-coach',
    description: 'Direct and results-focused. Pushes you to improve with clear feedback.',
    voiceStyle: 'professional',
  },

  yuki: {
    id: 'yuki',
    name: 'Yuki',
    initial: 'Y',
    color: '#ec4899', // Pink
    role: 'Patient Guide',
    personality: 'cultural-expert',
    description: 'Calm and methodical. Explains cultural context with gentle patience.',
    voiceStyle: 'patient',
  },

  elena: {
    id: 'elena',
    name: 'Elena',
    initial: 'E',
    color: '#10b981', // Green
    role: 'Cultural Expert',
    personality: 'cultural-expert',
    description: 'Intellectual and curious. Dives deep into language nuances and culture.',
    voiceStyle: 'intellectual',
  },

  raj: {
    id: 'raj',
    name: 'Raj',
    initial: 'R',
    color: '#eab308', // Yellow
    role: 'Supportive Friend',
    personality: 'friendly-peer',
    description: 'Warm and encouraging. Makes learning feel like chatting with a friend.',
    voiceStyle: 'supportive',
  },
};

export const TUTOR_LIST = Object.values(TUTORS);

export const getTutorById = (id: string): Tutor | undefined => {
  return TUTORS[id];
};

export const getDefaultTutor = (): Tutor => {
  return TUTORS.sofia;
};
