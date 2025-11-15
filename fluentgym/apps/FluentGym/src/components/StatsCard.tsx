/**
 * StatsCard Component
 *
 * Displays a single metric stat card with icon, value, label, and optional trend
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  isDark?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  isDark = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    if (!trend) return textSecondary;
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return textSecondary;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: textColor }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Trend */}
      {trend && (
        <View style={styles.trend}>
          <Ionicons
            name={getTrendIcon() as any}
            size={16}
            color={getTrendColor()}
          />
          {trendValue && (
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StatsCard;
