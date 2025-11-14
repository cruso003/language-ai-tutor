# Path B: Core Features Checklist
## No-Compromise Feature Implementation

> **Philosophy**: "Stop collecting streaks. Start having real conversations."

This checklist represents the **non-negotiable** features that make FluentGym revolutionary, not just another language app.

---

## 🎯 Status Legend
- ✅ **Implemented & Working**
- 🟡 **Partially Implemented** (needs completion)
- ❌ **Not Implemented** (critical gap)
- 🔄 **In Progress**

---

## 1️⃣ 3D AVATAR SYSTEM (CORE VISUAL IDENTITY)

### Avatar Infrastructure
- [ ] ❌ Three.js / React Three Fiber integration in mobile app
- [ ] ❌ GLB/GLTF model loader for avatars
- [ ] ❌ 5+ culturally diverse avatar models
  - [ ] Sofia Martinez (Latina, patient teacher)
  - [ ] Alex Chen (Asian, friendly peer)
  - [ ] Marco Rossi (Italian, demanding coach)
  - [ ] Dr. Tanaka (Japanese, formal professional)
  - [ ] Jean Dupont (French, casual local)
- [ ] ❌ Avatar model optimization for mobile (< 5MB per avatar)
- [ ] ❌ Level of Detail (LOD) system for performance

### Facial Animation & Lip-Sync
- [ ] ❌ Blend shape system for facial expressions
- [ ] ❌ Real-time lip-sync from AI audio output
- [ ] ❌ Phoneme-to-viseme mapping (A, E, I, O, U, M, F, V, etc.)
- [ ] ❌ Emotional state mapping to facial expressions
  - [ ] Happy (when user succeeds)
  - [ ] Encouraging (when user struggles)
  - [ ] Neutral (listening)
  - [ ] Thinking (processing)
  - [ ] Disappointed (repeated mistakes)
- [ ] ❌ Eye contact with user (gaze tracking toward camera)
- [ ] ❌ Blink animation system
- [ ] ❌ Head movement and gestures during speech

### Cultural Accuracy
- [ ] ❌ Culture-specific hand gestures per avatar
- [ ] ❌ Posture variations (formal vs casual)
- [ ] ❌ Background environments per avatar
  - [ ] Café (Sofia)
  - [ ] Living room (Alex)
  - [ ] Gym/Training area (Marco)
  - [ ] Office (Dr. Tanaka)
  - [ ] Street café (Jean)

### Performance
- [ ] ❌ 60 FPS rendering on mid-range phones
- [ ] ❌ GPU acceleration for avatar rendering
- [ ] ❌ Memory usage < 150MB for avatar system
- [ ] ❌ Lazy loading avatars not currently in use

---

## 2️⃣ COMPUTER VISION (CORE DIFFERENTIATOR)

### Infrastructure
- [ ] ❌ MediaPipe Face Mesh integration (or TensorFlow.js)
- [ ] ❌ Camera permission handling
- [ ] ❌ Real-time video frame processing (30 FPS minimum)
- [ ] ❌ Privacy-first design (no video upload, on-device processing)

### Facial Landmark Detection
- [ ] ❌ 468-point facial mesh extraction
- [ ] ❌ Mouth region isolation (lips, jaw)
- [ ] ❌ Eye tracking (confidence detection)
- [ ] ❌ Head pose estimation

### Lip Movement Analysis
- [ ] ❌ Lip aperture measurement (mouth opening)
- [ ] ❌ Lip shape classification (A/E/I/O/U detection)
- [ ] ❌ Tongue visibility estimation (TH, L sounds)
- [ ] ❌ Jaw movement tracking
- [ ] ❌ Phoneme-specific mouth shape validation
- [ ] ❌ Visual pronunciation feedback overlay

### Emotion Recognition
- [ ] ❌ Confidence level detection (eye contact, facial tension)
- [ ] ❌ Hesitation detection (facial cues)
- [ ] ❌ Stress level indicators
- [ ] ❌ Engagement scoring

### Gesture Recognition
- [ ] ❌ Hand gesture detection (if culturally appropriate)
- [ ] ❌ Body language analysis (posture confidence)

### Feedback System
- [ ] ❌ Side-by-side comparison (user vs avatar lip movement)
- [ ] ❌ Heatmap overlay showing pronunciation accuracy
- [ ] ❌ Real-time visual cues during practice
- [ ] ❌ Post-practice replay with analysis

---

## 3️⃣ ADVANCED SPEECH ANALYSIS

