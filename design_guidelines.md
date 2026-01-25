# SA Connect NZ - Design Guidelines

## Brand Identity

**Purpose**: SA Connect NZ helps South African families in New Zealand find and connect with other SA families based on location, interests, and life stages. It's a digital gathering place for families far from home.

**Aesthetic Direction**: Warm gathering place - blending African warmth with New Zealand freshness. The design feels like a cozy community center: welcoming, approachable, and culturally resonant. Think earthy, grounded, human.

**Memorable Element**: Subtle African-inspired patterns as card backgrounds/borders (geometric, warm) paired with NZ-inspired organic shapes. The combination creates a unique visual identity that honors both cultures without being cliché.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Discover** (map pin icon) - Find families nearby
- **Messages** (message icon) - Chat with connections
- **Community** (users icon) - Shared photos/stories
- **Profile** (person icon) - Your family profile

**Authentication**: Required (Apple Sign-In for iOS, Google Sign-In for Android)
- Onboarding flow: Welcome → Sign Up → Create Family Profile → Location Permission → Complete
- Profile creation collects: Family name, bio, kids (names/ages), interests (tags), profile photo

## Screen-by-Screen Specifications

### Onboarding Screens (Stack-Only)

**Welcome Screen**
- Full-screen hero illustration showing diverse SA families in NZ landscape
- App name and tagline centered
- "Get Started" button (bottom, primary color)
- Safe area: top: insets.top + 48, bottom: insets.bottom + 24

**Sign Up Screen**
- Header: transparent, left: back button
- Apple/Google Sign-In buttons (center)
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
- Map view (top 50% of screen) showing family locations as custom pins
- Bottom sheet (draggable): List of families sorted by distance, cards with rounded corners
- Family card: Profile photo circle (earth-tone border), family name (bold), distance, interests tags (3 max), "Connect" button
- Empty state: "No families nearby yet" with illustration
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Filter Modal** (triggered from Discover)
- Header: title "Filters", left: Cancel, right: Apply
- Form: Radius slider (1-50km), Kids age range checkboxes, Interests multi-select, Suburb dropdown
- Safe area: top: 16, bottom: insets.bottom + 16

**Family Detail Screen** (from Discover card tap)
- Header: default navigation, title: family name, right: message icon
- Scrollable content: Large profile photo, bio, kids section (name/age cards), interests tags, shared photos grid (2 columns), "Send Connection Request" button (if not connected)
- Safe area: top: 16, bottom: insets.bottom + 24

**Messages Tab**
- Header: default navigation, title "Messages", right: none
- List of conversations: Profile photo circle, family name, last message preview, timestamp, unread badge
- Empty state: "No messages yet" with illustration
- Safe area: top: 16, bottom: tabBarHeight + 16

**Chat Screen** (from Messages tap)
- Header: custom, left: back, center: family name + profile photo, right: info icon
- Message bubbles (sent: primary color, received: surface color), rounded corners
- Input bar (bottom): text input, send button
- Safe area: top: 16, bottom: insets.bottom + 16 (input bar handles own spacing)

**Community Tab**
- Header: transparent, title "Community", right: add photo icon
- Grid of shared photos (2 columns, rounded corners, soft shadow)
- Each photo card: Profile photo overlay (bottom-left corner), family name, timestamp
- Empty state: "No photos shared yet" with illustration
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Photo Detail Modal** (from Community tap)
- Full-screen photo with dark overlay
- Header: left: close, right: none
- Bottom: Family name, caption, likes/comments count, like button
- Safe area: top: insets.top + 16, bottom: insets.bottom + 16

**Profile Tab**
- Header: transparent, title "Your Family", right: settings icon
- Scrollable content: Large profile photo (editable), family name (editable), bio, kids cards, interests tags, "Edit Profile" button
- Safe area: top: headerHeight + 16, bottom: tabBarHeight + 16

**Settings Screen** (from Profile settings icon)
- Header: default navigation, title "Settings", left: back
- List: Notifications toggle, Privacy settings, Account (nested), Help & Support, Log Out
- Safe area: top: 16, bottom: insets.bottom + 16

**Account Screen** (nested under Settings)
- Header: default navigation, title "Account", left: back
- List: Email, Password change, Delete account (red text, at bottom)
- Safe area: top: 16, bottom: insets.bottom + 16

## Color Palette

**Primary**: #D84315 (warm red, SA-inspired)
**Secondary**: #00796B (teal-green, NZ nature)
**Accent**: #FFA726 (sunny yellow)
**Background**: #F5F3F0 (warm off-white)
**Surface**: #FFFFFF (white cards)
**Text Primary**: #3E2723 (deep charcoal)
**Text Secondary**: #795548 (coffee brown)
**Border**: #D7CCC8 (light earth tone)
**Error**: #C62828
**Success**: #388E3C

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

- Cards: 16px corner radius, subtle shadow (shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 3)
- Avatar circles: 4px earth-tone (#D7CCC8) border
- Buttons: 12px corner radius, pressed state darkens background 10%
- Subtle African geometric pattern as watermark on empty states (low opacity)
- All touchable components have visual feedback (opacity 0.7 on press)
- Floating action button (if used): shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

## Assets to Generate

1. **icon.png** - App icon with SA + NZ fusion (perhaps a family silhouette with subtle pattern), warm colors
2. **splash-icon.png** - Simplified version of app icon for launch screen
3. **welcome-hero.png** - Diverse SA families in NZ landscape (mountains, greenery), warm and welcoming, WHERE USED: Welcome screen
4. **empty-discover.png** - Map with single family icon, subtle pattern, WHERE USED: Discover tab empty state
5. **empty-messages.png** - Message bubble with heart, warm colors, WHERE USED: Messages tab empty state
6. **empty-community.png** - Photo frame with family silhouette, WHERE USED: Community tab empty state
7. **location-permission.png** - Map with multiple family pins, inviting, WHERE USED: Location permission screen
8. **avatar-preset-1.png** - Default family avatar option (earthy, geometric pattern)
9. **avatar-preset-2.png** - Alternative family avatar (warm, organic shapes)
10. **avatar-preset-3.png** - Third family avatar option (SA-inspired motif)

All assets should use the defined color palette and feel warm, human, and culturally respectful.