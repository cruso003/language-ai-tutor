# Path B: Core Features Roadmap
## Revolutionary Development Timeline

> **Mission**: Build the features that make FluentGym impossible to replicate.

---

## 🎯 Development Philosophy

1. **No Compromise** - Every feature must match the vision
2. **Quality Over Speed** - Better to ship late than ship mediocre
3. **Vertical Slices** - Complete one feature fully before moving to next
4. **User Testing** - Validate each phase with real users before proceeding
5. **Performance First** - 60 FPS avatars or nothing

---

## 📅 Timeline Overview

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **Phase 0** | ✅ COMPLETE | Foundation (Auth, Backend, Basic UI) | Done |
| **Phase 1** | 8 weeks | 3D Avatars + Lip-Sync | 🔜 Next |
| **Phase 2** | 6 weeks | Scenario System + Fluency Gate | Pending |
| **Phase 3** | 8 weeks | Advanced Speech Analysis | Pending |
| **Phase 4** | 10 weeks | Computer Vision Integration | Pending |
| **Phase 5** | 6 weeks | AI Personality Depth | Pending |
| **Phase 6** | 6 weeks | LiveKit Real-Time Sessions | Pending |
| **Phase 7** | 4 weeks | Metrics & Analytics | Pending |
| **Phase 8** | 4 weeks | Polish & Optimization | Pending |
| **Phase 9** | 3 weeks | Beta Testing & Iteration | Pending |

**Total Estimated Time**: **~12 months** (55 weeks) to MVP

---

## Phase 0: Foundation ✅ COMPLETE

**Duration**: Already completed
**Goal**: Solid technical foundation

### What Was Built
- ✅ Backend API (Fastify + Drizzle ORM)
- ✅ PostgreSQL database with comprehensive schema
- ✅ JWT authentication + user management
- ✅ Mobile app structure (Expo + NativeWind)
- ✅ Basic conversation API (OpenAI + Gemini)
- ✅ Whisper speech-to-text integration
- ✅ Semantic memory system (pgvector embeddings)
- ✅ Skill pack framework (multi-domain)
- ✅ LiveKit infrastructure (not yet used in mobile)

### Current State
The app has a **solid foundation** but lacks the **core differentiators**.

---

## Phase 1: 3D Avatars + Lip-Sync (8 weeks)

**Priority**: 🔴 CRITICAL - This is the visual identity
**Goal**: Users see a 3D avatar that speaks with synchronized lip movements

### Week 1-2: Research & Setup
- [ ] Evaluate 3D libraries for React Native
  - [ ] **Option A**: React Three Fiber (Three.js for React Native)
  - [ ] **Option B**: Expo GL + raw Three.js
  - [ ] **Option C**: Unity WebGL bridge (overkill?)
- [ ] Choose avatar source
  - [ ] **Option A**: Ready Player Me (customizable, GLB export)
  - [ ] **Option B**: Mixamo characters (free, pre-rigged)
  - [ ] **Option C**: Custom 3D artist commission ($$$)
- [ ] Performance benchmarking on target devices
  - [ ] iPhone 12 / 13 / 14
  - [ ] Samsung Galaxy S21 / S22
  - [ ] Mid-range Android (minimum viable device)
- [ ] Decision: Choose library and avatar source

### Week 3-4: Basic Avatar Rendering
- [ ] Set up React Three Fiber in mobile app
- [ ] Load and render first GLB avatar (Sofia Martinez)
- [ ] Basic camera setup (fixed angle, good lighting)
- [ ] LOD (Level of Detail) system for performance
- [ ] Memory optimization (< 150MB for avatar)
- [ ] Achieve 60 FPS on target devices

**Milestone**: Static 3D avatar renders beautifully at 60 FPS

### Week 5-6: Facial Animation System
- [ ] Implement blend shapes for facial expressions
  - [ ] Happy, Sad, Neutral, Thinking, Surprised
