/**
 * TutorSelector Component
 *
 * Allows users to choose their preferred tutor
 * Simple grid layout with colored avatars and descriptions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TutorAvatar } from './TutorAvatar';
import { TUTOR_LIST, type Tutor } from '../config/tutors';

interface TutorSelectorProps {
  selectedTutorId?: string;
  onSelectTutor: (tutor: Tutor) => void;
  isDark?: boolean;
}

export const TutorSelector: React.FC<TutorSelectorProps> = ({
  selectedTutorId,
  onSelectTutor,
  isDark = false,
}) => {
  const cardColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TUTOR_LIST.map((tutor) => {
        const isSelected = selectedTutorId === tutor.id;

        return (
          <TouchableOpacity
            key={tutor.id}
            onPress={() => onSelectTutor(tutor)}
            style={[
              styles.tutorCard,
              {
                backgroundColor: cardColor,
                borderColor: isSelected ? tutor.color : borderColor,
                borderWidth: isSelected ? 3 : 1,
              },
            ]}
            activeOpacity={0.7}
          >
            <TutorAvatar tutor={tutor} size="large" />

            <Text style={[styles.tutorName, { color: textColor }]}>
              {tutor.name}
            </Text>

            <Text style={[styles.tutorRole, { color: tutor.color }]}>
              {tutor.role}
            </Text>

            <Text
              style={[styles.tutorDescription, { color: textSecondary }]}
              numberOfLines={3}
            >
              {tutor.description}
            </Text>

            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: tutor.color }]}>
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tutorCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tutorName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  tutorRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tutorDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  selectedBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default TutorSelector;
