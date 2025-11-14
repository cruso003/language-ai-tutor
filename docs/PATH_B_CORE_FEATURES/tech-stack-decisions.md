# Tech Stack Decisions
## Architecture & Technology Choices for Path B

> **Purpose**: Document all technology decisions, trade-offs, and rationale for the revolutionary features.

---

## Overview

This document explains the **why** behind every major technology choice for FluentGym's core features.

---

## 1️⃣ 3D Avatar Rendering

### Decision: React Three Fiber + Three.js

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **React Three Fiber** | ✅ React-like API<br>✅ Mature ecosystem<br>✅ Good performance<br>✅ Supports GLB/GLTF | ❌ Larger bundle (~1MB)<br>❌ Learning curve | ✅ **CHOSEN** |
| Unity WebGL | ✅ Best rendering quality<br>✅ Powerful editor | ❌ Huge bundle (20MB+)<br>❌ Poor React integration<br>❌ Overkill for use case | ❌ Rejected |
| Native OpenGL ES | ✅ Maximum performance<br>✅ Minimal bundle size | ❌ Low-level (hard to maintain)<br>❌ No ecosystem<br>❌ Platform-specific code | ❌ Rejected |
| Babylon.js | ✅ Good performance<br>✅ Feature-rich | ❌ Less React integration<br>❌ Smaller ecosystem than Three.js | ❌ Rejected |

**Rationale**:
- React Three Fiber provides the **best balance** of performance, maintainability, and ecosystem support
- Three.js is **battle-tested** (used by Google, Microsoft, NASA)
- Declarative API makes it easier for React developers to contribute
- Bundle size is acceptable (~1MB gzipped) for mobile

**Performance Targets**:
- 60 FPS on iPhone 12 (A14 Bionic)
- 60 FPS on Samsung Galaxy S21 (Snapdragon 888)
- 30 FPS fallback on older devices (iPhone 11, Galaxy S20)

---

### Avatar Model Source: Ready Player Me

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Ready Player Me** | ✅ Free tier available<br>✅ Customizable<br>✅ GLB export with blend shapes<br>✅ API for programmatic generation | ❌ Requires internet for customization<br>❌ Limited free tier | ✅ **CHOSEN** |
| Mixamo | ✅ Free<br>✅ Pre-rigged characters | ❌ Limited customization<br>❌ No facial blend shapes | ❌ Rejected |
| Custom 3D Artist | ✅ Full control<br>✅ Unique style | ❌ Expensive ($500-1000/avatar)<br>❌ Time-consuming | ❌ Fallback if RPM fails |
| VRoid Studio | ✅ Free<br>✅ Anime-style avatars | ❌ Not suitable for realistic tutors | ❌ Rejected |

**Rationale**:
- Ready Player Me offers the best **balance of quality and cost**
- Users can eventually **create their own avatars** (future feature)
- GLB export includes **blend shapes** required for facial animation
- Fallback: Commission custom avatars if RPM doesn't meet quality standards

**Avatar Specifications**:
- Format: GLB (binary GLTF)
- Polygon count: < 20,000 triangles (mobile optimization)
- Texture size: 1024x1024 (max)
- Blend shapes: Minimum 10 (mouth, eyes, brows)

---

### Lip-Sync Approach: Phoneme-to-Viseme Mapping

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Phoneme-to-Viseme** | ✅ Accurate<br>✅ Works across languages<br>✅ Controllable | ❌ Requires phoneme extraction<br>❌ More complex | ✅ **CHOSEN** |
| Audio-Driven (Amplitude) | ✅ Simple<br>✅ Low latency | ❌ Inaccurate (just jaw movement)<br>❌ Not language-aware | ❌ Rejected (too basic) |
| Pre-recorded Animations | ✅ Perfect sync<br>✅ No computation | ❌ Not scalable (need animation per phrase)<br>❌ No AI flexibility | ❌ Rejected |
| Deepfake Lip-Sync | ✅ Hyper-realistic | ❌ Computationally expensive<br>❌ Ethical concerns<br>❌ Requires ML models | ❌ Rejected (overkill) |

**Rationale**:
- **Phoneme-to-viseme** is the industry standard for realistic lip-sync (used in games like Cyberpunk 2077)
- Works across **multiple languages** (just need phoneme mappings)
- Provides **full control** over mouth shapes for each sound
- Fallback: Start with audio-driven jaw movement, upgrade to phoneme-based later if needed

**Implementation Plan**:
1. Extract phonemes from AI audio (Whisper + GPT-4o or CMU Dict)
2. Map phonemes to visemes (mouth shapes)
3. Animate blend shapes in sync with audio playback

---

## 2️⃣ Computer Vision

