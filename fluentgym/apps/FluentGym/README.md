# FluentGym Mobile App

A beautiful, feature-rich React Native mobile application built with Expo and NativeWind for the FluentGym AI-powered learning platform.

## 🌟 Features

### Authentication & User Management
- **Email/Password Authentication** with JWT tokens
- **Email Verification** flow
- **Password Reset** functionality
- **Secure Token Storage** using Expo SecureStore
- **Auto Token Refresh** on expiration
- **Social Login Ready** (Google, Apple, GitHub)

### Home Dashboard
- **Daily Quests** with XP rewards
- **Streak Tracking** (current and longest)
- **XP Progress** visualization
- **Sessions Counter** with completion stats
- **Personalized Recommendations** based on progress
- **Quick Action Buttons** for instant practice

### AI Practice Sessions
- **Multi-Personality AI Tutors**:
  - Encouraging Mentor
  - Friendly Peer
  - Professional Coach
  - Cultural Expert
- **Real-time Chat** with AI responses
- **Speech-to-Text** using Whisper API
- **Voice Recording** with pronunciation feedback
- **Context-Aware Conversations** using semantic memory
- **Session History** persistence

### Marketplace
- **Browse Premium Skill Packs**
- **Category Filtering** (Language, Business, Travel, Culture)
- **Featured Packs** with special offers
- **Ratings & Reviews** system
- **Stripe Integration** for purchases
- **Creator Economy** support

### Progress Tracking
- **Comprehensive Stats Dashboard**
- **Weekly Activity Graph**
- **Achievement System** with badges
- **Visual Progress Indicators**

### User Profile
- **Avatar Management**
- **Profile Customization**
- **Language Preferences**
- **Privacy & Security Settings**
- **Account Management**

## 🛠️ Tech Stack

- **React Native** 0.81.5
- **Expo** ^54.0.22
- **Expo Router** ~6.0.14 (File-based routing)
- **NativeWind** 4.0 (Tailwind CSS for React Native)
- **TypeScript** ~5.9.2
- **Axios** (API client)
- **Zustand** ^4.5.0 (State management)
- **Expo Audio** ~1.0.14 (Voice recording)
- **Expo Speech** ~14.0.7 (Text-to-speech)
- **LiveKit** ^2.9.4 (Real-time audio/video)

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)
- Access to the FluentGym backend API

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd fluentgym/apps/FluentGym
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```env
API_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
```

**Important**: For physical device testing, replace `localhost` with your computer's IP address:
```env
API_URL=http://192.168.1.x:3000
```

### 3. Start the Backend API

Make sure the FluentGym backend is running:

```bash
cd ../backend-api
npm install
npm run dev
```

The backend should be accessible at `http://localhost:3000`

### 4. Start the Expo Development Server

```bash
# From fluentgym/apps/FluentGym
npm start
```

### 5. Run on Device/Simulator

Choose one of the following options:

#### iOS (Mac only)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Expo Go App
1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## 📱 App Structure

```
app/
├── (auth)/                 # Authentication screens
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   └── verify.tsx         # Email verification screen
├── (tabs)/                # Main app tabs
│   ├── _layout.tsx        # Tab navigation layout
│   ├── home.tsx           # Home dashboard
│   ├── practice.tsx       # AI practice sessions
│   ├── marketplace.tsx    # Skill packs marketplace
│   ├── progress.tsx       # Progress tracking
│   └── profile.tsx        # User profile
├── _layout.tsx            # Root layout with providers
└── index.tsx              # Initial routing screen

src/
├── api/
│   └── client.ts          # API client with all endpoints
├── components/
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── config/
│   └── env.ts             # Environment configuration
└── utils/
    └── cn.ts              # Tailwind utility
```

## 🔧 Development

### Clearing Cache

If you encounter issues:

```bash
npx expo start -c
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on correct port
- Check API_URL in `.env`
- For physical devices, use your computer's IP instead of `localhost`

### NativeWind Styles Not Applying
```bash
rm -rf node_modules .expo
npm install
npx expo start -c
```

### Metro Bundler Errors
```bash
npx expo start -c
```

## 📚 Backend Integration

This app integrates with the FluentGym backend API located at `../backend-api`. See the backend README for API documentation.

### Key API Endpoints Used

- Authentication: `/auth/*`
- User Management: `/api/v1/users/*`
- AI Conversation: `/api/v1/conversation`
- Sessions: `/api/v1/sessions/*`
- Speech: `/api/v1/speech/*`
- Progress: `/api/v1/progress/*`
- Marketplace: `/api/v1/marketplace/*`

## 🚢 Building for Production

### iOS App Store

```bash
eas build --platform ios
eas submit --platform ios
```

### Google Play Store

```bash
eas build --platform android
eas submit --platform android
```

## 📄 License

See the main repository LICENSE file.

## 🆘 Support

For issues or questions, please open an issue in the main repository.

---

**Built with ❤️ using Expo, NativeWind, and TypeScript**
