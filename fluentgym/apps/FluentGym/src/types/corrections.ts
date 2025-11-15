/**
 * Correction Types and Data Structures
 *
 * Defines types for AI-driven smart corrections on user input
 * Covers grammar, vocabulary, pronunciation, and cultural context
 */

export type CorrectionType = 'grammar' | 'vocabulary' | 'pronunciation' | 'culture' | 'fluency';

export type CorrectionSeverity = 'error' | 'suggestion' | 'tip';

export interface Correction {
  id: string;
  type: CorrectionType;
  severity: CorrectionSeverity;

  // What was said
  original: string;
  highlightStart?: number; // Character position where error starts
  highlightEnd?: number;   // Character position where error ends

  // What should be said
  corrected: string;

  // Educational explanation
  explanation: string;
  rule?: string; // Grammar rule or cultural note

  // Examples for context
  examples?: string[];

  // Whether correction was acknowledged/dismissed
  acknowledged?: boolean;
}

export interface CorrectionSummary {
  messageId: string;
  userMessage: string;
  corrections: Correction[];
  overallScore: number; // 0-100, how well they did
  timestamp: Date;
}

/**
 * Generate unique correction ID
 */
export const generateCorrectionId = (): string => {
  return `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get color for correction type
 */
export const getCorrectionColor = (type: CorrectionType): string => {
  switch (type) {
    case 'grammar':
      return '#ef4444'; // Red
    case 'vocabulary':
      return '#f59e0b'; // Yellow
    case 'pronunciation':
      return '#8b5cf6'; // Purple
    case 'culture':
      return '#06b6d4'; // Cyan
    case 'fluency':
      return '#10b981'; // Green
    default:
      return '#6b7280'; // Gray
  }
};

/**
 * Get icon for correction type
 */
export const getCorrectionIcon = (type: CorrectionType): string => {
  switch (type) {
    case 'grammar':
      return 'alert-circle';
    case 'vocabulary':
      return 'book';
    case 'pronunciation':
      return 'mic';
    case 'culture':
      return 'globe';
    case 'fluency':
      return 'trending-up';
    default:
      return 'information-circle';
  }
};

/**
 * Get label for correction type
 */
export const getCorrectionLabel = (type: CorrectionType): string => {
  switch (type) {
    case 'grammar':
      return 'Grammar';
    case 'vocabulary':
      return 'Vocabulary';
    case 'pronunciation':
      return 'Pronunciation';
    case 'culture':
      return 'Culture';
    case 'fluency':
      return 'Fluency';
    default:
      return 'General';
  }
};