### Infrastructure
- [x] ✅ Whisper API integration (already implemented)
- [ ] ❌ Phoneme-level transcription (beyond words)
- [ ] ❌ Real-time streaming transcription (not batch)
- [ ] ❌ Multi-language pronunciation dictionaries

### Pronunciation Scoring
- [ ] ❌ Phoneme accuracy scoring (0-100 per phoneme)
- [ ] ❌ Word-level pronunciation score
- [ ] ❌ Sentence-level fluency score
- [ ] ❌ Native speaker comparison algorithm
- [ ] ❌ Common mistake detection per language
  - [ ] English: TH sounds, R/L confusion
  - [ ] Spanish: Rolled R, soft vowels
  - [ ] French: Nasal vowels, silent letters
  - [ ] Japanese: Pitch accent

### Response Latency Tracking
- [ ] ❌ Time from AI question → user starts speaking
- [ ] ❌ Silence detection between words
- [ ] ❌ Filler word detection ("um", "uh", "like")
- [ ] ❌ Pause pattern analysis
- [ ] ❌ Response speed trending over time

### Fluency Metrics
- [ ] ❌ Speaking rate (words per minute)
- [ ] ❌ Hesitation count per session
- [ ] ❌ Self-correction detection
- [ ] ❌ Vocabulary range (unique words used)
- [ ] ❌ Grammatical accuracy (basic error detection)

### Feedback Generation
- [ ] ❌ AI-driven pronunciation tips
- [ ] ❌ Specific phoneme correction suggestions
- [ ] ❌ Native speaker audio samples for comparison
- [ ] ❌ Progress visualization (pronunciation improving)

---

## 4️⃣ FLUENCY GATE SYSTEM (CORE MECHANIC)

### 3-Second Rule
- [ ] ❌ Visual countdown timer (3 seconds)
- [ ] ❌ Audio warning at 2 seconds
- [ ] ❌ Auto-fail if no response after 3 seconds
- [ ] ❌ Progressive difficulty (starts at 5s, reduces to 2s)

### Response Pressure Mechanics
- [ ] ❌ Real-time pressure indicator (visual stress meter)
- [ ] ❌ Adaptive timeout based on difficulty
- [ ] ❌ "Thinking allowed" grace period for complex questions
- [ ] ❌ Pressure level affects AI tutor reaction

### Progression Blocking
- [ ] ❌ Cannot advance to next scenario until fluency threshold met
- [ ] ❌ Fluency score requirements per level
  - [ ] Beginner: 60% fluency, 5s response time
  - [ ] Intermediate: 75% fluency, 3s response time
  - [ ] Advanced: 85% fluency, 2s response time
  - [ ] Native-like: 95% fluency, 1.5s response time
- [ ] ❌ Retry mechanism with hints
- [ ] ❌ Emergency "Help" button (counts as fluency penalty)

### Pressure Levels
- [ ] ❌ **Low Pressure** - Learning new vocabulary (5-7s)
- [ ] ❌ **Medium Pressure** - Familiar scenarios (3s)
- [ ] ❌ **High Pressure** - Real-world simulation (2s)
- [ ] ❌ **Extreme Pressure** - Job interviews, negotiations (1.5s)

---

## 5️⃣ SCENARIO SYSTEM (MISSION-BASED LEARNING)

### Scenario Infrastructure
- [x] 🟡 Skill pack framework exists (backend)
- [ ] ❌ 8+ hand-crafted scenarios per language
- [ ] ❌ Scenario state management (progress, completion)
- [ ] ❌ Dynamic scenario loading from backend

### Core Scenarios (Per Language)
1. [ ] ❌ **Café Order** - Order coffee and pastries
2. [ ] ❌ **Market Negotiation** - Bargain for prices
3. [ ] ❌ **Restaurant Reservation** - Book a table, handle changes
4. [ ] ❌ **Job Interview** - Answer professional questions
5. [ ] ❌ **Doctor Visit** - Explain symptoms, understand diagnosis
6. [ ] ❌ **Hotel Check-in** - Handle reservations, requests
7. [ ] ❌ **Airport Navigation** - Ask for directions, flight info
8. [ ] ❌ **Small Talk** - Weather, hobbies, casual conversation
9. [ ] ❌ **Complaint Handling** - Return items, resolve issues
10. [ ] ❌ **Emergency Situations** - Ask for help, explain urgency

### Scenario Components
- [ ] ❌ Clear objective definition ("Order a cappuccino and croissant")
- [ ] ❌ Success criteria (must-have phrases, vocabulary)
- [ ] ❌ Failure conditions (timeout, too many mistakes)
- [ ] ❌ Cultural context notes
- [ ] ❌ Vocabulary list for scenario
- [ ] ❌ Grammar patterns required
- [ ] ❌ Difficulty rating (1-5 stars)

