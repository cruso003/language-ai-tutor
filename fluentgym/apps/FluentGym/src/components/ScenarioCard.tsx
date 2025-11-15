/**
 * ScenarioCard Component
 *
 * Displays a single scenario with icon, name, difficulty, and objectives
 * Used in scenario selection grid
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Scenario, DifficultyLevel } from '../config/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  isSelected?: boolean;
  isDark?: boolean;
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: '#10b981', // Green
  intermediate: '#f59e0b', // Yellow
  advanced: '#ef4444', // Red
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onSelect,
  isSelected = false,
  isDark = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const difficultyColor = DIFFICULTY_COLORS[scenario.difficulty];
  const difficultyLabel = DIFFICULTY_LABELS[scenario.difficulty];

  return (
    <TouchableOpacity
      onPress={() => onSelect(scenario)}
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor: isSelected ? difficultyColor : borderColor,
          borderWidth: isSelected ? 3 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      {/* Icon and Title */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: difficultyColor }]}>
          <Ionicons name={scenario.icon as any} size={28} color="#ffffff" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {scenario.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyText}>{difficultyLabel}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color={textSecondary} />
              <Text style={[styles.timeText, { color: textSecondary }]}>
                {scenario.estimatedTime}min
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: textSecondary }]} numberOfLines={2}>
        {scenario.description}
      </Text>

      {/* Objectives Count */}
      <View style={styles.footer}>
        <View style={styles.objectivesContainer}>
          <Ionicons name="checkmark-circle-outline" size={14} color={difficultyColor} />
          <Text style={[styles.objectivesText, { color: textSecondary }]}>
            {scenario.objectives.length} objectives
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: difficultyColor }]}>
            <Ionicons name="checkmark" size={12} color="#ffffff" />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectivesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  objectivesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ScenarioCard;
