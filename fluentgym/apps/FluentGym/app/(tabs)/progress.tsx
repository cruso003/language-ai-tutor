/**
 * Progress Screen
 *
 * Displays comprehensive user progress with REAL metrics (no fake data)
 * Shows session history, fluency trends, skill breakdown, and milestones
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/ui/Card';
import { StatsCard } from '../../src/components/StatsCard';
import { ProgressChart } from '../../src/components/ProgressChart';
import { SkillsBreakdown } from '../../src/components/SkillsBreakdown';
import { MilestoneCard } from '../../src/components/MilestoneCard';
import { useMetricsTracking } from '../../src/hooks/useMetricsTracking';
import { getStreakMessage, formatPracticeTime } from '../../src/types/metrics';

export default function ProgressScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const {
    userProgress,
    dailyStats,
    isLoading,
    getRecentDailyStats,
    reload,
  } = useMetricsTracking(user?.id || 'guest');

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    reload();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const recentStats = getRecentDailyStats(7);

  // Show loading state
  if (isLoading || !userProgress) {
    return (
      <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="stats-chart"
            size={64}
            color={isDark ? '#4b5563' : '#d1d5db'}
          />
          <Text className={`text-lg ${textSecondary} mt-4`}>
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no sessions yet
  if (userProgress.totalSessions === 0) {
    return (
      <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="rocket-outline"
            size={80}
            color={isDark ? '#4b5563' : '#d1d5db'}
          />
          <Text className={`text-2xl font-bold ${textColor} mt-6 text-center`}>
            Ready to Start?
          </Text>
          <Text className={`text-base ${textSecondary} mt-2 text-center`}>
            Complete your first practice session to see your progress here!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#ffffff' : '#0284c7'}
          />
        }
      >
        {/* Header */}
        <View className={`${cardColor} px-6 py-6 mb-4`}>
          <Text className={`text-3xl font-bold ${textColor} mb-2`}>
            Your Progress
          </Text>
          <Text className={`text-base ${textSecondary}`}>
            {getStreakMessage(userProgress.currentStreak)}
          </Text>
        </View>

        {/* Key Stats */}
        <View className="px-6 mb-4">
          <View style={styles.statsGrid}>
            <View style={styles.statHalf}>
              <StatsCard
                icon="calendar"
                iconColor="#10b981"
                label="Total Sessions"
                value={userProgress.totalSessions}
                subtitle="practice sessions"
                isDark={isDark}
              />
            </View>
            <View style={styles.statHalf}>
              <StatsCard
                icon="time"
                iconColor="#0284c7"
                label="Practice Time"
                value={formatPracticeTime(userProgress.totalPracticeTime)}
                subtitle="total time"
                isDark={isDark}
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statHalf}>
              <StatsCard
                icon="flame"
                iconColor="#f97316"
                label="Current Streak"
                value={`${userProgress.currentStreak} days`}
                subtitle={`Best: ${userProgress.longestStreak}`}
                isDark={isDark}
              />
            </View>
            <View style={styles.statHalf}>
              <StatsCard
                icon="chatbubbles"
                iconColor="#8b5cf6"
                label="Messages"
                value={userProgress.totalMessages}
                subtitle="sent in Spanish"
                isDark={isDark}
              />
            </View>
          </View>
        </View>

        {/* Practice Time Chart */}
        <View className="px-6 mb-4">
          <View className={`${cardColor}`} style={styles.chartCard}>
            <ProgressChart
              dailyStats={recentStats}
              metric="practiceTime"
              title="Practice Time (Last 7 Days)"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Fluency Score Chart */}
        <View className="px-6 mb-4">
          <View className={`${cardColor}`} style={styles.chartCard}>
            <ProgressChart
              dailyStats={recentStats}
              metric="fluencyScore"
              title="Fluency Score Trend"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Skills Breakdown */}
        <View className="px-6 mb-4">
          <SkillsBreakdown skillProgress={userProgress.skillProgress} isDark={isDark} />
        </View>

        {/* Scenarios Completed */}
        {Object.keys(userProgress.scenariosCompleted).length > 0 && (
          <View className="px-6 mb-4">
            <View className={`${cardColor}`} style={styles.card}>
              <Text className={`text-lg font-bold ${textColor} mb-4`}>
                Scenarios Completed
              </Text>
              {Object.entries(userProgress.scenariosCompleted).map(
                ([scenarioId, count]) => (
                  <View key={scenarioId} style={styles.scenarioRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className={`flex-1 ${textColor} ml-2`}>
                      {scenarioId}
                    </Text>
                    <Text className={`${textSecondary} font-semibold`}>
                      {count}x
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {/* Milestones */}
        <View className="px-6 mb-4">
          <Text className={`text-xl font-bold ${textColor} mb-3`}>
            Milestones
          </Text>
          {userProgress.milestones.map((milestone) => (
            <View key={milestone.id} style={styles.milestoneContainer}>
              <MilestoneCard milestone={milestone} isDark={isDark} />
            </View>
          ))}
        </View>

        {/* Join Date */}
        <View className="px-6 pb-8">
          <Text className={`text-sm ${textSecondary} text-center`}>
            Member since {userProgress.joinedAt.toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statHalf: {
    flex: 1,
  },
  chartCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  milestoneContainer: {
    marginBottom: 12,
  },
});