### Dynamic Difficulty
- [ ] ❌ AI adjusts speaking speed based on user level
- [ ] ❌ Scenario complexity increases with user progress
- [ ] ❌ Vocabulary density adjustment
- [ ] ❌ Curveball questions (unexpected twists)

### Scenario Feedback
- [ ] ❌ Real-time objective progress indicator
- [ ] ❌ Post-scenario performance report
- [ ] ❌ Missed vocabulary highlights
- [ ] ❌ Cultural mistakes flagged
- [ ] ❌ Replay option with annotations

---

## 6️⃣ AI TUTOR PERSONALITIES (BEHAVIORAL DEPTH)

### Infrastructure
- [x] ✅ Backend has 6 personalities defined
- [ ] ❌ Mobile app personality switching
- [ ] ❌ Personality-specific system prompts
- [ ] ❌ Behavioral consistency enforcement

### Sofia Martinez (Patient Teacher)
- [ ] ❌ Speaks 20% slower than native speed
- [ ] ❌ Uses simple vocabulary and grammar
- [ ] ❌ Frequent encouragement ("¡Muy bien!", "Keep going!")
- [ ] ❌ Repeats phrases if user struggles
- [ ] ❌ Never shows frustration
- [ ] ❌ Provides hints before corrections

### Alex Chen (Friendly Peer)
- [ ] ❌ Casual language and slang
- [ ] ❌ Shares personal stories
- [ ] ❌ Uses humor and jokes
- [ ] ❌ Normal speaking speed
- [ ] ❌ Makes relatable mistakes intentionally
- [ ] ❌ Celebrates small wins enthusiastically

### Marco Rossi (Demanding Coach)
- [ ] ❌ Speaks at native speed (no slowdown)
- [ ] ❌ High standards, minimal praise
- [ ] ❌ Pushes for perfect pronunciation
- [ ] ❌ Points out mistakes immediately
- [ ] ❌ Uses challenging vocabulary
- [ ] ❌ "Again!" for incorrect responses
- [ ] ❌ Tough love approach

### Dr. Tanaka (Formal Professional)
- [ ] ❌ Business/professional vocabulary
- [ ] ❌ Formal grammar structures
- [ ] ❌ Respectful, professional tone
- [ ] ❌ Technical language for job interviews
- [ ] ❌ Cultural etiquette enforcement
- [ ] ❌ No casual slang

### Jean Dupont (Casual Local)
- [ ] ❌ Heavy use of slang and idioms
- [ ] ❌ Regional accents
- [ ] ❌ Fast, natural speech
- [ ] ❌ Interruptions and overlapping speech
- [ ] ❌ Real-world messiness (background noise in prompts)
- [ ] ❌ Cultural references

### Lena Schmidt (Storyteller)
- [ ] ❌ Teaches through stories and narratives
- [ ] ❌ Uses metaphors and analogies
- [ ] ❌ Patient but intellectually stimulating
- [ ] ❌ Contextual learning approach
- [ ] ❌ Historical and cultural depth

---

## 7️⃣ REAL-TIME METRICS (NO FAKE DATA)

### Response Latency
- [ ] ❌ Measure time from AI finish → user speech start
- [ ] ❌ Track per-session average latency
- [ ] ❌ Historical latency trends (weekly, monthly)
- [ ] ❌ Latency by scenario type
- [ ] ❌ Benchmark against native speaker speed

### Hesitation Detection
- [ ] ❌ Count of pauses > 1 second
- [ ] ❌ Filler word frequency
- [ ] ❌ False starts (began speaking, stopped, restarted)
- [ ] ❌ Hesitation heatmap (which phrases cause hesitation)

### Accuracy Metrics
- [ ] ❌ Pronunciation accuracy (phoneme-level)
- [ ] ❌ Grammar accuracy (basic error detection)
- [ ] ❌ Vocabulary appropriateness (context match)
- [ ] ❌ Cultural appropriateness score

### Fluency Score Calculation
```
Fluency Score = (
  Response Speed (40%) +
  Pronunciation (30%) +
  Confidence (20%) +
  Vocabulary Range (10%)
)
```
- [ ] ❌ Implement weighted scoring algorithm
- [ ] ❌ Daily fluency score trending
- [ ] ❌ Scenario-specific fluency benchmarks

