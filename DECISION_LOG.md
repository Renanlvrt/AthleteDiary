# AthleteDiary — Decision Log

> Every significant design or technical decision is recorded here with rationale.
> **Before re-debating any of these choices, read the entry.** This prevents circular discussions.

---

## D001 — Mood Picker: Slider vs Swatches
**Date:** 2026-05-24
**Decision:** Mood picker is a **gradient slider** (horizontal track, draggable thumb)
**Rejected:** 5 colour swatches in a row
**Why:**
- The `log session.png` design reference clearly shows a slider with gradient track (red left → green right) and a circular draggable thumb
- The HTML reference (`athlete_diary_colorful_redesign.html`) implements a slider with `linear-gradient(to right, #991B1B, #EF4444 25%, #F97316 50%, #86EFAC 75%, #22C55E)`
- More expressive for mood than discrete swatches — user sees the full emotional spectrum
**Implementation:** `react-native-reanimated` PanGestureHandler on a gradient track (via `expo-linear-gradient`). Thumb position maps to mood level 1–5. Label shown below: TERRIBLE / BAD / OKAY / GOOD / GREAT.

---

## D002 — Sport Identifiers: No Emojis
**Date:** 2026-05-24
**Decision:** Sports displayed as **text-only uppercase labels** (RUN, GYM, CYCLE, SWIM, BALL, BBALL, OTHER)
**Rejected:** Sport emojis (🏃🏋️🚴🏊⚽🏀💪)
**Why:** User explicitly requested removal of sport emojis. Clean editorial style matches the design philosophy better.
**Implementation:** Session cards show sport label text. Sport picker shows text pills. No emoji anywhere.
**Note:** The HTML reference still has emojis (legacy) — ignore those, follow the user's explicit decision.

---

## D003 — Mood Colours: Green→Yellow→Orange→Red
**Date:** 2026-05-24
**Decision:** Mood colours follow a **natural traffic-light gradient** from great to terrible:
```
5 (Great):    #22C55E  — bright green
4 (Good):     #86EFAC  — soft green
3 (Okay):     #FBBF24  — yellow
2 (Bad):      #F97316  — orange
1 (Terrible): #EF4444  — red
```
**Rejected:** The original spec had `#991B1B` (dark red) for mood 1 and `#F97316` for mood 3
**Why:** User specified "green, less green, yellow, orange, red" — a clean natural gradient.

---

## D004 — Typography: System SF Pro + expo-font Display Font
**Date:** 2026-05-24
**Decision:** Use **system SF Pro** for body/label text, add **expo-font with a display typeface** for hero text
**Recommended options (front_end_design.md):** Bebas Neue, Barlow Condensed Black, Anton
**Default choice for implementation:** Anton (free on Google Fonts, punchy, matches the sports aesthetic)
**Why:** front_end_design.md explicitly states: "This single change will make the app feel designed, not generated."
**Implementation:** Load in `app/_layout.tsx`, reference as `TYPOGRAPHY.display.fontFamily` in `lib/constants.ts`.
**Risk:** If expo-font causes issues in Expo Go, fallback to system font with weight 900.

---

## D005 — Screen Architecture: Colour Block Layout
**Date:** 2026-05-24
**Decision:** Screens are composed of **solid colour block sections** stacked vertically (not a single background colour)
**Why:** This is the defining visual identity of the app — directly copied from the design reference screenshots.
- Home: Yellow → White → Red → Black button bar
- Log Session: Yellow → White (multiple sections) → Red
**Implementation:** Each block is a `View` with the block colour as `backgroundColor`. No global background colour.

---

## D006 — Storage: AsyncStorage Only
**Date:** 2026-05-24
**Decision:** All persistence via `@react-native-async-storage/async-storage`
**Rejected:** SQLite, MMKV, any network storage
**Why:** Spec is explicit: "100% local. No accounts. No backend. AsyncStorage only."
**Storage keys:**
```
@athlete_diary:sessions   — Session[] JSON array
@athlete_diary:last_sport — SportType string
@athlete_diary:schedule   — TrainingSchedule JSON object
```

---

## D007 — Navigation: expo-router with Modal for Log
**Date:** 2026-05-24
**Decision:** File-based routing via `expo-router`. Log Session presented as `presentation: 'modal'`.
**Why:** Spec requirement. Modal gives iOS sheet-style presentation.
**Routes:**
- `/` — Home screen
- `/log` — Log Session (modal)
- `/schedule` — Schedule setup (pushed screen)

---

## D008 — Notifications: Local Only, 1h After Training
**Date:** 2026-05-24
**Decision:** Local push notifications via `expo-notifications`, scheduled weekly, firing 1 hour after each training slot
**Why:** User requirement. No remote push server — all local.
**Edge case:** If training is at 23:xx, the notification fires next day at 00:xx (handled by modulo arithmetic).
**Re-scheduling:** On every app launch, cancel all + re-schedule from stored schedule. This handles app updates.

---

## D009 — Performance Picker: Yellow Pill on Select
**Date:** 2026-05-24
**Decision:** Performance picker uses 5 horizontal pill buttons. Selected state: `background: #FFE500, text: #000000, font-weight: 900`. Unselected: border only, grey text.
**Why:** Directly matches `log session.png` and HTML reference (`.pp.sel { background: #FFE500 }`).

---

## D010 — Session Cards: No Emoji, Mood Colour Dot
**Date:** 2026-05-24
**Decision:** Session cards show: sport text label (left) | date (centre) | mood colour circle dot + performance label (right)
**Why:** Matches design reference. No emojis per D002.
**The mood dot** is a 10×10px coloured circle using the mood colour from MOOD_COLOURS.
