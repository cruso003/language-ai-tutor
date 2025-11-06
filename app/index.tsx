import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/useUserStore';

export default function IndexScreen() {
  const router = useRouter();
  const { profile, isLoading } = useUserStore();

  useEffect(() => {
    if (!isLoading) {
      if (profile) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, profile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Loading FluentAI...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  }
});