### Decision: MediaPipe Face Mesh

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **MediaPipe Face Mesh** | ✅ Free<br>✅ On-device (privacy)<br>✅ 468 landmarks<br>✅ Fast (30 FPS on mobile) | ❌ Google dependency | ✅ **CHOSEN** |
| TensorFlow.js Facemesh | ✅ Open-source<br>✅ On-device | ❌ Slower than MediaPipe<br>❌ Less accurate | ❌ Rejected |
| Azure Face API | ✅ Very accurate<br>✅ Emotion detection included | ❌ Requires cloud upload (privacy issue)<br>❌ Expensive<br>❌ Latency | ❌ Rejected (privacy) |
| Amazon Rekognition | ✅ Accurate | ❌ Cloud-only<br>❌ Privacy concerns<br>❌ Expensive | ❌ Rejected (privacy) |

**Rationale**:
- **Privacy first**: MediaPipe runs **100% on-device** (no video uploaded)
- **Performance**: Achieves 30 FPS on modern mobile devices
- **Accuracy**: 468-point mesh is sufficient for lip tracking
- **Cost**: Free (no API fees)

**Privacy Guarantees**:
- ✅ Video frames **never leave the device**
- ✅ Only facial landmark coordinates sent to backend (if needed)
- ✅ User consent required before camera access
- ✅ Clear privacy policy explaining on-device processing

**Performance Targets**:
- 30 FPS facial landmark detection (minimum)
- Lip shape classification in < 50ms
- Works in various lighting conditions (with user warning for low light)

---

## 3️⃣ Speech Analysis

### Decision: Multi-Provider Approach

**Transcription**: OpenAI Whisper (already implemented)
**Pronunciation Scoring**: AssemblyAI or Azure Speech Services

**Options for Pronunciation Analysis**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **AssemblyAI** | ✅ Phoneme-level confidence<br>✅ Good documentation<br>✅ Affordable | ❌ API dependency | ✅ **CHOSEN (Primary)** |
| Azure Speech Services | ✅ Pronunciation assessment built-in<br>✅ Multi-language support | ❌ More expensive<br>❌ Microsoft lock-in | 🟡 **Fallback** |
| Google Cloud Speech | ✅ Good accuracy | ❌ No phoneme-level scoring | ❌ Rejected |
| Self-Hosted Whisper | ✅ No API costs<br>✅ Full control | ❌ Requires GPU infrastructure<br>❌ No pronunciation scoring | ❌ Rejected (missing features) |

**Rationale**:
- **AssemblyAI** provides the best balance of features and cost
- Fallback to **Azure** if AssemblyAI doesn't meet accuracy requirements
- Continue using **Whisper** for basic transcription (already implemented)
- Future: Consider self-hosting Whisper + custom pronunciation model

**Cost Estimation** (based on 1000 users, 10 minutes/day):
- Whisper: ~$500/month (10,000 minutes = $300 at $0.006/minute)
- AssemblyAI: ~$300/month (10,000 minutes at ~$0.03/minute)
- **Total**: ~$800/month for speech analysis

---

## 4️⃣ Real-Time Communication

### Decision: LiveKit (Already Implemented in Backend)

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **LiveKit** | ✅ Already integrated<br>✅ Open-source<br>✅ Low latency (< 150ms)<br>✅ Self-hostable | ❌ Cost scales with usage | ✅ **CHOSEN** |
| Agora | ✅ Very low latency<br>✅ Enterprise-grade | ❌ Expensive<br>❌ Closed-source | ❌ Rejected |
| Twilio Video | ✅ Reliable<br>✅ Good docs | ❌ Very expensive<br>❌ Overkill for use case | ❌ Rejected |
| WebRTC (DIY) | ✅ Free<br>✅ Full control | ❌ Complex to implement<br>❌ Requires TURN/STUN servers | ❌ Rejected (too complex) |

**Rationale**:
- LiveKit is **already implemented** in the backend (reduces risk)
- **Open-source** allows self-hosting (cost savings at scale)
- **Low latency** (< 150ms) is critical for real-time conversation
- Can scale from cloud to self-hosted as usage grows

**Cost Estimation** (LiveKit Cloud):
- Free tier: 10,000 participant minutes/month
- Paid: $0.04/participant minute after free tier
- **Estimated cost for 1000 users**: ~$200-500/month

**Alternative**: Self-host LiveKit when users exceed 10,000/month (saves ~70% cost)

---

## 5️⃣ AI Conversation

### Decision: Multi-Provider AI Router (Already Implemented)

