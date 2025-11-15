/**
 * AvatarDisplay Component
 *
 * High-level component for displaying 3D avatars with loading states
 * Integrates avatar loading utility with 3D scene rendering
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import * as THREE from 'three';
import Avatar3DScene from './Avatar3DScene';
import {
  loadAvatarFromAsset,
  loadAvatarFromURL,
  LoadedAvatar,
  AvatarLoadOptions,
} from '../utils/avatarLoader';

export interface AvatarDisplayProps {
  // Avatar source (either asset module or URL)
  source?: number | string;

  // Display options
  style?: ViewStyle;
  showLoadingIndicator?: boolean;
  loadingText?: string;

  // Loading options
  loadOptions?: AvatarLoadOptions;

  // Callbacks
  onLoad?: (avatar: LoadedAvatar) => void;
  onError?: (error: Error) => void;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera) => void;

  // Animation controls
  enableIdleAnimation?: boolean;
  idleAnimationName?: string;
}

/**
 * AvatarDisplay - Complete avatar rendering component
 *
 * Handles loading, error states, and rendering of 3D avatars
 */
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  source,
  style,
  showLoadingIndicator = true,
  loadingText = 'Loading avatar...',
  loadOptions,
  onLoad,
  onError,
  onSceneReady,
  enableIdleAnimation = false,
  idleAnimationName,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedAvatar, setLoadedAvatar] = useState<LoadedAvatar | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const avatarRef = useRef<THREE.Object3D | null>(null);
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Load avatar when source changes
  useEffect(() => {
    if (!source) {
      return;
    }

    loadAvatar();

    return () => {
      // Cleanup animation mixer
      if (animationMixerRef.current) {
        animationMixerRef.current.stopAllAction();
        animationMixerRef.current = null;
      }
    };
  }, [source]);

  /**
   * Load avatar from source
   */
  const loadAvatar = async () => {
    if (!source) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const options: AvatarLoadOptions = {
        ...loadOptions,
        onProgress: (prog) => {
          setProgress(prog);
          loadOptions?.onProgress?.(prog);
        },
      };

      let avatar: LoadedAvatar;

      // Load from asset (number) or URL (string)
      if (typeof source === 'number') {
        console.log('Loading avatar from bundled asset...');
        avatar = await loadAvatarFromAsset(source, options);
      } else {
        console.log(`Loading avatar from URL: ${source}`);
        avatar = await loadAvatarFromURL(source, options);
      }

      setLoadedAvatar(avatar);
      avatarRef.current = avatar.scene;

      // Setup animations if available
      if (enableIdleAnimation && avatar.animations.length > 0) {
        setupAnimations(avatar);
      }

      // Callback
      if (onLoad) {
        onLoad(avatar);
      }

      console.log('✅ Avatar display ready');
    } catch (err) {
      const error = err as Error;
      console.error('Failed to load avatar:', error);
      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Setup animation mixer and start idle animation
   */
  const setupAnimations = (avatar: LoadedAvatar) => {
    if (!avatar.scene || avatar.animations.length === 0) {
      return;
    }

    // Create animation mixer
    const mixer = new THREE.AnimationMixer(avatar.scene);
    animationMixerRef.current = mixer;

    // Find and play idle animation
    let animationToPlay = avatar.animations[0];

    if (idleAnimationName) {
      const namedAnimation = avatar.animations.find(
        (anim) => anim.name === idleAnimationName
      );
      if (namedAnimation) {
        animationToPlay = namedAnimation;
      }
    }

    const action = mixer.clipAction(animationToPlay);
    action.play();

    console.log(`Playing animation: ${animationToPlay.name}`);
  };

  /**
   * Update animation mixer (called on each frame)
   */
  const updateAnimations = (deltaTime: number) => {
    if (animationMixerRef.current) {
      animationMixerRef.current.update(deltaTime);
    }
  };

  /**
   * Get morph target influence by name
   */
  const getMorphTargetInfluence = (targetName: string): number => {
    if (!loadedAvatar) return 0;

    for (const morphInfo of loadedAvatar.morphTargets) {
      const index = morphInfo.targetNames.indexOf(targetName);
      if (index !== -1 && morphInfo.mesh.morphTargetInfluences) {
        return morphInfo.mesh.morphTargetInfluences[index];
      }
    }

    return 0;
  };

  /**
   * Set morph target influence by name
   */
  const setMorphTargetInfluence = (
    targetName: string,
    value: number
  ): boolean => {
    if (!loadedAvatar) return false;

    let found = false;

    for (const morphInfo of loadedAvatar.morphTargets) {
      const index = morphInfo.targetNames.indexOf(targetName);
      if (index !== -1 && morphInfo.mesh.morphTargetInfluences) {
        morphInfo.mesh.morphTargetInfluences[index] = Math.max(
          0,
          Math.min(1, value)
        );
        found = true;
      }
    }

    return found;
  };

  /**
   * Handle scene ready callback
   */
  const handleSceneReady = (scene: THREE.Scene, camera: THREE.Camera) => {
    if (onSceneReady) {
      onSceneReady(scene, camera);
    }
  };

  // Render loading state
  if (loading && showLoadingIndicator) {
    return (
      <View style={[styles.container, style, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>{loadingText}</Text>
        {progress > 0 && (
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        )}
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorTitle}>Failed to load avatar</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  // Render avatar scene
  return (
    <Avatar3DScene
      style={style}
      avatarModel={avatarRef.current || undefined}
      onSceneReady={handleSceneReady}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
  },
});

export default AvatarDisplay;

/**
 * Example Usage:
 *
 * // From bundled asset
 * <AvatarDisplay
 *   source={require('../../assets/avatars/sofia.glb')}
 *   onLoad={(avatar) => console.log('Avatar loaded:', avatar)}
 *   enableIdleAnimation={true}
 * />
 *
 * // From URL
 * <AvatarDisplay
 *   source="https://cdn.example.com/avatars/sofia.glb"
 *   loadOptions={{ enableCache: true }}
 *   onError={(error) => console.error(error)}
 * />
 */