- [ ] Eye blinking animation (random intervals)
- [ ] Eye contact system (look at camera/user)
- [ ] Head movement (subtle nods, tilts)
- [ ] Test emotional transitions (smooth interpolation)

**Milestone**: Avatar shows emotions and feels alive

### Week 7-8: Lip-Sync Implementation
- [ ] **Option A**: Phoneme-based lip-sync
  - [ ] Map AI audio to phonemes using speech recognition
  - [ ] Map phonemes to visemes (mouth shapes)
  - [ ] Implement viseme blending (A/E/I/O/U/M/F/V)
- [ ] **Option B**: Audio-driven lip-sync
  - [ ] Use audio amplitude to drive jaw movement
  - [ ] Less accurate but simpler
- [ ] Sync lip movement with AI audio playback
- [ ] Fine-tune timing (no lag or lead)
- [ ] Test with different speech speeds

**Milestone**: Avatar's lips move in sync when AI speaks

### Phase 1 Deliverables
- ✅ 5 avatars (Sofia, Alex, Marco, Dr. Tanaka, Jean)
- ✅ Lip-sync working with AI audio
- ✅ Emotional facial expressions
- ✅ 60 FPS performance on mid-range devices
- ✅ Eye contact and natural idle animations

**Exit Criteria**: A user can have a conversation with Sofia and her lips move perfectly in sync.

---

## Phase 2: Scenario System + Fluency Gate (6 weeks)

**Priority**: 🔴 CRITICAL - Core learning mechanic
**Goal**: Mission-based learning with response pressure

### Week 1-2: Scenario Infrastructure
- [ ] Design scenario data model (expand skill packs)
- [ ] Create scenario manager (state machine)
- [ ] Build scenario selection UI (card-based)
- [ ] Implement scenario progress tracking
- [ ] Create scenario completion logic
- [ ] Scenario unlock system (linear progression)

### Week 3-4: Hand-Craft 8 Core Scenarios (Spanish First)
1. [ ] **Café Order** - "Order a cappuccino and croissant"
2. [ ] **Market Negotiation** - "Buy 3 apples, negotiate price"
3. [ ] **Restaurant Reservation** - "Book table for 2 at 7 PM"
4. [ ] **Doctor Visit** - "Explain you have a headache"
5. [ ] **Hotel Check-in** - "Check in, request room change"
6. [ ] **Airport Navigation** - "Find gate B12"
7. [ ] **Small Talk** - "Discuss the weather and weekend plans"
8. [ ] **Complaint** - "Return a broken phone charger"

For each scenario:
- [ ] Define clear objective
- [ ] Success criteria (must-say phrases)
- [ ] Failure conditions
- [ ] Vocabulary list (20-30 words)
- [ ] Cultural notes
- [ ] AI tutor script (dynamic but guided)

### Week 5-6: Fluency Gate Implementation
- [ ] Build response timer UI (countdown from 3 seconds)
- [ ] Visual stress indicator (color changes)
- [ ] Audio warning at 2 seconds remaining
- [ ] Auto-fail logic (no response after timeout)
- [ ] Progressive difficulty system
  - [ ] Level 1: 5 seconds
  - [ ] Level 2: 4 seconds
  - [ ] Level 3: 3 seconds
  - [ ] Level 4: 2 seconds
- [ ] "Thinking allowed" grace period for complex questions
- [ ] Retry mechanism with hints
- [ ] Fluency score calculation per scenario

**Milestone**: User completes "Café Order" scenario with 3-second pressure

### Phase 2 Deliverables
- ✅ 8 scenarios for Spanish (expandable to other languages)
- ✅ Fluency Gate working (3-second rule enforced)
- ✅ Scenario progress tracking
- ✅ Visual objective indicators during practice
- ✅ Post-scenario performance report

**Exit Criteria**: A user can order coffee in Spanish under 3-second pressure and receive meaningful feedback.

---

