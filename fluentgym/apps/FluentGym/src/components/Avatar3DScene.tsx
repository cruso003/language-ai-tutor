/**
 * Avatar3DScene Component
 *
 * A complete 3D scene with camera, lighting, and avatar rendering
 * This component manages the Three.js scene for avatar display
 */

import React, { useRef, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import * as THREE from 'three';
import Avatar3DCanvas from './Avatar3DCanvas';

interface Avatar3DSceneProps {
  style?: ViewStyle;
  avatarModel?: THREE.Object3D;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera) => void;
}

/**
 * Avatar3DScene - Complete scene setup for avatar rendering
 *
 * Features:
 * - Professional lighting setup (key, fill, rim lights)
 * - Camera positioned for portrait view
 * - Auto-rotation for demo purposes
 * - Performance optimized for mobile
 */
export const Avatar3DScene: React.FC<Avatar3DSceneProps> = ({
  style,
  avatarModel,
  onSceneReady
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const testMeshRef = useRef<THREE.Mesh | null>(null);
  const setupDone = useRef(false);

  const setupScene = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => {
    // Only setup once
    if (setupDone.current) return;
    setupDone.current = true;

    // Store scene reference
    sceneRef.current = scene;
    cameraRef.current = camera;

      // --- LIGHTING SETUP ---
      // Key light (main light, slightly above and to the side)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(5, 10, 7.5);
      scene.add(keyLight);

      // Fill light (softer light from the opposite side)
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-5, 0, -5);
      scene.add(fillLight);

      // Rim light (backlight for depth)
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
      rimLight.position.set(0, 5, -10);
      scene.add(rimLight);

      // Ambient light (soft overall illumination)
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);

      // --- CAMERA SETUP ---
      if (camera instanceof THREE.PerspectiveCamera) {
        // Position camera for portrait view (head and shoulders)
        camera.position.set(0, 1.5, 3);
        camera.lookAt(0, 1.5, 0);
      }

      // --- TEST GEOMETRY (will be replaced by avatar) ---
      // Create a sphere as placeholder for avatar head
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x4a90e2,
        metalness: 0.3,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 1.5, 0);
      scene.add(mesh);
      testMeshRef.current = mesh;

      // If avatar model is provided, add it to scene
      if (avatarModel) {
        scene.add(avatarModel);
        // Remove test mesh if avatar is loaded
        if (testMeshRef.current) {
          scene.remove(testMeshRef.current);
          testMeshRef.current = null;
        }
      }

    // Callback when scene is ready
    if (onSceneReady) {
      onSceneReady(scene, camera);
    }
  };

  const handleRender = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => {
    // Setup scene on first render
    setupScene(renderer, scene, camera);

    // Rotate test mesh for demo (will be removed when avatar is added)
    if (testMeshRef.current) {
      testMeshRef.current.rotation.y += 0.01;
    }

    // Update avatar animation here (future implementation)
    // updateAvatarAnimation(deltaTime);
  };

  useEffect(() => {
    // Add avatar model to scene if it changes
    if (avatarModel && sceneRef.current) {
      sceneRef.current.add(avatarModel);
      // Remove test mesh
      if (testMeshRef.current) {
        sceneRef.current.remove(testMeshRef.current);
        testMeshRef.current = null;
      }
    }
  }, [avatarModel]);

  return (
    <Avatar3DCanvas
      style={style}
      onRender={handleRender}
    />
  );
};

export default Avatar3DScene;
