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
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { apiClient } from '../../src/api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function PracticeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('encouraging-mentor');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  const personalities = [
    { id: 'encouraging-mentor', name: 'Mentor', icon: 'school', color: '#3b82f6' },
    { id: 'friendly-peer', name: 'Friend', icon: 'people', color: '#10b981' },
    { id: 'professional-coach', name: 'Coach', icon: 'briefcase', color: '#8b5cf6' },
    { id: 'cultural-expert', name: 'Expert', icon: 'globe', color: '#f59e0b' },
  ];

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const session = await apiClient.createSession('default-skill-pack');
      setSessionId(session.id);

      // Get initial greeting
      const response = await apiClient.startSession('default-skill-pack', undefined, selectedPersonality);
      addMessage('assistant', response.greeting);
    } catch (error) {
      console.error('Failed to initialize session:', error);
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
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await apiClient.sendMessage(sessionId, userMessage, selectedPersonality);
      addMessage('assistant', response.response);

      // Optionally play audio response
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
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

        // Get AI response
        const response = await apiClient.sendMessage(
          sessionId,
          transcription.transcript,
          selectedPersonality
        );
        addMessage('assistant', response.response);
      }
    } catch (error) {
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-3">Practice Session</Text>

          {/* Personality Selection */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
            {personalities.map((personality) => (
              <TouchableOpacity
                key={personality.id}
                onPress={() => setSelectedPersonality(personality.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  selectedPersonality === personality.id ? 'bg-primary-600' : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name={personality.icon as any}
                  size={16}
                  color={selectedPersonality === personality.id ? 'white' : personality.color}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    selectedPersonality === personality.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {personality.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`text-base ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}
                >
                  {message.content}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1 px-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View className="items-start mb-4">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <View className="flex-row space-x-1">
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="bg-white px-6 py-4 border-t border-gray-200">
          <View className="flex-row items-center space-x-2">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                className="flex-1 text-base text-gray-900"
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isRecording ? 'bg-error' : 'bg-primary-600'
              }`}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isLoading ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
