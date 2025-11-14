/**
 * Avatar3DCanvas Component
 *
 * A React Native-compatible 3D canvas wrapper for rendering avatars
 * Uses expo-gl and Three.js for 3D rendering on mobile devices
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

interface Avatar3DCanvasProps {
  style?: ViewStyle;
  onContextCreate?: (gl: WebGLRenderingContext) => void;
  onRender?: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
  children?: React.ReactNode;
}

/**
 * Avatar3DCanvas - Wrapper component for 3D avatar rendering
 *
 * This component creates a WebGL context using expo-gl and sets up
 * the Three.js renderer for mobile devices.
 */
export const Avatar3DCanvas: React.FC<Avatar3DCanvasProps> = ({
  style,
  onContextCreate,
  onRender,
  children
}) => {
  const frameId = useRef<number>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const handleContextCreate = async (gl: WebGLRenderingContext) => {
    // Set up renderer with expo-three
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;

    // Set up scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75, // FOV
      gl.drawingBufferWidth / gl.drawingBufferHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Call optional context creation callback
    if (onContextCreate) {
      onContextCreate(gl);
    }

    // Start render loop
    const render = () => {
      frameId.current = requestAnimationFrame(render);

      if (onRender && rendererRef.current && sceneRef.current && cameraRef.current) {
        onRender(rendererRef.current, sceneRef.current, cameraRef.current);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // End the frame and update the screen
      gl.endFrameEXP();
    };

    render();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView
        style={styles.glView}
        onContextCreate={handleContextCreate}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});

export default Avatar3DCanvas;
