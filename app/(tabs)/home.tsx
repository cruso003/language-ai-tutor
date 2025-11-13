import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { apiClient } from '../../src/api/client';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.displayName || 'Learner'}! 👋
              </Text>
              <Text className="text-base text-gray-600 mt-1">
                Ready to practice your {profile?.targetLanguage || 'skills'} today?
              </Text>
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <Ionicons name="notifications" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className="ml-1 text-sm font-semibold text-gray-600">Streak</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900">{currentStreak}</Text>
              <Text className="text-xs text-gray-600">days</Text>
            </View>

            <View className="flex-1 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="star" size={20} color="#eab308" />
                <Text className="ml-1 text-sm font-semibold text-gray-600">XP</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900">{totalXp}</Text>
              <Text className="text-xs text-gray-600">points</Text>
            </View>

            <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text className="ml-1 text-sm font-semibold text-gray-600">Sessions</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900">{sessionsCompleted}</Text>
              <Text className="text-xs text-gray-600">completed</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/practice')}
              className="flex-1 bg-primary-600 rounded-2xl p-4 items-center"
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                <Ionicons name="mic" size={24} color="white" />
              </View>
              <Text className="text-white font-semibold">Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-secondary-600 rounded-2xl p-4 items-center">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                <Ionicons name="videocam" size={24} color="white" />
              </View>
              <Text className="text-white font-semibold">Live Session</Text>
            </TouchableOpacity>
          </View>
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
            <Text className="text-lg font-bold text-gray-900">Recommended for You</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
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
                className="bg-white rounded-2xl p-4 w-48 border border-gray-200"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${session.color}20` }}
                >
                  <Ionicons name={session.icon as any} size={24} color={session.color} />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">{session.title}</Text>
                <View className="flex-row items-center space-x-2">
                  <View className="bg-gray-100 px-2 py-1 rounded-full">
                    <Text className="text-xs text-gray-600">{session.level}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={12} color="#6b7280" />
                    <Text className="text-xs text-gray-600 ml-1">{session.duration}</Text>
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
