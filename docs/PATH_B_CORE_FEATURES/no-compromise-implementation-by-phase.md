# No-Compromise Implementation Guide
## Detailed Technical Specifications by Phase

> **For Engineers**: This document contains the actual implementation details, code patterns, and technical decisions for each phase.

---

## Phase 1: 3D Avatars + Lip-Sync (8 weeks)

### Architecture Decision: React Three Fiber vs. Native GL

**Chosen Approach**: React Three Fiber (R3F) with Expo GL

**Rationale**:
- ✅ React-like declarative API (easier to maintain)
- ✅ Three.js ecosystem (mature, well-documented)
- ✅ Performance optimizations built-in
- ✅ Supports GLB/GLTF models natively
- ❌ Slightly larger bundle size (acceptable trade-off)

**Alternative Considered**: Unity WebGL
- ❌ Too heavy (20MB+ bundle size)
- ❌ Overkill for this use case
- ❌ Poor integration with React Native

---

### Week 1-2: Research & Setup

#### Dependencies to Install

```bash
# Mobile app (apps/FluentGym)
npx expo install expo-gl
npm install @react-three/fiber @react-three/drei
npm install three @types/three
npm install @react-three/cannon  # Physics (optional, for animations)
npm install three-stdlib  # Utilities
```

#### Avatar Source Decision

**Chosen**: Ready Player Me + Custom Fallbacks

**Why Ready Player Me**:
- ✅ Free tier available
- ✅ Customizable avatars (user can create their own later)
- ✅ GLB export with blend shapes
- ✅ Pre-rigged for facial animation
- ✅ API for programmatic generation

**Fallback Plan**: If RPM doesn't work, commission 5 custom avatars from Fiverr ($500-800 each)

#### Avatar Requirements Specification

```typescript
// types/avatar.ts
export interface AvatarModel {
  id: string;
  name: string; // "Sofia Martinez"
  personality: PersonalityType;
  modelUrl: string; // CDN URL to GLB file
  thumbnailUrl: string;
  culturalBackground: string; // "Latina"
  gender: "male" | "female" | "non-binary";
  blendShapes: BlendShape[];
  defaultEmotion: EmotionType;
}

export interface BlendShape {
  name: string; // "mouthSmile", "eyesClosed", "jawOpen"
  target: string; // Mesh name in GLB
  range: [number, number]; // [0, 1] typically
}

export type EmotionType = "neutral" | "happy" | "encouraging" | "thinking" | "disappointed";

export interface Viseme {
  phoneme: string; // "A", "E", "I", "O", "U", "M", "F", "V", "TH", "L"
  blendShapeWeights: Record<string, number>; // { "jawOpen": 0.8, "mouthSmile": 0.2 }
  duration: number; // milliseconds
}
```

#### Performance Benchmarking Setup

```typescript
// utils/performance-monitor.ts
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= 1000) {
      this.fps = (this.frameCount / delta) * 1000;
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.fps < 50) {
        console.warn(`Low FPS detected: ${this.fps.toFixed(1)} FPS`);
      }
    }

    return this.fps;
  }

  getFPS() {
    return this.fps;
  }
}
```

**Target Devices**:
- iPhone 12 (A14 Bionic) - Primary target
- Samsung Galaxy S21 (Snapdragon 888) - Primary target
- iPhone 11 (A13 Bionic) - Minimum viable device
- Samsung Galaxy S20 (Snapdragon 865) - Minimum viable device

**Exit Criteria for Week 1-2**:
- [ ] R3F renders a spinning cube at 60 FPS on all target devices
- [ ] GLB model loads successfully
- [ ] Memory usage < 100MB for test scene

---

### Week 3-4: Basic Avatar Rendering

#### File Structure

```
apps/FluentGym/src/
├── components/
│   ├── Avatar/
│   │   ├── Avatar3D.tsx          # Main avatar component
│   │   ├── AvatarScene.tsx       # Three.js scene wrapper
│   │   ├── AvatarLoader.tsx      # GLB model loader
│   │   ├── AvatarLOD.tsx         # Level of Detail system
│   │   └── types.ts
│   └── ...
├── hooks/
│   ├── useAvatarAnimation.ts
│   ├── useGLBLoader.ts
│   └── usePerformanceMonitor.ts
├── services/
│   └── avatar-service.ts          # Avatar state management
└── ...
```

#### Core Implementation: Avatar3D Component

