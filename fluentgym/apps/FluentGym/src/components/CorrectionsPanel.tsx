/**
 * CorrectionsPanel Component
 *
 * Displays all corrections for recent messages
 * Shows as a collapsible panel in the practice screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CorrectionCard } from './CorrectionCard';
import type { CorrectionSummary } from '../types/corrections';

interface CorrectionsPanelProps {
  corrections: CorrectionSummary[];
  onAcknowledge?: (correctionId: string) => void;
  onDismiss?: (correctionId: string) => void;
  onClearAll?: () => void;
  isDark?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CorrectionsPanel: React.FC<CorrectionsPanelProps> = ({
  corrections,
  onAcknowledge,
  onDismiss,
  onClearAll,
  isDark = false,
  isExpanded = true,
  onToggleExpand,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  // Count total corrections
  const totalCorrections = corrections.reduce(
    (sum, summary) => sum + summary.corrections.length,
    0
  );

  // Count unacknowledged corrections
  const unacknowledgedCount = corrections.reduce((sum, summary) => {
    const unacknowledged = summary.corrections.filter((c) => !c.acknowledged).length;
    return sum + unacknowledged;
  }, 0);

  if (totalCorrections === 0) {
    return null; // Don't show panel if no corrections
  }

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <TouchableOpacity
        onPress={onToggleExpand}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="school" size={20} color="#0284c7" />
          <Text style={[styles.title, { color: textColor }]}>Smart Corrections</Text>
          {unacknowledgedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unacknowledgedCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {isExpanded && totalCorrections > 0 && (
            <TouchableOpacity
              onPress={onClearAll}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearButtonText, { color: textSecondary }]}>
                Clear all
              </Text>
            </TouchableOpacity>
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Corrections List */}
      {isExpanded && (
        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {corrections.map((summary) =>
              summary.corrections.map((correction) => (
                <CorrectionCard
                  key={correction.id}
                  correction={correction}
                  onAcknowledge={onAcknowledge}
                  onDismiss={onDismiss}
                  isDark={isDark}
                  compact={false}
                />
              ))
            )}
          </ScrollView>

          {/* Summary Stats */}
          <View style={[styles.stats, { borderTopColor: borderColor }]}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={[styles.statText, { color: textSecondary }]}>
                {totalCorrections - unacknowledgedCount} reviewed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="alert-circle" size={16} color="#f59e0b" />
              <Text style={[styles.statText, { color: textSecondary }]}>
                {unacknowledgedCount} new
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
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
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    maxHeight: 400,
  },
  scrollView: {
    maxHeight: 320,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 0,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CorrectionsPanel;
