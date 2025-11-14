import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Button } from '../src/components/ui/Button';

const languages = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸', learners: '24M' },
  { code: 'fr', name: 'French', flag: '🇫🇷', learners: '12M' },
  { code: 'de', name: 'German', flag: '🇩🇪', learners: '8M' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', learners: '5M' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', learners: '6M' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', learners: '15M' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', learners: '10M' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', learners: '7M' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', learners: '4M' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', learners: '3M' },
];

const proficiencyLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Just starting out',
    icon: 'seedling' as const
  },
  {
    id: 'elementary',
    name: 'Elementary',
    description: 'Know some basics',
    icon: 'leaf' as const
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Can have conversations',
    icon: 'trending-up' as const
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Fluent speaker',
    icon: 'rocket' as const
  },
];

const learningGoals = [
  { id: 'travel', name: 'Travel', icon: 'airplane' as const },
  { id: 'work', name: 'Career', icon: 'briefcase' as const },
  { id: 'education', name: 'Education', icon: 'school' as const },
  { id: 'culture', name: 'Culture', icon: 'globe' as const },
  { id: 'family', name: 'Family', icon: 'people' as const },
  { id: 'personal', name: 'Personal', icon: 'heart' as const },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-gray-50';
  const cardColor = isDark ? 'bg-dark-card' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (step === 1 && !selectedLanguage) {
      Alert.alert('Selection Required', 'Please select a language to continue');
      return;
    }
    if (step === 2 && !selectedLevel) {
      Alert.alert('Selection Required', 'Please select your proficiency level');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        targetLanguage: selectedLanguage,
        proficiencyLevel: selectedLevel,
        interests: selectedGoals,
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text className={`text-3xl font-bold ${textColor} mb-2 text-center`}>
              What do you want to learn?
            </Text>
            <Text className={`text-base ${textSecondary} mb-8 text-center`}>
              Choose the language you'd like to master
            </Text>
            <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
              <View className="gap-3">
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setSelectedLanguage(lang.code)}
                    className={`${cardColor} rounded-2xl p-4 border-2 ${
                      selectedLanguage === lang.code
                        ? 'border-primary-600'
                        : isDark
                        ? 'border-gray-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <Text className="text-4xl">{lang.flag}</Text>
                        <View>
                          <Text className={`text-lg font-bold ${textColor}`}>
                            {lang.name}
                          </Text>
                          <Text className={`text-sm ${textSecondary}`}>
                            {lang.learners} learners
                          </Text>
                        </View>
                      </View>
                      {selectedLanguage === lang.code && (
                        <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View>
            <Text className={`text-3xl font-bold ${textColor} mb-2 text-center`}>
              What's your current level?
            </Text>
            <Text className={`text-base ${textSecondary} mb-8 text-center`}>
              This helps us personalize your learning experience
            </Text>
            <View className="gap-4">
              {proficiencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  onPress={() => setSelectedLevel(level.id)}
                  className={`${cardColor} rounded-2xl p-6 border-2 ${
                    selectedLevel === level.id
                      ? 'border-primary-600'
                      : isDark
                      ? 'border-gray-700'
                      : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className={`w-12 h-12 rounded-full items-center justify-center ${
                        selectedLevel === level.id ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <Ionicons
                          name={level.icon}
                          size={24}
                          color={selectedLevel === level.id ? '#0284c7' : '#6b7280'}
                        />
                      </View>
                      <View>
                        <Text className={`text-lg font-bold ${textColor}`}>
                          {level.name}
                        </Text>
                        <Text className={`text-sm ${textSecondary}`}>
                          {level.description}
                        </Text>
                      </View>
                    </View>
                    {selectedLevel === level.id && (
                      <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text className={`text-3xl font-bold ${textColor} mb-2 text-center`}>
              Why are you learning?
            </Text>
            <Text className={`text-base ${textSecondary} mb-8 text-center`}>
              Select all that apply
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {learningGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  className={`${cardColor} rounded-2xl p-4 border-2 flex-row items-center gap-3 ${
                    selectedGoals.includes(goal.id)
                      ? 'border-primary-600'
                      : isDark
                      ? 'border-gray-700'
                      : 'border-gray-200'
                  }`}
                  style={{ minWidth: '45%' }}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedGoals.includes(goal.id) ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <Ionicons
                      name={goal.icon}
                      size={20}
                      color={selectedGoals.includes(goal.id) ? '#0284c7' : '#6b7280'}
                    />
                  </View>
                  <Text className={`text-base font-semibold ${textColor}`}>
                    {goal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top', 'bottom']}>
      <View className="flex-1 px-6 py-8">
        {/* Progress Bar */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`text-sm font-semibold ${textSecondary}`}>
              Step {step} of 3
            </Text>
            <Text className={`text-sm font-semibold ${textSecondary}`}>
              {Math.round((step / 3) * 100)}%
            </Text>
          </View>
          <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <View
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View className="gap-3 mt-6">
          <Button
            onPress={handleContinue}
            disabled={isLoading}
            size="lg"
          >
            {step === 3 ? (isLoading ? 'Saving...' : 'Get Started') : 'Continue'}
          </Button>
          {step > 1 && (
            <Button
              onPress={() => setStep(step - 1)}
              variant="outline"
              size="lg"
            >
              Back
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
