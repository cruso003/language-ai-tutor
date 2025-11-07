# FluentAI Implementation Guide & Development Workflow

> **Step-by-step implementation guide for transforming the prototype into a production-ready application**

## 🚀 Getting Started: Immediate Actions

### **Week 1: Environment Setup & Planning**

#### **Day 1-2: Development Environment**

```bash
# 1. Install recommended tools
npm install -g bun@latest
npm install -g @expo/cli@latest
npm install -g @nestjs/cli@latest

# 2. Set up development database
docker run --name fluentai-postgres \
  -e POSTGRES_DB=fluentai \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpass \
  -p 5432:5432 -d postgres:16

# 3. Set up Redis for caching
docker run --name fluentai-redis \
  -p 6379:6379 -d redis:7.2-alpine

# 4. Clone and restructure project
git checkout -b feature/backend-architecture
mkdir -p backend/{src,tests,docs}
mkdir -p frontend/mobile
mkdir -p shared/{types,utils}
```

#### **Day 3-5: Backend Foundation**

```bash
# Create backend API server
cd backend
bun init
bun add fastify @fastify/cors @fastify/helmet @fastify/rate-limit
bun add prisma @prisma/client
bun add jsonwebtoken bcryptjs
bun add @types/jsonwebtoken @types/bcryptjs -D

# Initialize Prisma
npx prisma init
```

**Backend Structure:**

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── environment.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── conversations/
│   │   ├── ai/
│   │   └── scenarios/
│   ├── shared/
│   │   ├── guards/
│   │   ├── middlewares/
│   │   └── decorators/
│   ├── types/
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
└── docker/
```

---

## 🏗️ Phase 1: Secure Backend Architecture (Weeks 1-4)

### **Week 1-2: Core Backend Setup**

#### **Database Schema Design**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  authId    String   @unique // Auth0/Supabase ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile UserProfile?
  sessions ConversationSession[]
  progress UserProgress[]

  @@map("users")
}

model UserProfile {
  id               String          @id @default(cuid())
  userId           String          @unique
  name             String
  targetLanguage   LanguageCode
  nativeLanguage   LanguageCode
  proficiencyLevel ProficiencyLevel
  interests        String[]
  avatar           String?
  timezone         String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model ConversationSession {
  id        String   @id @default(cuid())
  userId    String
  scenarioId String
  startedAt DateTime @default(now())
  endedAt   DateTime?
  completed Boolean  @default(false)
  passed    Boolean  @default(false)

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scenario Scenario  @relation(fields: [scenarioId], references: [id])
  messages Message[]
  metrics  SessionMetrics?

  @@map("conversation_sessions")
}

model Message {
  id          String   @id @default(cuid())
  sessionId   String
  role        MessageRole
  content     String
  audioUrl    String?
  createdAt   DateTime @default(now())

  session     ConversationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  corrections GrammarCorrection[]

  @@map("messages")
}

model Scenario {
  id               String           @id @default(cuid())
  title            String
  description      String
  difficulty       ProficiencyLevel
  category         ScenarioCategory
  objectives       String[]
  estimatedMinutes Int
  vocabulary       String[]
  culturalNotes    String[]
  isActive         Boolean          @default(true)
  createdAt        DateTime         @default(now())

  sessions ConversationSession[]

  @@map("scenarios")
}

model AIPersonality {
  id                   String @id @default(cuid())
  name                 String
  description          String
  personality          String
  speakingSpeed        String
  interruptionLikelihood Float
  avatar               String
  voiceId              String?
  isActive             Boolean @default(true)

  @@map("ai_personalities")
}

enum LanguageCode {
  EN
  ES
  FR
  DE
  IT
  PT
  JA
  KO
  ZH
  AR
  RU
}

enum ProficiencyLevel {
  BEGINNER
  ELEMENTARY
  INTERMEDIATE
  ADVANCED
  FLUENT
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum ScenarioCategory {
  TRAVEL
  BUSINESS
  SOCIAL
  SHOPPING
  EMERGENCY
  CUSTOM
}
```

#### **API Architecture Setup**

```typescript
// backend/src/main.ts
import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { setupAuth } from "./config/auth";
import { setupDatabase } from "./config/database";
import { registerRoutes } from "./modules";

const prisma = new PrismaClient();

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  // Security middleware
  await fastify.register(require("@fastify/helmet"));
  await fastify.register(require("@fastify/cors"), {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  });
  await fastify.register(require("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "1 minute",
  });

  // Database setup
  fastify.decorate("prisma", prisma);

  // Authentication setup
  await setupAuth(fastify);

  // Register all routes
  await registerRoutes(fastify);

  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("🚀 Backend server running on http://localhost:3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
```

