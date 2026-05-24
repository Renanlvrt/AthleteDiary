# Privacy Rules — AthleteDiary

## Absolute Prohibitions (never violate)

- **ZERO remote network calls** — no `fetch()`, no `axios`, no `XMLHttpRequest`, no WebSocket
- **ZERO third-party analytics** — no Amplitude, Mixpanel, Segment, PostHog, Firebase Analytics
- **ZERO crash reporting that phones home** — no Sentry, no Bugsnag, no Crashlytics
- **ZERO remote storage** — no Supabase, no Firebase Firestore/RTDB, no AWS, no any cloud
- **ZERO tracking pixels or SDKs** — no Facebook SDK, no Google Analytics

## What IS Allowed
- `AsyncStorage` — 100% on-device
- `expo-notifications` — LOCAL notifications only (no push token, no APNS registration for remote push)
- `expo-haptics` — fully local
- `react-native-reanimated` — fully local
- `expo-font` — font files bundled with the app
- Console logging for development only (remove before production)

## Permissions
The only permission this app may request is notification permission (`expo-notifications`).
- Request ONLY when user explicitly sets up a training schedule
- Never request on app launch
- Never request microphone, camera, contacts, location, or health data

## Data Retention
All user data lives in AsyncStorage on the device.
The user can delete the app to delete all data.
No data is ever sent anywhere.
