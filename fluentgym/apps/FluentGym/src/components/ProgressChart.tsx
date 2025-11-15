/**
 * ProgressChart Component
 *
 * Displays a simple bar chart showing progress over time
 * Uses pure React Native components (no chart library dependency)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react';
import type { DailyStats } from '../types/metrics';

interface ProgressChartProps {
  dailyStats: DailyStats[];
  metric: 'practiceTime' | 'fluencyScore' | 'messageCount';
  title: string;
  isDark?: boolean;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  dailyStats,
  metric,
  title,
  isDark = false,
}) => {
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const barColor = '#0284c7';
  const barBg = isDark ? '#374151' : '#e5e7eb';

  // Get last 7 days
  const last7Days = getLast7Days();
  const chartData = last7Days.map((date) => {
    const stat = dailyStats.find((s) => s.date === date);
    return {
      date,
      value: stat ? getMetricValue(stat, metric) : 0,
      label: getDayLabel(date),
    };
  });

  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>

      {/* Chart */}
      <View style={styles.chart}>
        {chartData.map((data, index) => {
          const height = (data.value / maxValue) * 100;
          const isToday = data.date === new Date().toISOString().split('T')[0];

          return (
            <View key={data.date} style={styles.barContainer}>
              {/* Value label */}
              {data.value > 0 && (
                <Text style={[styles.valueLabel, { color: textSecondary }]}>
                  {formatValue(data.value, metric)}
                </Text>
              )}

              {/* Bar */}
              <View style={[styles.barTrack, { backgroundColor: barBg }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: isToday ? '#10b981' : barColor,
                    },
                  ]}
                />
              </View>

              {/* Day label */}
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? '#10b981' : textSecondary,
                    fontWeight: isToday ? '700' : '600',
                  },
                ]}
              >
                {data.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Get last 7 days as YYYY-MM-DD strings
 */
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Get metric value from daily stats
 */
function getMetricValue(stat: DailyStats, metric: string): number {
  switch (metric) {
    case 'practiceTime':
      return stat.practiceTime;
    case 'fluencyScore':
      return stat.averageFluencyScore;
    case 'messageCount':
      return stat.messageCount;
    default:
      return 0;
  }
}

/**
 * Get day label (Mon, Tue, etc.)
 */
function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Format value for display
 */
function formatValue(value: number, metric: string): string {
  switch (metric) {
    case 'practiceTime':
      return Math.round(value) + 'm';
    case 'fluencyScore':
      return Math.round(value).toString();
    case 'messageCount':
      return Math.round(value).toString();
    default:
      return value.toString();
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    width: '80%',
    height: 120,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default ProgressChart;
