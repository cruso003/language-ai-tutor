/**
 * Metrics and Progress Tracking Types
 *
 * Defines comprehensive data structures for tracking real user progress
 * over time, replacing fake gamification with actual learning metrics
 */

export interface PracticeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds

  // Session context
  scenarioId?: string;
  tutorId: string;
  languagePair: string; // e.g., "en-es" for English to Spanish

  // Conversation metrics
  messageCount: number;
  userMessages: number;
  aiMessages: number;

  // Fluency metrics
  averageResponseTime: number; // seconds
  fluencyScore: number; // 0-100
  responseBreakdown: {
    excellent: number; // <1s
    good: number;      // 1-2s
    okay: number;      // 2-3s
    slow: number;      // >3s
  };

  // Corrections metrics
  totalCorrections: number;
  correctionsByType: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    culture: number;
    fluency: number;
  };
  correctionsAcknowledged: number;

  // Scenario progress (if applicable)
  objectivesCompleted?: number;
  objectivesTotal?: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  practiceTime: number; // total minutes
  sessionCount: number;
  messageCount: number;
  averageFluencyScore: number;
  correctionsReceived: number;
  scenariosCompleted: string[]; // scenario IDs
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  practiceTime: number; // total minutes
  sessionCount: number;
  averageFluencyScore: number;
  bestDay: string; // day with highest fluency score
  streak: number; // consecutive days practiced
  topScenarios: Array<{
    scenarioId: string;
    completionCount: number;
  }>;
}

export interface SkillProgress {
  grammar: SkillLevel;
  vocabulary: SkillLevel;
  pronunciation: SkillLevel;
  fluency: SkillLevel;
  culture: SkillLevel;
}

export interface SkillLevel {
  level: number; // 0-100
  totalPractice: number; // total time practicing this skill (minutes)
  correctionsReceived: number;
  correctionsAcknowledged: number;
  accuracy: number; // 0-100, based on correction frequency
  trend: 'improving' | 'stable' | 'declining';
  lastPracticed?: Date;
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: Date;
  progress: number; // 0-100
  target: number; // e.g., 100 sessions, 1000 messages
  current: number; // e.g., 45 sessions, 678 messages
}

export type MilestoneType =
  | 'sessions'
  | 'messages'
  | 'scenarios'
  | 'fluency'
  | 'streak'
  | 'corrections'
  | 'time';

export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalPracticeTime: number; // minutes
  totalMessages: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  skillProgress: SkillProgress;
  scenariosCompleted: Record<string, number>; // scenario ID -> completion count
  milestones: Milestone[];
  lastPracticed?: Date;
  joinedAt: Date;
}

export interface ProgressSnapshot {
  date: string; // YYYY-MM-DD
  fluencyScore: number;
  skillLevels: SkillProgress;
  totalSessions: number;
  streak: number;
}

/**
 * Calculate skill trend based on recent performance
 */
export function calculateSkillTrend(
  recentScores: number[]
): 'improving' | 'stable' | 'declining' {
  if (recentScores.length < 3) return 'stable';

  const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
  const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

/**
 * Calculate accuracy based on corrections received vs acknowledged
 */
export function calculateAccuracy(
  totalCorrections: number,
  totalMessages: number
): number {
  if (totalMessages === 0) return 100;
  const errorRate = totalCorrections / totalMessages;
  return Math.max(0, Math.min(100, 100 - errorRate * 50));
}

/**
 * Get streak status message
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return '1 day streak - keep it up!';
  if (streak < 7) return `${streak} day streak - great start!`;
  if (streak < 30) return `${streak} day streak - you\'re on fire! 🔥`;
  if (streak < 100) return `${streak} day streak - incredible dedication! 🌟`;
  return `${streak} day streak - legendary! 🏆`;
}

/**
 * Format practice time for display
 */
export function formatPracticeTime(minutes: number): string {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get milestone icon
 */
export function getMilestoneIcon(type: MilestoneType): string {
  switch (type) {
    case 'sessions':
      return 'calendar';
    case 'messages':
      return 'chatbubbles';
    case 'scenarios':
      return 'compass';
    case 'fluency':
      return 'trending-up';
    case 'streak':
      return 'flame';
    case 'corrections':
      return 'school';
    case 'time':
      return 'time';
    default:
      return 'star';
  }
}
