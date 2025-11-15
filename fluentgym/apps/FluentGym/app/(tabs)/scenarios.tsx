/**
 * Scenarios Tab Screen
 *
 * Browse and select conversation scenarios for practice
 * Displays scenario details, objectives, and difficulty levels
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ScenarioSelector } from '../../src/components/ScenarioSelector';
import { Button } from '../../src/components/ui/Button';
import type { Scenario } from '../../src/config/scenarios';

export default function ScenariosScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const bgColor = isDark ? 'bg-dark-bg' : 'bg-white';
  const textColor = isDark ? 'text-dark-text' : 'text-gray-900';

  const handleStartPractice = () => {
    if (selectedScenario) {
      // Navigate to practice screen with scenario
      router.push({
        pathname: '/(tabs)/practice',
        params: { scenarioId: selectedScenario.id },
      });
    } else {
      // Free practice mode
      router.push('/(tabs)/practice');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      <View style={styles.container}>
        {/* Scenario Selector */}
        <View style={styles.selectorContainer}>
          <ScenarioSelector
            selectedScenarioId={selectedScenario?.id}
            onSelectScenario={setSelectedScenario}
            isDark={isDark}
          />
        </View>

        {/* Start Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleStartPractice}
            variant="primary"
            size="large"
            fullWidth
          >
            {selectedScenario
              ? `Start: ${selectedScenario.name}`
              : 'Start Free Practice'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorContainer: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 10,
  },
});