```typescript
// components/Avatar/Avatar3D.tsx
import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { AvatarModel, EmotionType } from './types';
import * as THREE from 'three';

interface Avatar3DProps {
  avatarModel: AvatarModel;
  emotion?: EmotionType;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  avatarModel,
  emotion = 'neutral',
  isListening = false,
  isSpeaking = false,
}) => {
  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: false }} // Performance optimization
      style={{ flex: 1 }}
    >
      <Suspense fallback={null}>
        <AvatarMesh
          modelUrl={avatarModel.modelUrl}
          emotion={emotion}
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </Suspense>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.5} />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 1.5, 2.5]} fov={50} />

      {/* Controls (optional, for testing) */}
      {__DEV__ && <OrbitControls />}
    </Canvas>
  );
};

// Internal mesh component
const AvatarMesh: React.FC<{
  modelUrl: string;
  emotion: EmotionType;
  isListening: boolean;
  isSpeaking: boolean;
}> = ({ modelUrl, emotion, isListening, isSpeaking }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene, nodes, materials } = useGLTF(modelUrl);

  // Emotion mapping
  useEffect(() => {
    if (!meshRef.current) return;

    const head = meshRef.current.getObjectByName('Head') as THREE.SkinnedMesh;
    if (!head || !head.morphTargetInfluences) return;

    // Reset all blend shapes
    head.morphTargetInfluences.fill(0);

    // Apply emotion blend shapes
    const emotionWeights = getEmotionBlendShapes(emotion);
    Object.entries(emotionWeights).forEach(([shapeName, weight]) => {
      const index = head.morphTargetDictionary?.[shapeName];
      if (index !== undefined) {
        head.morphTargetInfluences[index] = weight;
      }
    });
  }, [emotion]);

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
};

// Emotion to blend shape mapping
function getEmotionBlendShapes(emotion: EmotionType): Record<string, number> {
  switch (emotion) {
    case 'happy':
      return { mouthSmile: 0.8, eyesClosed: 0.1 };
    case 'encouraging':
      return { mouthSmile: 0.5, browUp: 0.3 };
    case 'thinking':
      return { browDown: 0.4, eyesClosed: 0.2 };
    case 'disappointed':
      return { mouthFrown: 0.6, browDown: 0.5 };
    case 'neutral':
    default:
      return { mouthSmile: 0.0 };
  }
}
```

#### LOD (Level of Detail) System

```typescript
// components/Avatar/AvatarLOD.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export const useAvatarLOD = (scene: THREE.Group) => {
  const { fps } = usePerformanceMonitor();

  const lodLevel = useMemo(() => {
    if (fps >= 55) return 'high'; // Full quality
    if (fps >= 40) return 'medium'; // Reduced polygons
    return 'low'; // Minimum quality
  }, [fps]);

  useMemo(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        switch (lodLevel) {
          case 'high':
            child.material.wireframe = false;
            child.castShadow = true;
            break;
          case 'medium':
            child.castShadow = false; // Disable shadows for performance
            break;
          case 'low':
            child.castShadow = false;
            // Could reduce texture resolution here
            break;
        }
      }
    });
  }, [scene, lodLevel]);

  return lodLevel;
};
```

#### Memory Optimization

```typescript
// utils/avatar-memory-optimizer.ts
import * as THREE from 'three';

export const optimizeAvatarMemory = (scene: THREE.Group) => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose of unused materials
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose());
      } else {
        child.material.dispose();
      }

      // Dispose of geometry
      child.geometry.dispose();
    }
  });

  // Compress textures
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (material.map) {
        material.map.minFilter = THREE.LinearFilter; // Reduce quality
        material.map.generateMipmaps = false; // Save memory
      }
    }
  });
};
```

**Exit Criteria for Week 3-4**:
- [ ] Sofia Martinez avatar renders at 60 FPS on iPhone 12
- [ ] Avatar is centered and properly lit
- [ ] Memory usage < 150MB
- [ ] LOD system reduces quality when FPS drops below 50

---

### Week 5-6: Facial Animation System

#### Blend Shape Implementation

```typescript
// hooks/useAvatarAnimation.ts
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EmotionType } from '@/components/Avatar/types';

export const useAvatarAnimation = (
  meshRef: React.RefObject<THREE.Group>,
  emotion: EmotionType,
  isSpeaking: boolean
) => {
  const animationFrameRef = useRef<number>();
  const blinkTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!meshRef.current) return;

    const head = meshRef.current.getObjectByName('Head') as THREE.SkinnedMesh;
    if (!head || !head.morphTargetInfluences) return;

    let lastTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000; // seconds
      lastTime = currentTime;

      // Blinking animation
      blinkTimerRef.current += delta;
      if (blinkTimerRef.current > 3) {
        // Blink every 3 seconds
        const blinkIndex = head.morphTargetDictionary?.['eyesClosed'];
        if (blinkIndex !== undefined) {
          // Quick blink animation (0.2 seconds)
          const blinkProgress = (blinkTimerRef.current - 3) / 0.2;
          if (blinkProgress < 1) {
            head.morphTargetInfluences[blinkIndex] = Math.sin(blinkProgress * Math.PI);
          } else {
            head.morphTargetInfluences[blinkIndex] = 0;
            blinkTimerRef.current = 0;
          }
        }
      }

      // Head movement (subtle idle animation)
      if (!isSpeaking) {
        const headBone = meshRef.current.getObjectByName('Head_Bone') as THREE.Bone;
        if (headBone) {
          headBone.rotation.y = Math.sin(currentTime / 2000) * 0.05; // Slight rotation
          headBone.rotation.x = Math.sin(currentTime / 3000) * 0.03; // Subtle nod
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [meshRef, emotion, isSpeaking]);
};
```

#### Eye Contact System

```typescript
// components/Avatar/EyeContact.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const useEyeContact = (
  meshRef: React.RefObject<THREE.Group>,
  isListening: boolean
) => {
  useEffect(() => {
    if (!meshRef.current) return;

    const leftEye = meshRef.current.getObjectByName('LeftEye') as THREE.Bone;
    const rightEye = meshRef.current.getObjectByName('RightEye') as THREE.Bone;

    if (!leftEye || !rightEye) return;

    // Look at camera (user)
    const cameraPosition = new THREE.Vector3(0, 1.5, 2.5);

    if (isListening) {
      // Direct eye contact when listening
      leftEye.lookAt(cameraPosition);
      rightEye.lookAt(cameraPosition);
    } else {
      // Slight gaze avoidance when speaking (natural behavior)
      const offset = new THREE.Vector3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        0
      );
      leftEye.lookAt(cameraPosition.clone().add(offset));
      rightEye.lookAt(cameraPosition.clone().add(offset));
    }
  }, [meshRef, isListening]);
};
```

