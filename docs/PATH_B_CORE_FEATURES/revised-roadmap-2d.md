# Revised Path B Roadmap: 2D Character System

**Start Date:** 2025-11-15
**Target Completion:** 9 weeks
**End Goal:** Revolutionary language learning MVP with focus on actual fluency

---

## Phase 1: Simple 2D Character System (3 days)

### Characters
- Sofia (Spanish) - Warm, encouraging
- Marcus (Professional) - Direct, results-focused
- Yuki (Japanese) - Calm, patient
- Elena (Cultural) - Intellectual, curious
- Raj (Mentor) - Supportive, motivating

### Implementation
**Option 1: Placeholder (Start TODAY)**
- Colored circles with initials
- Different color per tutor
- Replace with art later

**Option 2: Simple Illustrations**
- Commission on Fiverr ($200-400, 1-2 weeks)
- OR AI-generate (Midjourney/DALL-E, 1 day)

### Deliverables
- [ ] Character selection screen
- [ ] Character display in conversation UI
- [ ] Different TTS voices per tutor
- [ ] Color-coded personalities

---

## Phase 2: Fluency Gate (1.5 weeks)

### The Revolutionary Feature
**3-Second Response Rule**

Users MUST respond within 3 seconds, forcing:
- Real-time thinking in target language
- Breaking translation habit
- Building genuine fluency

### Implementation
```typescript
// Countdown timer
const [timeRemaining, setTimeRemaining] = useState(3);

// Response pressure indicators
- Timer bar (visual countdown)
- Color changes (green → yellow → red)
- Sound cues (tick at 1 second)
- Haptic feedback

// Scoring
- <1s = Excellent
- 1-2s = Good
- 2-3s = Okay
- >3s = Too slow (penalty)
```

### Deliverables
- [ ] Visual countdown timer
- [ ] Response latency tracking
- [ ] Pressure mechanics (color, sound, haptic)
- [ ] Fluency scoring based on speed

---

## Phase 3: Scenario System (2 weeks)

### 8 Core Scenarios (Per Language)

1. **Restaurant Ordering**
   - Order food
   - Ask about ingredients
   - Handle special requests
   - Pay the bill

2. **Airport Navigation**
   - Check-in conversation
   - Security questions
   - Gate directions
   - Flight changes

3. **Job Interview**
   - Introduce yourself
   - Answer common questions
   - Ask about the role
   - Professional etiquette

4. **Making Friends**
   - Small talk
   - Finding common interests
   - Making plans
   - Staying in touch

5. **Shopping**
   - Ask for items
   - Negotiate prices
   - Return/exchange
   - Size and color preferences

6. **Doctor Visit**
   - Describe symptoms
   - Answer health questions
   - Understand prescriptions
   - Schedule follow-up

7. **Phone Call**
   - Answer/make calls
   - Handle unclear audio
   - Take messages
   - End politely

8. **Emergency**
   - Ask for help
   - Describe urgent situation
   - Give location
   - Stay calm under pressure

### Structure
```typescript
interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  vocabulary: string[];
  successCriteria: {
    requiredPhrases: string[];
    responseTime: number;
    fluencyScore: number;
  };
}
```

### Deliverables
- [ ] Scenario data structure
- [ ] 8 scenarios per language (start with 1 language)
- [ ] Progressive difficulty
- [ ] Success tracking
- [ ] Vocabulary hints

---

## Phase 4: Smart Corrections (1.5 weeks)

### AI-Powered Feedback

**Pronunciation Scoring**
- Use AssemblyAI or Whisper for phoneme accuracy
- Highlight problem words
- Suggest similar sounds in native language

**Grammar Correction**
- Real-time grammar analysis
- Gentle corrections (not interrupting flow)
- Pattern recognition (repeated mistakes)

**Vocabulary Suggestions**
- More natural alternatives
- Cultural context
- Formality levels

### Implementation
```typescript
interface Feedback {
  type: 'pronunciation' | 'grammar' | 'vocabulary';
  severity: 'critical' | 'moderate' | 'minor';
  message: string;
  suggestion: string;
  example?: string;
}
```

### Deliverables
- [ ] Pronunciation scoring integration
- [ ] Grammar correction system
- [ ] Vocabulary suggestions
- [ ] Feedback delivery UI (non-intrusive)

---

## Phase 5: Real Metrics (1 week)

### Replace All Fake Data

**Track:**
- Response latency (ms)
- Fluency score (speed + accuracy)
- Active vocabulary (words used correctly)
- Session quality (engagement, completion)
- Pronunciation improvement trend
- Grammar accuracy over time
- Hesitation frequency

