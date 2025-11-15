/**
 * ScenarioSelector Component
 *
 * Displays all available scenarios in categorized sections
 * Allows user to select a scenario for practice
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScenarioCard } from './ScenarioCard';
import {
  SCENARIO_LIST,
  getScenariosByDifficulty,
  type Scenario,
  type DifficultyLevel,
} from '../config/scenarios';

interface ScenarioSelectorProps {
  selectedScenarioId?: string;
  onSelectScenario: (scenario: Scenario | null) => void;
  isDark?: boolean;
}

type FilterType = 'all' | DifficultyLevel;

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenarioId,
  onSelectScenario,
  isDark = false,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const bgColor = isDark ? '#111827' : '#f9fafb';
  const cardColor = isDark ? '#1f2937' : '#ffffff';

  const getFilteredScenarios = (): Scenario[] => {
    if (filter === 'all') return SCENARIO_LIST;
    return getScenariosByDifficulty(filter);
  };

  const filteredScenarios = getFilteredScenarios();

  const handleSelectScenario = (scenario: Scenario) => {
    // If clicking the same scenario, deselect it
    if (selectedScenarioId === scenario.id) {
      onSelectScenario(null);
    } else {
      onSelectScenario(scenario);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="compass" size={24} color={textColor} />
          <Text style={[styles.title, { color: textColor }]}>Choose a Scenario</Text>
        </View>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Practice real-world conversations
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterTab
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
          isDark={isDark}
        />
        <FilterTab
          label="Beginner"
          active={filter === 'beginner'}
          onPress={() => setFilter('beginner')}
          isDark={isDark}
          color="#10b981"
        />
        <FilterTab
          label="Intermediate"
          active={filter === 'intermediate'}
          onPress={() => setFilter('intermediate')}
          isDark={isDark}
          color="#f59e0b"
        />
        <FilterTab
          label="Advanced"
          active={filter === 'advanced'}
          onPress={() => setFilter('advanced')}
          isDark={isDark}
          color="#ef4444"
        />
      </ScrollView>

      {/* Scenarios List */}
      <ScrollView
        style={styles.scenariosList}
        contentContainerStyle={styles.scenariosContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredScenarios.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={textSecondary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              No scenarios found
            </Text>
          </View>
        ) : (
          filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onSelect={handleSelectScenario}
              isSelected={selectedScenarioId === scenario.id}
              isDark={isDark}
            />
          ))
        )}

        {/* Free Practice Option */}
        <TouchableOpacity
          onPress={() => onSelectScenario(null)}
          style={[
            styles.freePracticeCard,
            {
              backgroundColor: cardColor,
              borderColor: selectedScenarioId === undefined ? '#0284c7' : isDark ? '#374151' : '#e5e7eb',
              borderWidth: selectedScenarioId === undefined ? 3 : 1,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.freePracticeHeader}>
            <View style={[styles.freePracticeIcon, { backgroundColor: '#0284c7' }]}>
              <Ionicons name="chatbubbles" size={28} color="#ffffff" />
            </View>
            <View style={styles.freePracticeText}>
              <Text style={[styles.freePracticeTitle, { color: textColor }]}>
                Free Practice
              </Text>
              <Text style={[styles.freePracticeDescription, { color: textSecondary }]}>
                Chat about anything without a specific scenario
              </Text>
            </View>
          </View>
          {selectedScenarioId === undefined && (
            <View style={[styles.selectedBadge, { backgroundColor: '#0284c7' }]}>
              <Ionicons name="checkmark" size={12} color="#ffffff" />
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

interface FilterTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark?: boolean;
  color?: string;
}

const FilterTab: React.FC<FilterTabProps> = ({
  label,
  active,
  onPress,
  isDark,
  color = '#0284c7',
}) => {
  const bgColor = active ? color : isDark ? '#374151' : '#e5e7eb';
  const textColor = active ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterTab, { backgroundColor: bgColor }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterTabText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginLeft: 34,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scenariosList: {
    flex: 1,
  },
  scenariosContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  freePracticeCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  freePracticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  freePracticeIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freePracticeText: {
    flex: 1,
  },
  freePracticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  freePracticeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ScenarioSelector;
