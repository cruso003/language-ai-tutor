/**
 * ScenarioProgress Component
 *
 * Displays current scenario objectives and completion progress
 * Shows during practice session to guide the user
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Scenario, ScenarioObjective } from '../config/scenarios';

interface ScenarioProgressProps {
  scenario: Scenario;
  completedObjectives: string[]; // Array of completed objective IDs
  onToggleObjective?: (objectiveId: string) => void;
  isDark?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ScenarioProgress: React.FC<ScenarioProgressProps> = ({
  scenario,
  completedObjectives,
  onToggleObjective,
  isDark = false,
  isExpanded = false,
  onToggleExpand,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const totalObjectives = scenario.objectives.length;
  const completedCount = completedObjectives.length;
  const progress = totalObjectives > 0 ? (completedCount / totalObjectives) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <TouchableOpacity
        onPress={onToggleExpand}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={18} color="#0284c7" />
          <Text style={[styles.scenarioName, { color: textColor }]}>
            {scenario.name}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.progressText, { color: textSecondary }]}>
            {completedCount}/{totalObjectives}
          </Text>
          {onToggleExpand && (
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#10b981' : '#0284c7',
            },
          ]}
        />
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Setting */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>Setting</Text>
            <Text style={[styles.settingText, { color: textColor }]}>
              {scenario.setting}
            </Text>
          </View>

          {/* Objectives */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>Objectives</Text>
            <View style={styles.objectivesList}>
              {scenario.objectives.map((objective) => {
                const isCompleted = completedObjectives.includes(objective.id);
                return (
                  <TouchableOpacity
                    key={objective.id}
                    onPress={() => onToggleObjective?.(objective.id)}
                    style={styles.objectiveItem}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isCompleted ? '#10b981' : textSecondary}
                    />
                    <Text
                      style={[
                        styles.objectiveText,
                        {
                          color: isCompleted ? textSecondary : textColor,
                          textDecorationLine: isCompleted ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {objective.description}
                      {objective.required && (
                        <Text style={styles.requiredBadge}> *</Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.requiredNote, { color: textSecondary }]}>
              * Required objectives
            </Text>
          </View>

          {/* Key Phrases */}
          {scenario.keyPhrases.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                Useful Phrases
              </Text>
              <View style={styles.phrasesList}>
                {scenario.keyPhrases.map((phrase, index) => (
                  <View
                    key={index}
                    style={[styles.phraseChip, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                  >
                    <Text style={[styles.phraseText, { color: textColor }]}>
                      {phrase}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Vocabulary Hints */}
          {scenario.vocabularyHints.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>
                Vocabulary Hints
              </Text>
              <View style={styles.vocabularyList}>
                {scenario.vocabularyHints.map((hint, index) => (
                  <Text key={index} style={[styles.vocabularyItem, { color: textSecondary }]}>
                    • {hint}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scenarioName: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    padding: 12,
    paddingTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  settingText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  objectivesList: {
    gap: 8,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  objectiveText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  requiredBadge: {
    color: '#ef4444',
    fontWeight: '700',
  },
  requiredNote: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  phrasesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  phraseChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  phraseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vocabularyList: {
    gap: 4,
  },
  vocabularyItem: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ScenarioProgress;
