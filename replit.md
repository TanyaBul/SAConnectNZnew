# SA Connect NZ

## Overview
SA Connect NZ is a mobile app for South African families living in New Zealand to connect with other SA families based on location, interests, and life stages. Built with Expo React Native + Express.js.

## Current State
MVP implementation complete with:
- User authentication (signup/signin with AsyncStorage)
- Family profile creation with family members (names + ages) and interests
- Location-based discovery of nearby families
- Connection requests between families
- In-app messaging system
- Events tab for community events (braais, playdates, etc.)
- Settings and profile editing

## Project Structure
```
client/
├── App.tsx                 # Root app with providers
├── components/             # Reusable UI components
│   ├── Avatar.tsx          # Profile avatar with edit badge
│   ├── Button.tsx          # Primary button component
│   ├── Card.tsx            # Card container
│   ├── ConversationItem.tsx # Message list item
│   ├── EmptyState.tsx      # Empty state with illustrations
│   ├── FamilyCard.tsx      # Family profile card
│   ├── HeaderTitle.tsx     # Navigation header with logo
│   ├── Input.tsx           # Form input field
│   ├── InterestTag.tsx     # Interest selection tags
│   ├── MessageBubble.tsx   # Chat message bubble
│   └── ThemedText/View.tsx # Themed components
├── constants/
│   └── theme.ts            # Colors, spacing, typography
├── context/
│   └── AuthContext.tsx     # Authentication state
├── hooks/                  # Custom hooks
├── lib/
│   ├── query-client.ts     # API client
│   └── storage.ts          # AsyncStorage helpers & sample data
├── navigation/             # React Navigation setup
│   ├── RootStackNavigator.tsx
│   ├── AuthStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── *StackNavigator.tsx
└── screens/                # App screens
    ├── WelcomeScreen.tsx
    ├── SignUpScreen.tsx
    ├── SignInScreen.tsx
    ├── CreateProfileScreen.tsx
    ├── LocationPermissionScreen.tsx
    ├── DiscoverScreen.tsx
    ├── FamilyDetailScreen.tsx
    ├── MessagesScreen.tsx
    ├── ChatScreen.tsx
    ├── CommunityScreen.tsx
    ├── ProfileScreen.tsx
    ├── EditProfileScreen.tsx
    └── SettingsScreen.tsx

server/
├── index.ts                # Express server entry
├── routes.ts               # API routes
└── storage.ts              # Storage interface

assets/images/              # Generated app assets
```

## Design System
- **Primary Color**: #0D9488 (teal - trust, connection)
- **Secondary Color**: #64748B (slate gray - neutral)
- **Accent**: #06B6D4 (cyan - fresh, modern)
- **Font**: Poppins (Google Font)
- **Theme**: Clean, modern, and welcoming with neutral teal-focused palette

## Key Features
1. **Onboarding**: Welcome → Sign Up → Create Profile → Location Permission
2. **Discover Tab**: Find families nearby with distance, interests, and connect
3. **Messages Tab**: Chat with connected families
4. **Events Tab**: Create and browse community events (braais, playdates, sports, etc.)
5. **Profile Tab**: View/edit family profile, kids, interests

## Running the App
- **Backend**: `npm run server:dev` (port 5000)
- **Frontend**: `npm run expo:dev` (port 8081)
- Test on device via Expo Go by scanning QR code

## Data Persistence
Full PostgreSQL database integration with Drizzle ORM:
- Users table with bcrypt password hashing for secure authentication
- Family members linked to user profiles
- Connections system for family-to-family requests
- Message threads and messages for private chat
- Events with full CRUD operations

All data persists server-side - no more demo/sample data.

## Recent Changes
- Initial MVP build with all core screens
- Custom design system with SA/NZ-inspired colors
- Generated app icon and empty state illustrations
- Implemented authentication flow with AsyncStorage
- Added location-based family discovery
- Built messaging and community photo features
