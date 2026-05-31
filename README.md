# FamilyCircle

A free, open-source family location sharing app — a self-hosted alternative to Life360. Share real-time location with family and friends through private circles, with no subscription fees.

## Features

- **Real-time location sharing** — see family members on a live map
- **Private circles** — invite family via a 6-digit code sent over SMS
- **Cross-platform** — iOS and Android from a single codebase
- **Battery-aware** — background location updates with adaptive polling
- **Push notifications** — alerts when members arrive or leave places
- **100% free** — runs on Firebase's free tier for typical family use

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 52) |
| Language | TypeScript |
| Navigation | React Navigation v6 |
| Map | react-native-maps |
| Backend / Auth | Firebase (Firestore + Auth) |
| Real-time sync | Firestore live listeners |
| Background GPS | expo-location + expo-task-manager |
| Push notifications | Expo Notifications + FCM |
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
│       ├── services/       # Firebase client, auth, circle, location
│       ├── hooks/          # useAuth, useCircle, useLocation
│       └── types/          # Shared TypeScript types
└── README.md
```

## Firebase Data Model

```
/users/{userId}
  displayName, email, photoURL, circleIds[]

/circles/{circleId}
  name, ownerId, createdAt, inviteCode, inviteExpiry, memberIds[]

/circles/{circleId}/members/{userId}
  displayName, photoURL, joinedAt

/locations/{userId}
  latitude, longitude, speed, heading, batteryLevel, updatedAt, circleId
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone (for development)
- A [Firebase](https://console.firebase.google.com/) account (free)

### 1. Clone the repo

```bash
git clone https://github.com/justinxwynkoop/family-circle.git
cd family-circle/mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Go to **Authentication → Sign-in method** and enable **Email/Password**
3. Go to **Firestore Database** and click **Create database** (start in test mode)
4. Go to **Project Settings → Your apps → Add app** → choose Web (`</>`)
5. Copy the config and paste it into `mobile/src/services/firebase.ts`:

```ts
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

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

## Firestore Security Rules

Once you're done testing, replace the default rules in **Firebase Console → Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /circles/{circleId} {
      allow read: if request.auth.uid in resource.data.memberIds;
      allow write: if request.auth.uid == resource.data.ownerId;
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == memberId
                     || request.auth.uid == get(/databases/$(database)/documents/circles/$(circleId)).data.ownerId;
      }
    }
    match /locations/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Contributing

Pull requests are welcome. For major changes, open an issue first.

## License

[MIT](LICENSE)