### **Week 2-3: Authentication & Security**

#### **Auth0 Integration**

```typescript
// backend/src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async validateAuth0Token(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY!);
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async findOrCreateUser(authPayload: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { authId: authPayload.sub },
      include: { profile: true },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        email: authPayload.email,
        authId: authPayload.sub,
        profile: {
          create: {
            name: authPayload.name || "Anonymous User",
            targetLanguage: "ES", // Default to Spanish
            nativeLanguage: "EN",
            proficiencyLevel: "BEGINNER",
            interests: [],
          },
        },
      },
      include: { profile: true },
    });
  }

  async generateInternalToken(user: any) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
  }
}
```

#### **Security Middleware**

```typescript
// backend/src/shared/guards/auth.guard.ts
import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing or invalid token" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid token" });
  }
}
```

### **Week 3-4: AI Service Integration**

#### **Multi-AI Orchestration**

```typescript
// backend/src/modules/ai/ai-orchestrator.service.ts
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIOrchestrator {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async routeRequest(request: AIRequest): Promise<AIResponse> {
    // Smart routing based on request type and complexity
    if (request.type === "grammar_check") {
      return this.processWithGemini(request);
    } else if (request.type === "conversation") {
      return this.processWithGPT4(request);
    } else if (request.complexity > 0.8) {
      return this.processWithBestModel(request);
    }

    return this.processWithDefault(request);
  }

  private async processWithGPT4(request: AIRequest): Promise<AIResponse> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: request.messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      content: response.choices[0].message.content || "",
      model: "gpt-4-turbo",
      usage: response.usage,
      confidence: 0.95,
    };
  }

  private async processWithGemini(request: AIRequest): Promise<AIResponse> {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(request.prompt);

    return {
      content: result.response.text(),
      model: "gemini-pro",
      confidence: 0.9,
    };
  }

  async estimateCost(request: AIRequest): Promise<number> {
    // Cost estimation for different models
    const costs = {
      "gpt-4-turbo": 0.01,
      "gemini-pro": 0.0005,
      "gpt-3.5-turbo": 0.002,
    };

    const selectedModel = this.selectModel(request);
    return costs[selectedModel] * request.estimatedTokens;
  }
}
```

---

## 📱 Phase 2: Frontend Modernization (Weeks 5-8)

### **Week 5-6: React Native Architecture Refactor**

#### **State Management with React Query**

```typescript
// frontend/src/hooks/useConversations.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: conversationApi.getAll,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      message,
    }: {
      sessionId: string;
      message: string;
    }) => conversationApi.sendMessage(sessionId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.sessionId],
      });
    },
  });
}
```

#### **Secure API Client**

```typescript
// frontend/src/api/client.ts
import axios from "axios";
import { getSecureValue } from "../utils/secureStorage";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await getSecureValue("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await handleTokenRefresh();
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

#### **Improved Audio Recording**

```typescript
// frontend/src/hooks/useAudioRecording.ts
import { useState, useCallback } from "react";
import { Audio } from "expo-av";
import { usePermissions } from "expo-permissions";

export function useAudioRecording() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = usePermissions(Audio.RECORDING);

  const startRecording = useCallback(async () => {
    try {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) throw new Error("Audio permission denied");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }, [permission, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      return uri;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }, [recording]);

  return {
    startRecording,
    stopRecording,
    isRecording,
    hasPermission: permission?.granted,
  };
}
```

### **Week 7-8: Real-time Communication**

#### **LiveKit Integration**

```typescript
// frontend/src/services/livekit.service.ts
import {
  Room,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";

export class LiveKitService {
  private room: Room | null = null;
  private token: string | null = null;

  async connect(url: string, token: string): Promise<Room> {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    // Set up event listeners
    this.room.on("trackSubscribed", this.handleTrackSubscribed);
    this.room.on("trackUnsubscribed", this.handleTrackUnsubscribed);
    this.room.on("participantConnected", this.handleParticipantConnected);

    await this.room.connect(url, token);
    this.token = token;

    return this.room;
  }

  async enableMicrophone(): Promise<void> {
    if (!this.room) throw new Error("Not connected to room");

    await this.room.localParticipant.setMicrophoneEnabled(true);
  }

  async disableMicrophone(): Promise<void> {
    if (!this.room) throw new Error("Not connected to room");

    await this.room.localParticipant.setMicrophoneEnabled(false);
  }

  private handleTrackSubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    if (track.kind === "audio") {
      // Handle AI voice playback
      const audioElement = track.attach();
      document.body.appendChild(audioElement);
    }
  };

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.token = null;
    }
  }
}
```

---

## 🎭 Phase 3: Advanced Features (Weeks 9-16)

### **Week 9-12: 3D Avatar System**

#### **3D Avatar Component**

```typescript
// frontend/src/components/Avatar3D.tsx
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useLipSync } from "../hooks/useLipSync";

