import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { TutorSelector } from '../../src/components/TutorSelector';
import { TutorAvatar } from '../../src/components/TutorAvatar';
import { FluencyGate } from '../../src/components/FluencyGate';
import { FluencyMetrics } from '../../src/components/FluencyMetrics';
import { ScenarioProgress } from '../../src/components/ScenarioProgress';
import { getDefaultTutor, getTutorById, type Tutor } from '../../src/config/tutors';
import { getScenarioById, type Scenario } from '../../src/config/scenarios';
import { useFluencyTracking } from '../../src/hooks/useFluencyTracking';
import { apiClient } from '../../src/api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{ scenarioId?: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(getDefaultTutor());
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isFluencyGateActive, setIsFluencyGateActive] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showScenarioProgress, setShowScenarioProgress] = useState(true);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const responseStartTimeRef = useRef<number>();

  // Load scenario if scenarioId param provided
  const activeScenario: Scenario | undefined = params.scenarioId
    ? getScenarioById(params.scenarioId)
    : undefined;

  // Fluency tracking
  const { recordResponse, getSessionMetrics } = useFluencyTracking();

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100';

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const session = await apiClient.createSession('default-skill-pack');
      setSessionId(session.id);

      // Get initial greeting (use scenario greeting if available)
      const greeting = activeScenario
        ? activeScenario.initialGreeting
        : undefined;

      if (greeting) {
        // Use scenario's initial greeting directly
        addMessage('assistant', greeting);
      } else {
        // Get AI-generated greeting
        const response = await apiClient.startSession(
          'default-skill-pack',
          undefined,
          selectedTutor.personality
        );
        addMessage('assistant', response.greeting);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      Alert.alert('Error', 'Failed to start practice session. Please try again.');
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Activate Fluency Gate after assistant message
    if (role === 'assistant') {
      responseStartTimeRef.current = Date.now();
      setIsFluencyGateActive(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId) return;

    // Stop Fluency Gate and record response time
    setIsFluencyGateActive(false);
    const responseTime = responseStartTimeRef.current
      ? (Date.now() - responseStartTimeRef.current) / 1000
      : 0;

    if (responseTime > 0) {
      const metrics = recordResponse(responseTime);
      console.log(`Response time: ${responseTime.toFixed(2)}s - ${metrics.rating}`);
    }

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // FIX: Include userId in the request
      const response = await apiClient.sendMessage(sessionId, userMessage, selectedTutor.personality);
      addMessage('assistant', response.response);

      // Optionally play audio response
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is required for voice practice.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        // Transcribe audio
        const transcription = await apiClient.transcribeAudio(uri);
        addMessage('user', transcription.transcript);

        // Get AI response with userId
        const response = await apiClient.sendMessage(
          sessionId,
          transcription.transcript,
          selectedTutor.personality
        );
        addMessage('assistant', response.response);

        // Play audio response if available
        if (response.audioUrl) {
          playAudio(response.audioUrl);
        }
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setRecording(null);
      setIsLoading(false);
    }
  };

  const playAudio = async (url: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  // Fluency Gate handlers
  const handleFluencyTimeout = () => {
    console.log('⚠️ Response timeout! Too slow.');
    setIsFluencyGateActive(false);

    // Record timeout as slow response (4 seconds)
    if (responseStartTimeRef.current) {
      const responseTime = (Date.now() - responseStartTimeRef.current) / 1000;
      recordResponse(responseTime);
    }

    Alert.alert(
      'Too Slow!',
      'Try to respond faster next time. Thinking in your target language gets easier with practice!',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleResponseStart = (elapsedTime: number) => {
    console.log(`User started responding after ${elapsedTime.toFixed(2)}s`);
  };

  const handleInputFocus = () => {
    // Stop timer when user starts typing
    if (isFluencyGateActive && responseStartTimeRef.current) {
      const responseTime = (Date.now() - responseStartTimeRef.current) / 1000;
      recordResponse(responseTime);
      setIsFluencyGateActive(false);
    }
  };

  // Scenario handlers
  const handleToggleObjective = (objectiveId: string) => {
    setCompletedObjectives((prev) => {
      if (prev.includes(objectiveId)) {
        // Remove if already completed
        return prev.filter((id) => id !== objectiveId);
      } else {
        // Add to completed
        return [...prev, objectiveId];
      }
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`${cardColor} px-6 py-4 border-b ${borderColor}`}>
          <Text className={`text-2xl font-bold ${textColor} mb-3`}>Practice Session</Text>

          {/* Tutor Selection */}
          <TutorSelector
            selectedTutorId={selectedTutor.id}
            onSelectTutor={setSelectedTutor}
            isDark={isDark}
          />

          {/* Fluency Metrics Toggle */}
          {getSessionMetrics().totalResponses > 0 && (
            <TouchableOpacity
              onPress={() => setShowMetrics(!showMetrics)}
              className="mt-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="stats-chart" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text className={`text-sm font-medium ${textSecondary}`}>
                  Session Metrics
                </Text>
              </View>
              <Ionicons
                name={showMetrics ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Fluency Metrics Display */}
        {showMetrics && getSessionMetrics().totalResponses > 0 && (
          <View className="px-6 py-4">
            <FluencyMetrics
              metrics={getSessionMetrics()}
              isDark={isDark}
              compact={false}
            />
          </View>
        )}

        {/* Scenario Progress */}
        {activeScenario && (
          <View className="px-6 py-4">
            <ScenarioProgress
              scenario={activeScenario}
              completedObjectives={completedObjectives}
              onToggleObjective={handleToggleObjective}
              isDark={isDark}
              isExpanded={showScenarioProgress}
              onToggleExpand={() => setShowScenarioProgress(!showScenarioProgress)}
            />
          </View>
        )}

        {/* Fluency Gate Timer */}
        <FluencyGate
          isActive={isFluencyGateActive}
          maxTime={3}
          onTimeout={handleFluencyTimeout}
          onResponseStart={handleResponseStart}
        />

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={isDark ? '#4b5563' : '#d1d5db'}
              />
              <Text className={`text-lg ${textSecondary} mt-4 text-center`}>
                Start practicing! Send a message or use voice input.
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <View className={`flex-row gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <TutorAvatar tutor={selectedTutor} size="small" />
                )}
                <View>
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600'
                        : isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                    }`}
                    style={
                      message.role === 'user'
                        ? {
                            shadowColor: '#0284c7',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-base ${
                        message.role === 'user'
                          ? 'text-white'
                          : isDark
                          ? 'text-dark-text'
                          : 'text-gray-900'
                      }`}
                    >
                      {message.content}
                    </Text>
                  </View>
                  <Text className={`text-xs ${textSecondary} mt-1 px-2`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {isLoading && (
            <View className="items-start mb-4">
              <View
                className={`${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } border ${borderColor} rounded-2xl px-4 py-3`}
              >
                <View className="flex-row gap-1">
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className={`${cardColor} px-6 py-4 border-t ${borderColor}`}>
          <View className="flex-row items-center gap-2">
            <View className={`flex-1 flex-row items-center ${inputBg} rounded-full px-4 py-3`}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                onFocus={handleInputFocus}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                className={`flex-1 text-base ${textColor}`}
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isRecording ? 'bg-error' : 'bg-primary-600'
              }`}
              style={{
                shadowColor: isRecording ? '#ef4444' : '#0284c7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isLoading ? 'bg-primary-600' : isDark ? 'bg-gray-800' : 'bg-gray-300'
              }`}
              style={
                inputText.trim() && !isLoading
                  ? {
                      shadowColor: '#0284c7',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  : undefined
              }
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? 'white' : isDark ? '#4b5563' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
