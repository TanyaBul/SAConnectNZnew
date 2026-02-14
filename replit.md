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
5. **Business Hub Tab**: Free business listings for SA families (Food & Baking, Beauty & Wellness, Home Services, etc.)
6. **Profile Tab**: View/edit family profile, kids, interests

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
- Family Photo Gallery
  - Upload up to 5 family photos per profile
  - Photos stored in /uploads/family-photos/ (filesystem, same as business logos)
  - Native file upload via FormData (multer) for iOS/Android, base64 fallback for web
  - Photo grid on Profile and FamilyDetail screens with full-screen viewer
  - Database table: family_photos
  - API endpoints: GET/POST /api/users/:userId/photos, DELETE /api/users/:userId/photos/:photoId
- App icon badge for push notifications
  - Push notifications now include badge: 1 for app icon badge on home screen
  - Badge clears automatically when user opens the app
- Added Push Notifications
  - Expo push notifications for new messages and connection requests
  - Server sends notifications via Expo Push API when messages/connections are created
  - Client registers push token on login, stored in push_tokens table
  - Notification handler shows alerts even when app is in foreground
  - API endpoints: POST/DELETE /api/push-token
  - Database table: push_tokens
  - Green badge dots on bottom tab bar for unread messages, new events, businesses, and pending connection requests
- Removed connections section from Profile screen (still visible in Discover)
- Added Business Hub feature
  - Free business listings for SA families in NZ
  - Categories: Food & Baking, Beauty & Wellness, Home Services, Health & Fitness, Education & Tutoring, Childcare, Events & Entertainment, Arts & Crafts, Professional Services, Retail, Transport, Other
  - Expandable business cards with contact details (phone, email, website)
  - Logo upload support (base64 to /uploads/business-logos/)
  - Integrated with connections/messaging system
  - Database table: businesses
  - API endpoints: GET/POST /api/businesses, PUT/DELETE /api/businesses/:id
  - Terms of Service updated with Business Hub disclaimer (section 9)
- Added Forgot Password functionality
  - 6-digit reset code system with 15-minute expiry
  - Multi-step flow: email → code verification → new password → success
  - Database table: password_reset_tokens
  - API endpoints: /api/auth/forgot-password, /api/auth/verify-reset-token, /api/auth/reset-password
  - Reset codes sent via Brevo email API (300 free emails/day)
  - Branded HTML email template with SA Connect NZ branding
  - Token no longer exposed in API response or displayed in app (app store compliant)
- Admin Dashboard restricted to saconnectnz@gmail.com only
  - Client-side: Admin section only visible to admin email in Settings
  - Server-side: Admin API endpoints verify email header for authorization
- Account deletion (App Store compliant)
  - Two-step confirmation in Settings before deletion
  - DELETE /api/users/:id endpoint removes user and all related data (cascade)
  - Deletes: family members, connections, messages, threads, events, businesses, blocks, reports, tokens
- Added block/report user functionality
  - Users can block families (removes them from Discover feed)
  - Users can report inappropriate behavior with reason selection
  - Database tables: user_blocks, user_reports
- Initial MVP build with all core screens
- Custom design system with SA/NZ-inspired colours
- Generated app icon and empty state illustrations
- Implemented authentication flow with AsyncStorage
- Added location-based family discovery
- Built messaging and community photo features
