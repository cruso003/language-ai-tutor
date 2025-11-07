# FluentAI - Revolutionary Language Learning App

> **Stop collecting streaks. Start having real conversations.**

FluentAI is not another language learning app with gamified lessons and multiple-choice questions. It's a **conversation gym** powered by GPT-4.0 and LiveKit that forces you to **actually speak** from Day 1.

## 🎯 The Problem We're Solving

Traditional language apps give you:

- ✅ 200-day streaks
- ✅ Thousands of vocabulary words memorized
- ✅ Perfect grammar exercises
- ❌ The ability to hold a simple conversation

**FluentAI focuses on what matters: Can you DO this in real life?**

## 🚀 Game-Changing Features

### 1. **Real-Time Conversation Missions**

No multiple choice. No translation exercises. You're thrown into real scenarios:

- Order coffee at a café in Paris
- Negotiate prices at a Tokyo market
- Handle a job interview in Spanish
- Explain your symptoms to a German doctor

**You must speak to complete the mission.**

### 2. **AI Tutors with Real Personalities**

Choose from multiple AI personalities:

- 👩‍🏫 **Sofia Martinez** - Patient teacher who speaks slowly
- 🧑 **Alex Chen** - Friendly peer for casual practice
- 👨‍💼 **Marco Rossi** - Demanding coach who pushes you hard
- 👔 **Dr. Tanaka** - Formal professional for business contexts
- 🙋 **Jean Dupont** - Casual local who uses real slang

Each personality adapts to YOUR level and interests.

### 3. **Live Speech Analysis**

- Real-time pronunciation feedback
- Fluency metrics (response latency = how fast you respond)
- Hesitation pattern detection
- Automatic error correction in context

### 4. **The Fluency Gate**

You can't move forward until you respond within 3 seconds. We're training **automaticity**, not memorization.

### 5. **Immersive Scenarios**

Every scenario is built around YOUR interests:

- Love gaming? Discuss AI in Spanish
- Into cooking? Learn culinary vocabulary through recipes
- Business professional? Practice negotiations in Japanese

### 6. **Smart Corrections Without Breaking Flow**

- AI catches your mistakes naturally
- Works correct forms into responses
- Real-time grammar explanations on demand
- No lesson interruptions

### 7. **Progress That Matters**

We don't track:

- ❌ Streak days
- ❌ XP points
- ❌ Vocabulary cards reviewed

We track:

- ✅ Can you order coffee in under 30 seconds?
- ✅ Can you handle interruptions?
- ✅ Can you debate current events?
- ✅ **Can you function in the real world?**

## 🏗️ Technical Architecture

### Tech Stack

```
Frontend:
- React Native (Expo) + TypeScript
- Expo Router for navigation
- Zustand for state management
- React Native Reanimated for animations

AI & Voice:
- GPT-4.0 Turbo for conversation engine
- Whisper for speech-to-text
- LiveKit for real-time audio/video
- expo-audio for audio recording and playback
- Custom speech analysis algorithms

Storage:
- AsyncStorage for local data
- Progress tracking and metrics
```

### Core Services

#### `AIConversationService`

The brain of the app. Handles:

- Dynamic scenario generation
- Personality-based responses
- Real-time grammar correction
- Difficulty adaptation
- Cultural context injection
- Session completion evaluation

#### `SpeechAnalysisService`

Analyzes your speech:

- Transcription via Whisper
- Pronunciation scoring
- Response latency tracking
- Hesitation detection
- Words-per-minute calculation

#### `LiveKitService`

Real-time communication:

- Audio streaming
- Video for visual feedback
- Multi-speaker support (future)
- Low-latency voice

### Key Features Implementation

#### Scenario System

```typescript
// 8 hand-crafted scenarios across difficulty levels
// From "Order Coffee" (beginner) to "Business Negotiation" (advanced)
// Each with specific objectives, vocabulary, and cultural notes
```

#### Dynamic Difficulty

```typescript
// AI analyzes your responses in real-time
// Adjusts complexity based on:
// - Response speed
// - Error patterns
// - Vocabulary range
// - Grammar accuracy
```

#### Metrics That Matter