**Current Setup**:
- **Primary**: OpenAI GPT-4o-mini (fast, affordable)
- **Fallback**: Google Gemini (cost optimization)

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Multi-Provider Router** | ✅ Cost optimization<br>✅ Redundancy<br>✅ Model flexibility | ❌ More complex | ✅ **CHOSEN** (already implemented) |
| OpenAI Only | ✅ Simple<br>✅ Best quality | ❌ Expensive<br>❌ Single point of failure | ❌ Rejected |
| Anthropic Claude | ✅ High quality<br>✅ Long context | ❌ More expensive than GPT-4o-mini | 🟡 Future consideration |
| Self-Hosted LLaMA | ✅ No API costs | ❌ Requires GPU infrastructure<br>❌ Lower quality than GPT-4o | ❌ Rejected |

**Rationale**:
- **Multi-provider** reduces risk (if OpenAI goes down, fallback to Gemini)
- **Cost optimization**: Use cheaper model when quality difference is negligible
- Already implemented in backend (low risk)

**Cost Estimation** (1000 users, 10 conversations/day):
- GPT-4o-mini: ~$0.0001/1K input tokens, ~$0.0003/1K output tokens
- Average conversation: ~5,000 tokens (input + output)
- **Estimated cost**: ~$500-1000/month

---

## 6️⃣ Database

### Decision: PostgreSQL + Drizzle ORM (Already Implemented)

**Current Setup**:
- **PostgreSQL** 15+ (with pgvector extension)
- **Drizzle ORM** for type-safe queries
- **Supabase** for hosting (or self-hosted)

**Rationale**:
- **PostgreSQL** is industry-standard, scalable, and reliable
- **pgvector** enables semantic search for memory system
- **Drizzle ORM** provides type safety without the bulk of Prisma
- **Already implemented** (low risk)

**Alternatives Considered**:
- ❌ **MongoDB**: No pgvector support, less structured
- ❌ **Prisma ORM**: Heavier than Drizzle, slower schema generation

**Cost Estimation**:
- **Supabase Free Tier**: 500 MB database (sufficient for MVP)
- **Paid**: $25/month for 8 GB (post-MVP)

---

## 7️⃣ Mobile App Framework

### Decision: Expo + React Native (Already Implemented)

**Current Setup**:
- **Expo** 54+
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind CSS for React Native)

**Rationale**:
- **Expo** provides the best developer experience for React Native
- **Expo Router** simplifies navigation (similar to Next.js)
- **NativeWind** enables rapid UI development with Tailwind syntax
- **Already implemented** (low risk)

**Alternatives Considered**:
- ❌ **Flutter**: Different language (Dart), team has React expertise
- ❌ **Native iOS/Android**: Slower development, need separate teams

---

## 8️⃣ State Management

### Decision: Zustand (Already Implemented)

**Rationale**:
- **Zustand** is lightweight and simple
- Better performance than Redux for this use case
- **Already implemented** (low risk)

**Alternatives Considered**:
- ❌ **Redux Toolkit**: More boilerplate, overkill for this app
- ❌ **React Context**: Not suitable for complex state (performance)

---

## 9️⃣ Deployment & Infrastructure

### Current Setup

**Backend**:
- **Hosting**: Railway (currently) or AWS (production)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Cloudinary (avatar assets, audio files)

**Mobile**:
- **App Store**: Apple App Store
- **Google Play**: Google Play Store
- **OTA Updates**: Expo EAS Update (for instant bug fixes)

**Cost Estimation** (1000 active users):

| Service | Cost/Month | Notes |
|---------|------------|-------|
| Backend Hosting (Railway) | $100-200 | Scales with usage |
| PostgreSQL (Supabase) | $25-50 | 8 GB database |
| LiveKit | $200-500 | Real-time sessions |
| OpenAI API | $500-1000 | GPT-4o-mini + Whisper |
| AssemblyAI | $300-400 | Pronunciation scoring |
| Cloudinary | $50-100 | Asset storage + CDN |
| **Total** | **$1,175-2,250/month** | |

**Scaling Plan**:
- **0-1K users**: Use free tiers where possible (~$500/month)
- **1K-10K users**: Optimize APIs, use caching (~$2,000/month)
- **10K+ users**: Self-host LiveKit, optimize AI costs (~$5,000/month)

---

## 🔟 Performance Optimization Strategy

### Mobile App Optimization

1. **Avatar Rendering**:
   - LOD (Level of Detail) system: Reduce polygons when FPS drops
   - Texture compression: Use ASTC/ETC2 for Android, PVRTC for iOS
   - Lazy loading: Only load avatars when needed

2. **Bundle Size**:
   - Code splitting: Lazy load screens
   - Tree shaking: Remove unused code
   - Asset optimization: Compress images, use WebP

3. **Memory Management**:
   - Dispose of 3D objects when not in use
   - Limit concurrent avatars (max 1 active)
   - Use React Native's memory profiler

### Backend Optimization