## Phase 3: Advanced Speech Analysis (8 weeks)

**Priority**: 🟡 HIGH - Core metric for fluency
**Goal**: Phoneme-level pronunciation feedback

### Week 1-2: Research & Architecture
- [ ] Evaluate pronunciation APIs
  - [ ] **Option A**: OpenAI Whisper + custom phoneme extraction
  - [ ] **Option B**: Google Cloud Speech-to-Text (phoneme confidence)
  - [ ] **Option C**: AssemblyAI (pronunciation assessment)
  - [ ] **Option D**: Azure Speech Services (pronunciation scoring)
- [ ] Build pronunciation dictionary per language
  - [ ] Spanish: 24 consonants, 5 vowels
  - [ ] French: Nasal vowels, silent letters
  - [ ] English: TH sounds, R/L distinction
- [ ] Design feedback UI (heatmap, waveform comparison)

### Week 3-4: Phoneme Extraction
- [ ] Integrate chosen pronunciation API
- [ ] Extract phoneme-level transcription
- [ ] Map phonemes to IPA (International Phonetic Alphabet)
- [ ] Build phoneme accuracy scoring algorithm
- [ ] Test accuracy with native speakers (baseline)

### Week 5-6: Response Latency & Hesitation Detection
- [ ] Implement precise timing
  - [ ] Measure: AI finishes speaking → user starts speaking
  - [ ] Measure: Pauses between words
  - [ ] Measure: Filler words ("um", "uh", "like")
- [ ] Build hesitation detection algorithm
  - [ ] Silence detection (> 1 second = hesitation)
  - [ ] False start detection (started, stopped, restarted)
- [ ] Store metrics in database (per session)
- [ ] Build latency trending (weekly, monthly)

### Week 7-8: Fluency Metrics & Feedback
- [ ] Calculate fluency score
  ```
  Fluency = (
    Response Speed * 0.4 +
    Pronunciation * 0.3 +
    Confidence * 0.2 +
    Vocabulary Range * 0.1
  )
  ```
- [ ] Build AI-driven correction system
  - [ ] Detect common mistakes per language
  - [ ] Generate specific pronunciation tips
  - [ ] Provide native speaker audio samples
- [ ] Build visual feedback UI
  - [ ] Phoneme heatmap (green = good, red = needs work)
  - [ ] Waveform comparison (user vs. native)
  - [ ] Pronunciation improvement trend chart

**Milestone**: User receives "Your 'R' sound needs work - watch this" feedback

### Phase 3 Deliverables
- ✅ Phoneme-level pronunciation scoring
- ✅ Response latency tracking (real-time)
- ✅ Hesitation detection and counting
- ✅ Fluency score calculation
- ✅ AI-driven pronunciation feedback
- ✅ Visual feedback UI (heatmaps, trends)

**Exit Criteria**: A user can see exactly which sounds they struggle with and track improvement over time.

---

## Phase 4: Computer Vision Integration (10 weeks)

**Priority**: 🟡 HIGH - Unique differentiator
**Goal**: Analyze user's lip movement and compare to avatar

### Week 1-2: Research & Privacy Design
- [ ] Evaluate computer vision libraries
  - [ ] **Option A**: MediaPipe Face Mesh (Google, free, on-device)
  - [ ] **Option B**: TensorFlow.js Facemesh
  - [ ] **Option C**: Azure Face API (requires cloud upload - privacy concern)
- [ ] Design privacy-first architecture
  - [ ] **All processing on-device** (no video upload to server)
  - [ ] Video frames never leave the device
  - [ ] Only metadata sent to backend (landmark coordinates)
- [ ] Performance benchmarking (target: 30 FPS)

### Week 3-4: Facial Landmark Detection
- [ ] Integrate MediaPipe Face Mesh
- [ ] Extract 468-point facial mesh in real-time
- [ ] Isolate mouth region (landmarks 0-17, 61-68)
- [ ] Isolate eyes (for confidence detection)
- [ ] Optimize performance (reduce to 30 FPS if needed)
- [ ] Test on various skin tones and lighting conditions