**Exit Criteria for Week 5-6**:
- [ ] Avatar blinks naturally every 3-4 seconds
- [ ] Eyes look directly at camera when listening
- [ ] Head has subtle idle movement (nods, slight rotation)
- [ ] Emotion transitions are smooth (no jarring changes)

---

### Week 7-8: Lip-Sync Implementation

#### Phoneme-to-Viseme Mapping

```typescript
// services/lip-sync-service.ts
import { Viseme } from '@/components/Avatar/types';

// Phoneme to viseme mapping (based on IPA)
const PHONEME_TO_VISEME: Record<string, Partial<Record<string, number>>> = {
  // Vowels
  'AA': { jawOpen: 0.8, mouthOpen: 0.7 }, // "father"
  'AE': { jawOpen: 0.6, mouthOpen: 0.6, mouthSmile: 0.2 }, // "cat"
  'AH': { jawOpen: 0.5, mouthOpen: 0.4 }, // "cup"
  'AO': { jawOpen: 0.6, mouthOpen: 0.5, mouthRound: 0.6 }, // "caught"
  'EH': { jawOpen: 0.4, mouthOpen: 0.3, mouthSmile: 0.3 }, // "bed"
  'ER': { jawOpen: 0.3, mouthOpen: 0.2 }, // "bird"
  'IH': { jawOpen: 0.2, mouthSmile: 0.5 }, // "bit"
  'IY': { jawOpen: 0.2, mouthSmile: 0.7 }, // "beat"
  'UH': { jawOpen: 0.3, mouthRound: 0.4 }, // "book"
  'UW': { jawOpen: 0.3, mouthRound: 0.8 }, // "boot"

  // Consonants
  'M': { jawOpen: 0.0, mouthClosed: 1.0 }, // "moon"
  'B': { jawOpen: 0.0, mouthClosed: 1.0 }, // "bat"
  'P': { jawOpen: 0.0, mouthClosed: 1.0 }, // "pat"
  'F': { jawOpen: 0.2, lowerLipUp: 0.8 }, // "fat"
  'V': { jawOpen: 0.2, lowerLipUp: 0.8 }, // "vat"
  'TH': { jawOpen: 0.3, tongueOut: 0.6 }, // "think"
  'DH': { jawOpen: 0.3, tongueOut: 0.6 }, // "this"
  'L': { jawOpen: 0.4, tongueUp: 0.7 }, // "lot"
  'R': { jawOpen: 0.4, mouthRound: 0.4 }, // "rat"
  'W': { jawOpen: 0.3, mouthRound: 0.7 }, // "wet"

  // Silence
  'SIL': { jawOpen: 0.0, mouthClosed: 0.5 },
};

export class LipSyncService {
  /**
   * Convert phoneme sequence to viseme blend shapes
   */
  public phonemesToVisemes(phonemes: PhonemeData[]): Viseme[] {
    return phonemes.map((phoneme) => ({
      phoneme: phoneme.phoneme,
      blendShapeWeights: PHONEME_TO_VISEME[phoneme.phoneme] || {},
      duration: phoneme.duration,
    }));
  }

  /**
   * Apply visemes to avatar mesh over time
   */
  public async playVisemes(
    mesh: THREE.SkinnedMesh,
    visemes: Viseme[],
    audioElement: HTMLAudioElement
  ) {
    let currentVisemeIndex = 0;
    let elapsedTime = 0;

    const startTime = performance.now();

    const animate = () => {
      if (!audioElement.paused) {
        elapsedTime = performance.now() - startTime;

        // Find current viseme
        let cumulativeTime = 0;
        for (let i = 0; i < visemes.length; i++) {
          cumulativeTime += visemes[i].duration;
          if (elapsedTime < cumulativeTime) {
            currentVisemeIndex = i;
            break;
          }
        }

        const currentViseme = visemes[currentVisemeIndex];
        if (currentViseme) {
          this.applyViseme(mesh, currentViseme);
        }

        requestAnimationFrame(animate);
      } else {
        // Reset to neutral
        this.resetMouth(mesh);
      }
    };

    animate();
  }

  private applyViseme(mesh: THREE.SkinnedMesh, viseme: Viseme) {
    if (!mesh.morphTargetInfluences) return;

    Object.entries(viseme.blendShapeWeights).forEach(([shapeName, weight]) => {
      const index = mesh.morphTargetDictionary?.[shapeName];
      if (index !== undefined) {
        // Smooth interpolation
        const current = mesh.morphTargetInfluences[index];
        mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(current, weight, 0.3);
      }
    });
  }

  private resetMouth(mesh: THREE.SkinnedMesh) {
    if (!mesh.morphTargetInfluences) return;

    const mouthShapes = ['jawOpen', 'mouthOpen', 'mouthSmile', 'mouthRound', 'mouthClosed'];
    mouthShapes.forEach((shapeName) => {
      const index = mesh.morphTargetDictionary?.[shapeName];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[index],
          0,
          0.2
        );
      }
    });
  }
}

interface PhonemeData {
  phoneme: string;
  duration: number; // milliseconds
  start: number; // milliseconds from audio start
}
```

#### Backend: Phoneme Extraction from Whisper

