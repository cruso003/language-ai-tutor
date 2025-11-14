import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const { isDark, themePreference, setThemePreference } = useTheme();

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

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

  const handleThemeChange = () => {
    Alert.alert('Choose Theme', 'Select your preferred theme', [
      { text: 'Light', onPress: () => setThemePreference('light') },
      { text: 'Dark', onPress: () => setThemePreference('dark') },
      { text: 'System', onPress: () => setThemePreference('system') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const menuItems = [
    {
      title: 'Theme',
      subtitle: themePreference.charAt(0).toUpperCase() + themePreference.slice(1),
      icon: isDark ? 'moon' : 'sunny',
      onPress: handleThemeChange,
      color: '#3b82f6',
    },
    {
      title: 'Language Preferences',
      icon: 'language',
      onPress: () => router.push('/onboarding'),
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
      title: 'About FluentGym',
      icon: 'information-circle',
      onPress: () => {},
      color: '#6b7280',
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`${cardColor} px-6 py-8 mb-4`}>
          <View className="items-center">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center mb-4 border-4 border-primary-200">
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} className="w-24 h-24 rounded-full" />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {profile?.displayName?.charAt(0) || 'U'}
                </Text>
              )}
            </View>

            <Text className={`text-2xl font-bold ${textColor} mb-1`}>
              {profile?.displayName || 'User'}
            </Text>
            <Text className={`text-base ${textSecondary} mb-4`}>{user?.email}</Text>

            <View className="flex-row gap-2">
              <View className={`${isDark ? 'bg-primary-900/30' : 'bg-primary-100'} px-3 py-1.5 rounded-full`}>
                <Text className="text-primary-700 font-semibold text-sm">
                  {profile?.proficiencyLevel || 'Beginner'}
                </Text>
              </View>
              <View className={`${isDark ? 'bg-secondary-900/30' : 'bg-secondary-100'} px-3 py-1.5 rounded-full`}>
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
                <Text className={`text-2xl font-bold ${textColor}`}>127</Text>
                <Text className={`text-sm ${textSecondary}`}>Followers</Text>
              </View>
              <View className={`w-px h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <View className="items-center">
                <Text className={`text-2xl font-bold ${textColor}`}>48</Text>
                <Text className={`text-sm ${textSecondary}`}>Following</Text>
              </View>
              <View className={`w-px h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <View className="items-center">
                <Text className={`text-2xl font-bold ${textColor}`}>25</Text>
                <Text className={`text-sm ${textSecondary}`}>Badges</Text>
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
              className={`${cardColor} rounded-2xl px-4 py-4 mb-3 flex-row items-center border ${borderColor}`}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${item.color}${isDark ? '33' : '20'}` }}
              >
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${textColor}`}>{item.title}</Text>
                {item.subtitle && (
                  <Text className={`text-sm ${textSecondary}`}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
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
