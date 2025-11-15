/**
 * SkillsBreakdown Component
 *
 * Displays user's skill levels across different areas
 * (Grammar, Vocabulary, Pronunciation, Fluency, Culture)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { SkillProgress } from '../types/metrics';

interface SkillsBreakdownProps {
  skillProgress: SkillProgress;
  isDark?: boolean;
}

const SKILL_INFO = {
  grammar: {
    label: 'Grammar',
    icon: 'alert-circle',
    color: '#ef4444',
  },
  vocabulary: {
    label: 'Vocabulary',
    icon: 'book',
    color: '#f59e0b',
  },
  pronunciation: {
    label: 'Pronunciation',
    icon: 'mic',
    color: '#8b5cf6',
  },
  fluency: {
    label: 'Fluency',
    icon: 'trending-up',
    color: '#10b981',
  },
  culture: {
    label: 'Culture',
    icon: 'globe',
    color: '#06b6d4',
  },
};

export const SkillsBreakdown: React.FC<SkillsBreakdownProps> = ({
  skillProgress,
  isDark = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const trackBg = isDark ? '#374151' : '#e5e7eb';

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Skill Breakdown</Text>

      <View style={styles.skills}>
        {(Object.keys(SKILL_INFO) as Array<keyof SkillProgress>).map((skillKey) => {
          const skill = skillProgress[skillKey];
          const info = SKILL_INFO[skillKey];

          const getTrendIcon = () => {
            switch (skill.trend) {
              case 'improving':
                return 'trending-up';
              case 'declining':
                return 'trending-down';
              default:
                return 'remove';
            }
          };

          const getTrendColor = () => {
            switch (skill.trend) {
              case 'improving':
                return '#10b981';
              case 'declining':
                return '#ef4444';
              default:
                return textSecondary;
            }
          };

          return (
            <View key={skillKey} style={styles.skillRow}>
              {/* Icon and Label */}
              <View style={styles.skillHeader}>
                <View style={[styles.iconContainer, { backgroundColor: info.color }]}>
                  <Ionicons name={info.icon as any} size={16} color="#ffffff" />
                </View>
                <View style={styles.skillInfo}>
                  <Text style={[styles.skillLabel, { color: textColor }]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.skillLevel, { color: textSecondary }]}>
                    Level {skill.level}
                  </Text>
                </View>
                {/* Trend */}
                <Ionicons
                  name={getTrendIcon() as any}
                  size={16}
                  color={getTrendColor()}
                />
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: trackBg }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${skill.level}%`,
                      backgroundColor: info.color,
                    },
                  ]}
                />
              </View>

              {/* Stats */}
              <View style={styles.stats}>
                <Text style={[styles.statText, { color: textSecondary }]}>
                  Accuracy: {Math.round(skill.accuracy)}%
                </Text>
                <Text style={[styles.statText, { color: textSecondary }]}>
                  {Math.round(skill.totalPractice)}min practiced
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  skills: {
    gap: 16,
  },
  skillRow: {
    gap: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillLevel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 11,
  },
});

export default SkillsBreakdown;
