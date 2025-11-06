import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConversationStore } from '../src/stores/useConversationStore';
import { useUserStore } from '../src/stores/useUserStore';
import AIConversationService from '../src/services/AIConversationService';
import SpeechAnalysisService from '../src/services/SpeechAnalysisService';
import { ConversationMessage } from '../src/types';

// In production, load from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-key-here';

export default function ConversationScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    currentSession,
    messages,
    isProcessing,
    addMessage,
    addCorrections,
    setProcessing,
    endSession
  } = useConversationStore();

  const { profile, updateProgress } = useUserStore();

  const [aiService] = useState(() => new AIConversationService(OPENAI_API_KEY));
  const [speechService] = useState(() => new SpeechAnalysisService(OPENAI_API_KEY));

  const [isRecording, setIsRecording] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    if (!currentSession) {
      router.replace('/home');
      return;
    }

    // Initialize AI service
    if (profile) {
      aiService.setLanguageSettings(
        profile.targetLanguage,
        profile.nativeLanguage,
        profile.proficiencyLevel
      );
      aiService.startScenario(
        { id: currentSession.missionId, title: '', description: '', difficulty: profile.proficiencyLevel, category: 'custom', objectives: [], estimatedDuration: 0, requiredVocabulary: [], culturalNotes: [] },
        currentSession.aiPersonality
      );
    }

    // Start with AI greeting
    sendInitialGreeting();

    // Request audio permissions
    speechService.requestPermissions();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendInitialGreeting = async () => {
    setProcessing(true);

    try {
      const response = await aiService.sendMessage('Hello!');

      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to get initial greeting:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      speechService.markPromptTime();
      await speechService.startRecording();
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setProcessing(true);

    try {
      const { uri, duration, responseLatency } = await speechService.stopRecording();

      // Transcribe the audio
      const transcription = await speechService.transcribeAudio(uri);

      // Add user message
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: transcription,
        timestamp: new Date(),
        audioUrl: uri
      };
      addMessage(userMessage);

      // Get AI response
      const response = await aiService.sendMessage(transcription);

      // Add AI message
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      addMessage(aiMessage);

      // Show corrections if any
      if (response.corrections.length > 0) {
        addCorrections(response.corrections);
        setShowCorrections(true);
      }

      // Check if session should end
      if (response.shouldEndSession) {
        await handleEndSession(true);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('Error', 'Failed to process your speech. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleEndSession = async (passed: boolean) => {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // in minutes

    // Get final feedback
    const feedback = await aiService.generateFinalFeedback();

    // Update progress
    await updateProgress({
      sessionsCompleted: (useUserStore.getState().progress?.sessionsCompleted || 0) + 1,
      totalPracticeTime: (useUserStore.getState().progress?.totalPracticeTime || 0) + Math.round(sessionDuration),
      fluencyTrend: [...(useUserStore.getState().progress?.fluencyTrend || []), feedback.fluencyScore]
    });

    endSession(passed);
    router.push('/results');
  };

  const handleExitEarly = () => {
    Alert.alert(
      'Exit Session?',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            useConversationStore.getState().resetConversation();
            router.replace('/home');
          }
        }
      ]
    );
  };

  if (!currentSession) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitEarly} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {currentSession.aiPersonality.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentSession.aiPersonality.description}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.aiMessageText
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}

        {isProcessing && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            <ActivityIndicator color="#666" />
          </View>
        )}
      </ScrollView>

      {/* Corrections Panel */}
      {showCorrections && useConversationStore.getState().recentCorrections.length > 0 && (
        <View style={styles.correctionsPanel}>
          <View style={styles.correctionsPanelHeader}>
            <Text style={styles.correctionsPanelTitle}>💡 Quick Corrections</Text>
            <TouchableOpacity onPress={() => setShowCorrections(false)}>
              <Text style={styles.correctionsPanelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {useConversationStore.getState().recentCorrections.map((correction, index) => (
            <View key={index} style={styles.correctionItem}>
              <Text style={styles.correctionOriginal}>❌ {correction.original}</Text>
              <Text style={styles.correctionCorrected}>✅ {correction.corrected}</Text>
              <Text style={styles.correctionExplanation}>{correction.explanation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recording Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            isProcessing && styles.recordButtonDisabled
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.recordButtonText}>
              {isRecording ? '🔴 Stop' : '🎤 Speak'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.controlsHint}>
          {isRecording
            ? 'Recording... Tap to stop'
            : isProcessing
            ? 'Processing...'
            : 'Tap to respond'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  exitButtonText: {
    fontSize: 18,
    color: '#666'
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666'
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF'
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userMessageText: {
    color: '#fff'
  },
  aiMessageText: {
    color: '#000'
  },
  correctionsPanel: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  correctionsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  correctionsPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  correctionsPanelClose: {
    fontSize: 20,
    color: '#666'
  },
  correctionItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6cc'
  },
  correctionOriginal: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4
  },
  correctionCorrected: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 4
  },
  correctionExplanation: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center'
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30'
  },
  recordButtonDisabled: {
    backgroundColor: '#ccc'
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  controlsHint: {
    fontSize: 13,
    color: '#666'
  }
});
