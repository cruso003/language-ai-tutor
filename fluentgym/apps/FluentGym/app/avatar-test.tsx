/**
 * Avatar 3D Test Screen
 *
 * Week 2 Test: Loading and rendering actual 3D avatar
 * Tests:
 * - Avatar loading from Ready Player Me URL
 * - Morph target extraction
 * - 3D rendering with avatar model
 * - FPS performance with real avatar
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarDisplay } from '../src/components';
import type { LoadedAvatar } from '../src/utils/avatarLoader';

export default function AvatarTestScreen() {
  const router = useRouter();
  const [avatarInfo, setAvatarInfo] = useState<LoadedAvatar | null>(null);
  const [loadTime, setLoadTime] = useState<number>(0);

  const handleAvatarLoad = (avatar: LoadedAvatar) => {
    setAvatarInfo(avatar);
    console.log('✅ Avatar loaded successfully!');
    console.log('📊 Avatar Statistics:');
    console.log('  - Animations:', avatar.animations.length);
    console.log('  - Meshes with morph targets:', avatar.morphTargets.length);

    // Log all morph targets
    avatar.morphTargets.forEach((morphInfo, index) => {
      console.log(`\n  Mesh ${index + 1}: "${morphInfo.meshName}"`);
      console.log(`    - Morph targets (${morphInfo.targetNames.length}):`,
        morphInfo.targetNames.slice(0, 10).join(', ') +
        (morphInfo.targetNames.length > 10 ? '...' : '')
      );
    });
  };

  const handleAvatarError = (error: Error) => {
    console.error('❌ Avatar load failed:', error);
  };

  const handleSceneReady = (scene: any, camera: any) => {
    console.log('✅ 3D Scene ready');
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
        <Text style={styles.title}>Avatar Test (Week 2)</Text>
        <View style={styles.spacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="person" size={20} color="#0284c7" />
        <Text style={styles.infoText}>
          Loading Ready Player Me avatar with morph targets for lip-sync
        </Text>
      </View>

      {/* 3D Avatar Display */}
      <AvatarDisplay
        source="https://models.readyplayer.me/691860c91aa3af821aaa52e7.glb"
        style={styles.sceneContainer}
        onLoad={handleAvatarLoad}
        onError={handleAvatarError}
        onSceneReady={handleSceneReady}
        loadingText="Loading Sofia avatar..."
      />

      {/* Footer with Avatar Info */}
      <View style={styles.footer}>
        <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
          {avatarInfo ? (
            <>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.statusSuccess]} />
                <Text style={styles.statusText}>Avatar Loaded</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Animations:</Text>
                <Text style={styles.statValue}>{avatarInfo.animations.length}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Morph Target Meshes:</Text>
                <Text style={styles.statValue}>{avatarInfo.morphTargets.length}</Text>
              </View>

              {avatarInfo.morphTargets.map((morphInfo, index) => (
                <View key={index} style={styles.morphInfo}>
                  <Text style={styles.morphMesh}>{morphInfo.meshName}</Text>
                  <Text style={styles.morphCount}>
                    {morphInfo.targetNames.length} blend shapes
                  </Text>
                  <Text style={styles.morphPreview} numberOfLines={2}>
                    {morphInfo.targetNames.slice(0, 5).join(', ')}
                    {morphInfo.targetNames.length > 5 ? '...' : ''}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusLoading]} />
              <Text style={styles.statusText}>Loading avatar...</Text>
            </View>
          )}
        </ScrollView>

        <Text style={styles.footerText}>
          Week 2 Test: Avatar Loading + Morph Targets
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
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
  },
  infoScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#10b981',
  },
  statusLoading: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  morphInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
  },
  morphMesh: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  morphCount: {
    fontSize: 11,
    color: '#0284c7',
    marginBottom: 4,
  },
  morphPreview: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 14,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
