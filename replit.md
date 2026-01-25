# SA Connect NZ

## Overview
SA Connect NZ is a mobile app for South African families living in New Zealand to connect with other SA families based on location, interests, and life stages. Built with Expo React Native + Express.js.

## Current State
MVP implementation complete with:
- User authentication (signup/signin with AsyncStorage)
- Family profile creation with kids and interests
- Location-based discovery of nearby families
- Connection requests between families
- In-app messaging system
- Community photo sharing
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
- **Primary Color**: #D84315 (warm red)
- **Secondary Color**: #00796B (teal-green)
- **Accent**: #FFA726 (sunny yellow)
- **Font**: Poppins (Google Font)
- **Theme**: Warm earth tones blending SA warmth with NZ freshness

## Key Features
1. **Onboarding**: Welcome → Sign Up → Create Profile → Location Permission
2. **Discover Tab**: Find families nearby with distance, interests, and connect
3. **Messages Tab**: Chat with connected families
4. **Community Tab**: Share and view photos
5. **Profile Tab**: View/edit family profile, kids, interests

## Running the App
- **Backend**: `npm run server:dev` (port 5000)
- **Frontend**: `npm run expo:dev` (port 8081)
- Test on device via Expo Go by scanning QR code

## Data Persistence
Currently using AsyncStorage for local data persistence. Sample families are pre-populated on first launch for demo purposes.

## Recent Changes
- Initial MVP build with all core screens
- Custom design system with SA/NZ-inspired colors
- Generated app icon and empty state illustrations
- Implemented authentication flow with AsyncStorage
- Added location-based family discovery
- Built messaging and community photo features