```typescript
// apps/backend-api/src/services/speech/phoneme-extractor.ts
import Anthropic from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

export class PhonemeExtractor {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Extract phonemes from audio using Whisper + GPT-4o for alignment
   */
  public async extractPhonemes(audioBuffer: Buffer): Promise<PhonemeData[]> {
    // Step 1: Transcribe audio with Whisper
    const transcription = await this.openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      response_format: 'verbose_json', // Get word timestamps
      timestamp_granularities: ['word'],
    });

    // Step 2: Convert words to phonemes (using GPT-4o or external library)
    const phonemes: PhonemeData[] = [];

    for (const word of transcription.words || []) {
      const wordPhonemes = await this.wordToPhonemes(word.word);

      // Distribute duration evenly across phonemes
      const phonemeDuration = (word.end - word.start) / wordPhonemes.length;

      wordPhonemes.forEach((phoneme, index) => {
        phonemes.push({
          phoneme,
          duration: phonemeDuration * 1000, // convert to ms
          start: (word.start + index * phonemeDuration) * 1000,
        });
      });
    }

    return phonemes;
  }

  /**
   * Convert word to phonemes (simplified - use a proper phonetic dictionary in production)
   */
  private async wordToPhonemes(word: string): Promise<string[]> {
    // Option 1: Use CMU Pronouncing Dictionary
    // Option 2: Use GPT-4o to convert (expensive but flexible)
    // Option 3: Use a phonetic library (compromise)

    // Simplified example (replace with real implementation)
    const phonemeDict: Record<string, string[]> = {
      hello: ['HH', 'EH', 'L', 'OW'],
      world: ['W', 'ER', 'L', 'D'],
      thank: ['TH', 'AE', 'NG', 'K'],
      you: ['Y', 'UW'],
    };

    return phonemeDict[word.toLowerCase()] || word.split('').map((c) => c.toUpperCase());
  }
}

interface PhonemeData {
  phoneme: string;
  duration: number;
  start: number;
}
```

#### Integration: Playing AI Response with Lip-Sync

```typescript
// components/Avatar/AvatarWithLipSync.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { Avatar3D } from './Avatar3D';
import { LipSyncService } from '@/services/lip-sync-service';
import { Viseme } from './types';

interface AvatarWithLipSyncProps {
  avatarModel: AvatarModel;
  audioUrl: string; // AI response audio
  phonemes: PhonemeData[]; // From backend
  onFinish: () => void;
}

export const AvatarWithLipSync: React.FC<AvatarWithLipSyncProps> = ({
  avatarModel,
  audioUrl,
  phonemes,
  onFinish,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lipSyncService = useRef(new LipSyncService());

  useEffect(() => {
    const loadAndPlayAudio = async () => {
      const { sound: audioSound } = await Audio.Sound.createAsync({ uri: audioUrl });

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsSpeaking(status.isPlaying);
          if (status.didJustFinish) {
            onFinish();
          }
        }
      });

      setSound(audioSound);
      await audioSound.playAsync();

      // Start lip-sync animation
      const visemes = lipSyncService.current.phonemesToVisemes(phonemes);
      // Apply visemes to avatar (via ref to mesh)
    };

    loadAndPlayAudio();

    return () => {
      sound?.unloadAsync();
    };
  }, [audioUrl, phonemes]);

  return <Avatar3D avatarModel={avatarModel} isSpeaking={isSpeaking} />;
};
```

**Exit Criteria for Week 7-8**:
- [ ] Avatar's lips move in sync with AI audio
- [ ] Phoneme-to-viseme mapping is accurate (no lag)
- [ ] Mouth shapes match vowels (A/E/I/O/U) correctly
- [ ] Lip-sync works for English, Spanish, French

---

## Phase 2: Scenario System + Fluency Gate (6 weeks)

### Data Model: Scenario Schema

```typescript
// types/scenario.ts
export interface Scenario {
  id: string;
  skillPackId: string;
  title: string; // "Café Order"
  description: string; // "Order a cappuccino and croissant in a Parisian café"
  difficulty: 1 | 2 | 3 | 4 | 5; // Stars
  estimatedDuration: number; // minutes
  objectives: ScenarioObjective[];
  requiredVocabulary: VocabularyItem[];
  culturalNotes: string[];
  aiTutorScript: AIScriptNode[];
  successCriteria: SuccessCriteria;
  failureConditions: FailureCondition[];
  xpReward: number;
  unlockRequirements?: string[]; // Other scenario IDs
}

export interface ScenarioObjective {
  id: string;
  description: string; // "Order a cappuccino"
  mustSayPhrases: string[]; // ["un cappuccino", "s'il vous plaît"]
  completed: boolean;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string; // IPA or simplified
  audioUrl?: string; // Native speaker example
}

export interface AIScriptNode {
  id: string;
  condition?: string; // "if user ordered coffee"
  aiMessage: string;
  expectedUserResponses: string[]; // For branching logic
  hints?: string[]; // If user struggles
}

export interface SuccessCriteria {
  minObjectivesCompleted: number; // e.g., 3 out of 4
  maxTimeSeconds?: number; // Time limit
  minFluencyScore?: number; // e.g., 70%
}

export interface FailureCondition {
  type: 'timeout' | 'too-many-errors' | 'fluency-too-low';
  threshold: number;
}
```

### Backend: Scenario Endpoints

