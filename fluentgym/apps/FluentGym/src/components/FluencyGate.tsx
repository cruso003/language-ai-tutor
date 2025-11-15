/**
 * Fluency Gate Component
 *
 * Enforces 3-second response time to build real fluency
 * Visual pressure through countdown timer and color changes
 * Tracks response latency for fluency scoring
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface FluencyGateProps {
  isActive: boolean;
  maxTime?: number; // seconds
  onTimeout: () => void;
  onTimeUpdate?: (timeRemaining: number) => void;
  onResponseStart?: (elapsedTime: number) => void;
  isDark?: boolean;
}

export const FluencyGate: React.FC<FluencyGateProps> = ({
  isActive,
  maxTime = 3,
  onTimeout,
  onTimeUpdate,
  onResponseStart,
  isDark = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [elapsedTime, setElapsedTime] = useState(0);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  // Dark mode colors
  const trackBg = isDark ? '#374151' : '#e5e7eb';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    if (isActive) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [isActive]);

  const startTimer = () => {
    setTimeRemaining(maxTime);
    setElapsedTime(0);
    startTimeRef.current = Date.now();

    // Reset animations
    progressAnim.setValue(1);

    // Start countdown
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current!) / 1000;
      const remaining = Math.max(0, maxTime - elapsed);

      setElapsedTime(elapsed);
      setTimeRemaining(remaining);

      // Update progress bar
      const progress = remaining / maxTime;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 50,
        useNativeDriver: false,
      }).start();

      // Trigger haptic feedback at 1 second mark
      if (remaining <= 1 && remaining > 0.95) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        startPulse();
      }

      // Callback for time updates
      if (onTimeUpdate) {
        onTimeUpdate(remaining);
      }

      // Timeout
      if (remaining <= 0) {
        stopTimer();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onTimeout();
      }
    }, 50);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Record response time if user responded
    if (onResponseStart && elapsedTime > 0 && elapsedTime < maxTime) {
      onResponseStart(elapsedTime);
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Determine color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining > 2) return '#10b981'; // Green - plenty of time
    if (timeRemaining > 1) return '#f59e0b'; // Yellow - warning
    return '#ef4444'; // Red - urgent
  };

  const getFluencyRating = (): string => {
    if (elapsedTime < 1) return 'Excellent';
    if (elapsedTime < 2) return 'Good';
    if (elapsedTime < 3) return 'Okay';
    return 'Too Slow';
  };

  if (!isActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: trackBg }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getTimerColor(),
            },
          ]}
        />
      </View>

      {/* Timer Display */}
      <Animated.View
        style={[
          styles.timerContainer,
          { transform: [{ scale: timeRemaining <= 1 ? pulseAnim : 1 }] },
        ]}
      >
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {timeRemaining.toFixed(1)}s
        </Text>
        <Text style={[styles.timerLabel, { color: textSecondary }]}>Time to respond</Text>
      </Animated.View>

      {/* Pressure Message */}
      {timeRemaining <= 1 && (
        <View style={[styles.urgentBanner, { backgroundColor: getTimerColor() }]}>
          <Text style={styles.urgentText}>⚡ Respond now!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  timerLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  urgentBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  urgentText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FluencyGate;
