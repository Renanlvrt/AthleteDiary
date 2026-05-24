# AthleteDiary

Sports performance diary app — iOS, React Native + Expo.

## Key Rules
- Expo managed workflow only. Never eject. Never `expo prebuild`.
- AsyncStorage for all persistence. No network calls.
- expo-router for navigation.
- All screens dark background (#0A0A0A) when not in a colour block. No light mode.
- Bold editorial design — yellow header blocks, red recent-sessions block, big type, solid colour blocks.
- Minimum friction logging: only mood + performance are required inputs.
- Haptics on every meaningful interaction.
- **No sport emojis.** Text-only sport labels (RUN, GYM, CYCLE, SWIM, BALL, BBALL, OTHER).
- **Mood picker is a SLIDER** with gradient track (red→green), not swatches.

## Architecture
- `/app` — expo-router screens
- `/components` — reusable UI components
- `/lib` — pure logic (storage, streak calc, date utils, notifications, constants, types)
- `/hooks` — React hooks (useSessions, useStreak, useSchedule)
- `/.ecc` — agentic harness (agents, skills, rules)

## Design System
Read `.ecc/skills/editorial-design/SKILL.md` for full design tokens.
**All colour values and typography presets live in `lib/constants.ts`. Import from there.**

## Visual Reference
- `frontend/home screen.png` — Home screen design target
- `frontend/log session.png` — Log Session design target
- `frontend/athlete_diary_colorful_redesign.html` — Reference HTML

## Screen Layout (critical)
### Home
Yellow block (ATHLETE DIARY label + black circle + button | streak pill | TRAIN.LOG.GROW. hero text | date)
→ White block (THIS YEAR section label + mood grid)
→ Red block (#E5232A) (RECENT SESSIONS heading + white session cards)
→ White/black bar (+ LOG SESSION black button)

### Log Session (modal)
Yellow block (‹ back | TODAY label | date headline | sport pill with "change" text)
→ White section (HOW DID YOU FEEL? + gradient slider)
→ Divider
→ White section (HOW DID YOU PERFORM? + 5 pill buttons)
→ Divider
→ White section (NOTES optional + text input)
→ Red block (SAVE SESSION white button)

## Constants live in /lib/constants.ts
Always import MOOD_COLOURS, SPORT_LABELS, PERFORMANCE_LABELS, COLORS, TYPOGRAPHY from there.

## V1 Scope — 3 screens ONLY
Home (dashboard), Log Session (modal), Schedule Setup.
Do NOT add extra screens, settings, or features beyond the spec.

## Progress Tracking
See `PROGRESS.md` for current build state and known issues.
See `DECISION_LOG.md` for why key choices were made.