```typescript
// apps/backend-api/src/routes/scenarios.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function scenarioRoutes(fastify: FastifyInstance) {
  // Get scenarios by language
  fastify.get<{ Params: { language: string } }>(
    '/scenarios/by-language/:language',
    async (request, reply) => {
      const { language } = request.params;

      const scenarios = await fastify.db
        .select()
        .from('scenarios')
        .where('language', language)
        .orderBy('difficulty', 'asc');

      return scenarios;
    }
  );

  // Start scenario session
  fastify.post<{ Body: { scenarioId: string; userId: string } }>(
    '/scenarios/start-session',
    async (request, reply) => {
      const { scenarioId, userId } = request.body;

      const session = await fastify.db.insert('sessions').values({
        userId,
        scenarioId,
        startedAt: new Date(),
        status: 'in_progress',
        objectives: [], // Will be populated
      });

      return session;
    }
  );

  // Update scenario progress
  fastify.put<{ Params: { sessionId: string }; Body: { objectiveId: string } }>(
    '/scenarios/update-progress/:sessionId',
    async (request, reply) => {
      const { sessionId } = request.params;
      const { objectiveId } = request.body;

      // Mark objective as completed
      await fastify.db
        .update('session_objectives')
        .set({ completed: true, completedAt: new Date() })
        .where({ sessionId, objectiveId });

      return { success: true };
    }
  );

  // Complete scenario
  fastify.post<{ Params: { sessionId: string }; Body: { fluencyScore: number } }>(
    '/scenarios/complete/:sessionId',
    async (request, reply) => {
      const { sessionId } = request.params;
      const { fluencyScore } = request.body;

      const session = await fastify.db
        .select()
        .from('sessions')
        .where({ id: sessionId })
        .first();

      if (!session) {
        return reply.status(404).send({ error: 'Session not found' });
      }

      // Check success criteria
      const scenario = await fastify.db
        .select()
        .from('scenarios')
        .where({ id: session.scenarioId })
        .first();

      const objectivesCompleted = await fastify.db
        .select()
        .from('session_objectives')
        .where({ sessionId, completed: true })
        .count();

      const success =
        objectivesCompleted >= scenario.successCriteria.minObjectivesCompleted &&
        fluencyScore >= (scenario.successCriteria.minFluencyScore || 0);

      // Update session
      await fastify.db.update('sessions').set({
        status: success ? 'completed' : 'failed',
        completedAt: new Date(),
        fluencyScore,
      }).where({ id: sessionId });

      // Award XP if successful
      if (success) {
        await fastify.db.update('users').increment({ xp: scenario.xpReward }).where({ id: session.userId });
      }

      return { success, fluencyScore, xpEarned: success ? scenario.xpReward : 0 };
    }
  );
}
```

### Mobile: Scenario State Management

```typescript
// stores/scenario-store.ts
import { create } from 'zustand';
import { Scenario, ScenarioObjective } from '@/types/scenario';
import { apiClient } from '@/api/client';

interface ScenarioState {
  currentScenario: Scenario | null;
  sessionId: string | null;
  objectives: ScenarioObjective[];
  startTime: number;
  fluencyGateActive: boolean;
  responseTimeoutSeconds: number;

  // Actions
  startScenario: (scenarioId: string) => Promise<void>;
  completeObjective: (objectiveId: string) => Promise<void>;
  completeScenario: (fluencyScore: number) => Promise<void>;
  resetScenario: () => void;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  currentScenario: null,
  sessionId: null,
  objectives: [],
  startTime: 0,
  fluencyGateActive: true,
  responseTimeoutSeconds: 3,

  startScenario: async (scenarioId: string) => {
    const scenario = await apiClient.get<Scenario>(`/scenarios/${scenarioId}`);
    const session = await apiClient.post('/scenarios/start-session', {
      scenarioId,
      userId: 'current-user-id', // Get from auth
    });

    set({
      currentScenario: scenario.data,
      sessionId: session.data.id,
      objectives: scenario.data.objectives,
      startTime: Date.now(),
    });
  },

  completeObjective: async (objectiveId: string) => {
    const { sessionId, objectives } = get();
    if (!sessionId) return;

    await apiClient.put(`/scenarios/update-progress/${sessionId}`, { objectiveId });

    set({
      objectives: objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, completed: true } : obj
      ),
    });
  },

  completeScenario: async (fluencyScore: number) => {
    const { sessionId } = get();
    if (!sessionId) return;

    await apiClient.post(`/scenarios/complete/${sessionId}`, { fluencyScore });

    set({ currentScenario: null, sessionId: null, objectives: [] });
  },

  resetScenario: () => {
    set({ currentScenario: null, sessionId: null, objectives: [], startTime: 0 });
  },
}));
```

### Mobile: Fluency Gate UI Component