### Active Vocabulary Tracking
- [ ] ❌ Track words user has SPOKEN (not just seen)
- [ ] ❌ Active vocabulary count (used in last 30 days)
- [ ] ❌ Passive vocabulary (recognized but not used)
- [ ] ❌ New words learned per week
- [ ] ❌ Word retention rate

### Metrics Dashboard
- [ ] ❌ Real-time fluency score display
- [ ] ❌ Weekly progress charts (actual data, not fake)
- [ ] ❌ Strengths/weaknesses breakdown
- [ ] ❌ Comparison to previous week
- [ ] ❌ Goal progress tracking (e.g., "Reach 80% fluency")

---

## 8️⃣ LIVEKIT REAL-TIME INTEGRATION

### Infrastructure
- [x] ✅ LiveKit server SDK (backend)
- [x] ✅ LiveKit client SDK (mobile)
- [ ] ❌ Room creation and joining flow
- [ ] ❌ Token minting for secure access

### Audio Streaming
- [ ] ❌ Low-latency audio transmission (< 150ms)
- [ ] ❌ Echo cancellation
- [ ] ❌ Noise suppression
- [ ] ❌ Automatic gain control
- [ ] ❌ Audio quality indicators

### Video Streaming (for Computer Vision)
- [ ] ❌ User video stream to backend (for analysis)
- [ ] ❌ Avatar video stream to user (rendered avatar)
- [ ] ❌ Video quality adaptation based on network
- [ ] ❌ Bandwidth optimization

### Session Recording
- [ ] ❌ Record practice sessions for playback
- [ ] ❌ Store recordings with metadata
- [ ] ❌ Replay with annotations (mistakes highlighted)
- [ ] ❌ Export recordings for sharing (optional)

### Real-Time Data Channels
- [ ] ❌ Send pronunciation feedback via data channel
- [ ] ❌ Send response latency metrics
- [ ] ❌ Send scenario progress updates
- [ ] ❌ Send visual cues (show avatar emotion change)

---

## 9️⃣ SMART CORRECTIONS (AI FEEDBACK)

### Correction Philosophy
- [ ] ❌ **Never interrupt** - corrections AFTER user finishes
- [ ] ❌ **Weave corrections** into next AI response naturally
- [ ] ❌ **Prioritize** - fix critical mistakes, ignore minor ones
- [ ] ❌ **Sandwich method** - praise → correction → encouragement

### Correction Types
- [ ] ❌ **Pronunciation** - "I heard 'sank you', try 'thank you'"
- [ ] ❌ **Grammar** - "Good! You can also say 'I am hungry' instead of 'I have hungry'"
- [ ] ❌ **Vocabulary** - "Nice! A more natural word here is 'grab' instead of 'take'"
- [ ] ❌ **Cultural** - "That phrase is a bit too formal for this casual situation"

### Correction Delivery
- [ ] ❌ Visual indicator (highlight corrected phrase)
- [ ] ❌ Audio replay (AI demonstrates correct pronunciation)
- [ ] ❌ Written correction in chat history
- [ ] ❌ Option to retry immediately

### Adaptive Correction Frequency
- [ ] ❌ Beginners: Correct only critical mistakes (20%)
- [ ] ❌ Intermediate: Moderate corrections (50%)
- [ ] ❌ Advanced: Detailed corrections (80%)
- [ ] ❌ User can adjust correction aggressiveness

---

## 🔟 MOBILE UX ENHANCEMENTS

### Practice Screen Redesign
- [ ] ❌ Full-screen avatar (immersive mode)
- [ ] ❌ Minimal UI during conversation
- [ ] ❌ Floating microphone button
- [ ] ❌ Visual response timer
- [ ] ❌ Live transcription display
- [ ] ❌ Avatar emotional reactions to user performance

### Scenario Selection UI
- [ ] ❌ Visual scenario cards with previews
- [ ] ❌ Difficulty indicators (stars)
- [ ] ❌ Completion status (locked, in-progress, completed)
- [ ] ❌ XP rewards display
- [ ] ❌ Estimated time to complete

### Onboarding Flow
- [ ] ❌ Voice test (check microphone quality)
- [ ] ❌ Camera permission request (explain computer vision)
- [ ] ❌ Avatar preview (show all tutors)
- [ ] ❌ Fluency Gate explanation (demo the 3-second rule)
- [ ] ❌ First scenario tutorial (guided practice)

### Home Screen Improvements
- [ ] ❌ Remove fake/meaningless stats
- [ ] ❌ Show REAL metrics (response latency, fluency score)
- [ ] ❌ Daily scenario recommendations
- [ ] ❌ Active vocabulary count
- [ ] ❌ Next milestone progress

