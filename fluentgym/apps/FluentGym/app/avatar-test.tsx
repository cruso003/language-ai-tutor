/**
 * Avatar 3D Test Screen
 *
 * Dedicated screen for testing and validating the 3D avatar rendering system
 * Navigate to this screen to verify:
 * - 3D canvas initialization
 * - Lighting setup
 * - Camera positioning
 * - FPS performance on device
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar3DScene from '../src/components/Avatar3DScene';

export default function AvatarTestScreen() {
  const router = useRouter();

  const handleSceneReady = (scene: any, camera: any) => {
    console.log('✅ 3D Scene initialized successfully');
    console.log('Scene:', scene);
    console.log('Camera:', camera);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>3D Avatar Test</Text>
        <View style={styles.spacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#0284c7" />
        <Text style={styles.infoText}>
          Testing 3D rendering. You should see a rotating blue sphere.
        </Text>
      </View>

      {/* 3D Scene */}
      <Avatar3DScene
        style={styles.sceneContainer}
        onSceneReady={handleSceneReady}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, styles.statusActive]} />
          <Text style={styles.statusText}>3D Rendering Active</Text>
        </View>
        <Text style={styles.footerText}>
          Week 1 Test: Canvas + Lighting + Camera
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  spacer: {
    width: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
  },
  sceneContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
