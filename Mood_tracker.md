# AthleteDiary — Full Product Specification
> **For:** Antigravity IDE / AI agent build
> **Version:** v1.0
> **Platform:** iOS — React Native + Expo
> **Last updated:** May 2026

---

## 1. Overview

AthleteDiary is a bold, energetic sports performance diary for athletes of all disciplines. Users log their mood and performance after each session. A GitHub-style annual mood grid shows training consistency and emotional patterns at a glance. The app is minimal by design — the fewer taps to log a session, the better.

**Target audience:** Public-facing. Any athlete — runners, gym-goers, cyclists, team sport players.
**Storage:** 100% local. No accounts. No backend. AsyncStorage only.
**V1 scope:** Home dashboard (mood grid + streak) + Log Session screen. Nothing else.

---

## 2. Tech Stack

```
React Native         — core framework
Expo SDK 51+         — managed workflow
expo-router          — file-based navigation
AsyncStorage         — @react-native-async-storage/async-storage
date-fns             — date formatting and manipulation
react-native-reanimated — animations
expo-haptics         — haptic feedback on interactions
expo-status-bar      — status bar theming
@expo/vector-icons   — icons (Ionicons)
```

> **Important:** Use Expo managed workflow. Do NOT eject. Do NOT use bare workflow.
> Target: iOS first. Android parity is a v2 concern.

---

## 3. Design System

### Philosophy
Inspired by bold editorial / fashion magazine design. NOT a data dashboard. NOT Strava.
Think: massive typography, solid colour blocks, zero clutter. The design should **hype the user up**.

### Colour Palette

```
Background:       #0A0A0A   (near-black)
Surface:          #141414   (card background)
Surface Alt:      #1E1E1E   (secondary cards)

Primary:          #FFE500   (electric yellow — primary CTA, accents)
Accent Red:       #FF2D2D   (destructive, bad mood)
Accent Blue:      #0066FF   (info, highlights)

Text Primary:     #FFFFFF
Text Secondary:   #888888
Text Muted:       #444444

--- Mood Colours ---
Mood Great:       #22C55E   (bright green)
Mood Good:        #86EFAC   (soft green)
Mood Okay:        #F97316   (orange)
Mood Bad:         #EF4444   (red)
Mood Terrible:    #991B1B   (dark red)
Mood None:        #1E1E1E   (empty day — dark grey)
```

### Typography

```
Font family: System default (SF Pro on iOS)

Display:    96px  weight 900  letter-spacing -3  uppercase
Headline:   48px  weight 800  letter-spacing -1
Title:      32px  weight 700
Body:       16px  weight 400
Caption:    12px  weight 500  letter-spacing 1   uppercase
```

### Spacing Scale
```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
3xl:  64px
```

### Border Radius
```
sm:   4px
md:   8px
lg:   16px
xl:   24px
full: 9999px
```

