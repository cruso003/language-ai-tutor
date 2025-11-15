/**
 * Avatar Loader Utility
 *
 * Handles loading 3D avatar models (GLB/GLTF) for React Native
 * Supports both bundled assets and remote URLs
 * Includes caching, error handling, and loading states
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Type definitions
export interface AvatarLoadOptions {
  enableCache?: boolean;
  onProgress?: (progress: number) => void;
  timeout?: number;
}

export interface LoadedAvatar {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
  morphTargets: MorphTargetInfo[];
}

export interface MorphTargetInfo {
  meshName: string;
  targetNames: string[];
  mesh: THREE.Mesh;
}

// Avatar cache directory
const AVATAR_CACHE_DIR = `${FileSystem.cacheDirectory}avatars/`;

/**
 * AvatarLoader class
 * Manages loading and caching of 3D avatar models
 */
export class AvatarLoader {
  private loader: GLTFLoader;
  private loadedAvatars: Map<string, LoadedAvatar>;

  constructor() {
    this.loader = new GLTFLoader();
    this.loadedAvatars = new Map();
    this.ensureCacheDirectory();
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(AVATAR_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AVATAR_CACHE_DIR, {
          intermediates: true,
        });
        console.log('✅ Avatar cache directory created');
      }
    } catch (error) {
      console.error('Failed to create avatar cache directory:', error);
    }
  }

  /**
   * Load avatar from bundled asset
   *
   * @param assetModule - Require'd asset module (e.g., require('./assets/avatars/sofia.glb'))
   * @param options - Loading options
   * @returns Loaded avatar object
   */
  async loadFromAsset(
    assetModule: number,
    options: AvatarLoadOptions = {}
  ): Promise<LoadedAvatar> {
    try {
      // Load the asset
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('Asset local URI not available');
      }

      console.log(`Loading avatar from asset: ${asset.localUri}`);

      // Load GLTF
      const gltf = await this.loadGLTF(asset.localUri, options);

      // Extract morph target information
      const morphTargets = this.extractMorphTargets(gltf.scene);

      const loadedAvatar: LoadedAvatar = {
        scene: gltf.scene,
        animations: gltf.animations || [],
        morphTargets,
      };

      console.log(`✅ Avatar loaded successfully`);
      console.log(`   - Animations: ${loadedAvatar.animations.length}`);
      console.log(`   - Morph targets: ${morphTargets.length} meshes`);

      return loadedAvatar;
    } catch (error) {
      console.error('Failed to load avatar from asset:', error);
      throw error;
    }
  }

  /**
   * Load avatar from URL
   *
   * @param url - Remote URL to GLB/GLTF file
   * @param options - Loading options
   * @returns Loaded avatar object
   */
  async loadFromURL(
    url: string,
    options: AvatarLoadOptions = {}
  ): Promise<LoadedAvatar> {
    const { enableCache = true } = options;

    try {
      // Generate cache key from URL
      const cacheKey = this.getCacheKey(url);
      const cachedPath = `${AVATAR_CACHE_DIR}${cacheKey}.glb`;

      // Check memory cache first
      if (this.loadedAvatars.has(url)) {
        console.log(`✅ Avatar loaded from memory cache: ${url}`);
        return this.loadedAvatars.get(url)!;
      }

      // Check file cache
      if (enableCache) {
        const cacheInfo = await FileSystem.getInfoAsync(cachedPath);
        if (cacheInfo.exists) {
          console.log(`Loading avatar from file cache: ${cachedPath}`);
          const gltf = await this.loadGLTF(cachedPath, options);
          const loadedAvatar = this.createLoadedAvatar(gltf);
          this.loadedAvatars.set(url, loadedAvatar);
          return loadedAvatar;
        }
      }

      // Download from URL
      console.log(`Downloading avatar from URL: ${url}`);
      const downloadResult = await FileSystem.downloadAsync(url, cachedPath);

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      console.log(`✅ Avatar downloaded to: ${downloadResult.uri}`);

      // Load the downloaded file
      const gltf = await this.loadGLTF(downloadResult.uri, options);
      const loadedAvatar = this.createLoadedAvatar(gltf);

      // Cache in memory
      this.loadedAvatars.set(url, loadedAvatar);

      return loadedAvatar;
    } catch (error) {
      console.error('Failed to load avatar from URL:', error);
      throw error;
    }
  }

  /**
   * Load GLTF file using Three.js GLTFLoader
   */
  private loadGLTF(
    uri: string,
    options: AvatarLoadOptions = {}
  ): Promise<any> {
    const { onProgress, timeout = 30000 } = options;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Avatar loading timeout'));
      }, timeout);

      this.loader.load(
        uri,
        (gltf) => {
          clearTimeout(timeoutId);
          resolve(gltf);
        },
        (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  /**
   * Extract morph target information from loaded scene
   */
  private extractMorphTargets(scene: THREE.Object3D): MorphTargetInfo[] {
    const morphTargets: MorphTargetInfo[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
        const targetNames = Object.keys(child.morphTargetDictionary);
        if (targetNames.length > 0) {
          morphTargets.push({
            meshName: child.name,
            targetNames,
            mesh: child,
          });

          console.log(`   - Mesh "${child.name}" has ${targetNames.length} morph targets`);
        }
      }
    });

    return morphTargets;
  }

  /**
   * Create LoadedAvatar object from GLTF
   */
  private createLoadedAvatar(gltf: any): LoadedAvatar {
    const morphTargets = this.extractMorphTargets(gltf.scene);

    return {
      scene: gltf.scene,
      animations: gltf.animations || [],
      morphTargets,
    };
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear avatar from memory cache
   */
  clearMemoryCache(url?: string): void {
    if (url) {
      this.loadedAvatars.delete(url);
      console.log(`Cleared memory cache for: ${url}`);
    } else {
      this.loadedAvatars.clear();
      console.log('Cleared all memory cache');
    }
  }

  /**
   * Clear file cache
   */
  async clearFileCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(AVATAR_CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(AVATAR_CACHE_DIR, { idempotent: true });
        await this.ensureCacheDirectory();
        console.log('✅ File cache cleared');
      }
    } catch (error) {
      console.error('Failed to clear file cache:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(AVATAR_CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(
          `${AVATAR_CACHE_DIR}${file}`
        );
        if (fileInfo.exists && !fileInfo.isDirectory) {
          totalSize += fileInfo.size || 0;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
}

// Singleton instance
let avatarLoaderInstance: AvatarLoader | null = null;

/**
 * Get singleton instance of AvatarLoader
 */
export const getAvatarLoader = (): AvatarLoader => {
  if (!avatarLoaderInstance) {
    avatarLoaderInstance = new AvatarLoader();
  }
  return avatarLoaderInstance;
};

/**
 * Convenience function to load avatar from asset
 */
export const loadAvatarFromAsset = (
  assetModule: number,
  options?: AvatarLoadOptions
): Promise<LoadedAvatar> => {
  return getAvatarLoader().loadFromAsset(assetModule, options);
};

/**
 * Convenience function to load avatar from URL
 */
export const loadAvatarFromURL = (
  url: string,
  options?: AvatarLoadOptions
): Promise<LoadedAvatar> => {
  return getAvatarLoader().loadFromURL(url, options);
};
