import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConversationStore } from '../src/stores/useConversationStore';
import AIConversationService from '../src/services/AIConversationService';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-key-here';

export default function ResultsScreen() {
  const router = useRouter();
  const { currentSession, resetConversation } = useConversationStore();

  const [feedback, setFeedback] = useState<{
    fluencyScore: number;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: number;
    nextSteps: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentSession) {
      router.replace('/home');
      return;
    }

    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const aiService = new AIConversationService(OPENAI_API_KEY);
      const result = await aiService.generateFinalFeedback();
      setFeedback(result);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    resetConversation();
    router.replace('/home');
  };

  if (!currentSession) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {currentSession.passed ? (
            <>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.title}>Mission Completed!</Text>
              <Text style={styles.subtitle}>
                You successfully navigated this conversation
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.successEmoji}>📊</Text>
              <Text style={styles.title}>Session Complete</Text>
              <Text style={styles.subtitle}>Here's how you did</Text>
            </>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing your performance...</Text>
          </View>
        ) : feedback ? (
          <>
            {/* Fluency Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Fluency Score</Text>
              <Text style={styles.scoreValue}>{feedback.fluencyScore}</Text>
              <Text style={styles.scoreSubtext}>out of 100</Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    { width: `${feedback.fluencyScore}%` }
                  ]}
                />
              </View>
            </View>

            {/* Strengths */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Your Strengths</Text>
              {feedback.strengths.map((strength, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>• {strength}</Text>
                </View>
              ))}
            </View>

            {/* Areas for Improvement */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Focus Areas</Text>
              {feedback.improvements.map((improvement, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>• {improvement}</Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{feedback.vocabularyUsed}</Text>
                <Text style={styles.statLabel}>Words Used</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentSession.messages.filter((m) => m.role === 'user').length}
                </Text>
                <Text style={styles.statLabel}>Exchanges</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(
                    ((currentSession.endTime?.getTime() || Date.now()) -
                      currentSession.startTime.getTime()) /
                      1000 /
                      60
                  )}
                </Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>

            {/* Next Steps */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 Next Steps</Text>
              {feedback.nextSteps.map((step, index) => (
                <View key={index} style={styles.nextStepCard}>
                  <Text style={styles.nextStepNumber}>{index + 1}</Text>
                  <Text style={styles.nextStepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Motivational Message */}
            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                {feedback.fluencyScore >= 80
                  ? "Outstanding! You're having real conversations now. Keep pushing the boundaries."
                  : feedback.fluencyScore >= 60
                  ? "Good progress! You're building real conversational ability. Keep practicing under pressure."
                  : "Every conversation counts. The more you speak, the more natural it becomes. Don't give up!"}
              </Text>
            </View>
          </>
        ) : null}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 24,
    paddingTop: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#007AFF'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  nextStepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  nextStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12
  },
  nextStepText: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  motivationCard: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  motivationText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'center'
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
