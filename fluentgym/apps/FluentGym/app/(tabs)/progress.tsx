import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { apiClient } from '../../src/api/client';

export default function ProgressScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [progress, setProgress] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await apiClient.getProgress(user?.id || '');
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    {
      label: 'Total XP',
      value: progress?.totalXp || 0,
      icon: 'star',
      color: '#fbbf24',
      bgColor: isDark ? 'rgba(251, 191, 36, 0.1)' : '#fef3c7',
    },
    {
      label: 'Sessions',
      value: progress?.sessionsCompleted || 0,
      icon: 'checkmark-circle',
      color: '#10b981',
      bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
    },
    {
      label: 'Current Streak',
      value: progress?.currentStreak || 0,
      icon: 'flame',
      color: '#f97316',
      bgColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#fed7aa',
    },
    {
      label: 'Longest Streak',
      value: progress?.longestStreak || 0,
      icon: 'trophy',
      color: '#8b5cf6',
      bgColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#ede9fe',
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadProgress}
            tintColor={isDark ? '#ffffff' : '#0284c7'}
          />
        }
      >
        {/* Header */}
        <View className={`${cardColor} px-6 py-6 mb-4`}>
          <Text className={`text-3xl font-bold ${textColor} mb-2`}>Your Progress</Text>
          <Text className={`text-base ${textSecondary}`}>
            Track your learning journey and achievements
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-4">
          <View className="flex-row flex-wrap gap-3">
            {stats.map((stat, index) => (
              <View key={index} style={{ width: '48%' }}>
                <Card>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  </View>
                  <Text className={`text-3xl font-bold ${textColor} mb-1`}>{stat.value}</Text>
                  <Text className={`text-sm ${textSecondary}`}>{stat.label}</Text>
                </Card>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Activity */}
        <View className="px-6 mb-4">
          <Card>
            <CardHeader title="Weekly Activity" subtitle="Last 7 days" />
            <CardContent>
              <View className="flex-row justify-between items-end h-32">
                {[65, 80, 45, 90, 70, 55, 85].map((height, index) => (
                  <View key={index} className="items-center flex-1">
                    <View
                      className="bg-primary-600 rounded-t-lg w-8"
                      style={{ height: `${height}%` }}
                    />
                    <Text className={`text-xs ${textSecondary} mt-2`}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Achievements */}
        <View className="px-6 pb-8">
          <Card>
            <CardHeader title="Recent Achievements" subtitle="Keep up the great work!" />
            <CardContent>
              {[
                { title: '7-Day Streak', icon: 'flame', color: '#f97316', xp: 100 },
                { title: 'First Session', icon: 'trophy', color: '#fbbf24', xp: 50 },
                { title: 'Early Bird', icon: 'sunny', color: '#eab308', xp: 75 },
              ].map((achievement, index) => (
                <View
                  key={index}
                  className={`flex-row items-center py-3 border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  } last:border-b-0`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${achievement.color}${isDark ? '33' : '20'}` }}
                  >
                    <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${textColor}`}>
                      {achievement.title}
                    </Text>
                    <Text className={`text-sm ${textSecondary}`}>+{achievement.xp} XP</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
              ))}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
