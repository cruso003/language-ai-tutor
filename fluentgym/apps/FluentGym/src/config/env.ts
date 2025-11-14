import Constants from "expo-constants";

/**
 * Environment configuration helper
 * Centralizes access to environment variables through Expo Constants
 */
export const ENV = {
  API_URL: Constants.expoConfig?.extra?.API_URL || "http://192.168.1.3:3001",
  LIVEKIT_URL: Constants.expoConfig?.extra?.LIVEKIT_URL || "",
  LIVEKIT_API_KEY: Constants.expoConfig?.extra?.LIVEKIT_API_KEY || "",
  LIVEKIT_API_SECRET: Constants.expoConfig?.extra?.LIVEKIT_API_SECRET || "",
} as const;

export const API_URL = ENV.API_URL;

/**
 * Validates that required environment variables are present
 */
export const validateEnv = () => {
  const missingVars: string[] = [];

  // LiveKit credentials are optional for now
  // Can add validation here if needed later
  return true;
};

export default ENV;
