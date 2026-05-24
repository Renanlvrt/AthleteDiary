# Expo Managed Workflow Rules

## The One Rule

**Never eject. Never run `expo prebuild`. Never run `expo eject`.**

If a library requires native code that isn't compatible with Expo managed workflow,
find a different library. Do not compromise the managed workflow.

## Target
- Expo SDK: ~51.0.0
- Testing: Expo Go on iOS (no build required for development)
- iOS first. Android parity is V2.

## Approved Libraries (all managed-workflow compatible)
```
expo-router ~3.5.0            — navigation
expo-status-bar ~1.12.0       — status bar control
expo-haptics ~13.0.0          — haptic feedback
expo-notifications ~0.28.0    — local notifications
expo-font                     — custom font loading (if used)
expo-linear-gradient          — gradient track for mood slider
@expo/vector-icons ^14.0.0    — Ionicons
@react-native-async-storage/async-storage ~1.23.0
@react-native-community/datetimepicker ~8.0.0
react-native-reanimated ~3.10.0
react-native-gesture-handler  — required by reanimated gestures
date-fns ^3.6.0
```

## Navigation
- File-based routing via expo-router
- Routes: `/` (Home), `/log` (modal), `/schedule` (pushed)
- Log presented as `presentation: 'modal'`
- Schedule presented as a standard pushed screen

## Icons
- Use `@expo/vector-icons` (Ionicons set)
- Examples: `Ionicons name="calendar-outline"`, `"add"`, `"chevron-back"`

## Status Bar
- Always light content (white icons on dark/yellow/red backgrounds)
- Set in `app/_layout.tsx` via `<StatusBar style="dark" />` (dark = dark icons on light bg)
  - On yellow blocks, need dark icons
  - Use `expo-status-bar`'s `StatusBar` component

## Font Loading (if using expo-font)
```typescript
// In app/_layout.tsx
const [fontsLoaded] = useFonts({
  'Anton-Regular': require('../assets/fonts/Anton-Regular.ttf'),
});
if (!fontsLoaded) return null; // splash screen shows while loading
```
