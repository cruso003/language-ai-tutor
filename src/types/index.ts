// Core types for the language learning app

export type LanguageCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ja"
  | "ko"
  | "zh"
  | "ar"
  | "ru";

export type ProficiencyLevel =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "advanced"
  | "fluent";

export interface UserProfile {
  id: string;
  name: string;
  targetLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  proficiencyLevel: ProficiencyLevel;
  interests: string[];
  createdAt: Date;
  totalPracticeTime: number; // in minutes
}

export interface ConversationMetrics {
  responseLatency: number; // average ms to respond
  hesitationCount: number;
  errorRate: number;
  vocabularyUsed: number;
  complexSentences: number;
  fluencyScore: number; // 0-100
}

export interface ScenarioMission {
  id: string;
  title: string;
  description: string;
  difficulty: ProficiencyLevel;
  category:
    | "travel"
    | "business"
    | "social"
    | "shopping"
    | "emergency"
    | "custom";
  objectives: string[];
  estimatedDuration: number; // in minutes
  requiredVocabulary: string[];
  culturalNotes: string[];
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  corrections?: GrammarCorrection[];
  pronunciationFeedback?: PronunciationFeedback;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  errorType: "grammar" | "vocabulary" | "syntax" | "idiom";
}

export interface PronunciationFeedback {
  word: string;
  accuracy: number; // 0-100
  issues: {
    phoneme: string;
    expected: string;
    actual: string;
    suggestion: string;
  }[];
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  personality: "patient" | "challenging" | "friendly" | "formal" | "casual";
  speakingSpeed: "slow" | "normal" | "fast";
  interruptionLikelihood: number; // 0-1
  avatar: string;
}

export interface ConversationSession {
  id: string;
  missionId: string;
  startTime: Date;
  endTime?: Date;
  messages: ConversationMessage[];
  metrics: ConversationMetrics;
  aiPersonality: AIPersonality;
  completed: boolean;
  passed: boolean;
}

export interface ProgressData {
  userId: string;
  sessionsCompleted: number;
  totalPracticeTime: number;
  currentStreak: number;
  fluencyTrend: number[]; // last 30 days
  weakAreas: string[];
  strongAreas: string[];
  vocabularyMastered: number;
  scenariosCompleted: string[];
}
