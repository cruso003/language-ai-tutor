/**
 * Fluency Metrics Display Component
 *
 * Shows real-time fluency statistics for current practice session
 * Displays: average response time, fluency score, response breakdown
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SessionMetrics {
  totalResponses: number;
  averageResponseTime: number;
  fluencyScore: number;
  breakdown: {
    excellent: number; // <1s
    good: number;      // 1-2s
    okay: number;      // 2-3s
    slow: number;      // >3s
  };
}

interface FluencyMetricsProps {
  metrics: SessionMetrics;
  isDark?: boolean;
  compact?: boolean;
}

export const FluencyMetrics: React.FC<FluencyMetricsProps> = ({
  metrics,
  isDark = false,
  compact = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  // Determine score color and rating
  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10b981'; // Green - Excellent
    if (score >= 70) return '#3b82f6'; // Blue - Good
    if (score >= 50) return '#f59e0b'; // Yellow - Okay
    return '#ef4444'; // Red - Needs work
  };

  const getScoreRating = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Keep Practicing';
  };

  const scoreColor = getScoreColor(metrics.fluencyScore);
  const scoreRating = getScoreRating(metrics.fluencyScore);

  if (metrics.totalResponses === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: cardColor, borderColor }]}>
        <Ionicons name="stats-chart-outline" size={32} color={textSecondary} />
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          Start practicing to see your fluency metrics
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.compactRow}>
          <View style={styles.compactStat}>
            <Text style={[styles.compactValue, { color: scoreColor }]}>
              {metrics.fluencyScore}
            </Text>
            <Text style={[styles.compactLabel, { color: textSecondary }]}>Score</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={[styles.compactValue, { color: textColor }]}>
              {metrics.averageResponseTime.toFixed(1)}s
            </Text>
            <Text style={[styles.compactLabel, { color: textSecondary }]}>Avg Time</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={[styles.compactValue, { color: textColor }]}>
              {metrics.totalResponses}
            </Text>
            <Text style={[styles.compactLabel, { color: textSecondary }]}>Responses</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={20} color={textColor} />
        <Text style={[styles.headerText, { color: textColor }]}>Session Metrics</Text>
      </View>

      {/* Fluency Score */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {metrics.fluencyScore}
          </Text>
          <Text style={[styles.scoreMax, { color: textSecondary }]}>/100</Text>
        </View>
        <Text style={[styles.scoreRating, { color: scoreColor }]}>{scoreRating}</Text>
      </View>

      {/* Average Response Time */}
      <View style={styles.statRow}>
        <Text style={[styles.statLabel, { color: textSecondary }]}>Avg Response Time</Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {metrics.averageResponseTime.toFixed(2)}s
        </Text>
      </View>

      {/* Total Responses */}
      <View style={styles.statRow}>
        <Text style={[styles.statLabel, { color: textSecondary }]}>Total Responses</Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {metrics.totalResponses}
        </Text>
      </View>

      {/* Response Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={[styles.breakdownTitle, { color: textSecondary }]}>
          Response Breakdown
        </Text>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.breakdownLabel, { color: textSecondary }]}>
              Excellent ({`<1s`})
            </Text>
            <Text style={[styles.breakdownValue, { color: textColor }]}>
              {metrics.breakdown.excellent}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={[styles.breakdownLabel, { color: textSecondary }]}>
              Good (1-2s)
            </Text>
            <Text style={[styles.breakdownValue, { color: textColor }]}>
              {metrics.breakdown.good}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.breakdownLabel, { color: textSecondary }]}>
              Okay (2-3s)
            </Text>
            <Text style={[styles.breakdownValue, { color: textColor }]}>
              {metrics.breakdown.okay}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.breakdownLabel, { color: textSecondary }]}>
              Slow ({`>3s`})
            </Text>
            <Text style={[styles.breakdownValue, { color: textColor }]}>
              {metrics.breakdown.slow}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  compactContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
  },
  compactValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreRating: {
    fontSize: 18,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownGrid: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FluencyMetrics;
