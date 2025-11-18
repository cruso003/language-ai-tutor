# FluentGym Web App

Web application for FluentGym - an AI-powered language learning platform.

## Features

- **Authentication**: Login, register, and user management
- **Dashboard**: Overview of learning progress and stats
- **Practice Sessions**: Interactive AI-powered conversations
  - Scenario selection (restaurant, airport, job interview, etc.)
  - Tutor personality selection
  - Real-time chat interface
  - Fluency Gate challenge (3-second response timer)
  - Key phrases and vocabulary hints
- **Progress Tracking**: View session history and learning metrics
- **Profile Settings**: Manage account and preferences
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (via contexts)
- **API Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on http://localhost:3001

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FluentGym
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── practice/          # Practice session page
│   ├── profile/           # Profile settings page
│   ├── progress/          # Progress tracking page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── FluencyGate.tsx   # 3-second response timer
│   ├── Navbar.tsx        # Navigation bar
│   ├── ScenarioSelector.tsx
│   └── TutorSelector.tsx
├── contexts/             # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Dark mode state
├── config/              # Configuration files
│   ├── personalities.ts # AI tutor personalities
│   └── scenarios.ts     # Practice scenarios
├── lib/                 # Utilities
│   ├── api-client.ts   # API client
│   └── utils.ts        # Helper functions
└── types/              # TypeScript types
    └── index.ts
```

## Features by Page

### Dashboard
- Quick stats (streak, sessions, time, fluency)
- Quick action cards
- Recent session history

### Practice
- 3-step flow: Scenario → Tutor → Chat
- 8 real-world scenarios
- 6 AI tutor personalities
- Fluency Gate challenge
- Real-time corrections
- Key phrases and vocabulary

### Progress
- Total sessions and time
- Average fluency score
- Complete session history with metrics

### Profile
- Account information
- Theme preferences
- Learning settings

## API Endpoints Used

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/sessions` - Create practice session
- `GET /api/v1/sessions` - Get session history
- `POST /api/v1/conversation` - Send message to AI tutor
- `GET /api/v1/stats` - Get dashboard stats

## Contributing

This is part of the FluentGym monorepo. See the main README for contribution guidelines.

## License

MIT