**Display:**
- Progress charts
- Streak tracking
- Skill breakdown
- Achievement badges

### Deliverables
- [ ] Metrics calculation system
- [ ] Data persistence
- [ ] Progress dashboard
- [ ] Historical trends

---

## Phase 6: Polish (1 week)

### Production-Ready

**Onboarding:**
- Welcome flow
- Character introduction
- First scenario tutorial
- Settings walkthrough

**Settings:**
- Voice speed
- Fluency Gate difficulty
- Notification preferences
- Data privacy

**Visual Polish:**
- Smooth transitions
- Loading states
- Error handling
- Responsive design

### Deliverables
- [ ] Onboarding flow
- [ ] Settings screen
- [ ] Error states
- [ ] Loading indicators
- [ ] App icon and splash screen

---

## Timeline Summary

| Phase | Duration | Start Week | Features |
|-------|----------|------------|----------|
| Phase 1: 2D Characters | 3 days | Week 1 | Character system |
| Phase 2: Fluency Gate | 1.5 weeks | Week 1-2 | 3-second timer |
| Phase 3: Scenarios | 2 weeks | Week 3-4 | 8 real-world missions |
| Phase 4: Smart Corrections | 1.5 weeks | Week 5-6 | AI feedback |
| Phase 5: Real Metrics | 1 week | Week 7 | Progress tracking |
| Phase 6: Polish | 1 week | Week 8-9 | Production-ready |

**Total: 9 weeks**

---

## Success Metrics

### MVP Success = Users Actually Get Fluent

**Measure:**
1. Response time improves over sessions
2. Vocabulary grows (measured by unique words used correctly)
3. Pronunciation accuracy increases
4. Users complete scenarios faster over time
5. Retention: Users return daily for practice

**Avoid Vanity Metrics:**
- ❌ Time in app (could be stuck/confused)
- ❌ Messages sent (quality > quantity)
- ✅ Fluency score improvement
- ✅ Real conversations completed
- ✅ Response latency decrease

---

## Technical Stack (Simplified)

**Frontend (Mobile):**
- React Native + Expo
- Expo Router (navigation)
- Zustand (state)
- NativeWind (styling)

**Backend (Existing):**
- Fastify + PostgreSQL
- OpenAI/Gemini (AI responses)
- Whisper (speech-to-text)
- Supabase (hosting)

**New Integrations:**
- AssemblyAI OR Deepgram (pronunciation scoring)
- Character illustrations (commission or AI-generate)

**Removed:**
- ❌ Three.js
- ❌ expo-gl
- ❌ expo-three
- ❌ @react-three/fiber
- ❌ GLB loaders

---

## Exit Criteria

**Phase 1 DONE when:**
- User can select a tutor
- Character appears in conversation
- Different personalities evident

**Phase 2 DONE when:**
- 3-second timer works
- Response latency tracked
- Pressure mechanics functional

**Phase 3 DONE when:**
- 8 scenarios implemented (1 language)
- Users can complete missions
- Success criteria clear

**Phase 4 DONE when:**
- Pronunciation feedback works
- Grammar corrections appear
- Vocabulary suggestions helpful

**Phase 5 DONE when:**
- All fake data replaced
- Real progress shown
- Metrics accurate

**Phase 6 DONE when:**
- Onboarding smooth
- No critical bugs
- Ready for beta users

---

## Next Action: Start Phase 1 TODAY

**Step 1: Archive 3D Work**
```bash
mkdir -p archive/3d-avatar-exploration
git mv fluentgym/apps/FluentGym/src/components/Avatar* archive/3d-avatar-exploration/
git mv fluentgym/apps/FluentGym/src/utils/avatarLoader.ts archive/3d-avatar-exploration/
git commit -m "Archive 3D avatar exploration"
```

**Step 2: Clean Dependencies**
Remove from `package.json`:
- `@react-three/fiber`
- `@react-three/drei`
- `expo-three`
- `expo-gl`
- `three`
- `@types/three`

**Step 3: Implement Placeholder Characters**
Simple colored circles for 5 tutors:
- Sofia: #F97316 (Orange)
- Marcus: #0284c7 (Blue)
- Yuki: #ec4899 (Pink)
- Elena: #10b981 (Green)
- Raj: #eab308 (Yellow)

**Time to first character on screen: 2 hours**

---

**Status:** Ready to build
**Focus:** Core learning mechanics, not visual polish
**Timeline:** 9 weeks to revolutionary MVP
