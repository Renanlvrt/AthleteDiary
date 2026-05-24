# Skill: Session Logging Flow

> Read this before building log.tsx or the log session components.

## What It Is
The minimum-friction session logging screen. Presented as an iOS modal sheet from Home.
Only 2 required fields: mood (slider) + performance (pill).

## Auto-filled Fields (user cannot change in V1)
- `date` → today's date in 'YYYY-MM-DD' format
- `timestamp` → `Date.now()` at save time
- `sport` → last used sport (from `@athlete_diary:last_sport`), default 'running'

## Required User Inputs
1. **Mood** — slider value 1–5 (maps position on gradient track to nearest integer)
2. **Performance** — pill button 1–5

## Optional User Inputs
3. **Sport** — pill selector (can change the auto-filled value)
4. **Notes** — single-line text input

---

## Mood Slider Implementation

### The slider from the design reference:
- Horizontal gradient track: `linear-gradient(left, #991B1B → #EF4444 → #F97316 → #86EFAC → #22C55E)`
- Circular draggable thumb (white circle, dark border, coloured border matches current mood)
- Label below: TERRIBLE / BAD / OKAY / GOOD / GREAT (changes with position)
- Current mood name shown centred below labels, coloured to match

### In React Native (expo-linear-gradient + Reanimated gesture):
```typescript
// Use PanGestureHandler from react-native-gesture-handler
// Track is a LinearGradient from expo-linear-gradient
// Thumb position (0–1) maps to mood level:
//   0.0–0.1 → 1 (Terrible)
//   0.1–0.3 → 2 (Bad)
//   0.3–0.5 → 3 (Okay)
//   0.5–0.75 → 4 (Good)
//   0.75–1.0 → 5 (Great)

function positionToMood(position: number): MoodLevel {
  if (position < 0.2) return 1;
  if (position < 0.4) return 2;
  if (position < 0.6) return 3;
  if (position < 0.8) return 4;
  return 5;
}
```

### Thumb border colour = current mood colour:
```typescript
const thumbBorderColor = MOOD_COLOURS[currentMood];
```

---

## Validation

On "SAVE SESSION" tap, validate BEFORE saving:
- Mood must be selected (slider must have been interacted with, or has a default)
- Performance must be selected

**Default state:** Slider starts at rightmost position (mood = 5 / GREAT) — pre-selected.
Performance starts unselected — user MUST tap one.

If performance not selected:
- Shake animation on the performance pills row (3× horizontal ±6px, 300ms)
- Yellow pulsing border on the pills container
- NO alert dialogs — inline feedback only

---

## Save Sequence

```typescript
async function saveSession(): Promise<void> {
  // 1. Validate
  if (!selectedPerformance) {
    triggerShakeAnimation();
    return;
  }

  // 2. Build session object
  const session: Session = {
    id: generateId(),           // uuid v4 (use a simple implementation)
    date: getTodayDateString(), // 'YYYY-MM-DD'
    timestamp: Date.now(),
    sport: selectedSport,
    mood: currentMood,
    performance: selectedPerformance,
    notes: notes.trim() || undefined,
  };

  // 3. Save (with deduplication)
  await addSession(session);    // from useSessions hook

  // 4. Update last sport
  await saveLastSport(selectedSport);

  // 5. Haptic feedback
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  // 6. Navigate back
  router.back();
}
```

---

## Session Deduplication (in lib/sessions.ts)

```typescript
export async function addSession(newSession: Session): Promise<Session[]> {
  const sessions = await getSessions();

  // Find existing session for same date + same sport
  const existingIndex = sessions.findIndex(
    s => s.date === newSession.date && s.sport === newSession.sport
  );

  if (existingIndex >= 0) {
    // OVERWRITE — keep the id of the existing session
    sessions[existingIndex] = { ...newSession, id: sessions[existingIndex].id };
  } else {
    // APPEND
    sessions.push(newSession);
  }

  await saveSessions(sessions);
  return sessions;
}
```

---

## Sport Picker (on Log Screen)

Horizontal scrollable row of text pill buttons.
Auto-scroll to the currently selected sport on mount.

```
Sports: RUN | GYM | CYCLE | SWIM | BALL | BBALL | OTHER
```

Selected: yellow background (#FFE500), black text, weight 800
Unselected: dark surface (#141414), grey text (#888)

---

## Sport Label to Pill Display Mapping

```typescript
export const SPORT_LABELS: Record<SportType, string> = {
  running:    'RUN',
  gym:        'GYM',
  cycling:    'CYCLE',
  swimming:   'SWIM',
  football:   'BALL',
  basketball: 'BBALL',
  other:      'OTHER',
};
```
