export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  targetLanguage?: string;
  nativeLanguage?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredPersonality?: string;
  dailyGoalMinutes?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  corrections?: Correction[];
}

export interface Correction {
  type: 'grammar' | 'vocabulary' | 'pronunciation';
  original: string;
  suggestion: string;
  explanation: string;
}

export interface Session {
  id: string;
  userId: string;
  scenarioId: string;
  personalityId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  metrics?: SessionMetrics;
  messages?: Message[];
}

export interface SessionMetrics {
  fluencyScore: number;
  responseLatencyMs: number;
  hesitationCount: number;
  vocabularyVariety: number;
  grammarAccuracy?: number;
  pronunciationScore?: number;
}

export interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageFluencyScore: number;
  recentSessions: Session[];
  weeklyProgress: WeeklyProgress[];
}

export interface WeeklyProgress {
  date: string;
  minutes: number;
  sessions: number;
  fluencyScore: number;
}

export interface ConversationRequest {
  message: string;
  sessionId?: string;
  scenarioId?: string;
  personalityId?: string;
  targetLanguage?: string;
  nativeLanguage?: string;
}

export interface ConversationResponse {
  response: string;
  sessionId: string;
  corrections?: Correction[];
}
