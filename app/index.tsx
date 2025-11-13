import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if onboarding is completed
        if (profile?.targetLanguage) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, profile]);

  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <ActivityIndicator size="large" color="#0284c7" />
      <Text className="mt-4 text-base text-gray-600">Loading FluentAI...</Text>
    </View>
  );
}