1. **Caching**:
   - Redis for session data
   - Cache AI responses for common phrases
   - Cache pronunciation scores

2. **Database**:
   - Indexes on frequently queried fields
   - Connection pooling (Drizzle built-in)
   - Query optimization (avoid N+1)

3. **API Rate Limiting**:
   - Prevent abuse (Fastify rate limit plugin)
   - Per-user limits (10 requests/minute)

---

## 1️⃣1️⃣ Security & Privacy

### Privacy-First Design

1. **Computer Vision**:
   - ✅ 100% on-device processing (no video upload)
   - ✅ User consent required
   - ✅ Clear privacy policy

2. **Data Storage**:
   - ✅ Minimal data collection (only what's needed)
   - ✅ User data encrypted at rest
   - ✅ GDPR compliance (data export, deletion)

3. **Authentication**:
   - ✅ JWT tokens (already implemented)
   - ✅ Refresh token rotation
   - ✅ Secure storage (Expo SecureStore)

### Security Best Practices

1. **API Security**:
   - ✅ HTTPS only
   - ✅ CORS configuration
   - ✅ Helmet.js security headers
   - ✅ Rate limiting

2. **Input Validation**:
   - ✅ Zod schema validation
   - ✅ SQL injection prevention (Drizzle ORM)
   - ✅ XSS prevention

---

## 1️⃣2️⃣ Monitoring & Analytics

### Application Performance Monitoring (APM)

**Chosen**: Sentry (error tracking) + Mixpanel (user analytics)

**Rationale**:
- **Sentry**: Best-in-class error tracking, React Native support
- **Mixpanel**: Product analytics, user flow tracking

**Metrics to Track**:
1. **Engagement**:
   - Daily Active Users (DAU)
   - Session duration
   - Scenario completion rate

2. **Performance**:
   - App load time
   - Avatar render FPS
   - API response time

3. **Learning Outcomes**:
   - Fluency score improvement
   - Response latency reduction
   - Pronunciation accuracy

**Cost**:
- Sentry: Free tier (5K events/month) → $26/month (50K events)
- Mixpanel: Free tier (100K events/month) → $89/month (1M events)

---

## 1️⃣3️⃣ Testing Strategy

### Unit Testing
- **Framework**: Vitest (backend), Jest (mobile)
- **Coverage**: Aim for 70% coverage on critical paths
- **Focus**: Business logic, calculations (fluency score, pronunciation)

### Integration Testing
- **Backend**: Test API endpoints with supertest
- **Mobile**: Test component integration with React Native Testing Library

### E2E Testing
- **Framework**: Detox (React Native E2E)
- **Critical Paths**:
  - Onboarding flow
  - Complete a scenario
  - View progress dashboard

### Performance Testing
- **Tools**: React Native Profiler, Lighthouse (web)
- **Benchmarks**:
  - Avatar renders at 60 FPS
  - App loads in < 3 seconds
  - Memory usage < 300 MB

---

## 🎯 Decision Summary Table

| Category | Technology | Status | Priority |
|----------|-----------|--------|----------|
| **3D Rendering** | React Three Fiber + Three.js | ✅ To Implement | 🔴 Critical |
| **Avatar Models** | Ready Player Me | ✅ To Implement | 🔴 Critical |
| **Lip-Sync** | Phoneme-to-Viseme | ✅ To Implement | 🔴 Critical |
| **Computer Vision** | MediaPipe Face Mesh | ✅ To Implement | 🟡 High |
| **Speech Analysis** | Whisper + AssemblyAI | 🟡 Partial (Whisper done) | 🔴 Critical |
| **Real-Time** | LiveKit | ✅ Implemented (Backend) | 🟢 Medium |
| **AI Conversation** | OpenAI GPT-4o-mini + Gemini | ✅ Implemented | ✅ Done |
| **Database** | PostgreSQL + Drizzle ORM | ✅ Implemented | ✅ Done |
| **Mobile Framework** | Expo + React Native | ✅ Implemented | ✅ Done |
| **State Management** | Zustand | ✅ Implemented | ✅ Done |
| **Backend** | Fastify + TypeScript | ✅ Implemented | ✅ Done |
| **Hosting** | Railway / AWS | ✅ Implemented | ✅ Done |
| **Monitoring** | Sentry + Mixpanel | ❌ To Implement | 🟢 Medium |
| **Testing** | Vitest + Jest + Detox | ❌ To Implement | 🟢 Medium |

---

## ✅ Next Steps

1. **Phase 1**: Start with 3D Avatar implementation (React Three Fiber)
2. **Validate**: Test avatar rendering on target devices
3. **Iterate**: Optimize performance to 60 FPS
4. **Proceed**: Move to Phase 2 (Scenario System)

**No compromises. Choose quality over speed. Choose impact over convenience.**
