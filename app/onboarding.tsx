import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../src/stores/useUserStore";
import {
  LanguageCode,
  ProficiencyLevel,
  UserProfile,
  ProgressData,
} from "../src/types";

const LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

const LEVELS: { level: ProficiencyLevel; name: string; description: string }[] =
  [
    { level: "beginner", name: "Beginner", description: "Just starting out" },
    {
      level: "elementary",
      name: "Elementary",
      description: "Know basic phrases",
    },
    {
      level: "intermediate",
      name: "Intermediate",
      description: "Can have simple conversations",
    },
    {
      level: "advanced",
      name: "Advanced",
      description: "Fluent in most situations",
    },
  ];

const INTERESTS = [
  "Travel",
  "Business",
  "Food",
  "Technology",
  "Sports",
  "Movies",
  "Music",
  "Art",
  "Science",
  "Gaming",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setProfile = useUserStore((state) => state.setProfile);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("es");
  const [proficiencyLevel, setProficiencyLevel] =
    useState<ProficiencyLevel>("beginner");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    const profile: UserProfile = {
      id: Date.now().toString(),
      name,
      targetLanguage,
      nativeLanguage: "en", // Default to English
      proficiencyLevel,
      interests: selectedInterests,
      createdAt: new Date(),
      totalPracticeTime: 0,
    };

    const progress: ProgressData = {
      userId: profile.id,
      sessionsCompleted: 0,
      totalPracticeTime: 0,
      currentStreak: 0,
      fluencyTrend: [],
      weakAreas: [],
      strongAreas: [],
      vocabularyMastered: 0,
      scenariosCompleted: [],
    };

    await setProfile(profile);
    await useUserStore.getState().updateProgress(progress);

    router.replace("/home");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Step 1: Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to FluentAI!</Text>
            <Text style={styles.subtitle}>
              Let's get you set up for conversational mastery
            </Text>

            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, !name && styles.buttonDisabled]}
              onPress={() => setStep(2)}
              disabled={!name}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Language Selection */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>
              What language do you want to master?
            </Text>

            <View style={styles.languageGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageCard,
                    targetLanguage === lang.code && styles.languageCardSelected,
                  ]}
                  onPress={() => setTargetLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={styles.languageName}>{lang.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Level Selection */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your current level?</Text>

            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.level}
                style={[
                  styles.levelCard,
                  proficiencyLevel === level.level && styles.levelCardSelected,
                ]}
                onPress={() => setProficiencyLevel(level.level)}
              >
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(2)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are you interested in?</Text>
            <Text style={styles.subtitle}>
              We'll personalize conversations around your interests
            </Text>

            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest) &&
                      styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) &&
                        styles.interestTextSelected,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                selectedInterests.length === 0 && styles.buttonDisabled,
              ]}
              onPress={handleComplete}
              disabled={selectedInterests.length === 0}
            >
              <Text style={styles.buttonText}>Start Learning!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(3)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  languageCard: {
    width: "47%",
    padding: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
  },
  languageCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  languageFlag: {
    fontSize: 48,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  levelCard: {
    padding: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
  },
  levelCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  levelName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  levelDescription: {
    fontSize: 14,
    color: "#666",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 20,
  },
  interestChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  interestText: {
    fontSize: 14,
    color: "#000",
  },
  interestTextSelected: {
    color: "#fff",
  },
});
