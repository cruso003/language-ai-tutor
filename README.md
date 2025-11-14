# FluentGym - AI-Powered Learning Platform

> **A comprehensive AI-powered learning platform with multi-modal practice, real-time speech analysis, and personalized tutoring.**

FluentGym is a full-stack learning platform featuring a mobile app and backend API that leverages cutting-edge AI technologies (OpenAI GPT-4, Whisper, Gemini) to provide immersive, conversation-based learning experiences.

## 🏗️ Project Structure

This is a monorepo containing two main applications:

```
fluentgym/
├── apps/
│   ├── FluentGym/          # React Native mobile app (Expo + NativeWind)
│   └── backend-api/        # Node.js/TypeScript backend (Fastify)
```

### Mobile App (`apps/FluentGym`)
- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Zustand
- **Features**: Authentication, AI Chat, Speech Practice, Marketplace, Progress Tracking

[📱 Mobile App Documentation →](./fluentgym/apps/FluentGym/README.md)

### Backend API (`apps/backend-api`)
- **Framework**: Fastify with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Providers**: OpenAI (GPT-4o-mini, Whisper), Google Gemini
- **Real-time**: LiveKit for audio/video sessions
- **Payment**: Stripe for marketplace transactions
- **Features**: 30+ REST API endpoints, JWT auth, vector embeddings, speech processing

[🔧 Backend Documentation →](./fluentgym/apps/backend-api/README.md)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- (Optional) LiveKit account for real-time features
- (Optional) Stripe account for marketplace

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/language-ai-tutor.git
cd language-ai-tutor
```

### 2. Set Up Backend API

```bash
cd fluentgym/apps/backend-api
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Run database migrations
npm run db:migrate

# Start the backend
npm run dev
```

The backend will be available at `http://localhost:3000`

### 3. Set Up Mobile App

```bash
cd fluentgym/apps/FluentGym
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with backend URL

# Start Expo development server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## 🎯 Key Features

### For Learners

- **AI-Powered Conversations**: Chat with multiple AI personality tutors
- **Speech Practice**: Real-time transcription and pronunciation feedback
- **Gamification**: Daily quests, XP, achievements, and streak tracking
- **Progress Analytics**: Comprehensive stats and weekly activity graphs
- **Skill Packs**: Browse and purchase premium learning content
- **Live Sessions**: Real-time audio/video practice with LiveKit

### For Creators

- **Marketplace**: Sell custom skill packs
- **Revenue Sharing**: Automated payouts via Stripe
- **Content Management**: Create and manage learning scenarios
- **Analytics**: Track pack performance and reviews

### For Developers

- **Type-Safe APIs**: Full TypeScript coverage
- **Modern Stack**: React Native, Fastify, Drizzle ORM
- **Scalable Architecture**: Monorepo structure for easy maintenance
- **Multiple AI Providers**: OpenAI and Gemini with fallback logic
- **Comprehensive Documentation**: Detailed guides for all features

## 📚 Documentation

- [Mobile App Setup](./fluentgym/apps/FluentGym/README.md)
- [Backend API Documentation](./fluentgym/apps/backend-api/README.md)
- [Tech Stack Details](./TECH_STACK.md)
- [Features Roadmap](./FEATURES_ROADMAP.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)
- [Security Guide](./SECURITY_GUIDE.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)

## 🛠️ Tech Stack

### Mobile App
- React Native 0.81.5
- Expo ^54.0.22
- NativeWind (Tailwind CSS)
- TypeScript ~5.9.2
- Expo Router ~6.0.14
- Zustand ^4.5.0
- Axios for API calls
- LiveKit for real-time communication

### Backend API
- Node.js + TypeScript
- Fastify v4.28.1
- PostgreSQL + Drizzle ORM
- OpenAI SDK (GPT-4o-mini, Whisper)
- Google Gemini SDK
- LiveKit Server SDK
- Stripe for payments
- JWT authentication
- Zod validation

## 🌍 Supported Features

### Languages
- Spanish, French, German, Italian, Portuguese
- Japanese, Korean, Chinese (Mandarin)
- Easy to extend for more languages

### Learning Domains
- Language learning (primary)
- Business communication
- Travel conversations
- Cultural immersion
- Custom skill packs

### AI Capabilities
- Natural conversation
- Real-time error correction
- Pronunciation analysis
- Semantic memory (context-aware responses)
- Multi-provider support (OpenAI, Gemini)

## 📱 App Flow

```
Authentication
    ↓
Onboarding (set target language & preferences)
    ↓
Home Dashboard (quests, stats, recommendations)
    ↓
Practice Sessions (AI chat + speech)
    ↓
Progress Tracking (analytics & achievements)
```

## 🔧 Development

### Running Tests

Backend:
```bash
cd fluentgym/apps/backend-api
npm test
```

### Building for Production

Mobile App:
```bash
cd fluentgym/apps/FluentGym
eas build --platform ios
eas build --platform android
```

Backend:
```bash
cd fluentgym/apps/backend-api
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

Areas we need help:
- Additional language support
- More skill pack scenarios
- UI/UX improvements
- Performance optimizations
- Documentation improvements

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- OpenAI (GPT-4, Whisper)
- Google Gemini AI
- LiveKit for real-time communication
- Expo for mobile development
- Fastify for backend
- PostgreSQL + Drizzle ORM

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review the implementation guides

---

**Ready to start learning?** Follow the Quick Start guide above! 🚀
