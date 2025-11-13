import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiClient } from '../../src/api/client';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await apiClient.getProgress(user?.id || '');
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const stats = [
    {
      label: 'Total XP',
      value: progress?.totalXp || 0,
      icon: 'star',
      color: '#fbbf24',
      bgColor: '#fef3c7',
    },
    {
      label: 'Sessions',
      value: progress?.sessionsCompleted || 0,
      icon: 'checkmark-circle',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      label: 'Current Streak',
      value: progress?.currentStreak || 0,
      icon: 'flame',
      color: '#f97316',
      bgColor: '#fed7aa',
    },
    {
      label: 'Longest Streak',
      value: progress?.longestStreak || 0,
      icon: 'trophy',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Your Progress</Text>
          <Text className="text-base text-gray-600">
            Track your learning journey and achievements
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-4">
          <View className="flex-row flex-wrap -mx-2">
            {stats.map((stat, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <Card>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  </View>
                  <Text className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</Text>
                  <Text className="text-sm text-gray-600">{stat.label}</Text>
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
                    <Text className="text-xs text-gray-500 mt-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Achievements */}
        <View className="px-6 pb-6">
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
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${achievement.color}20` }}
                  >
                    <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">
                      {achievement.title}
                    </Text>
                    <Text className="text-sm text-gray-600">+{achievement.xp} XP</Text>
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