interface Avatar3DProps {
  avatarId: string;
  emotion: "happy" | "neutral" | "encouraging" | "concerned";
  speaking: boolean;
  audioBuffer?: ArrayBuffer;
}

function AvatarModel({
  avatarId,
  emotion,
  speaking,
  audioBuffer,
}: Avatar3DProps) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(`/avatars/${avatarId}.glb`);
  const { actions } = useAnimations(animations, group);
  const lipSyncData = useLipSync(audioBuffer);

  useEffect(() => {
    // Play emotion animation
    if (actions[emotion]) {
      actions[emotion]?.play();
    }
  }, [emotion, actions]);

  useFrame(() => {
    if (speaking && lipSyncData && group.current) {
      // Apply lip sync data to avatar's mouth
      applyLipSync(group.current, lipSyncData);
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Avatar} />
    </group>
  );
}

export function Avatar3D(props: Avatar3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <AvatarModel {...props} />
    </Canvas>
  );
}
```

#### **Lip Sync Processing**

```typescript
// frontend/src/hooks/useLipSync.ts
import { useState, useEffect } from "react";

interface LipSyncData {
  visemes: Array<{
    time: number;
    viseme: string;
    weight: number;
  }>;
}

export function useLipSync(audioBuffer?: ArrayBuffer): LipSyncData | null {
  const [lipSyncData, setLipSyncData] = useState<LipSyncData | null>(null);

  useEffect(() => {
    if (!audioBuffer) return;

    async function processAudio() {
      try {
        // Use Azure Speech Services or similar for viseme generation
        const response = await fetch("/api/speech/analyze", {
          method: "POST",
          body: audioBuffer,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

        const data = await response.json();
        setLipSyncData(data);
      } catch (error) {
        console.error("Failed to process lip sync:", error);
      }
    }

    processAudio();
  }, [audioBuffer]);

  return lipSyncData;
}
```

### **Week 13-16: Computer Vision Integration**

#### **Pronunciation Analysis with Camera**

```typescript
// frontend/src/components/PronunciationAnalyzer.tsx
import React, { useRef, useEffect, useState } from "react";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

interface PronunciationAnalyzerProps {
  targetPhoneme: string;
  onAnalysisComplete: (score: number) => void;
}

export function PronunciationAnalyzer({
  targetPhoneme,
  onAnalysisComplete,
}: PronunciationAnalyzerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    requestCameraPermission();
    loadModel();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const loadModel = async () => {
    try {
      const modelUrl = "/models/pronunciation-analyzer/model.json";
      const loadedModel = await tf.loadLayersModel(modelUrl);
      setModel(loadedModel);
    } catch (error) {
      console.error("Failed to load pronunciation model:", error);
    }
  };

  const analyzeLipMovement = async () => {
    if (!cameraRef.current || !model) return;

    try {
      // Capture frame from camera
      const imageUri = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      // Convert image to tensor
      const response = await fetch(`data:image/jpeg;base64,${imageUri.base64}`);
      const imageData = await response.arrayBuffer();
      const imageTensor = tf.browser.fromPixels(new ImageData(imageData));

      // Preprocess image (resize, normalize)
      const preprocessed = tf.image
        .resizeBilinear(imageTensor, [224, 224])
        .div(255.0)
        .expandDims(0);

      // Run inference
      const prediction = model.predict(preprocessed) as tf.Tensor;
      const scores = await prediction.data();

      // Calculate pronunciation score
      const pronunciationScore = calculatePronunciationScore(
        scores,
        targetPhoneme
      );

      onAnalysisComplete(pronunciationScore);

      // Cleanup
      imageTensor.dispose();
      preprocessed.dispose();
      prediction.dispose();
    } catch (error) {
      console.error("Failed to analyze pronunciation:", error);
    }
  };

  const calculatePronunciationScore = (
    scores: Float32Array,
    targetPhoneme: string
  ): number => {
    // Implementation depends on your model output format
    // This is a simplified example
    const phonemeIndex = getPhonemeIndex(targetPhoneme);
    return scores[phonemeIndex] * 100;
  };

  if (hasPermission === null) {
    return <View>Requesting camera permission...</View>;
  }

  if (hasPermission === false) {
    return <View>No access to camera</View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={Camera.Constants.Type.front}
        onCameraReady={analyzeLipMovement}
      />
    </View>
  );
}
```

---

## 🧪 Testing Strategy

### **Unit Testing Setup**

```typescript
// tests/unit/ai-orchestrator.test.ts
import { AIOrchestrator } from "../../src/modules/ai/ai-orchestrator.service";

describe("AIOrchestrator", () => {
  let orchestrator: AIOrchestrator;

  beforeEach(() => {
    orchestrator = new AIOrchestrator();
  });

  describe("routeRequest", () => {
    it("should route grammar checks to Gemini", async () => {
      const request = {
        type: "grammar_check",
        content: "I are going to the store",
        complexity: 0.3,
      };

      const response = await orchestrator.routeRequest(request);
      expect(response.model).toBe("gemini-pro");
    });

    it("should route conversations to GPT-4", async () => {
      const request = {
        type: "conversation",
        content: "How are you today?",
        complexity: 0.7,
      };

      const response = await orchestrator.routeRequest(request);
      expect(response.model).toBe("gpt-4-turbo");
    });
  });
});
```

### **E2E Testing with Detox**

```typescript
// e2e/conversation.e2e.ts
import { device, element, by, expect } from "detox";

describe("Conversation Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should complete a full conversation scenario", async () => {
    // Navigate to conversation screen
    await element(by.id("start-conversation-button")).tap();

    // Select scenario
    await element(by.id("cafe-scenario")).tap();

    // Start recording
    await element(by.id("record-button")).tap();
    await device.sleep(2000); // Simulate speaking
    await element(by.id("record-button")).tap();

    // Wait for AI response
    await waitFor(element(by.id("ai-response")))
      .toBeVisible()
      .withTimeout(5000);

    // Verify conversation state
    await expect(element(by.id("conversation-active"))).toBeVisible();
  });
});
```

---

## 📊 Monitoring & Analytics

### **Application Monitoring Setup**

```typescript
// backend/src/shared/monitoring/metrics.service.ts
import { Counter, Histogram, register } from "prom-client";