### Week 5-6: Lip Movement Analysis
- [ ] Measure lip aperture (mouth opening height)
- [ ] Classify lip shapes (A, E, I, O, U, M, F, V)
- [ ] Detect tongue visibility (for TH, L sounds)
- [ ] Measure jaw movement
- [ ] Build phoneme-specific validation
  - [ ] "TH" requires tongue between teeth
  - [ ] "M" requires closed lips
  - [ ] "A" requires wide mouth opening

### Week 7-8: Visual Feedback System
- [ ] Side-by-side comparison UI
  - [ ] Left: User's face (with landmark overlay)
  - [ ] Right: Avatar's face (correct pronunciation)
- [ ] Heatmap overlay on user's face
  - [ ] Green = correct lip position
  - [ ] Red = incorrect lip position
- [ ] Real-time visual cues during practice
  - [ ] "Open your mouth wider for 'A'"
  - [ ] "Close your lips for 'M'"

### Week 9-10: Emotion & Confidence Detection
- [ ] Eye contact detection (gaze direction)
- [ ] Facial tension analysis (stress indicators)
- [ ] Confidence level scoring
  - [ ] High confidence: direct eye contact, relaxed face
  - [ ] Low confidence: looking away, tense face
- [ ] Engagement scoring (are they paying attention?)
- [ ] Integrate emotion score into fluency metrics

**Milestone**: User sees their face vs. avatar face, understands lip position errors

### Phase 4 Deliverables
- ✅ Real-time facial landmark detection (30 FPS)
- ✅ Lip movement analysis and validation
- ✅ Side-by-side comparison UI
- ✅ Visual pronunciation feedback
- ✅ Confidence and engagement detection
- ✅ Privacy-first on-device processing

**Exit Criteria**: A user can practice the "TH" sound and see real-time feedback on tongue position.

---

## Phase 5: AI Personality Depth (6 weeks)

**Priority**: 🟢 MEDIUM - Makes practice feel human
**Goal**: Each AI tutor behaves distinctly, not just named differently

### Week 1-2: Personality System Prompts
- [ ] Write detailed system prompts for each tutor
  - [ ] Sofia Martinez (Patient Teacher)
    - [ ] Speaks 20% slower than native
    - [ ] Uses simple grammar
    - [ ] Frequent encouragement
    - [ ] Never shows frustration
  - [ ] Alex Chen (Friendly Peer)
    - [ ] Casual slang
    - [ ] Shares stories
    - [ ] Uses humor
  - [ ] Marco Rossi (Demanding Coach)
    - [ ] Native speed (no slowdown)
    - [ ] High standards
    - [ ] Minimal praise
    - [ ] "Again!" for mistakes
  - [ ] Dr. Tanaka (Formal Professional)
    - [ ] Business vocabulary
    - [ ] Formal grammar
    - [ ] Cultural etiquette
  - [ ] Jean Dupont (Casual Local)
    - [ ] Heavy slang
    - [ ] Regional accent
    - [ ] Fast speech
  - [ ] Lena Schmidt (Storyteller)
    - [ ] Teaches through stories
    - [ ] Metaphors and analogies

### Week 3-4: Behavioral Validation
- [ ] Build prompt testing framework
- [ ] A/B test personality prompts with users
- [ ] Measure personality consistency
  - [ ] Does Marco ALWAYS push hard?
  - [ ] Does Sofia NEVER show frustration?
- [ ] Refine prompts based on feedback
- [ ] Build personality-specific correction styles
  - [ ] Sofia: "That's good! Try this instead..."
  - [ ] Marco: "Wrong. Say it again."

### Week 5-6: Avatar-Personality Integration
- [ ] Link avatars to personalities (visual + behavioral)
- [ ] Personality-specific emotional reactions
  - [ ] Marco frowns when you hesitate
  - [ ] Sofia smiles encouragingly
