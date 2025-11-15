import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const { isDark } = useTheme();

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

  const bgColor = isDark ? '#111827' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#111827';

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: bgColor,
      }}
    >
      <ActivityIndicator size="large" color="#0284c7" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: textColor,
        }}
      >
        Loading FluentGym...
      </Text>
    </View>
  );
}