export class MetricsService {
  private requestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
  });

  private requestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route"],
  });

  private aiRequestCounter = new Counter({
    name: "ai_requests_total",
    help: "Total number of AI API requests",
    labelNames: ["model", "type"],
  });

  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number
  ) {
    this.requestCounter.inc({ method, route, status: status.toString() });
    this.requestDuration.observe({ method, route }, duration);
  }

  recordAIRequest(model: string, type: string) {
    this.aiRequestCounter.inc({ model, type });
  }

  getMetrics() {
    return register.metrics();
  }
}
```

### **User Analytics**

```typescript
// frontend/src/utils/analytics.ts
import { Analytics } from "@segment/analytics-react-native";

class AnalyticsService {
  private analytics: Analytics;

  constructor() {
    this.analytics = new Analytics({
      writeKey: process.env.EXPO_PUBLIC_SEGMENT_KEY!,
    });
  }

  trackConversationStart(scenarioId: string, difficulty: string) {
    this.analytics.track("Conversation Started", {
      scenarioId,
      difficulty,
      timestamp: new Date().toISOString(),
    });
  }

  trackPronunciationScore(score: number, phoneme: string) {
    this.analytics.track("Pronunciation Analyzed", {
      score,
      phoneme,
      timestamp: new Date().toISOString(),
    });
  }

  trackUserProgress(level: string, fluencyScore: number) {
    this.analytics.track("Progress Updated", {
      level,
      fluencyScore,
      timestamp: new Date().toISOString(),
    });
  }
}

export const analytics = new AnalyticsService();
```

---

## 🚀 Deployment Pipeline

### **Docker Configuration**

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fluentai -u 1001

USER fluentai

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### **GitHub Actions CI/CD**

```yaml
# .github/workflows/deploy.yml
name: Deploy FluentAI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy-backend:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: "fluentai-backend"

  deploy-mobile:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build and submit
        run: |
          expo build:ios --non-interactive
          expo build:android --non-interactive
```

This implementation guide provides a comprehensive roadmap for transforming FluentAI from a prototype to a production-ready application. Each phase builds upon the previous one, ensuring a solid foundation while progressively adding advanced features.

The guide emphasizes security, scalability, and user experience while maintaining development velocity through modern tools and practices.

---

_Implementation Guide Version: 1.0_  
_Last Updated: November 7, 2025_  
_Next Review: December 7, 2025_
