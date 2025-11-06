import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../src/stores/useUserStore';

export default function RootLayout() {
  const loadUserData = useUserStore((state) => state.loadUserData);

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="results" />
      </Stack>
    </>
  );
}
