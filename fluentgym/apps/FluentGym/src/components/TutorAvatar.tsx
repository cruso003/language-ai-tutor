/**
 * TutorAvatar Component
 *
 * Simple 2D representation of tutor using colored circle with initial
 * Zero dependencies, clean design, personality through color
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { Tutor } from '../config/tutors';

interface TutorAvatarProps {
  tutor: Tutor;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const SIZE_MAP = {
  small: 32,
  medium: 48,
  large: 80,
};

const FONT_SIZE_MAP = {
  small: 14,
  medium: 20,
  large: 32,
};

export const TutorAvatar: React.FC<TutorAvatarProps> = ({
  tutor,
  size = 'medium',
  style,
}) => {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: tutor.color,
        },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>
        {tutor.initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initial: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default TutorAvatar;