```typescript
// components/FluencyGate/ResponseTimer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useScenarioStore } from '@/stores/scenario-store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ResponseTimerProps {
  isActive: boolean; // AI just finished speaking
  onTimeout: () => void; // User didn't respond in time
  onResponse: () => void; // User started speaking
}

export const ResponseTimer: React.FC<ResponseTimerProps> = ({
  isActive,
  onTimeout,
  onResponse,
}) => {
  const { responseTimeoutSeconds } = useScenarioStore();
  const [secondsLeft, setSecondsLeft] = useState(responseTimeoutSeconds);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (!isActive) {
      setSecondsLeft(responseTimeoutSeconds);
      progress.value = 1;
      return;
    }

    // Start countdown
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    // Animate progress
    progress.value = withTiming(0, {
      duration: responseTimeoutSeconds * 1000,
      easing: Easing.linear,
    });

    return () => clearInterval(interval);
  }, [isActive, responseTimeoutSeconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!isActive) return null;

  return (
    <View className="absolute top-20 left-4 right-4 z-50">
      {/* Countdown Text */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-lg font-bold">Respond now!</Text>
        <Text
          className={`text-2xl font-bold ${
            secondsLeft <= 1 ? 'text-red-500' : 'text-white'
          }`}
        >
          {secondsLeft.toFixed(1)}s
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <Animated.View
          style={animatedStyle}
          className={`h-full ${
            secondsLeft <= 1 ? 'bg-red-500' : secondsLeft <= 2 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        />
      </View>

      {/* Warning */}
      {secondsLeft <= 2 && (
        <Text className="text-yellow-500 text-sm mt-2 text-center font-semibold">
          ⚠️ Time is running out!
        </Text>
      )}
    </View>
  );
};
```

**Exit Criteria for Phase 2**:
- [ ] User can complete "Café Order" scenario
- [ ] Objectives are tracked in real-time
- [ ] Fluency Gate enforces 3-second response time
- [ ] Success/failure is calculated correctly
- [ ] XP is awarded upon completion

---

## Phase 3: Advanced Speech Analysis (8 weeks)

### Backend: Pronunciation API Integration

```typescript
// apps/backend-api/src/services/pronunciation/pronunciation-service.ts
import { AssemblyAI } from 'assemblyai';

export class PronunciationService {
  private client: AssemblyAI;

  constructor() {
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });
  }

  /**
   * Analyze pronunciation and return phoneme-level scores
   */
  public async analyzePronunciation(audioBuffer: Buffer, targetLanguage: string) {
    const transcript = await this.client.transcripts.create({
      audio: audioBuffer,
      language_code: this.getLanguageCode(targetLanguage),
      speech_model: 'nano', // Fastest model
      // Enable pronunciation assessment
      format_text: false,
    });

    // Extract phoneme-level scores (if API supports it)
    // Otherwise, use word-level confidence scores
    const pronunciationScores = transcript.words.map((word) => ({
      word: word.text,
      confidence: word.confidence,
      startTime: word.start / 1000,
      endTime: word.end / 1000,
      pronunciation: this.estimatePronunciationScore(word.confidence),
    }));

    return {
      overall: this.calculateOverallScore(pronunciationScores),
      words: pronunciationScores,
    };
  }

  /**
   * Detect common pronunciation mistakes for a language
   */
  public detectCommonMistakes(
    transcript: string,
    targetLanguage: string,
    nativeLanguage: string
  ): PronunciationFeedback[] {
    const feedback: PronunciationFeedback[] = [];

    // English-specific mistakes
    if (targetLanguage === 'English' && nativeLanguage === 'Spanish') {
      if (transcript.includes('sank')) {
        feedback.push({
          type: 'phoneme-error',
          original: 'sank',
          corrected: 'thank',
          explanation: 'Practice the "TH" sound by placing your tongue between your teeth.',
          audioExample: 'https://cdn.example.com/audio/th-sound.mp3',
        });
      }
    }

    // Spanish-specific mistakes
    if (targetLanguage === 'Spanish' && nativeLanguage === 'English') {
      if (transcript.match(/r[aeiou]/)) {
        feedback.push({
          type: 'phoneme-error',
          original: 'r',
          corrected: 'rr (rolled)',
          explanation: 'Roll your Rs by vibrating your tongue against the roof of your mouth.',
          audioExample: 'https://cdn.example.com/audio/rolled-r.mp3',
        });
      }
    }

    return feedback;
  }

  private calculateOverallScore(scores: any[]): number {
    const avg = scores.reduce((sum, s) => sum + s.pronunciation, 0) / scores.length;
    return Math.round(avg * 100);
  }

  private estimatePronunciationScore(confidence: number): number {
    // Confidence is 0-1, map to pronunciation score
    return confidence;
  }

  private getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      English: 'en',
      Spanish: 'es',
      French: 'fr',
      German: 'de',
      Japanese: 'ja',
    };
    return codes[language] || 'en';
  }
}

interface PronunciationFeedback {
  type: 'phoneme-error' | 'word-stress' | 'intonation';
  original: string;
  corrected: string;
  explanation: string;
  audioExample?: string;
}
```

### Backend: Response Latency Tracking

```typescript
// apps/backend-api/src/services/metrics/latency-tracker.ts
export class LatencyTracker {
  /**
   * Calculate response latency from AI finish to user speech start
   */
  public calculateResponseLatency(
    aiFinishTime: number,
    userSpeechStartTime: number
  ): number {
    return userSpeechStartTime - aiFinishTime;
  }

  /**
   * Detect hesitations in audio (pauses, filler words)
   */
  public async detectHesitations(transcript: string, timestamps: WordTimestamp[]): Promise<HesitationAnalysis> {
    const hesitations: Hesitation[] = [];
    let fillerWordCount = 0;
    let pauseCount = 0;

    // Detect filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    fillerWords.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        fillerWordCount += matches.length;
        matches.forEach(() => {
          hesitations.push({
            type: 'filler-word',
            word: filler,
            timestamp: 0, // Would need actual timestamp
          });
        });
      }
    });

    // Detect long pauses (> 1 second between words)
    for (let i = 0; i < timestamps.length - 1; i++) {
      const gap = timestamps[i + 1].start - timestamps[i].end;
      if (gap > 1.0) {
        pauseCount++;
        hesitations.push({
          type: 'pause',
          duration: gap,
          timestamp: timestamps[i].end,
        });
      }
    }

    return {
      totalHesitations: hesitations.length,
      fillerWordCount,
      pauseCount,
      hesitations,
      hesitationRate: hesitations.length / (timestamps.length || 1),
    };
  }
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Hesitation {
  type: 'filler-word' | 'pause' | 'false-start';
  word?: string;
  duration?: number;
  timestamp: number;
}