- [ ] Personality-specific speaking speed
  - [ ] Sofia: 0.8x speed
  - [ ] Marco/Jean: 1.2x speed
- [ ] Background environments per personality
  - [ ] Sofia: Cozy classroom
  - [ ] Marco: Gym
  - [ ] Dr. Tanaka: Office
  - [ ] Jean: Outdoor café

**Milestone**: Users clearly feel the difference between Sofia and Marco

### Phase 5 Deliverables
- ✅ 6 distinct AI personality system prompts
- ✅ Behavioral consistency enforcement
- ✅ Personality-specific correction styles
- ✅ Avatar-personality integration
- ✅ User testing validates perceived differences

**Exit Criteria**: A user can articulate "Sofia is patient and helpful, but Marco pushes me hard."

---

## Phase 6: LiveKit Real-Time Sessions (6 weeks)

**Priority**: 🟢 MEDIUM - Enables real-time features
**Goal**: Low-latency audio/video sessions with avatars

### Week 1-2: LiveKit Mobile Integration
- [ ] Integrate LiveKit SDK in mobile app
- [ ] Build room creation flow
- [ ] Implement token minting (backend)
- [ ] Join room with audio permissions
- [ ] Test audio streaming (< 150ms latency)

### Week 3-4: Real-Time Audio Processing
- [ ] Stream user audio to backend
- [ ] Implement echo cancellation
- [ ] Noise suppression
- [ ] Automatic gain control
- [ ] Audio quality indicators (network strength)

### Week 5-6: Avatar Streaming (Optional)
- [ ] Stream avatar video to user (if rendering on backend)
  - [ ] **Alternative**: Render avatar locally (better performance)
- [ ] Use data channels for:
  - [ ] Real-time pronunciation feedback
  - [ ] Response latency metrics
  - [ ] Scenario progress updates
  - [ ] Avatar emotion changes
- [ ] Session recording for playback
- [ ] Bandwidth optimization (adaptive quality)

**Milestone**: User has real-time conversation with avatar via LiveKit

### Phase 6 Deliverables
- ✅ LiveKit rooms working in mobile app
- ✅ Low-latency audio streaming (< 150ms)
- ✅ Real-time data channels for feedback
- ✅ Session recording and playback
- ✅ Network resilience (handles poor connections)

**Exit Criteria**: A user can practice in real-time with < 150ms audio latency.

---

## Phase 7: Metrics & Analytics (4 weeks)

**Priority**: 🟢 MEDIUM - Replaces fake data
**Goal**: Real, meaningful metrics displayed in UI

### Week 1-2: Backend Metrics Endpoints
- [ ] Build metrics aggregation service
- [ ] Create endpoints:
  - [ ] `GET /api/v1/metrics/fluency-dashboard/:userId`
  - [ ] `GET /api/v1/metrics/response-latency/:userId`
  - [ ] `GET /api/v1/metrics/pronunciation-history/:userId`
  - [ ] `GET /api/v1/metrics/vocabulary-growth/:userId`
- [ ] Implement caching (Redis) for performance
- [ ] Real-time metrics updates via WebSocket (optional)

### Week 3-4: Mobile UI Dashboards
- [ ] Replace fake data in Progress screen
- [ ] Build real fluency score chart (weekly)
- [ ] Build response latency trend chart
- [ ] Build pronunciation improvement chart
- [ ] Build active vocabulary count
- [ ] Build scenario completion history
- [ ] Show strengths/weaknesses breakdown
  - [ ] "Your 'R' pronunciation improved 15% this week!"
  - [ ] "Your response time is 20% faster than last month!"

**Milestone**: Progress screen shows 100% real data

### Phase 7 Deliverables
- ✅ Backend metrics aggregation
- ✅ Real-time metrics endpoints
- ✅ Mobile UI dashboards with real data
- ✅ Weekly/monthly trend charts
- ✅ Strengths/weaknesses insights