```typescript
interface ConversationMetrics {
  responseLatency: number; // Speed = fluency
  hesitationCount: number; // Confidence indicator
  errorRate: number; // Accuracy
  vocabularyUsed: number; // Active vocabulary
  fluencyScore: number; // Overall score (0-100)
}
```

## 📱 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- OpenAI API key (GPT-4 access)
- LiveKit account (optional for full features)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/language-ai-tutor.git
cd language-ai-tutor
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

4. **Start the development server**

```bash
npm start
```

5. **Run on your device**

- iOS: Press `i` or scan QR code with Expo Go
- Android: Press `a` or scan QR code with Expo Go
- Web: Press `w`

### Production Deployment

**IMPORTANT**: For production, move API keys to a backend server. Never expose OpenAI keys in a mobile app.

Recommended architecture:

```
Mobile App → Your Backend API → OpenAI/LiveKit
```

## 🎨 App Flow

```
1. Onboarding
   ↓
   Choose target language & level
   ↓
   Select interests
   ↓
2. Home Screen
   ↓
   Browse scenarios
   ↓
   Select AI personality
   ↓
3. Conversation Screen
   ↓
   Speak → AI responds → Get corrections
   ↓
   Complete objectives
   ↓
4. Results Screen
   ↓
   Fluency score + Detailed feedback
   ↓
   Next steps recommendations
```

## 🧠 How It Works

### 1. **Scenario Loading**

When you start a mission:

```typescript
// AI receives:
- Your proficiency level
- Target language
- Scenario objectives
- AI personality traits
- Your interests

// AI becomes the character (barista, interviewer, etc.)
```

### 2. **Real-Time Conversation**

```
You speak → Whisper transcribes → GPT-4 responds
                              ↓
                        Analyzes for corrections
                              ↓
                      Checks objective completion
```

### 3. **Smart Correction**

```typescript
// Instead of stopping you:
You: "I want the big coffee" (error)
AI: "Of course! Would you like the LARGE coffee
     with milk or without?" (natural correction)
```

### 4. **Progress Evaluation**

```typescript
// After session:
- Response latency analyzed
- Error patterns identified
- Vocabulary usage calculated
- Fluency score generated (0-100)
- Personalized recommendations
```

## 🌍 Supported Languages

Currently supported:

- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese (Mandarin)

Easy to add more - just update the `LANGUAGES` constant!

## 📊 Metrics & Analytics

### What We Track

- **Response Latency**: Time from AI prompt to your response (fluency indicator)
- **Hesitation Count**: Number of pauses (confidence measure)
- **Error Rate**: Grammar/vocab mistakes per exchange
- **Vocabulary Range**: Unique words used
- **Scenario Completion**: Did you achieve the objectives?

### What We DON'T Track

- Streak days (creates false motivation)
- XP points (meaningless gamification)
- Lessons completed (quantity over quality)

## 🔮 Future Features

### Phase 2

- [ ] Multi-speaker scenarios (group conversations)
- [ ] Video analysis for lip reading and body language
- [ ] Cultural immersion mode (slang, idioms, local context)
- [ ] Accent training with regional variations
- [ ] Conversation speed challenges

### Phase 3

- [ ] Live language exchange matching
- [ ] Custom scenario creator
- [ ] Voice cloning for personalized tutors
- [ ] AR integration for environmental learning
- [ ] Offline mode with cached AI responses

## 🤝 Contributing

This is a revolutionary approach to language learning. Contributions welcome!

Areas we need help:

- Additional scenario creation
- More language support
- Speech analysis algorithms
- UI/UX improvements
- Backend API for production

## 📝 License

MIT License - Build amazing things with this!

## 🙏 Credits

Built with:

- GPT-4.0 by OpenAI
- LiveKit for real-time communication
- Expo for cross-platform development
- Whisper for speech recognition

## 💬 Philosophy

> "You don't become fluent by knowing 10,000 words. You become fluent by speaking 10,000 times under real pressure."

This app is designed to get you speaking. Imperfectly. Messily. Under pressure. **Just like real life.**

No streaks. No points. Just conversation.

---

**Ready to actually speak?** Install FluentAI and start your first mission. 🚀
