# AthleteDiary — Build Progress

> Updated by the AI agent at the end of every significant session.
> **This is the first thing to read when resuming work.**

## Current State
**Phase:** Complete / Maintenance 
**Status:** App is fully built, functional, and published via EAS.

## What's Been Done

### Core App Architecture
- [x] Full React Native / Expo Go scaffold using `expo-router`.
- [x] 100% Local `AsyncStorage` data layer for Sessions, Streak, and Schedule.
- [x] High-end editorial UI implemented perfectly matching design tokens (`lib/constants.ts`).
- [x] 3 Core Screens Built: Home (MoodGrid + Recent Sessions), Log Session (Modal), Widget Setup.

### iOS Scriptable Widgets & Cloud Sync (Crucial Context)
- [x] **The Problem:** The app is developed in Expo Go. Standard deep links and local APIs die when the laptop closes.
- [x] **The Solution:** A serverless cloud relay using `jsonblob.com`.
- [x] **How it works:**
  1. User logs a session in the app.
  2. The app's `lib/widgetSync.ts` sends a JSON payload to `jsonblob.com` (creates/updates a blob).
  3. The `app/widget.tsx` setup screen shows the user their unique `jsonblob.com` URL.
  4. The user pastes this URL into their iOS Scriptable widget.
  5. The Scriptable widget fetches data from `jsonblob.com`, completely bypassing the laptop and local network!
- [x] **Deep Linking Fix:** The `computeDeepLinkUrl()` logic was upgraded to use `expo-linking`. This ensures that when a user taps a widget, it correctly generates the `exp://u.expo.dev/...` URL if they are running a published Expo update, or `athletediary://` if they build a standalone app.

### Created Widgets (`/Scriptable` folder)
We created multiple widget designs for the user:
1. `AthleteDiary_Medium_1_WhiteBar.js` — Clean white, perfect 50/50 split with subtle divider.
2. `AthleteDiary_Medium_2_RedBox.js` — Streak flame inside a floating red box.
3. `AthleteDiary_Medium_3_RandomFact.js` — Features a curated list of 50 sports facts that change daily.
4. `AthleteDiary_LS_Fact.js` — A highly compact Lock Screen widget combining the streak flame and an ultra-short daily fact.

## What's NOT Started (Future Ideas)
- Notifications scheduling (`expo-notifications`) for reminding users to log.
- Building the app into a standalone `.ipa` via EAS Build (to completely remove Expo Go dependency).

## Key Design Decisions Made
See `DECISION_LOG.md` for full rationale.

| Decision | Choice | Why |
|----------|--------|-----|
| Mood picker UI | Slider (gradient track + thumb) | As shown in log session.png — more expressive than swatches |
| Sport identifiers | Text labels only, no emojis | User explicitly requested colour-based, not emoji-based |
| Widget Backend | `jsonblob.com` | Simplest free NoSQL relay to allow iOS widgets to update without a laptop/local server |
| Deep Linking | `Linking.createURL()` | Safely handles local tunnels, published updates, and standalone builds |

## Screen Layout (locked — do not change)

### Home Screen colour blocks (top to bottom):
1. **Yellow block** `#FFE500` — ATHLETE DIARY + gear icon + streak pill + hero text + date
2. **White block** `#FFFFFF` — THIS YEAR label + mood grid
3. **Red block** `#E5232A` — RECENT SESSIONS heading + white session cards inside
4. **Bottom bar** white — black rounded button "+ LOG SESSION"

### Log Session colour blocks (top to bottom):
1. **Yellow block** `#FFE500` — ‹ back chevron + TODAY label + date + sport pill
2. **White section** — HOW DID YOU FEEL? + gradient slider
3. **White section** — HOW DID YOU PERFORM? + 5 pill buttons
4. **White section** — NOTES OPTIONAL + text input
5. **Red block** `#E5232A` — white rounded "SAVE SESSION" button inside

## Session Log

### Recent Sessions
- **App Core Built:** Implemented the full UI, storage layer, and routing.
- **Widget Integration:** Created Scriptable widgets. Solved the "Expo Go laptop closed" problem by routing widget payloads through `jsonblob.com`.
- **Layout Precision:** Fixed flexbox scaling issues in Scriptable widgets (forcing exact 50/50 pixel splits to center dividers).
- **Published Update Fix:** Fixed the deep link generator so widgets can successfully open published Expo updates on the user's phone.