**Exit Criteria**: A user can see their actual fluency score improve over time (no fake data).

---

## Phase 8: Polish & Optimization (4 weeks)

**Priority**: 🟢 MEDIUM - Make it beautiful
**Goal**: Immersive, bug-free experience

### Week 1-2: Mobile UX Polish
- [ ] Full-screen immersive practice mode
- [ ] Minimal UI during conversation (hide everything)
- [ ] Smooth avatar transitions (fade in/out)
- [ ] Loading states (skeleton screens)
- [ ] Error states (graceful failure)
- [ ] Offline mode (basic chat without internet)
- [ ] Haptic feedback (success, failure)
- [ ] Sound effects (subtle, non-intrusive)

### Week 3-4: Performance Optimization
- [ ] Profile app performance (React Native Profiler)
- [ ] Reduce bundle size (code splitting)
- [ ] Optimize avatar rendering (reduce draw calls)
- [ ] Optimize database queries (add indexes)
- [ ] Implement lazy loading for scenarios
- [ ] Reduce memory usage (avatar LOD improvements)
- [ ] Battery optimization (reduce CPU usage)

**Milestone**: App feels fast, smooth, and polished

### Phase 8 Deliverables
- ✅ Immersive practice UI
- ✅ App loads in < 3 seconds
- ✅ Avatars render at 60 FPS consistently
- ✅ Memory usage < 300MB
- ✅ Battery drain acceptable (< 10%/hour)

**Exit Criteria**: The app feels as polished as Duolingo but way more immersive.

---

## Phase 9: Beta Testing & Iteration (3 weeks)

**Priority**: 🔴 CRITICAL - Validate assumptions
**Goal**: Real users validate the product

### Week 1: Beta Recruitment
- [ ] Recruit 50 beta testers
  - [ ] 20 beginners (A1-A2)
  - [ ] 20 intermediate (B1-B2)
  - [ ] 10 advanced (C1-C2)
- [ ] Set up feedback channels (Discord, Typeform)
- [ ] Install analytics (Mixpanel, Amplitude)
- [ ] Crash reporting (Sentry)

### Week 2: Beta Testing
- [ ] Monitor usage patterns
- [ ] Track completion rates per scenario
- [ ] Measure fluency score improvements
- [ ] Collect qualitative feedback
  - [ ] "Was the 3-second rule too stressful?"
  - [ ] "Did the avatar feel lifelike?"
  - [ ] "Were the corrections helpful?"

### Week 3: Iteration
- [ ] Fix critical bugs
- [ ] Adjust Fluency Gate timing (if too hard/easy)
- [ ] Refine AI personality prompts
- [ ] Improve pronunciation feedback clarity
- [ ] Optimize performance based on real devices

**Milestone**: 80% of beta testers complete at least 3 scenarios

### Phase 9 Deliverables
- ✅ 50 beta testers actively using the app
- ✅ Critical bugs fixed
- ✅ Fluency Gate tuned for optimal difficulty
- ✅ Pronunciation feedback validated
- ✅ Analytics dashboard tracking KPIs

**Exit Criteria**: Beta testers say "This is way better than Duolingo."

---

## 🚀 MVP Launch Criteria

**The app is ready for public launch when:**

### Core Features Working
- ✅ 3D avatars with perfect lip-sync
- ✅ 8+ scenarios per language (Spanish first)
- ✅ 3-second Fluency Gate enforced
- ✅ Real pronunciation feedback (phoneme-level)
- ✅ Real metrics displayed (no fake data)
- ✅ 6 distinct AI personalities

### Performance Benchmarks Met
- ✅ 60 FPS avatar rendering
- ✅ < 150ms audio latency (LiveKit)
- ✅ < 3-second app load time
- ✅ < 300MB memory usage
- ✅ Works on iPhone 12 and Samsung S21 minimum

