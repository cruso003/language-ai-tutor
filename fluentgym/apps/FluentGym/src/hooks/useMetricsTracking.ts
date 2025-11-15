/**
 * Metrics Tracking Hook
 *
 * Manages comprehensive user progress metrics with persistent storage
 * Tracks sessions, fluency, corrections, scenarios, streaks, and milestones
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PracticeSession,
  DailyStats,
  UserProgress,
  SkillProgress,
  Milestone,
  ProgressSnapshot,
} from '../types/metrics';
import {
  calculateSkillTrend,
  calculateAccuracy,
} from '../types/metrics';

const STORAGE_KEYS = {
  USER_PROGRESS: '@fluentgym/user_progress',
  SESSIONS: '@fluentgym/sessions',
  DAILY_STATS: '@fluentgym/daily_stats',
  SNAPSHOTS: '@fluentgym/progress_snapshots',
};

export const useMetricsTracking = (userId: string) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all metrics from storage on mount
  useEffect(() => {
    loadMetrics();
  }, [userId]);

  /**
   * Load all metrics from AsyncStorage
   */
  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      const [progressData, sessionsData, dailyData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_STATS),
      ]);

      // Parse progress
      if (progressData) {
        const progress = JSON.parse(progressData);
        // Convert date strings back to Date objects
        if (progress.lastPracticed) {
          progress.lastPracticed = new Date(progress.lastPracticed);
        }
        if (progress.joinedAt) {
          progress.joinedAt = new Date(progress.joinedAt);
        }
        setUserProgress(progress);
      } else {
        // Initialize new user progress
        const newProgress = createInitialProgress(userId);
        setUserProgress(newProgress);
        await saveUserProgress(newProgress);
      }

      // Parse sessions
      if (sessionsData) {
        const parsedSessions = JSON.parse(sessionsData);
        setSessions(parsedSessions.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        })));
      }

      // Parse daily stats
      if (dailyData) {
        setDailyStats(JSON.parse(dailyData));
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save user progress to storage
   */
  const saveUserProgress = async (progress: UserProgress) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error('Failed to save user progress:', error);
    }
  };

  /**
   * Start a new practice session
   */
  const startSession = useCallback(
    (scenarioId?: string, tutorId: string = 'sofia'): string => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newSession: PracticeSession = {
        id: sessionId,
        startTime: new Date(),
        duration: 0,
        scenarioId,
        tutorId,
        languagePair: 'en-es', // TODO: Make configurable
        messageCount: 0,
        userMessages: 0,
        aiMessages: 0,
        averageResponseTime: 0,
        fluencyScore: 0,
        responseBreakdown: {
          excellent: 0,
          good: 0,
          okay: 0,
          slow: 0,
        },
        totalCorrections: 0,
        correctionsByType: {
          grammar: 0,
          vocabulary: 0,
          pronunciation: 0,
          culture: 0,
          fluency: 0,
        },
        correctionsAcknowledged: 0,
        objectivesCompleted: 0,
        objectivesTotal: 0,
      };

      setSessions((prev) => [...prev, newSession]);
      return sessionId;
    },
    []
  );

  /**
   * Update session metrics
   */
  const updateSession = useCallback(
    async (
      sessionId: string,
      updates: Partial<PracticeSession>
    ) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, ...updates } : s
        );
        // Persist to storage
        AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  /**
   * End a practice session and update all metrics
   */
  const endSession = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

      // Update session with final metrics
      await updateSession(sessionId, {
        endTime,
        duration,
      });

      // Update user progress
      if (userProgress) {
        const updatedProgress = {
          ...userProgress,
          totalSessions: userProgress.totalSessions + 1,
          totalPracticeTime: userProgress.totalPracticeTime + duration / 60,
          totalMessages: userProgress.totalMessages + session.messageCount,
          lastPracticed: endTime,
        };

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const lastPracticedDate = userProgress.lastPracticed
          ? new Date(userProgress.lastPracticed).toISOString().split('T')[0]
          : null;

        if (lastPracticedDate) {
          const daysDiff = Math.floor(
            (new Date(today).getTime() - new Date(lastPracticedDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            // Consecutive day
            updatedProgress.currentStreak += 1;
            updatedProgress.longestStreak = Math.max(
              updatedProgress.longestStreak,
              updatedProgress.currentStreak
            );
          } else if (daysDiff > 1) {
            // Streak broken
            updatedProgress.currentStreak = 1;
          }
          // If daysDiff === 0, same day, don't change streak
        } else {
          // First session
          updatedProgress.currentStreak = 1;
        }

        // Update scenario completion
        if (session.scenarioId) {
          const completions = updatedProgress.scenariosCompleted[session.scenarioId] || 0;
          updatedProgress.scenariosCompleted[session.scenarioId] = completions + 1;
        }

        // Update skill progress based on session corrections
        updatedProgress.skillProgress = updateSkillProgress(
          updatedProgress.skillProgress,
          session
        );

        setUserProgress(updatedProgress);
        await saveUserProgress(updatedProgress);

        // Update daily stats
        await updateDailyStats(session, today);

        // Check for milestone achievements
        await checkMilestones(updatedProgress);
      }
    },
    [sessions, userProgress]
  );

  /**
   * Update daily stats for the session
   */
  const updateDailyStats = async (session: PracticeSession, date: string) => {
    setDailyStats((prev) => {
      const existing = prev.find((d) => d.date === date);
      let updated: DailyStats[];

      if (existing) {
        // Update existing day
        updated = prev.map((d) =>
          d.date === date
            ? {
                ...d,
                practiceTime: d.practiceTime + session.duration / 60,
                sessionCount: d.sessionCount + 1,
                messageCount: d.messageCount + session.messageCount,
                averageFluencyScore:
                  (d.averageFluencyScore * d.sessionCount + session.fluencyScore) /
                  (d.sessionCount + 1),
                correctionsReceived: d.correctionsReceived + session.totalCorrections,
                scenariosCompleted: session.scenarioId &&
                  !d.scenariosCompleted.includes(session.scenarioId)
                  ? [...d.scenariosCompleted, session.scenarioId]
                  : d.scenariosCompleted,
              }
            : d
        );
      } else {
        // Create new day
        const newDay: DailyStats = {
          date,
          practiceTime: session.duration / 60,
          sessionCount: 1,
          messageCount: session.messageCount,
          averageFluencyScore: session.fluencyScore,
          correctionsReceived: session.totalCorrections,
          scenariosCompleted: session.scenarioId ? [session.scenarioId] : [],
        };
        updated = [...prev, newDay];
      }

      // Persist to storage
      AsyncStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Get sessions from last N days
   */
  const getRecentSessions = useCallback(
    (days: number = 7): PracticeSession[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      return sessions.filter((s) => s.startTime >= cutoff);
    },
    [sessions]
  );

  /**
   * Get daily stats for last N days
   */
  const getRecentDailyStats = useCallback(
    (days: number = 7): DailyStats[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      return dailyStats
        .filter((d) => d.date >= cutoffStr)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [dailyStats]
  );

  /**
   * Get progress snapshot for historical tracking
   */
  const getProgressSnapshot = useCallback((): ProgressSnapshot | null => {
    if (!userProgress) return null;

    return {
      date: new Date().toISOString().split('T')[0],
      fluencyScore: calculateAverageFluencyScore(sessions),
      skillLevels: userProgress.skillProgress,
      totalSessions: userProgress.totalSessions,
      streak: userProgress.currentStreak,
    };
  }, [userProgress, sessions]);

  return {
    userProgress,
    sessions,
    dailyStats,
    isLoading,
    startSession,
    updateSession,
    endSession,
    getRecentSessions,
    getRecentDailyStats,
    getProgressSnapshot,
    reload: loadMetrics,
  };
};

/**
 * Create initial user progress object
 */
function createInitialProgress(userId: string): UserProgress {
  return {
    userId,
    totalSessions: 0,
    totalPracticeTime: 0,
    totalMessages: 0,
    currentStreak: 0,
    longestStreak: 0,
    skillProgress: {
      grammar: createInitialSkillLevel(),
      vocabulary: createInitialSkillLevel(),
      pronunciation: createInitialSkillLevel(),
      fluency: createInitialSkillLevel(),
      culture: createInitialSkillLevel(),
    },
    scenariosCompleted: {},
    milestones: createInitialMilestones(),
    joinedAt: new Date(),
  };
}

/**
 * Create initial skill level
 */
function createInitialSkillLevel() {
  return {
    level: 0,
    totalPractice: 0,
    correctionsReceived: 0,
    correctionsAcknowledged: 0,
    accuracy: 100,
    trend: 'stable' as const,
  };
}

/**
 * Update skill progress based on session data
 */
function updateSkillProgress(
  current: SkillProgress,
  session: PracticeSession
): SkillProgress {
  const updated = { ...current };

  // Update each skill based on corrections
  Object.entries(session.correctionsByType).forEach(([skill, count]) => {
    const skillKey = skill as keyof SkillProgress;
    const skillLevel = { ...updated[skillKey] };

    skillLevel.totalPractice += session.duration / 60;
    skillLevel.correctionsReceived += count;
    skillLevel.lastPracticed = new Date();

    // Calculate accuracy (fewer corrections = higher accuracy)
    skillLevel.accuracy = calculateAccuracy(
      skillLevel.correctionsReceived,
      session.userMessages
    );

    // Increase level based on practice time and accuracy
    const practiceBonus = Math.floor(skillLevel.totalPractice / 10); // 1 level per 10 min
    const accuracyBonus = Math.floor(skillLevel.accuracy / 10); // up to 10 levels from accuracy
    skillLevel.level = Math.min(100, practiceBonus + accuracyBonus);

    updated[skillKey] = skillLevel;
  });

  return updated;
}

/**
 * Calculate average fluency score across sessions
 */
function calculateAverageFluencyScore(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce((sum, s) => sum + s.fluencyScore, 0);
  return Math.round(total / sessions.length);
}

/**
 * Create initial milestones
 */
function createInitialMilestones(): Milestone[] {
  return [
    {
      id: 'first_session',
      type: 'sessions',
      title: 'First Steps',
      description: 'Complete your first practice session',
      achieved: false,
      progress: 0,
      target: 1,
      current: 0,
    },
    {
      id: 'ten_sessions',
      type: 'sessions',
      title: 'Getting Started',
      description: 'Complete 10 practice sessions',
      achieved: false,
      progress: 0,
      target: 10,
      current: 0,
    },
    {
      id: 'hundred_messages',
      type: 'messages',
      title: 'Chatty',
      description: 'Send 100 messages in Spanish',
      achieved: false,
      progress: 0,
      target: 100,
      current: 0,
    },
    {
      id: 'week_streak',
      type: 'streak',
      title: 'Week Warrior',
      description: 'Practice 7 days in a row',
      achieved: false,
      progress: 0,
      target: 7,
      current: 0,
    },
    {
      id: 'hour_practice',
      type: 'time',
      title: 'One Hour',
      description: 'Practice for 60 minutes total',
      achieved: false,
      progress: 0,
      target: 60,
      current: 0,
    },
  ];
}

/**
 * Check and update milestone achievements
 */
async function checkMilestones(progress: UserProgress) {
  // This would update milestone progress based on current stats
  // Implementation depends on milestone tracking requirements
}
