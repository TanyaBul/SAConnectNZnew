# SA Connect NZ - Design Guidelines

## Brand Identity

**Purpose**: SA Connect NZ helps South African families in New Zealand find and connect with other SA families based on location, interests, and life stages. It's a digital gathering place for families far from home.

**Aesthetic Direction**: Warm, welcoming, and community-focused. The design uses warm orange as the primary color to evoke the warmth of Africa, paired with teal to represent New Zealand's natural beauty. The overall feel is inviting and culturally connected.

**Design Philosophy**: Minimal and functional. Focus on usability and clarity over decorative elements. The app should feel like a trusted community platform, accessible to all.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Discover** (compass icon) - Find families nearby
- **Messages** (message icon) - Chat with connections
- **Community** (image icon) - Shared photos/stories
- **Profile** (user icon) - Your family profile

**Authentication**: Required
- Onboarding flow: Welcome → Sign Up → Create Family Profile → Location Permission → Complete
- Profile creation collects: Family name, bio, kids (names/ages), interests (tags), profile photo

## Screen-by-Screen Specifications

### Onboarding Screens (Stack-Only)

**Welcome Screen**
- Clean hero illustration with abstract family connection imagery
- App name and tagline centered
- "Get Started" button (bottom, teal primary color)
- Safe area: top: insets.top + 48, bottom: insets.bottom + 24

**Sign Up Screen**
- Header: transparent, left: back button
- Form fields for family name, email, password
- Privacy policy and terms links (bottom, small text)
- Safe area: top: headerHeight + 24, bottom: insets.bottom + 24

**Create Profile Screen**
- Header: default navigation, title "Your Family Profile", right: Skip
- Scrollable form with fields: Family name, Bio textarea, Profile photo picker, Add kids section (repeatable), Interests multi-select tags
- Submit button below form
- Safe area: top: 16, bottom: insets.bottom + 24

**Location Permission Screen**
- Illustration of map with families
- Explanation text
- "Enable Location" button
- "Maybe Later" text button
- Safe area: top: insets.top + 48, bottom: insets.bottom + 24

### Main App Screens (Tab Navigation)

**Discover Tab**
- Header: transparent, title "Discover Families", right: filter icon
- List of families sorted by distance, clean card design
- Family card: Profile photo circle, family name (bold), distance, interests tags (3 max), "Connect" button
- Empty state: "No families nearby yet" with illustration
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Family Detail Screen** (from Discover card tap)
- Header: default navigation, title: family name
- Scrollable content: Large profile photo, bio, kids section (name/age cards), interests tags, "Send Connection Request" button (if not connected)
- Safe area: top: 16, bottom: insets.bottom + 24

**Messages Tab**
- Header: default navigation, title "Messages"
- List of conversations: Profile photo circle, family name, last message preview, timestamp, unread badge
- Empty state: "No messages yet" with illustration
- Safe area: top: 16, bottom: tabBarHeight + 16

**Chat Screen** (from Messages tap)
- Header: custom, left: back, center: family name + profile photo
- Message bubbles (sent: teal primary, received: light gray)
- Input bar (bottom): text input, send button
- Safe area: top: 16, bottom: insets.bottom + 16

**Community Tab**
- Header: transparent, title "Community", right: add photo icon
- Grid of shared photos (2 columns, rounded corners)
- Each photo card: Profile photo overlay (bottom-left corner), family name, timestamp
- Empty state: "No photos shared yet" with illustration
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Profile Tab**
- Header: transparent, title "Your Family", right: settings icon
- Scrollable content: Large profile photo (editable), family name (editable), bio, kids cards, interests tags, "Edit Profile" button
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Settings Screen** (from Profile settings icon)
- Header: default navigation, title "Settings", left: back
- List: Notifications toggle, Privacy settings, Account (nested), Help & Support, Log Out
- Safe area: top: 16, bottom: insets.bottom + 16

## Color Palette

**Primary**: #E8703A (warm orange - Africa sunset, energy)
**Secondary**: #1A7F7F (teal - New Zealand, connection)
**Accent**: #F5A623 (golden orange - warmth, community)
**Background**: #F0F9F9 (soft teal white)
**Surface**: #FFFFFF (white cards)
**Background Secondary**: #E8F5F5 (light teal)
**Text Primary**: #1E293B (slate dark)
**Text Secondary**: #64748B (slate gray)
**Border**: #C5E0E0 (teal border)
**Error**: #DC2626
**Success**: #16A34A

**Brand Story**: Colors inspired by the logo - warm orange/red represents Africa's sunset and warmth, while teal represents New Zealand's natural beauty and connection between continents.

## Typography

**Font**: Poppins (Google Font)
**Type Scale**:
- Title Large: Poppins SemiBold, 28pt
- Title: Poppins SemiBold, 22pt
- Heading: Poppins Medium, 18pt
- Body: Poppins Regular, 16pt
- Caption: Poppins Regular, 14pt
- Small: Poppins Regular, 12pt

## Visual Design

- Cards: 16px corner radius, subtle shadow (shadowOpacity: 0.06)
- Avatar circles: 2px light border (#E2E8F0)
- Buttons: 12px corner radius, pressed state darkens background 10%
- Clean, minimal empty states with simple illustrations
- All touchable components have visual feedback (opacity 0.7 on press)
- Floating action button (if used): subtle shadow

## Assets

1. **icon.png** - App logo featuring Africa and New Zealand forming a heart with family figures
2. **splash-icon.png** - Same as app icon for brand consistency
3. **welcome-hero.png** - Abstract illustration of connection/community
4. **empty-discover.png** - Simple map illustration
5. **empty-messages.png** - Message bubble illustration
6. **empty-community.png** - Photo frame illustration
7. **location-permission.png** - Map with location pins illustration

All assets should use the defined color palette and feel clean, modern, and welcoming.
