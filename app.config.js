import "dotenv/config";

export default {
  expo: {
    name: "FluentAI",
    slug: "fluent-ai-tutor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fluentai.tutor",
      infoPlist: {
        NSMicrophoneUsageDescription:
          "This app needs access to your microphone for real-time conversation practice.",
        NSCameraUsageDescription:
          "This app needs access to your camera for pronunciation feedback and immersive learning.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.fluentai.tutor",
      permissions: ["CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      LIVEKIT_URL: process.env.LIVEKIT_URL,
      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    },
    plugins: ["expo-router"],
  },
};