### Design Rules
- Backgrounds are always near-black (#0A0A0A). No white backgrounds anywhere.
- CTAs are electric yellow (#FFE500) with black text.
- Section headings are ALL CAPS, small letter-spacing, secondary text colour.
- No drop shadows. Use solid colour blocks and thick borders instead.
- Generous whitespace. Breathe. Don't cram data.
- Haptic feedback on every meaningful tap (medium impact on log save, light on mood select).

---

## 4. Data Model

### Session Object
```typescript
interface Session {
  id: string;                    // uuid v4
  date: string;                  // ISO 8601 date string "YYYY-MM-DD"
  timestamp: number;             // Unix ms — auto-filled
  sport: SportType;              // auto-filled from last session, user can change
  mood: MoodLevel;               // REQUIRED — user selects
  performance: PerformanceLevel; // REQUIRED — user selects
  notes?: string;                // optional free text
}

type SportType =
  | 'running'
  | 'gym'
  | 'cycling'
  | 'swimming'
  | 'football'
  | 'basketball'
  | 'other';

type MoodLevel = 1 | 2 | 3 | 4 | 5;
// 1 = Terrible, 2 = Bad, 3 = Okay, 4 = Good, 5 = Great

type PerformanceLevel = 1 | 2 | 3 | 4 | 5;
// 1 = Poor, 2 = Below avg, 3 = Average, 4 = Good, 5 = Peak
```

### Mood → Colour Mapping
```typescript
const MOOD_COLOURS = {
  5: '#22C55E',  // Great   — bright green
  4: '#86EFAC',  // Good    — soft green
  3: '#F97316',  // Okay    — orange
  2: '#EF4444',  // Bad     — red
  1: '#991B1B',  // Terrible — dark red
};
```

### Performance → Label Mapping
```typescript
const PERFORMANCE_LABELS = {
  5: 'PEAK',
  4: 'GOOD',
  3: 'AVERAGE',
  2: 'BELOW',
  1: 'POOR',
};
```

### Storage Keys
```
@athlete_diary:sessions        — JSON array of Session[]
@athlete_diary:last_sport      — SportType string (for auto-fill)
```

---

## 5. App Structure

```
app/
  _layout.tsx          — root layout, dark status bar, background colour
  index.tsx            — Home screen (tab: Dashboard)
  log.tsx              — Log Session screen (modal)

components/
  MoodGrid.tsx         — GitHub-style annual mood grid
  StreakCounter.tsx    — current streak display
  MoodPicker.tsx       — 5-colour mood selector
  PerformancePicker.tsx — 5-level performance selector
  SportPicker.tsx      — sport type selector
  SessionCard.tsx      — recent session summary card

lib/
  storage.ts           — AsyncStorage read/write helpers
  sessions.ts          — session CRUD logic
  streak.ts            — streak calculation
  dates.ts             — date utilities (wrappers around date-fns)
  constants.ts         — MOOD_COLOURS, PERFORMANCE_LABELS, SPORT_LABELS, etc.

hooks/
  useSessions.ts       — load/save sessions, exposes sessions array + handlers
  useStreak.ts         — derived streak from sessions
```

---

## 6. Screen Specifications

---

### 6.1 Home Screen (`index.tsx`)

**Purpose:** At-a-glance view of the full year's mood history and current streak. One-tap to log a new session.

#### Layout (top → bottom)

```
┌─────────────────────────────┐
│  STATUS BAR (light content) │
├─────────────────────────────┤
│                             │
│  ATHLETE DIARY        [+]   │  ← App name (caption style) + FAB
│                             │
├─────────────────────────────┤
│                             │
│  🔥 47                      │  ← Streak number (Display size, yellow)
│  DAY STREAK                 │  ← Caption label
│                             │
├─────────────────────────────┤
│  THIS YEAR                  │  ← Section label
│  ┌──────────────────────┐   │
│  │   MOOD GRID          │   │  ← MoodGrid component
│  │   (52 weeks × 7 days)│   │
│  └──────────────────────┘   │
│                             │
├─────────────────────────────┤
│  RECENT                     │  ← Section label
│  ┌──────────────────────┐   │
│  │  SessionCard         │   │  ← Last 3 sessions
│  │  SessionCard         │   │
│  │  SessionCard         │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Streak Counter
- If streak = 0: show "START YOUR STREAK" in muted text
- If streak ≥ 1: show fire emoji + number in Display typography (96px, yellow #FFE500)
- Streak definition: consecutive calendar days with at least 1 logged session

#### FAB (Floating Action Button)
- Yellow circle (#FFE500), bottom-right corner, fixed position
- Large "+" icon in black
- Tap → opens Log Session as a modal (full-screen sheet from bottom)
- On press: Haptics.impactAsync(ImpactFeedbackStyle.Light)

#### MoodGrid Component
See Section 7.1 for full spec.

#### Session Cards
- Show last 3 sessions only
- Each card: sport icon + sport name, date, mood colour swatch, performance label
- Dark surface (#141414), rounded corners (lg)
- Tap → no action in v1 (placeholder)
- If no sessions yet: show empty state message "NO SESSIONS YET — TAP + TO LOG YOUR FIRST"

---

### 6.2 Log Session Screen (`log.tsx`)

**Purpose:** Log a new training session. Absolute minimum friction. Only 2 required fields.

#### Auto-filled fields (user cannot edit in v1)
- `date` → today's date
- `timestamp` → current Unix ms
- `sport` → last used sport type (default: 'running' on first use)

#### Required user inputs
1. **Mood** — colour picker (5 swatches)
2. **Performance** — rating picker (5 levels)

#### Optional user inputs
3. **Sport type** — pill selector (can change from auto-filled)
4. **Notes** — single-line text input (keyboard shows on tap)

#### Layout

```
┌─────────────────────────────┐
│  ← BACK        LOG SESSION  │  ← Nav header
├─────────────────────────────┤
│                             │
│  TODAY                      │  ← Auto-filled date, caption style
│  MONDAY 24 MAY              │  ← Headline size, white
│                             │
├─────────────────────────────┤
│                             │
│  HOW DID YOU FEEL?          │  ← Section label
│                             │
│  ○ ○ ○ ○ ○                  │  ← MoodPicker (5 colour swatches)
│  TERRIBLE → GREAT           │
│                             │
├─────────────────────────────┤
│                             │
│  HOW DID YOU PERFORM?       │  ← Section label
│                             │
│  [POOR][BELOW][AVG][GOOD][PEAK] │  ← PerformancePicker (5 pill buttons)
│                             │
├─────────────────────────────┤
│                             │
│  SPORT                      │  ← Section label
│  [RUN] [GYM] [CYCLE] [+]    │  ← SportPicker (horizontal scroll)
│                             │
├─────────────────────────────┤
│                             │
│  NOTES (OPTIONAL)           │  ← Section label
│  ┌──────────────────────┐   │
│  │ How was the session? │   │  ← Text input
│  └──────────────────────┘   │
│                             │
├─────────────────────────────┤
│                             │
│  ┌──────────────────────┐   │
│  │     SAVE SESSION     │   │  ← CTA — yellow, full width
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Save Behaviour
1. Validate: mood AND performance must be selected. If not, shake animation on unset field.
2. On valid save:
   - `Haptics.notificationAsync(NotificationFeedbackType.Success)`
   - Write to AsyncStorage
   - Update `last_sport`
   - Pop modal back to Home
   - Home screen re-fetches and re-renders grid

#### Validation
- Show a subtle pulsing yellow border on unpicked required fields if user taps SAVE without selecting them
- No alert dialogs. Inline feedback only.

---

## 7. Component Specifications

---

### 7.1 MoodGrid

**Visual:** GitHub contribution graph, adapted for mood.
- Full calendar year (Jan 1 → Dec 31 of current year)
- 53 columns (weeks) × 7 rows (days Mon–Sun)
- Each cell: 10×10px square, 2px gap between cells
- Horizontally scrollable if needed on smaller screens
- Month labels above columns (Jan, Feb, … Dec) in Caption style

**Cell colours:**
- Day with session → colour from MOOD_COLOURS based on mood level
- Day with no session → #1E1E1E (empty)
- Future days → #0F0F0F (slightly darker than empty, clearly inactive)
- Today → white 1px border ring around the cell

**Tap behaviour:**
- Tap a filled cell → show a small tooltip/popover: sport icon + date + mood label + performance label
- Tap an empty past cell → nothing (v1)

**Performance:**
- Pre-compute the full year grid layout once on mount
- Memoize with `useMemo`, only recompute when sessions change

---

### 7.2 MoodPicker

Five circular swatches in a row.

```
Size:        56×56px circles
Gap:         12px between
Selected:    white 3px ring + scale(1.15) + checkmark icon
Unselected:  solid fill at 60% opacity

Colours (left to right, mood 1→5):
  #991B1B  #EF4444  #F97316  #86EFAC  #22C55E
```

Labels below the row: "TERRIBLE" on far left, "GREAT" on far right, in Caption/muted style.

On select: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` + spring animation on selected swatch.

---

### 7.3 PerformancePicker

Five pill buttons in a horizontal row.

```
Unselected:   border 1px #333, bg transparent, text #888
Selected:     bg #FFE500, text #000000, font-weight 800
Height:       44px
Min width:    60px
Border radius: full (pill)
Font:         Caption style, uppercase
```

Labels: POOR / BELOW / AVG / GOOD / PEAK

On select: `Haptics.impactAsync(ImpactFeedbackStyle.Light)`.

---

### 7.4 SportPicker

Horizontal scrollable row of pill buttons.

Sports to show:
```
RUN    →  running
GYM    →  gym
CYCLE  →  cycling
SWIM   →  swimming
BALL   →  football
BBALL  →  basketball
OTHER  →  other
```

Selected sport: yellow background, black text.
Unselected: dark surface, grey text.

Auto-scroll to selected sport on mount.

---

### 7.5 StreakCounter

```tsx
// If streak = 0
<Text style={caption}>START YOUR STREAK</Text>

// If streak >= 1
<Text style={display}>🔥 {streak}</Text>
<Text style={caption}>DAY STREAK</Text>
```

Display text is #FFE500. Animate count-up on first mount with a 600ms spring.

---

### 7.6 SessionCard

```
Height:      80px
Padding:     16px horizontal, 12px vertical
Background:  #141414
Border:      1px solid #1E1E1E
Border radius: 16px
Margin bottom: 8px

Left:   Sport emoji + sport name (Title weight)
Center: Date (Caption, muted)
Right:  Mood colour swatch (24×24 circle) + Performance label (Caption, muted)
```

Sport emojis:
```
running   → 🏃
gym       → 🏋️
cycling   → 🚴
swimming  → 🏊
football  → ⚽
basketball→ 🏀
other     → 💪
```

---

## 8. Business Logic

### Streak Calculation

```typescript
function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  const today = startOfDay(new Date());
  const sessionDates = new Set(
    sessions.map(s => s.date) // "YYYY-MM-DD"
  );

  let streak = 0;
  let current = today;

  while (true) {
    const dateStr = format(current, 'yyyy-MM-dd');
    if (sessionDates.has(dateStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      // Allow today to be empty (streak continues from yesterday)
      if (streak === 0 && isSameDay(current, today)) {
        current = subDays(current, 1);
        const yesterdayStr = format(current, 'yyyy-MM-dd');
        if (sessionDates.has(yesterdayStr)) continue;
      }
      break;
    }
  }

  return streak;
}
```

### Session Deduplication
One session per day per sport type. If user logs same sport on same day twice, second log OVERWRITES the first (update, not append). Different sports on same day = both allowed.

---

## 9. Navigation

Use `expo-router`. Two routes only:

```
/           → Home (Dashboard)
/log        → Log Session (presented as a modal sheet)
```

Modal presentation: `presentation: 'modal'` in expo-router Link/router options.
Background when modal is open: Home screen should show through (iOS sheet style).

---

## 10. Empty States

| State | Message |
|---|---|
| No sessions ever | "NO SESSIONS YET — TAP + TO START" |
| Streak = 0 | "START YOUR STREAK TODAY" |
| Grid all empty | Grid renders with all #1E1E1E cells — no additional message needed |

Empty state text: Caption style, #444444, centred.

---

## 11. Animations

| Interaction | Animation |
|---|---|
| Mood swatch select | spring scale 1.0 → 1.15, duration 200ms |
| Performance pill select | spring scale 0.95 → 1.0 |
| Save session success | Home screen grid fades in new cell (opacity 0→1, 400ms) |
| Streak counter mount | count from 0 to N, spring easing, 600ms |
| FAB press | scale 0.9 → 1.0 spring feedback |
| Unpicked required field | shake animation (3× horizontal ±6px, 300ms total) |

Use `react-native-reanimated` for all animations.

---

## 12. Accessibility

- All interactive elements: `accessible={true}`, `accessibilityLabel` prop set
- Mood swatches: label = "Mood: {level name}"
- Performance pills: label = "Performance: {level name}"
- Minimum tap target: 44×44px on all buttons
- Colour is never the ONLY indicator — mood swatches also show a checkmark when selected

---

## 13. File: `CLAUDE.md` (project root)

> Place this file at the root of the project so Claude Code / Antigravity reads it automatically.

```markdown
# AthleteDiary

Sports performance diary app — iOS, React Native + Expo.

## Key Rules
- Expo managed workflow only. Never eject.
- AsyncStorage for all persistence. No network calls.
- expo-router for navigation.
- All screens dark background (#0A0A0A). No light mode.
- Bold editorial design — big type, solid colour blocks, zero clutter.
- Minimum friction logging: only mood + performance are required inputs.
- Haptics on every meaningful interaction.

## Architecture
- /app — expo-router screens
- /components — reusable UI components
- /lib — pure logic (storage, streak calc, date utils)
- /hooks — React hooks (useSessions, useStreak)

## Constants live in /lib/constants.ts
Always import MOOD_COLOURS and PERFORMANCE_LABELS from there.

## V1 Scope
Two screens ONLY: Home (dashboard) and Log Session (modal).
Do NOT add extra screens, settings, or features beyond the spec.
```

---

## 14. package.json Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.0",
    "expo-haptics": "~13.0.0",
    "@react-native-async-storage/async-storage": "~1.23.0",
    "react-native-reanimated": "~3.10.0",
    "date-fns": "^3.6.0",
    "@expo/vector-icons": "^14.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "typescript": "^5.3.0",
    "@types/react": "~18.2.0"
  }
}
```

---

## 15. What NOT to Build in V1

The following are explicitly out of scope for V1. Do not build them:

- User accounts, auth, or any backend
- Push notifications or reminders
- Statistics / insights / charts screen
- Settings screen
- Social features (sharing, following)
- Apple Health integration
- Widget / lock screen extension
- Android-specific optimisations
- Onboarding flow
- Dark/light mode toggle (dark only)

---

## 16. Definition of Done (V1)

- [ ] Home screen renders with mood grid, streak counter, recent sessions
- [ ] Mood grid shows correct colours for logged days
- [ ] Streak counter correctly calculates consecutive days
- [ ] Log Session modal opens from FAB
- [ ] User can select mood (required) and performance (required)
- [ ] Sport type auto-fills from last session
- [ ] Session saves to AsyncStorage and immediately reflects on home grid
- [ ] All interactions have haptic feedback
- [ ] Animations implemented (swatch select, streak counter, save confirmation)
- [ ] Validation: can't save without mood + performance selected
- [ ] App runs on iOS via Expo Go (no build needed for testing)
- [ ] TypeScript: no `any` types, no compiler errors
- [ ] No hardcoded colours — all from `constants.ts`