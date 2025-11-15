import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { apiClient } from '../../src/api/client';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [progressData, planData] = await Promise.all([
        apiClient.getProgress(user?.id || ''),
        apiClient.getDailyPlan(),
      ]);
      setProgress(progressData);
      setDailyPlan(planData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const currentStreak = progress?.currentStreak || 0;
  const totalXp = progress?.totalXp || 0;
  const sessionsCompleted = progress?.sessionsCompleted || 0;

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#ffffff' : '#0284c7'}
          />
        }
      >
        {/* Header */}
        <View className={`px-6 pt-4 pb-6 ${cardColor}`}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className={`text-2xl font-bold ${textColor}`}>
                Welcome back, {profile?.displayName || 'Learner'}!
              </Text>
              <Text className={`text-base ${textSecondary} mt-1`}>
                Ready to practice your {profile?.targetLanguage || 'skills'} today?
              </Text>
            </View>
            <TouchableOpacity className={`w-12 h-12 rounded-full ${isDark ? 'bg-primary-900/30' : 'bg-primary-100'} items-center justify-center`}>
              <Ionicons name="notifications-outline" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3">
            <View className={`flex-1 ${isDark ? 'bg-primary-900/20' : 'bg-primary-50'} rounded-2xl p-4 ${borderColor} border`}>
              <View className="flex-row items-center mb-1">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className={`ml-1 text-sm font-semibold ${textSecondary}`}>Streak</Text>
              </View>
              <Text className={`text-3xl font-bold ${textColor}`}>{currentStreak}</Text>
              <Text className={`text-xs ${textSecondary}`}>days</Text>
            </View>

            <View className={`flex-1 ${isDark ? 'bg-secondary-900/20' : 'bg-secondary-50'} rounded-2xl p-4 ${borderColor} border`}>
              <View className="flex-row items-center mb-1">
                <Ionicons name="star" size={20} color="#eab308" />
                <Text className={`ml-1 text-sm font-semibold ${textSecondary}`}>XP</Text>
              </View>
              <Text className={`text-3xl font-bold ${textColor}`}>{totalXp}</Text>
              <Text className={`text-xs ${textSecondary}`}>points</Text>
            </View>

            <View className={`flex-1 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} rounded-2xl p-4 ${borderColor} border`}>
              <View className="flex-row items-center mb-1">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text className={`ml-1 text-sm font-semibold ${textSecondary}`}>Sessions</Text>
              </View>
              <Text className={`text-3xl font-bold ${textColor}`}>{sessionsCompleted}</Text>
              <Text className={`text-xs ${textSecondary}`}>completed</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <Text className={`text-lg font-bold ${textColor} mb-3`}>Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/practice')}
              className="flex-1 bg-primary-600 rounded-2xl p-4 items-center"
              style={{
                shadowColor: '#0284c7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                <Ionicons name="mic" size={24} color="white" />
              </View>
              <Text className="text-white font-semibold">Practice Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/marketplace')}
              className="flex-1 bg-secondary-600 rounded-2xl p-4 items-center"
              style={{
                shadowColor: '#c026d3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                <Ionicons name="cart" size={24} color="white" />
              </View>
              <Text className="text-white font-semibold">Explore</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar Test - /avatar-test */}
        <View className="px-6 py-4">
          <Button onPress={() => router.push('/avatar-test')}>Avatar Test</Button>
        </View>

        {/* Daily Quests */}
        <View className="px-6 py-4">
          <Card>
            <CardHeader
              title="Today's Quests"
              subtitle="Complete these to earn bonus XP"
              action={
                <View className="bg-primary-100 px-3 py-1 rounded-full">
                  <Text className="text-primary-700 font-bold text-xs">
                    {dailyPlan?.quests?.filter((q: any) => q.completed).length || 0}/
                    {dailyPlan?.quests?.length || 3}
                  </Text>
                </View>
              }
            />
            <CardContent>
              {dailyPlan?.quests?.map((quest: any, index: number) => (
                <View
                  key={index}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                      quest.completed ? 'bg-success' : 'bg-gray-200'
                    }`}
                  >
                    {quest.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${
                        quest.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {quest.title}
                    </Text>
                    <Text className="text-xs text-gray-500">{quest.xp} XP</Text>
                  </View>
                  {!quest.completed && (
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  )}
                </View>
              )) || (
                <View className="py-4">
                  <Text className="text-gray-500 text-center">No quests available today</Text>
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Recommended Sessions */}
        <View className="px-6 py-4 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`text-lg font-bold ${textColor}`}>Recommended for You</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')}>
              <Text className="text-primary-600 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {[
              {
                title: 'Travel Conversation',
                level: 'Beginner',
                duration: '15 min',
                icon: 'airplane',
                color: '#3b82f6',
              },
              {
                title: 'Business Meeting',
                level: 'Intermediate',
                duration: '20 min',
                icon: 'briefcase',
                color: '#8b5cf6',
              },
              {
                title: 'Casual Chat',
                level: 'Beginner',
                duration: '10 min',
                icon: 'chatbubbles',
                color: '#ec4899',
              },
            ].map((session, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push('/(tabs)/practice')}
                className={`${cardColor} rounded-2xl p-4 w-48 border ${borderColor}`}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${session.color}20` }}
                >
                  <Ionicons name={session.icon as any} size={24} color={session.color} />
                </View>
                <Text className={`text-base font-bold ${textColor} mb-1`}>{session.title}</Text>
                <View className="flex-row items-center gap-2">
                  <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                    <Text className={`text-xs ${textSecondary}`}>{session.level}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className={`text-xs ${textSecondary}`}>{session.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
