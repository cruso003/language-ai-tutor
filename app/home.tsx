import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUserStore } from "../src/stores/useUserStore";
import { useConversationStore } from "../src/stores/useConversationStore";
import { SCENARIOS, AI_PERSONALITIES } from "../src/constants/scenarios";
import { ScenarioMission, AIPersonality, ProficiencyLevel } from "../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, progress } = useUserStore();
  const startSession = useConversationStore((state) => state.startSession);

  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(
    AI_PERSONALITIES[0]
  );

  // Filter scenarios by user level
  const availableScenarios = SCENARIOS.filter((scenario) => {
    if (!profile) return true;

    const levelOrder: ProficiencyLevel[] = [
      "beginner",
      "elementary",
      "intermediate",
      "advanced",
      "fluent",
    ];
    const userLevelIndex = levelOrder.indexOf(profile.proficiencyLevel);
    const scenarioLevelIndex = levelOrder.indexOf(scenario.difficulty);

    // Show current level and one level up
    return scenarioLevelIndex <= userLevelIndex + 1;
  });

  const handleStartScenario = (scenario: ScenarioMission) => {
    startSession(scenario, selectedPersonality);
    router.push("/conversation");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {profile?.name}! 👋</Text>
          <Text style={styles.subtitle}>
            Learning {profile?.targetLanguage.toUpperCase()} ·{" "}
            {profile?.proficiencyLevel}
          </Text>
        </View>

        {/* Progress Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {progress?.sessionsCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {progress?.totalPracticeTime || 0}m
            </Text>
            <Text style={styles.statLabel}>Practice Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* AI Personality Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your AI Tutor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AI_PERSONALITIES.map((personality) => (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityCard,
                  selectedPersonality.id === personality.id &&
                    styles.personalityCardSelected,
                ]}
                onPress={() => setSelectedPersonality(personality)}
              >
                <Text style={styles.personalityAvatar}>
                  {personality.avatar}
                </Text>
                <Text style={styles.personalityName}>{personality.name}</Text>
                <Text style={styles.personalityDescription}>
                  {personality.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready for a Mission?</Text>
          <Text style={styles.sectionSubtitle}>
            Real conversations, real situations. No multiple choice.
          </Text>

          {availableScenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={styles.scenarioCard}
              onPress={() => handleStartScenario(scenario)}
            >
              <View style={styles.scenarioHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDescription}>
                    {scenario.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor: getDifficultyColor(scenario.difficulty),
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {scenario.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.scenarioMeta}>
                <Text style={styles.scenarioMetaText}>
                  ⏱️ {scenario.estimatedDuration} min
                </Text>
                <Text style={styles.scenarioMetaText}>
                  🎯 {scenario.objectives.length} objectives
                </Text>
                <Text style={styles.scenarioMetaText}>
                  📚 {scenario.category}
                </Text>
              </View>

              <View style={styles.scenarioFooter}>
                <Text style={styles.startButton}>Start Mission →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>🔥 The Fluency Challenge</Text>
          <Text style={styles.motivationText}>
            Every conversation pushes you closer to real fluency. No streaks. No
            points. Just you, speaking naturally under real pressure.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDifficultyColor(difficulty: ProficiencyLevel): string {
  switch (difficulty) {
    case "beginner":
      return "#34C759";
    case "elementary":
      return "#5AC8FA";
    case "intermediate":
      return "#FF9500";
    case "advanced":
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  personalityCard: {
    width: 140,
    padding: 16,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  personalityCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  personalityAvatar: {
    fontSize: 36,
    marginBottom: 8,
  },
  personalityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  personalityDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
  },
  scenarioCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scenarioHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  scenarioDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  scenarioMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  scenarioMetaText: {
    fontSize: 13,
    color: "#666",
  },
  scenarioFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  startButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  motivationCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#000",
    borderRadius: 16,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
});
