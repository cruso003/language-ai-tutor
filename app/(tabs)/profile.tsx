import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Account Settings',
      icon: 'settings',
      onPress: () => {},
      color: '#3b82f6',
    },
    {
      title: 'Language Preferences',
      icon: 'language',
      onPress: () => {},
      color: '#10b981',
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => {},
      color: '#f59e0b',
    },
    {
      title: 'Privacy & Security',
      icon: 'shield-checkmark',
      onPress: () => {},
      color: '#8b5cf6',
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => {},
      color: '#ec4899',
    },
    {
      title: 'About FluentAI',
      icon: 'information-circle',
      onPress: () => {},
      color: '#6b7280',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-8 mb-4">
          <View className="items-center">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center mb-4">
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} className="w-24 h-24 rounded-full" />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {profile?.displayName?.charAt(0) || 'U'}
                </Text>
              )}
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.displayName || 'User'}
            </Text>
            <Text className="text-base text-gray-600 mb-4">{user?.email}</Text>

            <View className="flex-row space-x-2">
              <View className="bg-primary-100 px-3 py-1 rounded-full">
                <Text className="text-primary-700 font-semibold text-sm">
                  {profile?.proficiencyLevel || 'Beginner'}
                </Text>
              </View>
              <View className="bg-secondary-100 px-3 py-1 rounded-full">
                <Text className="text-secondary-700 font-semibold text-sm">
                  {profile?.targetLanguage || 'Not set'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mb-4">
          <Card>
            <View className="flex-row justify-around py-2">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">127</Text>
                <Text className="text-sm text-gray-600">Followers</Text>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">48</Text>
                <Text className="text-sm text-gray-600">Following</Text>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">25</Text>
                <Text className="text-sm text-gray-600">Badges</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="bg-white rounded-2xl px-4 py-4 mb-3 flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6 pb-8">
          <Button onPress={handleLogout} variant="danger" fullWidth size="lg">
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
