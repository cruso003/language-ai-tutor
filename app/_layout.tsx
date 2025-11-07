import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../src/stores/useUserStore";
import { validateEnv } from "../src/config/env";

export default function RootLayout() {
  const loadUserData = useUserStore((state) => state.loadUserData);

  useEffect(() => {
    // Validate environment variables on app startup
    validateEnv();
    loadUserData();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
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