interface HesitationAnalysis {
  totalHesitations: number;
  fillerWordCount: number;
  pauseCount: number;
  hesitations: Hesitation[];
  hesitationRate: number;
}
```

### Backend: Fluency Score Calculation

```typescript
// apps/backend-api/src/services/metrics/fluency-calculator.ts
export class FluencyCalculator {
  /**
   * Calculate overall fluency score
   */
  public calculateFluencyScore(metrics: FluencyMetrics): number {
    const responseSpeed = this.scoreResponseSpeed(metrics.averageLatencyMs);
    const pronunciation = metrics.pronunciationScore;
    const confidence = this.scoreConfidence(metrics.hesitationRate);
    const vocabularyRange = this.scoreVocabulary(metrics.uniqueWords, metrics.totalWords);

    const fluencyScore =
      responseSpeed * 0.4 +
      pronunciation * 0.3 +
      confidence * 0.2 +
      vocabularyRange * 0.1;

    return Math.round(fluencyScore);
  }

  /**
   * Score response speed (faster = more fluent)
   */
  private scoreResponseSpeed(latencyMs: number): number {
    if (latencyMs < 1000) return 100; // < 1s = native-like
    if (latencyMs < 2000) return 90; // < 2s = fluent
    if (latencyMs < 3000) return 75; // < 3s = intermediate
    if (latencyMs < 5000) return 60; // < 5s = beginner
    return 40; // > 5s = struggling
  }

  /**
   * Score confidence based on hesitation rate
   */
  private scoreConfidence(hesitationRate: number): number {
    if (hesitationRate < 0.05) return 100; // < 5% hesitations
    if (hesitationRate < 0.10) return 85;
    if (hesitationRate < 0.20) return 70;
    if (hesitationRate < 0.30) return 55;
    return 40;
  }

  /**
   * Score vocabulary range (unique words / total words)
   */
  private scoreVocabulary(uniqueWords: number, totalWords: number): number {
    const ratio = uniqueWords / (totalWords || 1);
    if (ratio > 0.8) return 100; // High variety
    if (ratio > 0.6) return 85;
    if (ratio > 0.4) return 70;
    if (ratio > 0.2) return 55;
    return 40;
  }
}

interface FluencyMetrics {
  averageLatencyMs: number;
  pronunciationScore: number; // 0-100
  hesitationRate: number; // 0-1
  uniqueWords: number;
  totalWords: number;
}
```

**Exit Criteria for Phase 3**:
- [ ] Pronunciation scores are accurate (validated against native speakers)
- [ ] Response latency is tracked per session
- [ ] Hesitations are detected and counted
- [ ] Fluency score correlates with actual fluency (user testing validation)
- [ ] Feedback is actionable ("Practice TH sounds" not just "70% score")

---

## Phase 4: Computer Vision Integration (10 weeks)

### Dependencies

```bash
# Mobile app
npm install @mediapipe/tasks-vision
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install expo-camera
```

### Privacy-First Architecture

```typescript
// services/vision/facial-analysis-service.ts
import { Camera } from 'expo-camera';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FacialAnalysisService {
  private faceLandmarker: FaceLandmarker | null = null;
  private camera: Camera | null = null;

  /**
   * Initialize MediaPipe Face Mesh (runs on-device)
   */
  public async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU', // Use GPU acceleration
      },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  }

  /**
   * Analyze facial landmarks from camera frame
   * NO VIDEO IS SENT TO SERVER - all processing on-device
   */
  public async analyzeFace(videoFrame: HTMLVideoElement): Promise<FacialAnalysis> {
    if (!this.faceLandmarker) {
      throw new Error('Face landmarker not initialized');
    }

    const result = this.faceLandmarker.detectForVideo(videoFrame, performance.now());

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      return {
        detected: false,
        lipAperture: 0,
        lipShape: 'neutral',
        confidence: 0,
        eyeContact: false,
      };
    }

    const landmarks = result.faceLandmarks[0];

    // Extract mouth landmarks (indices 61-68, 0-17)
    const mouthLandmarks = this.extractMouthLandmarks(landmarks);

    return {
      detected: true,
      lipAperture: this.calculateLipAperture(mouthLandmarks),
      lipShape: this.classifyLipShape(mouthLandmarks),
      confidence: this.estimateConfidence(landmarks),
      eyeContact: this.detectEyeContact(landmarks),
    };
  }

  /**
   * Calculate lip aperture (mouth opening height)
   */
  private calculateLipAperture(mouthLandmarks: Landmark[]): number {
    // Distance between upper lip and lower lip (center points)
    const upperLip = mouthLandmarks[13]; // Top of upper lip
    const lowerLip = mouthLandmarks[14]; // Bottom of lower lip

    const distance = Math.sqrt(
      Math.pow(upperLip.x - lowerLip.x, 2) + Math.pow(upperLip.y - lowerLip.y, 2)
    );

    return distance * 100; // Normalize to 0-100 range
  }

  /**
   * Classify lip shape for phoneme matching
   */
  private classifyLipShape(mouthLandmarks: Landmark[]): LipShape {
    const aperture = this.calculateLipAperture(mouthLandmarks);
    const width = this.calculateLipWidth(mouthLandmarks);

    if (aperture < 10 && width < 40) return 'closed'; // M, B, P
    if (aperture > 50 && width > 60) return 'wide-open'; // AA (father)
    if (aperture > 30 && width > 70) return 'smile'; // EE (beat)
    if (aperture > 30 && width < 50) return 'round'; // OO (boot)
    return 'neutral';
  }

  private calculateLipWidth(mouthLandmarks: Landmark[]): number {
    const leftCorner = mouthLandmarks[0];
    const rightCorner = mouthLandmarks[6];

    const distance = Math.sqrt(
      Math.pow(leftCorner.x - rightCorner.x, 2) + Math.pow(leftCorner.y - rightCorner.y, 2)
    );

    return distance * 100;
  }

  /**
   * Estimate confidence from facial cues (eye contact, tension)
   */
  private estimateConfidence(landmarks: Landmark[]): number {
    const eyeContact = this.detectEyeContact(landmarks);
    const facialTension = this.detectFacialTension(landmarks);

    let confidence = 50; // Baseline

    if (eyeContact) confidence += 30; // Direct eye contact = high confidence
    if (!facialTension) confidence += 20; // Relaxed face = high confidence

    return Math.min(confidence, 100);
  }

  /**
   * Detect if user is making eye contact (looking at camera)
   */
  private detectEyeContact(landmarks: Landmark[]): boolean {
    // Simplified: Check if eyes are centered (looking forward)
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const noseTip = landmarks[1];

    // If eyes are horizontally aligned with nose, likely looking forward
    const eyeLevel = (leftEye.y + rightEye.y) / 2;
    const noseLevel = noseTip.y;

    return Math.abs(eyeLevel - noseLevel) < 0.05;
  }

  /**
   * Detect facial tension (stress indicator)
   */
  private detectFacialTension(landmarks: Landmark[]): boolean {
    // Simplified: Check if eyebrows are raised (tension)
    const leftBrow = landmarks[55];
    const rightBrow = landmarks[285];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const leftDistance = leftBrow.y - leftEye.y;
    const rightDistance = rightBrow.y - rightEye.y;

    // If eyebrows are significantly raised, indicates tension
    return leftDistance > 0.03 || rightDistance > 0.03;
  }

  private extractMouthLandmarks(landmarks: Landmark[]): Landmark[] {
    // MediaPipe mouth indices: 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95
    const mouthIndices = [61, 146, 91, 181, 84, 17, 314];
    return mouthIndices.map((index) => landmarks[index]);
  }
}