### Recommended Sessions (Currently Broken)
- [ ] ❌ Connect button to scenario selection
- [ ] ❌ AI-driven recommendations based on weaknesses
- [ ] ❌ Difficulty progression logic

### Progress Screen
- [ ] ❌ Replace fake data with real metrics
- [ ] ❌ Weekly fluency score chart (real data)
- [ ] ❌ Pronunciation improvement trend
- [ ] ❌ Response latency trend
- [ ] ❌ Scenario completion history

---

## 1️⃣1️⃣ BACKEND ENHANCEMENTS

### Speech Analysis Endpoints
- [ ] ❌ POST `/api/v1/speech/analyze-pronunciation`
- [ ] ❌ POST `/api/v1/speech/compare-phonemes`
- [ ] ❌ GET `/api/v1/speech/pronunciation-history/:userId`
- [ ] ❌ POST `/api/v1/speech/fluency-score`

### Metrics Endpoints
- [ ] ❌ POST `/api/v1/metrics/response-latency`
- [ ] ❌ POST `/api/v1/metrics/hesitation-count`
- [ ] ❌ GET `/api/v1/metrics/fluency-score/:sessionId`
- [ ] ❌ GET `/api/v1/metrics/user-dashboard/:userId`

### Scenario Endpoints
- [ ] ❌ GET `/api/v1/scenarios/by-language/:language`
- [ ] ❌ POST `/api/v1/scenarios/start-session`
- [ ] ❌ PUT `/api/v1/scenarios/update-progress/:sessionId`
- [ ] ❌ POST `/api/v1/scenarios/complete/:sessionId`
- [ ] ❌ GET `/api/v1/scenarios/recommendations/:userId`

### Computer Vision Endpoints
- [ ] ❌ POST `/api/v1/vision/analyze-lip-movement` (optional - prefer on-device)
- [ ] ❌ POST `/api/v1/vision/emotion-score`

### AI Personality Enforcement
- [ ] ❌ Personality-specific system prompts in conversation endpoint
- [ ] ❌ Behavioral validation (ensure AI follows personality traits)
- [ ] ❌ A/B testing framework for prompt tuning

---

## 1️⃣2️⃣ QUALITY ASSURANCE

### Performance Benchmarks
- [ ] ❌ Avatar renders at 60 FPS on iPhone 12 / Samsung S21
- [ ] ❌ Computer vision processes at 30 FPS minimum
- [ ] ❌ Response latency < 500ms (AI response start)
- [ ] ❌ App load time < 3 seconds
- [ ] ❌ Memory usage < 300MB total

### Testing Coverage
- [ ] ❌ Unit tests for speech analysis algorithms
- [ ] ❌ Integration tests for LiveKit sessions
- [ ] ❌ E2E tests for complete scenario flow
- [ ] ❌ Performance tests on mid-range devices
- [ ] ❌ Accessibility testing (voice-over support)

### User Testing
- [ ] ❌ Beta testing with 20+ users
- [ ] ❌ A/B test Fluency Gate vs. no gate
- [ ] ❌ Measure completion rates per scenario
- [ ] ❌ Collect feedback on AI personalities
- [ ] ❌ Validate pronunciation feedback accuracy

---

## 📊 SUMMARY

### Critical Path (Must-Have for MVP)
1. **3D Avatars** - Visual identity, lip-sync
2. **Fluency Gate** - Core mechanic (3-second rule)
3. **Scenario System** - 8+ scenarios per language
4. **Real Metrics** - Response latency, fluency score, real data
5. **AI Personalities** - Distinct behaviors, not just names

### Tier 2 (Next Priority)
6. **Computer Vision** - Lip movement analysis, emotion detection
7. **Advanced Speech Analysis** - Phoneme-level pronunciation scoring
8. **LiveKit Integration** - Real-time audio/video
9. **Smart Corrections** - Contextual AI feedback

### Tier 3 (Polish)
10. **Mobile UX Enhancements** - Immersive UI, onboarding
11. **Backend Enhancements** - Additional endpoints
12. **Quality Assurance** - Testing, performance optimization

---

## ✅ Completion Criteria

**This app is NOT ready until:**
- [ ] A user can have a conversation with a 3D avatar
- [ ] The avatar's lips move in sync with speech
- [ ] The app enforces the 3-second response rule
- [ ] Real pronunciation feedback is provided
- [ ] 8+ scenarios exist per language with objectives
- [ ] Real metrics (not fake data) are displayed
- [ ] AI tutors behave distinctly different from each other

**No compromises. No shortcuts. Revolutionary or nothing.**
