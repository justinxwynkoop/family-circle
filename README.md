# FamilyCircle

A free, open-source family location sharing app — a self-hosted alternative to Life360. Share real-time location with family and friends through private circles, with no subscription fees.

## Features

- **Real-time location sharing** — see family members on a live map
- **Private circles** — invite family via a 6-digit code sent over SMS
- **Cross-platform** — iOS and Android from a single codebase
- **Battery-aware** — background location updates with adaptive polling
- **Push notifications** — alerts when members arrive or leave places
- **100% free** — runs on Supabase's free tier for typical family use

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 52) |
| Language | TypeScript |
| Navigation | React Navigation v6 |
| Map | react-native-maps |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Real-time sync | Supabase real-time subscriptions |
| Background GPS | expo-location + expo-task-manager |
| Push notifications | Expo Notifications |
| SMS invites | Expo SMS (native, no cost) |

## Project Structure

```
family-circle/
├── mobile/                 # React Native Expo app
│   ├── App.tsx             # Root component & auth gate
│   ├── app.json            # Expo config
│   └── src/
│       ├── navigation/     # Stack & tab navigators
│       ├── screens/
│       │   ├── auth/       # Login, Register
│       │   └── main/       # Map, Circle, Settings
│       ├── components/     # MemberMarker, MemberCard
│       ├── services/       # Supabase client, auth, circle, location
│       ├── hooks/          # useAuth, useCircle, useLocation
│       └── types/          # Shared TypeScript types
├── supabase/
│   └── schema.sql          # Database schema — run this in Supabase SQL editor
└── README.md
```

## Database Schema (Supabase / PostgreSQL)

```
users         — id, display_name, email, photo_url, circle_ids[]
circles       — id, name, owner_id, invite_code, invite_expiry, member_ids[]
circle_members — circle_id, user_id, display_name, joined_at
locations     — user_id (PK), circle_id, latitude, longitude, speed, updated_at
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone (for development)
- A [Supabase](https://supabase.com) account (free)

### 1. Clone the repo

```bash
git clone https://github.com/justinxwynkoop/family-circle.git
cd family-circle/mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, open `supabase/schema.sql` from this repo and click **Run** — this creates all tables and security rules
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**
4. Open `mobile/src/services/supabase.ts` and paste them in:

```ts
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

5. In Supabase, go to **Authentication → Providers** and make sure **Email** is enabled

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

### 5. Build for production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## Invite Flow

1. Circle owner taps **Circle** tab → **Send via SMS** — app generates a 6-digit code with a 24-hour expiry
2. Code is sent via your phone's native SMS app (no third-party cost)
3. Recipient opens the app, enters the code → gets added to the circle
4. Location sharing begins automatically in the background

## Contributing

Pull requests are welcome. For major changes, open an issue first.

## License

[MIT](LICENSE)
