# FluentAI Mobile App - Expo + NativeWind

A beautiful, feature-rich React Native mobile application built with Expo and NativeWind, designed to work seamlessly with the FluentAI backend API.

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
- **Comprehensive Stats Dashboard**:
  - Total XP earned
  - Sessions completed
  - Current streak
  - Longest streak
- **Weekly Activity Graph**
- **Achievement System** with badges
- **Visual Progress Indicators**

### User Profile
- **Avatar Management** (Ready Player Me integration ready)
- **Profile Customization**
- **Language Preferences**
- **Privacy & Security Settings**
- **Notification Preferences**
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
- **React Navigation** ^7.1.8

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)
- Access to the FluentAI backend API

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

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

Make sure the FluentAI backend is running:

```bash
cd fluentgym/apps/backend-api
npm install
npm run dev
```

The backend should be accessible at `http://localhost:3000`

### 4. Start the Expo Development Server

```bash
npm start
```

This will open the Expo DevTools in your browser.

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
2. Scan the QR code from the terminal/browser
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
    └── cn.ts              # Tailwind class name utility
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color palette:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your primary color shades
      },
      secondary: {
        // Your secondary color shades
      },
    },
  },
}
```

### UI Components

All UI components are in `src/components/ui/` and can be customized with NativeWind classes.

## 🔧 Key Features Implementation

### Authentication Flow

The app uses JWT-based authentication with automatic token refresh:

```typescript
// Login
const { login } = useAuth();
await login(email, password);

// Register
const { register } = useAuth();
await register(email, password, displayName);

// Logout
const { logout } = useAuth();
await logout();
```

### API Integration

All API endpoints are available through the `apiClient`:

```typescript
import { apiClient } from '../src/api/client';

// Send message to AI
const response = await apiClient.sendMessage(sessionId, message, personality);

// Get user progress
const progress = await apiClient.getProgress(userId);

// Transcribe audio
const transcription = await apiClient.transcribeAudio(audioUri);
```

### NativeWind Styling

Use Tailwind CSS classes directly in your components:

```tsx
<View className="flex-1 bg-gray-50 p-6">
  <Text className="text-2xl font-bold text-gray-900">
    Welcome!
  </Text>
  <Button className="mt-4 bg-primary-600">
    Get Started
  </Button>
</View>
```

## 🧪 Testing

### Running on Different Devices

**iOS Simulator**:
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Physical Device**:
1. Install Expo Go
2. Scan QR code from `npm start`
3. Make sure device is on same network as dev machine

## 🐛 Troubleshooting

### Common Issues

**1. Metro bundler errors**:
```bash
# Clear cache
npx expo start -c
```

**2. NativeWind styles not applying**:
```bash
# Rebuild with clean cache
rm -rf node_modules .expo
npm install
npx expo start -c
```

**3. API connection failed**:
- Ensure backend is running
- Check API_URL in `.env`
- For physical devices, use your computer's IP address instead of `localhost`

**4. iOS build errors**:
```bash
# Clean iOS build
cd ios
pod install
cd ..
```

**5. Android build errors**:
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

## 📚 API Endpoints Used

The app integrates with these backend endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/verify-email` - Email verification

### User Management
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update user profile

### Sessions & Practice
- `POST /api/v1/sessions` - Create practice session
- `GET /api/v1/sessions/:id` - Get session details
- `PATCH /api/v1/sessions/:id` - Update session
- `POST /api/v1/sessions/start` - Start session with greeting

### AI Conversation
- `POST /api/v1/conversation` - Send message to AI
- `GET /api/v1/personalities` - Get available personalities

### Speech Processing
- `POST /api/v1/speech/transcribe` - Transcribe audio
- `GET /api/v1/speech/voices` - Get TTS voices
- `GET /api/v1/speech/synthesize` - Text-to-speech

### Progress & Gamification
- `GET /api/v1/progress/:userId` - Get user progress
- `GET /api/v1/daily-plan` - Get daily quests

### Marketplace
- `GET /api/v1/marketplace/packs` - List marketplace packs
- `GET /api/v1/marketplace/packs/:id` - Get pack details
- `POST /api/v1/marketplace/purchase` - Purchase pack
- `POST /api/v1/marketplace/reviews` - Add review

### Memory & Context
- `POST /api/v1/memories` - Save memory
- `POST /api/v1/memories/search` - Semantic search
- `GET /api/v1/memories/recent` - Recent memories

### Avatars
- `GET /api/v1/avatars/me` - Get user avatar
- `POST /api/v1/avatars/save` - Save avatar
- `POST /api/v1/avatars/customize` - Customize avatar

## 🚢 Building for Production

### iOS App Store

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Google Play Store

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 📖 Next Steps

1. **Configure EAS Build**: Set up Expo Application Services for cloud builds
2. **Add Analytics**: Integrate analytics (e.g., Segment, Amplitude)
3. **Push Notifications**: Set up Expo Notifications
4. **Error Tracking**: Add Sentry or similar for crash reporting
5. **Performance Monitoring**: Integrate performance tracking
6. **Offline Support**: Implement offline-first architecture
7. **Deep Linking**: Configure deep links for share functionality
8. **App Store Optimization**: Add screenshots, description, keywords

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test on both iOS and Android
4. Submit a pull request

## 📄 License

See the main repository LICENSE file.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue in the GitHub repository
- Check existing issues for solutions
- Join our community Discord (if available)

---

**Built with ❤️ using Expo, NativeWind, and the FluentAI backend**
