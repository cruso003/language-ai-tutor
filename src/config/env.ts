import Constants from "expo-constants";

/**
 * Environment configuration helper
 * Centralizes access to environment variables through Expo Constants
 */
export const ENV = {
  API_URL: Constants.expoConfig?.extra?.API_URL || "http://localhost:3000",
  OPENAI_API_KEY: Constants.expoConfig?.extra?.OPENAI_API_KEY || "",
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

  if (!ENV.OPENAI_API_KEY) {
    missingVars.push("OPENAI_API_KEY");
  }

  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(", ")}`);
    return false;
  }

  return true;
};

export default ENV;
