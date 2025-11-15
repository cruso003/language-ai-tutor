/**
 * CorrectionCard Component
 *
 * Displays a single correction with original text, corrected version,
 * explanation, and examples in an educational, non-intrusive way
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Correction } from '../types/corrections';
import {
  getCorrectionColor,
  getCorrectionIcon,
  getCorrectionLabel,
} from '../types/corrections';

interface CorrectionCardProps {
  correction: Correction;
  onAcknowledge?: (correctionId: string) => void;
  onDismiss?: (correctionId: string) => void;
  isDark?: boolean;
  compact?: boolean;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({
  correction,
  onAcknowledge,
  onDismiss,
  isDark = false,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const errorBg = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
  const correctBg = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';

  const correctionColor = getCorrectionColor(correction.type);
  const correctionIcon = getCorrectionIcon(correction.type);
  const correctionLabel = getCorrectionLabel(correction.type);

  const handleAcknowledge = () => {
    onAcknowledge?.(correction.id);
  };

  const handleDismiss = () => {
    onDismiss?.(correction.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: correctionColor }]}>
            <Ionicons name={correctionIcon as any} size={16} color="#ffffff" />
          </View>
          <Text style={[styles.typeLabel, { color: correctionColor }]}>
            {correctionLabel}
          </Text>
          {correction.severity === 'error' && (
            <View style={[styles.severityBadge, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.severityText}>Error</Text>
            </View>
          )}
          {correction.severity === 'suggestion' && (
            <View style={[styles.severityBadge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.severityText}>Suggestion</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={textSecondary}
        />
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Original Text */}
          <View style={styles.textSection}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>You said:</Text>
            <View style={[styles.textBox, { backgroundColor: errorBg }]}>
              <Text style={[styles.textContent, { color: textColor }]}>
                {correction.original}
              </Text>
            </View>
          </View>

          {/* Corrected Text */}
          <View style={styles.textSection}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>Better way:</Text>
            <View style={[styles.textBox, { backgroundColor: correctBg }]}>
              <Text style={[styles.textContent, { color: textColor, fontWeight: '600' }]}>
                {correction.corrected}
              </Text>
            </View>
          </View>

          {/* Explanation */}
          <View style={styles.explanationSection}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb" size={16} color={correctionColor} />
              <Text style={[styles.explanationTitle, { color: textColor }]}>Why?</Text>
            </View>
            <Text style={[styles.explanationText, { color: textSecondary }]}>
              {correction.explanation}
            </Text>
          </View>

          {/* Rule (if applicable) */}
          {correction.rule && (
            <View style={[styles.ruleBox, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Text style={[styles.ruleText, { color: textSecondary }]}>
                📚 {correction.rule}
              </Text>
            </View>
          )}

          {/* Examples (if provided) */}
          {correction.examples && correction.examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={[styles.examplesTitle, { color: textSecondary }]}>
                More examples:
              </Text>
              {correction.examples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={[styles.exampleBullet, { color: correctionColor }]}>•</Text>
                  <Text style={[styles.exampleText, { color: textSecondary }]}>
                    {example}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleAcknowledge}
              style={[styles.actionButton, { backgroundColor: correctionColor }]}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Got it!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDismiss}
              style={[styles.actionButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonTextSecondary, { color: textSecondary }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
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
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  content: {
    padding: 12,
    paddingTop: 0,
    gap: 12,
  },
  textSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textBox: {
    padding: 12,
    borderRadius: 8,
  },
  textContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  explanationSection: {
    gap: 8,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ruleBox: {
    padding: 10,
    borderRadius: 6,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  examplesSection: {
    gap: 6,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  exampleItem: {
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 8,
  },
  exampleBullet: {
    fontSize: 14,
    fontWeight: '700',
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CorrectionCard;