### User Validation
- ✅ 80% scenario completion rate
- ✅ Average session duration > 10 minutes
- ✅ Fluency scores improve 20% after 10 sessions
- ✅ Net Promoter Score (NPS) > 50

### Business Readiness
- ✅ Stripe payments working (marketplace)
- ✅ Privacy policy and terms of service
- ✅ GDPR compliance (data export/deletion)
- ✅ Crash rate < 1%
- ✅ App Store / Google Play approval

---

## 🛠️ Resource Requirements

### Team Composition (Ideal)
- **1x Full-Stack Engineer** - Backend + mobile
- **1x 3D Artist** - Avatar creation and optimization
- **1x ML Engineer** - Computer vision + speech analysis (optional, can use APIs)
- **1x UI/UX Designer** - Mobile app design
- **1x QA Engineer** - Testing and bug reporting (part-time)

### Infrastructure Costs (Estimated Monthly)
- **Backend Hosting** (AWS/Railway): $100-200/month
- **PostgreSQL Database** (Supabase/Neon): $25-50/month
- **LiveKit** (real-time): $200-500/month (scales with users)
- **OpenAI API** (GPT-4o-mini + Whisper): $500-1000/month
- **Pronunciation API** (Azure/Google): $200-400/month
- **CDN + Storage** (Cloudinary): $50-100/month
- **Total**: **~$1,075 - $2,250/month** (varies with usage)

### One-Time Costs
- **Avatar 3D Models** - $500-1000 per avatar (5 avatars = $2,500-5,000)
- **Sound Design** - $500-1,000 (UI sounds, success/fail audio)
- **Illustrations** - $1,000-2,000 (onboarding, scenario previews)
- **Total**: **~$4,000 - $8,000**

---

## ⚠️ Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| **Avatars don't run at 60 FPS on mid-range phones** | Use aggressive LOD, reduce polygon count, consider 30 FPS fallback |
| **Lip-sync is not accurate enough** | Start with audio-driven jaw movement, upgrade to phoneme-based later |
| **Computer vision doesn't work in low light** | Require good lighting, show warning to user |
| **Speech analysis API is too expensive** | Cache results, batch requests, consider self-hosted Whisper |
| **LiveKit latency is too high** | Optimize server location, use WebRTC TURN servers |

### Product Risks
| Risk | Mitigation |
|------|------------|
| **3-second rule is too stressful** | Make it adaptive (start at 5s, reduce to 3s), allow "chill mode" |
| **Users don't see improvement** | Show granular metrics (phoneme-level), celebrate small wins |
| **AI personalities feel the same** | A/B test prompts, validate with user interviews |
| **Not enough scenarios** | Start with 8, add 2 new scenarios per month post-launch |

---

## 📈 Success Metrics (Post-Launch)

### Engagement
- **Daily Active Users (DAU)**: 40% of MAU
- **Average Session Duration**: > 15 minutes
- **Sessions per Week**: > 3
- **Scenario Completion Rate**: > 70%

### Learning Outcomes
- **Fluency Score Improvement**: +20% after 10 sessions
- **Response Latency Reduction**: -30% after 20 sessions
- **Pronunciation Accuracy**: +25% after 15 sessions

### Retention
- **Day 1 Retention**: > 60%
- **Day 7 Retention**: > 40%
- **Day 30 Retention**: > 20%

### Revenue (Post-MVP)
- **Conversion to Paid**: > 5% (freemium model)
- **Average Revenue Per User (ARPU)**: > $10/month
- **Churn Rate**: < 10%/month

---

## 🎯 Next Steps

1. **Review this roadmap** with the team
2. **Prioritize Phase 1** (3D Avatars) as the starting point
3. **Set up weekly sprints** (2-week cycles)
4. **Assign ownership** of each phase
5. **Begin Phase 1, Week 1** (Research & Setup)

**No compromises. Let's build revolutionary.**
