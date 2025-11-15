/**
 * MilestoneCard Component
 *
 * Displays a single milestone with progress and achievement status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Milestone } from '../types/metrics';
import { getMilestoneIcon } from '../types/metrics';

interface MilestoneCardProps {
  milestone: Milestone;
  isDark?: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isDark = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const trackBg = isDark ? '#374151' : '#e5e7eb';

  const icon = getMilestoneIcon(milestone.type);
  const iconColor = milestone.achieved ? '#10b981' : '#6b7280';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          opacity: milestone.achieved ? 1 : 0.7,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: milestone.achieved ? '#10b981' : trackBg,
          },
        ]}
      >
        <Ionicons
          name={milestone.achieved ? 'checkmark-circle' : (icon as any)}
          size={24}
          color={milestone.achieved ? '#ffffff' : iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>
          {milestone.title}
        </Text>
        <Text style={[styles.description, { color: textSecondary }]}>
          {milestone.description}
        </Text>

        {/* Progress */}
        {!milestone.achieved && (
          <>
            <View style={[styles.progressTrack, { backgroundColor: trackBg }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${milestone.progress}%`,
                    backgroundColor: '#0284c7',
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: textSecondary }]}>
              {milestone.current} / {milestone.target}
            </Text>
          </>
        )}

        {/* Achievement Date */}
        {milestone.achieved && milestone.achievedAt && (
          <Text style={[styles.achievedText, { color: '#10b981' }]}>
            ✓ Achieved {formatDate(milestone.achievedAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Format achievement date
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  achievedText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default MilestoneCard;
