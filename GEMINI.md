# AthleteDiary — Antigravity Agent Context

> **Read this file FIRST on every session.** It is the single source of truth for project context.

## What This Project Is

AthleteDiary is a **bold, editorial-design sports performance diary app** for iOS athletes.
Built with React Native + Expo (managed workflow). 100% local — no backend, no accounts.

**Project directory:** `c:\Users\renan\Desktop\Side_projects\AthleteDiary`
**Design references:** `c:\Users\renan\Desktop\Side_projects\Mood Tracker (mobile)\frontend\`

## Key Files to Read Before Working

| File | Purpose |
|------|---------|
| `PROGRESS.md` | Current build state, decisions made, known issues |
| `DECISION_LOG.md` | Why choices were made (avoid re-debates) |
| `lib/constants.ts` | ALL design tokens — never hardcode values |
| `lib/types.ts` | All TypeScript interfaces |
| `.ecc/rules/common/scope-guard.md` | What NOT to build in V1 |

## Critical Rules (never violate)

1. **Expo managed workflow only** — never eject, never `expo prebuild`
2. **AsyncStorage only** — no network calls, no backend, no analytics
3. **All colours from `lib/constants.ts`** — never hardcode hex values
4. **No sport emojis** — text labels only (RUN, GYM, CYCLE, etc.)
5. **Mood picker is a SLIDER** (gradient track, draggable thumb) — NOT swatches
6. **Screen layout:**
   - Home: Yellow → White (grid) → Red (sessions) → Black FAB bar
   - Log: Yellow (date+sport) → White (slider+perf+notes) → Red (save)
7. **TypeScript strict** — no `any`, no `@ts-ignore`
8. **V1 scope** — 3 screens only: Home, Log Session (modal), Schedule Setup

## Architecture

```
app/         — expo-router screens (_layout, index, log, schedule)
components/  — reusable UI (MoodGrid, MoodPicker, PerformancePicker, SportPicker,
               SessionCard, StreakCounter, DayTimePicker, ScheduleBanner)
lib/         — pure logic (constants, types, storage, sessions, streak, dates, notifications)
hooks/       — React hooks (useSessions, useStreak, useSchedule)
.ecc/        — agentic harness (agents, skills, rules)
```

## Design System At a Glance

```
Background: #0A0A0A  Surface: #141414
Primary:    #FFE500  (yellow blocks — black text)
Red:        #E5232A  (recent sessions + save button block)

Mood colours (5=Great → 1=Terrible):
  #22C55E  #86EFAC  #FBBF24  #F97316  #EF4444

Mood gradient: #991B1B → #EF4444 → #F97316 → #86EFAC → #22C55E (slider track)
```

## How to Recover Context After a Long Gap

1. Read `PROGRESS.md` — current state
2. Read `DECISION_LOG.md` — locked decisions
3. Run `npx tsc --noEmit` to see current TypeScript errors
4. Run `npx expo start` to test current state

## Token Efficiency Tips (for AI agents)

- Check `lib/constants.ts` before creating any UI — tokens are already defined
- Design target: `c:\Users\renan\Desktop\Side_projects\Mood Tracker (mobile)\frontend\home screen.png`
- Log screen target: `c:\Users\renan\Desktop\Side_projects\Mood Tracker (mobile)\frontend\log session.png`
- The `.ecc/skills/` files contain detailed how-to for each domain