interface FacialAnalysis {
  detected: boolean;
  lipAperture: number; // 0-100
  lipShape: LipShape;
  confidence: number; // 0-100
  eyeContact: boolean;
}

type LipShape = 'closed' | 'wide-open' | 'smile' | 'round' | 'neutral';

interface Landmark {
  x: number;
  y: number;
  z: number;
}
```

### Mobile: Side-by-Side Comparison UI

```typescript
// components/Vision/LipComparisonView.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { Avatar3D } from '@/components/Avatar/Avatar3D';
import { FacialAnalysisService } from '@/services/vision/facial-analysis-service';

export const LipComparisonView: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const analysisService = useRef(new FacialAnalysisService());
  const [userLipShape, setUserLipShape] = useState<LipShape>('neutral');
  const [targetLipShape, setTargetLipShape] = useState<LipShape>('neutral');

  useEffect(() => {
    analysisService.current.initialize();

    // Start analyzing camera frames
    const interval = setInterval(async () => {
      if (cameraRef.current) {
        const analysis = await analysisService.current.analyzeFace(/* camera frame */);
        setUserLipShape(analysis.lipShape);
      }
    }, 1000 / 30); // 30 FPS

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 flex-row">
      {/* User's Face */}
      <View className="flex-1 border-r border-white/20">
        <Camera ref={cameraRef} className="flex-1" type={Camera.Constants.Type.front} />
        <View className="absolute bottom-4 left-4 right-4 bg-black/70 p-3 rounded-lg">
          <Text className="text-white text-center">Your Lip Shape: {userLipShape}</Text>
        </View>
      </View>

      {/* Avatar's Face */}
      <View className="flex-1">
        <Avatar3D avatarModel={/* ... */} isSpeaking={true} />
        <View className="absolute bottom-4 left-4 right-4 bg-black/70 p-3 rounded-lg">
          <Text className="text-white text-center">Target Shape: {targetLipShape}</Text>
        </View>
      </View>
    </View>
  );
};
```

**Exit Criteria for Phase 4**:
- [ ] Facial landmarks detected at 30 FPS
- [ ] Lip shapes classified accurately (validated against phonemes)
- [ ] Side-by-side comparison UI works smoothly
- [ ] Privacy: No video leaves the device
- [ ] Confidence detection correlates with user self-reported confidence

---

## ⚡ Quick Reference: Development Priorities

### Must-Have for MVP
1. 3D Avatars with lip-sync
2. Scenario system with 8+ scenarios
3. Fluency Gate (3-second rule)
4. Real pronunciation feedback
5. Real metrics dashboard

### Should-Have (Post-MVP)
6. Computer vision integration
7. LiveKit real-time sessions
8. Advanced speech analysis

### Nice-to-Have (Future)
9. Multiple languages (beyond Spanish)
10. Social features (leaderboards)
11. Marketplace with creator content

---

## 🔄 Iteration Strategy

**After each phase**:
1. **User Testing** - Get 10+ users to test the feature
2. **Collect Feedback** - Qualitative + quantitative
3. **Measure KPIs** - Completion rate, engagement, fluency improvement
4. **Refine** - Adjust based on data
5. **Document** - What worked, what didn't

**No compromises means validating assumptions ruthlessly.**
