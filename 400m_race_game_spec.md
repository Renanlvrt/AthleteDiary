# 400M RACE — Full Dev-Ready Spec
### For Antigravity · Built into the existing Expo health/habit app

---

## TABLE OF CONTENTS
1. Feature Overview & Design Philosophy
2. Tech Stack & Exact Dependencies
3. EAS Custom Dev Build Setup (migrating from Expo Go)
4. 3D Asset Pipeline — Exact Steps
5. File & Folder Architecture
6. State Management (Zustand Store)
7. Screen Flow & Navigation
8. Core Game Loop
9. Mini-Games — Full Specs (all 7)
10. Opponent System
11. HUD Design
12. UI Design System (matching app aesthetic)
13. Post-Race Screen & Leaderboard
14. V1 Deliverables Checklist
15. V2 Roadmap

---

## 1. FEATURE OVERVIEW & DESIGN PHILOSOPHY

### What it is
A 30–50 second 3D 400m race game embedded inside the existing health/habit app. It is not a standalone game — it lives as a screen inside the app, accessible from the main navigation. The player controls their runner's speed vs. energy balance, encounters randomised brain-based mini-games during the race, and competes for personal records and a leaderboard.

### Core tension
The player holds the screen to accelerate. Speed drains energy. Releasing lets energy recover, but costs time. Mini-games interrupt the race and reward smart, fast thinking with energy gains and speed boosts. Running out of energy triggers the "Bonk" — a punishing but recoverable state.

### Design principles
- **Brain over fingers.** Mini-games are cognitively demanding, not just reflex-based. The player should feel smart for winning them, not just fast.
- **Visually cohesive.** The 3D world and 2D HUD use the same yellow/black/white language as the existing app.
- **Short but replayable.** One race = ~30–50 seconds. The randomised mini-game pool means no two races feel identical.
- **No audio for V1.** Haptics only.
- **Faceted Stylised character.** High-enough fidelity to feel premium, light enough for mobile performance.

---

## 2. TECH STACK & EXACT DEPENDENCIES

### Install command (run in project root)
```bash
npx expo install \
  three \
  @react-three/fiber \
  expo-gl \
  expo-three \
  @react-three/drei \
  zustand \
  expo-haptics \
  expo-linear-gradient \
  react-native-gesture-handler \
  react-native-reanimated \
  @react-navigation/native \
  @react-native-async-storage/async-storage
```

### Exact versions (pin these in package.json)
| Package | Version | Purpose |
|---|---|---|
| `three` | `^0.160.0` | 3D engine |
| `@react-three/fiber` | `^8.15.12` | React renderer for Three.js |
| `@react-three/drei` | `^9.92.7` | R3F helpers (useGLTF, useAnimations, etc.) |
| `expo-gl` | `~13.6.0` | WebGL context for native |
| `expo-three` | `^7.0.0` | Bridges Three.js to Expo GL |
| `zustand` | `^4.5.2` | Game state (never use useState in a game loop) |
| `expo-haptics` | `~12.8.1` | Tactile feedback |
| `expo-linear-gradient` | `~12.7.2` | Gradient UI elements |
| `react-native-gesture-handler` | `~2.14.0` | Swipe/tap detection |
| `react-native-reanimated` | `~3.6.2` | Animated transitions |
| `@react-native-async-storage/async-storage` | `^1.23.1` | Local personal records storage |

### Why NOT useState in the game loop
`useState` triggers React re-renders. At 60fps, that would re-render your entire component tree 60 times per second — guaranteed lag. Zustand updates state without re-renders. The `useFrame` hook (from R3F) reads Zustand state directly each frame.

### Why @react-three/drei is partially limited on React Native
Drei was built for the web. On React Native, only these helpers are confirmed to work:
- ✅ `useGLTF` — load .glb models
- ✅ `useAnimations` — play skeletal animations
- ✅ `PerspectiveCamera` — camera control
- ✅ `Environment` (via HDRI — limited)
- ❌ `Html`, `Text`, `OrbitControls` — web only, do NOT use

---

## 3. EAS CUSTOM DEV BUILD SETUP

### Why this is necessary
Expo Go sandboxes native modules. `expo-gl` (which powers all 3D) does not function correctly inside Expo Go. The app will need a Custom Dev Build — this is NOT a major change. The app remains:
- 100% serverless (jsonblob still works)
- Built and hosted on Expo's cloud (EAS), not the developer's laptop
- Distributed as a standard `.apk` (Android) or `.ipa` (iOS) file

### Steps
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to Expo account
eas login

# 3. Configure the project
eas build:configure
# This creates eas.json — accept all defaults

# 4. Create a development build (free tier)
eas build --platform android --profile development
# or for iOS:
eas build --platform ios --profile development

# 5. Install the resulting .apk / .ipa on device
# Then run the dev server:
npx expo start --dev-client
```

### eas.json (the config file, no changes needed)
```json
{
  "cli": { "version": ">= 5.9.3" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

---

## 4. 3D ASSET PIPELINE — EXACT STEPS

### 4A. The Character

**Where:** mixamo.com (free, requires Adobe account)

**Which character to download:** Search for **"Michelle"** — she is the most athletic-looking Mixamo character with realistic proportions. She will be stylised in Blender (step below).

**Why not Y Bot / X Bot:** Those look too robotic and toy-like for this app's premium aesthetic.

**Animations to download (download each separately as FBX, with skin):**

| Animation Name | Search term on Mixamo | Settings |
|---|---|---|
| Starting Crouch | "Crouch To Stand" | Default |
| Full Sprint | "Fast Run" | Overdrive: 0, Arm Space: 100 |
| Exhausted Jog | "Injured Walk" | Default |
| Bonk / Wall Hit | "Falling Back" | Default |
| Finish Celebration | "Victory" | Default |

**Download settings for each FBX:** Format: FBX, Skin: With Skin, Frames per second: 30, Keyframe Reduction: None.

---

### 4B. Stylising the Character in Blender (Free)

This takes ~15 minutes and transforms the realistic mesh into a clean, faceted stylised look that matches the app.

1. Download and open **Blender** (blender.org, free)
2. File → Import → FBX → import the Michelle + Sprint FBX
3. Select the mesh object (not the armature)
4. In the Properties panel (right sidebar) → Modifier tab (wrench icon)
5. Add Modifier → **Decimate**
   - Set Ratio to `0.35` (this reduces polygons by 65%, creating the faceted look)
   - Click **Apply**
6. Add Modifier → **Edge Split** (this sharpens the faceted edges, making it look intentionally geometric rather than just low-res)
   - Set Split Angle to `30°`
   - Click **Apply**
7. In the Material tab, change the base colour to a flat `#1A1A1A` (near-black athletic suit)
8. Add a second material slot, assign it to the face/hands with colour `#F5C5A3` (skin tone)

**Repeat for all 5 animations:** Import each FBX into the same Blender file, making sure to use the same Michelle mesh (re-link the armature each time using the NLA editor — there are many YouTube tutorials for "Mixamo multiple animations Blender GLB").

**Export the final GLB with all animations:**
- File → Export → glTF 2.0 (.glb)
- Include: Selected Objects, Apply Modifiers, Animations
- Save as: `athlete.glb`
- Place in: `assets/models/athlete.glb`

**Alternative if Blender feels complex:** Use **mixamo2gltf.com** (free online tool) to combine all FBX animations into one GLB without Blender. You lose the faceted stylisation but save time. The developer can decide which approach fits their timeline.

---

### 4C. The Track & Environment

Do NOT build a full 400m oval — it would be enormous and kill performance. Instead use the **looping scroll illusion**:

- Build a straight 30-metre track section in Blender (or download a free one from **Sketchfab.com** — search "athletics track low poly", filter by "Free")
- The character runs in place while the track scrolls backwards
- When the race hits the curve sections (80–100m and 280–320m), the environment and camera rotate around the character to simulate turning
- Save as: `track_section.glb`, placed in `assets/models/track_section.glb`

**Track texture:** Use a simple procedural material in Blender — dark red/terracotta (`#C1440E`) with white lane lines. No external texture files needed.

**Stadium environment (background):** Use Three.js's `fog` + a simple `CylinderGeometry` stadium backdrop mesh. No HDRI needed. Set fog colour to `#F0EAD6` (afternoon stadium haze).

---

### 4D. Opponent Characters

For V1, opponents are visual only — they don't interact with the player. Use the same `athlete.glb` model but with:
- Different flat material colours (e.g., `#2255FF` blue, `#FF3333` red)
- Slightly varied sprint animation speeds (0.85x, 0.95x, 1.05x, 1.1x playback rate)
- Offset starting positions (adjacent lanes)

Their "speed" is scripted (not AI), based on difficulty level — see Section 10.

---

## 5. FILE & FOLDER ARCHITECTURE

```
/features
  /race400m
    index.tsx                  ← Entry point / screen
    RaceScreen.tsx             ← Full screen wrapper
    
    /3d
      Scene.tsx                ← R3F Canvas + lighting + camera
      Athlete.tsx              ← Player character component
      Opponents.tsx            ← AI opponent characters
      Track.tsx                ← Scrolling track + environment
      CameraRig.tsx            ← Dynamic camera (FOV, shake, lean)
    
    /game
      useGameLoop.ts           ← useFrame logic (speed, energy, distance)
      gameStore.ts             ← Zustand store (ALL game state)
      constants.ts             ← Tuning values (speeds, drain rates, triggers)
      miniGameTriggers.ts      ← Distance → mini-game mappings
    
    /minigames
      MiniGameOverlay.tsx      ← Container that renders the active mini-game
      OxygenLock.tsx           ← Memory sequence game
      LacticMath.tsx           ← Mental arithmetic game
      WordSprint.tsx           ← Word unscramble game
      CrowdPressure.tsx        ← Visual scanning game
      StroopEffect.tsx         ← Colour-word interference game
      ReactionBurst.tsx        ← Pure reaction time bonus
      CurveLean.tsx            ← Swipe left curve mini-game
    
    /hud
      HUD.tsx                  ← Full HUD overlay (on top of 3D)
      EnergyBar.tsx            ← Animated energy bar
      SpeedDisplay.tsx         ← Bold speed number
      DistanceTracker.tsx      ← 400m progress bar
      MiniMapDots.tsx          ← Mini-game incoming indicators
    
    /screens
      PreRaceScreen.tsx        ← Difficulty, leaderboard, start
      ReactionTimeScreen.tsx   ← "READY... GO!" flash
      BonkOverlay.tsx          ← Red edges, heavy pulse when energy = 0
      FinishScreen.tsx         ← Stats, PB, leaderboard update
    
    /data
      leaderboard.ts           ← jsonblob.com API calls
      personalRecords.ts       ← AsyncStorage read/write
    
    /assets                    ← (symlink or copy from /assets/models)
```

---

## 6. STATE MANAGEMENT — ZUSTAND STORE

File: `/features/race400m/game/gameStore.ts`

```typescript
import { create } from 'zustand'

type Phase = 
  | 'idle'          // pre-race screen
  | 'reaction'      // reaction time countdown
  | 'racing'        // active race
  | 'minigame'      // mini-game overlay active
  | 'bonk'          // energy = 0, sluggish mode
  | 'finish'        // crossed 400m line

type MiniGameId = 
  | 'curve_lean' 
  | 'oxygen_lock' 
  | 'lactic_math' 
  | 'word_sprint' 
  | 'crowd_pressure' 
  | 'stroop_effect' 
  | 'reaction_burst'

interface GameState {
  // ─── Race state ───────────────────────────────
  phase: Phase
  distance: number          // 0–400 (metres equivalent)
  speed: number             // 0–100 (normalised, not km/h)
  energy: number            // 0–100
  isHolding: boolean        // is player pressing the screen?

  // ─── Performance tracking ─────────────────────
  reactionTimeMs: number | null
  topSpeed: number
  finishTimeMs: number | null
  miniGamesWon: number
  miniGamesLost: number
  raceStartTimestamp: number | null

  // ─── Mini-game ────────────────────────────────
  currentMiniGame: MiniGameId | null
  miniGameResult: 'win' | 'lose' | null
  completedMiniGames: MiniGameId[]   // tracks which have fired this race

  // ─── Opponents ────────────────────────────────
  opponentDistances: number[]        // one per opponent (3 opponents)

  // ─── Difficulty ───────────────────────────────
  difficulty: 'easy' | 'medium' | 'hard'

  // ─── Actions ──────────────────────────────────
  setPhase: (phase: Phase) => void
  setHolding: (holding: boolean) => void
  setDifficulty: (d: 'easy' | 'medium' | 'hard') => void
  tickFrame: (delta: number) => void    // called every frame by useFrame
  triggerMiniGame: (id: MiniGameId) => void
  resolveMiniGame: (result: 'win' | 'lose') => void
  resetRace: () => void
}

const INITIAL_STATE = {
  phase: 'idle' as Phase,
  distance: 0,
  speed: 0,
  energy: 100,
  isHolding: false,
  reactionTimeMs: null,
  topSpeed: 0,
  finishTimeMs: null,
  miniGamesWon: 0,
  miniGamesLost: 0,
  raceStartTimestamp: null,
  currentMiniGame: null,
  miniGameResult: null,
  completedMiniGames: [],
  opponentDistances: [0, 0, 0],
  difficulty: 'medium' as const,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...INITIAL_STATE,

  setPhase: (phase) => set({ phase }),
  setHolding: (isHolding) => set({ isHolding }),
  setDifficulty: (difficulty) => set({ difficulty }),

  tickFrame: (delta) => {
    const state = get()
    if (state.phase !== 'racing' && state.phase !== 'bonk') return

    const { speed, energy, isHolding, distance, difficulty } = state

    // ── Tuning constants (see constants.ts for full table) ──
    const ACCEL       = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 22 : 28
    const DECEL       = 12
    const ENERGY_DRAIN = difficulty === 'easy' ? 14 : difficulty === 'medium' ? 18 : 24
    const ENERGY_REGEN = 6
    const BONK_SPEED  = 0.3   // multiplier when bonked
    const MAX_SPEED   = 100

    let newSpeed  = speed
    let newEnergy = energy

    if (state.phase === 'bonk') {
      // Slowly regen energy in bonk state, speed is capped low
      newEnergy = Math.min(100, energy + ENERGY_REGEN * 0.5 * delta)
      newSpeed  = Math.max(0, speed - DECEL * delta)
      if (newEnergy > 20) {
        set({ phase: 'racing' })
      }
    } else {
      // Normal racing
      if (isHolding) {
        newSpeed  = Math.min(MAX_SPEED, speed + ACCEL * delta)
        newEnergy = Math.max(0, energy - ENERGY_DRAIN * (speed / MAX_SPEED) * delta)
      } else {
        newSpeed  = Math.max(0, speed - DECEL * delta)
        newEnergy = Math.min(100, energy + ENERGY_REGEN * delta)
      }

      if (newEnergy <= 0) {
        newSpeed = newSpeed * BONK_SPEED
        set({ phase: 'bonk', energy: 0 })
      }
    }

    // Distance: speed is normalised 0–100, map to ~0–8 metres/second at top speed
    const METRES_PER_SEC_AT_MAX = 8
    const newDistance = distance + (newSpeed / 100) * METRES_PER_SEC_AT_MAX * delta

    // Opponent movement (scripted)
    const opponentSpeeds = [0.7, 0.85, 0.95]  // relative to player max
    const newOpponentDistances = state.opponentDistances.map(
      (d, i) => d + opponentSpeeds[i] * METRES_PER_SEC_AT_MAX * delta
    )

    set({
      speed: newSpeed,
      energy: newEnergy,
      distance: newDistance,
      topSpeed: Math.max(state.topSpeed, newSpeed),
      opponentDistances: newOpponentDistances,
    })

    if (newDistance >= 400) {
      set({
        phase: 'finish',
        finishTimeMs: Date.now() - (state.raceStartTimestamp ?? Date.now()),
      })
    }
  },

  triggerMiniGame: (id) => {
    set({ phase: 'minigame', currentMiniGame: id, miniGameResult: null })
  },

  resolveMiniGame: (result) => {
    const state = get()
    const ENERGY_GAIN = 22
    const ENERGY_LOSS = 18
    const SPEED_GAIN  = 15

    set({
      phase: 'racing',
      currentMiniGame: null,
      miniGameResult: result,
      completedMiniGames: [...state.completedMiniGames, state.currentMiniGame!],
      energy: result === 'win'
        ? Math.min(100, state.energy + ENERGY_GAIN)
        : Math.max(0, state.energy - ENERGY_LOSS),
      speed: result === 'win'
        ? Math.min(100, state.speed + SPEED_GAIN)
        : state.speed,
      miniGamesWon:  result === 'win' ? state.miniGamesWon + 1  : state.miniGamesWon,
      miniGamesLost: result === 'lose' ? state.miniGamesLost + 1 : state.miniGamesLost,
    })
  },

  resetRace: () => set({ ...INITIAL_STATE }),
}))
```

---

## 7. SCREEN FLOW & NAVIGATION

```
App Navigator
  └── RaceStack
        ├── PreRaceScreen        (difficulty picker, leaderboard preview)
        │     ↓ TAP "START RACE"
        ├── ReactionTimeScreen   (full-screen "READY... SET... GO!")
        │     ↓ player taps on GO flash (reaction time recorded)
        ├── RaceScreen           (3D canvas + HUD overlay)
        │     ↓ distance triggers mini-game
        │     ├── MiniGameOverlay (slides up, covers bottom 60% of screen)
        │     │     ↓ win or lose → overlay dismisses → back to racing
        │     ↓ distance = 400m OR timer expires
        └── FinishScreen         (stat summary, PB notification, leaderboard)
              ↓ TAP "RACE AGAIN" → back to PreRaceScreen
              ↓ TAP "HOME"       → back to main app
```

### Transitions
- PreRace → ReactionTime: slide up (Reanimated `withSpring`)
- ReactionTime → Race: the "GO!" text scales up and fades while the 3D scene fades in from black underneath
- Race → MiniGame: overlay slides up from bottom with `withSpring`, 3D scene does NOT pause — it slows to 20% speed in the background (still visible, still moving)
- Race → Finish: runner crosses line → confetti burst (simple particle system in R3F) → screen cross-fades to FinishScreen

---

## 8. CORE GAME LOOP

File: `/features/race400m/3d/Scene.tsx`

```typescript
import { Canvas, useFrame } from '@react-three/fiber/native'
import { useGameStore } from '../game/gameStore'
import { checkMiniGameTriggers } from '../game/miniGameTriggers'

function GameLoop() {
  const { tickFrame, distance, completedMiniGames, triggerMiniGame, phase } = useGameStore()

  useFrame((_, delta) => {
    tickFrame(delta)
    // Check if we've hit a mini-game trigger distance
    if (phase === 'racing') {
      const triggered = checkMiniGameTriggers(distance, completedMiniGames)
      if (triggered) triggerMiniGame(triggered)
    }
  })

  return null   // This component has no visual output — it's pure logic
}

export function Scene() {
  return (
    <Canvas
      style={{ flex: 1 }}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 1.6, 4], fov: 55 }}
      shadows
    >
      <GameLoop />
      <fog attach="fog" args={['#F0EAD6', 20, 80]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Track />
      <Athlete />
      <Opponents />
      <CameraRig />
    </Canvas>
  )
}
```

### Mini-game distance triggers

File: `/features/race400m/game/miniGameTriggers.ts`

```typescript
import type { MiniGameId } from './gameStore'

// Distance thresholds at which mini-games can fire
// The specific game at each threshold is randomised from the pool
const TRIGGERS: { distance: number; pool: MiniGameId[] }[] = [
  { distance: 80,  pool: ['curve_lean'] },                               // Always the curve lean
  { distance: 150, pool: ['oxygen_lock', 'lactic_math'] },               // Memory OR maths
  { distance: 220, pool: ['word_sprint', 'crowd_pressure'] },            // Word OR scanning
  { distance: 300, pool: ['stroop_effect', 'oxygen_lock'] },             // Stroop OR memory
  { distance: 360, pool: ['reaction_burst', 'lactic_math'] },            // Bonus burst OR maths
]

export function checkMiniGameTriggers(
  distance: number,
  completed: MiniGameId[]
): MiniGameId | null {
  for (const trigger of TRIGGERS) {
    // Within 2m of trigger and hasn't fired yet
    if (
      distance >= trigger.distance &&
      distance < trigger.distance + 2 &&
      !trigger.pool.some(id => completed.includes(id))
    ) {
      // Pick randomly from pool
      return trigger.pool[Math.floor(Math.random() * trigger.pool.length)]
    }
  }
  return null
}
```

---

## 9. MINI-GAMES — FULL SPECS

All mini-games share the same wrapper from `MiniGameOverlay.tsx`. They:
- Slide up from the bottom of the screen (leaving ~40% of the 3D scene visible at the top)
- Have a **countdown timer bar** at the top (yellow → red)
- Auto-resolve as `'lose'` if timer hits zero
- Use the app's yellow/black design language

---

### 9.1 — CURVE LEAN (Distance: ~80m)
**Cognitive type:** Motor coordination / rhythm  
**Time limit:** 4 seconds

**Visual:** Four large arrows appear one by one (←) with a rhythm. The word **"LEAN"** flashes above in bold.

**Mechanic:** Player must swipe LEFT in rhythm as each arrow appears. 3 swipes needed. The arrows pulse — each pulse is the window to swipe. Swipe too early or too late = no count.

**Win condition:** 3 correct rhythmic swipes within 4 seconds  
**Lose condition:** Fewer than 3 swipes, or timer expires

**Implementation:**  
Use `react-native-gesture-handler`'s `GestureDetector` + `Gesture.Pan()`. Track swipe velocity direction. On left swipe with velocity > 400: count the swipe, flash the arrow green, trigger light haptic (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`). On 3rd swipe, auto-win.

---

### 9.2 — OXYGEN LOCK (Distance: ~150m)
**Cognitive type:** Short-term memory (sequence recall)  
**Time limit:** 6 seconds (2s to memorise + 4s to recall)

**Visual:** A 2×2 grid of coloured circles (yellow, black, white, grey). During the memorise phase (2 seconds), 3 of them light up in sequence. Then all go dark. Player must tap them in the same order.

**Mechanic:**
1. Phase 1 (2s): Show the sequence. Circles flash with a 0.6s interval.
2. Phase 2 (4s): Grid goes dark. Player taps 3 circles in order. Wrong tap → instant lose.

**Win condition:** Correct sequence tapped  
**Lose condition:** Wrong tap, or timer expires

**Difficulty scaling:**
- Easy: 3 items, 2×2 grid
- Medium: 4 items, 2×2 grid (harder to track order)
- Hard: 4 items, 3×2 grid (6 cells, more distraction)

**Implementation:** Store sequence in local component state. Compare player taps array to original sequence on each tap.

---

### 9.3 — LACTIC MATH (Distance: ~200m)
**Cognitive type:** Arithmetic under pressure  
**Time limit:** 5 seconds

**Visual:** A large equation in bold type, e.g. **"37 + 8 = ?"** with 4 answer buttons below (one correct, three plausible wrong answers).

**Mechanic:** Tap the correct answer. Simple.

**Win condition:** Correct tap  
**Lose condition:** Wrong tap, or timer expires

**Difficulty scaling:**
- Easy: Single digit addition/subtraction (e.g. `7 + 9`)
- Medium: Two-digit + single-digit (e.g. `34 + 8`, `61 - 7`)
- Hard: Two-digit × single-digit (e.g. `12 × 7`) or two-step (`8 × 6 + 4`)

**Wrong answer generation:** Take correct answer ± 1, ± random(2–8), and ± exactly 10 (common mental error). Shuffle all four options.

**Implementation:** Pure JavaScript math. Use `Math.random()` to pick the equation type based on difficulty. Generate wrong answers procedurally.

---

### 9.4 — WORD SPRINT (Distance: ~220m)
**Cognitive type:** Verbal processing / pattern recognition  
**Time limit:** 5 seconds

**Visual:** A scrambled 5-letter word appears in huge bold type (e.g. **"CAEP"**). Three unscrambled options appear below it.

**Mechanic:** Identify the correctly unscrambled word and tap it.

**Win condition:** Correct word tapped  
**Lose condition:** Wrong tap, or timer expires

**Word bank (athletics-themed for thematic immersion):**
```
PACE → CAEP, AECP, ECPA
TRACK → CRACKT, TARKC, KARCT
SPRINT → NRSPTI, PRSNIT, TIPRSN
POWER → PWERO, ROPEW, EOPWR
DRIVE → VIRDE, DERIV, IRVED
BLOCK → BOLCK, LCOBK, BKOCL
SPLIT → LPSIT, TILPS, SPITL
SURGE → GESUR, RSEUG, UEGRS
CURVE → RVUCE, EUCVR, CRUEV
FINAL → NFALI, ANIFL, LIFNA
```

**Wrong options:** Two other scrambles of the same word, making all three look similar. Player must identify the real one.

**Implementation:** Preload the word bank as a constant array. Pick one randomly per game instance. Shuffle the scramble options.

---

### 9.5 — CROWD PRESSURE (Distance: ~280m)
**Cognitive type:** Visual scanning / attention  
**Time limit:** 4 seconds

**Visual:** 8–12 large numbers (single digit, 1–9) appear scattered across the screen. One number appears TWICE among them. Find and tap the duplicate.

**Mechanic:** Scan the numbers, identify which one appears twice, tap it.

**Win condition:** Tapped the duplicated number  
**Lose condition:** Wrong tap, or timer expires

**Difficulty scaling:**
- Easy: 8 numbers, duplicate is visually separated (easier to find)
- Medium: 10 numbers, randomised positions
- Hard: 12 numbers, randomised, some numbers look similar (6 and 9, 1 and 7)

**Implementation:** Generate an array of unique random digits, duplicate one of them, shuffle the array, display in random positions using `position: 'absolute'` in a `View`. On tap, check if tapped value === the duplicated value.

---

### 9.6 — STROOP EFFECT (Distance: ~320m)
**Cognitive type:** Inhibitory control / cognitive interference  
**Time limit:** 4 seconds

**Visual:** A large word — the NAME of a colour — written in a DIFFERENT colour ink. E.g. the word "RED" written in blue. Below it: four colour swatches (red, blue, yellow, black).

**Mechanic:** Tap the colour of the INK (not what the word says). The brain wants to read the word — you must override it and respond to the visual colour. This is the classic Stroop effect.

**Win condition:** Tapped the correct ink colour  
**Lose condition:** Wrong tap (including tapping what the word says), or timer expires

**Word/colour pairs:**
```
"RED" in blue ink    → tap blue
"YELLOW" in black ink → tap black
"BLACK" in yellow ink → tap yellow
"BLUE" in red ink    → tap red
"GREEN" in yellow ink → tap yellow (hardest — green not in palette)
"WHITE" in black ink  → tap black
```

**Implementation:** Define pairs as objects `{ word: string, wordColor: string, inkColor: string }`. Display the word in its inkColor. Four answer buttons are always the same 4 app colours. On tap, compare to inkColor.

---

### 9.7 — REACTION BURST (Distance: ~360m — bonus)
**Cognitive type:** Pure reaction time (reward game)  
**Time limit:** 1.5 seconds to tap after the flash

**Visual:** Full screen goes BLACK. After a random 0.5–1.5 second delay, the screen flashes YELLOW and the word **"NOW!"** appears. Player must tap before the flash fades.

**Mechanic:** Wait for the flash. Tap as fast as possible.

**Win condition:** Tap within 0.4 seconds of the flash  
**Lose condition:** Tap too early (before flash) → immediate lose (anti-cheat), or miss the window

**This is a reward game** — it should feel generous, not punishing. Its purpose is a final energy burst before the home straight. The 0.4s window is achievable by most people.

**Implementation:** `setTimeout` for the random delay. Record timestamp when yellow flashes. On tap, compute delta. If delta < 400ms → win. If tap arrives before flash → lose immediately. 

---

### 9.8 — MINI-GAME OVERLAY COMPONENT

File: `/features/race400m/minigames/MiniGameOverlay.tsx`

```typescript
// Shared wrapper for all mini-games
// - Slides up from bottom with spring animation
// - Shows countdown timer bar
// - Renders the active mini-game
// - Calls resolveMiniGame('win' | 'lose') when done

// Key design details:
// - Background: #0A0A0A (near black, semi-transparent 95%)
// - Header: yellow (#FFE500) countdown bar that drains left-to-right
// - Game title in white bold uppercase (e.g. "CROWD PRESSURE")
// - Bottom area: the game's interactive elements
// - On win: flash green (#00C851) overlay for 0.3s + heavy haptic
// - On lose: flash red (#FF4444) overlay for 0.3s + heavy haptic
```

---

## 10. OPPONENT SYSTEM

### V1: Scripted Opponents (no true AI)

Three opponents run alongside the player. Their speed is not AI — it follows a pre-calculated script based on difficulty:

```typescript
// /features/race400m/game/constants.ts

export const OPPONENT_PROFILES = {
  easy: [
    { name: 'Runner 1', speedMultiplier: 0.70, colour: '#2255FF' },
    { name: 'Runner 2', speedMultiplier: 0.80, colour: '#FF3333' },
    { name: 'Runner 3', speedMultiplier: 0.65, colour: '#33CC33' },
  ],
  medium: [
    { name: 'Runner 1', speedMultiplier: 0.85, colour: '#2255FF' },
    { name: 'Runner 2', speedMultiplier: 0.90, colour: '#FF3333' },
    { name: 'Runner 3', speedMultiplier: 0.78, colour: '#33CC33' },
  ],
  hard: [
    { name: 'Runner 1', speedMultiplier: 0.97, colour: '#2255FF' },
    { name: 'Runner 2', speedMultiplier: 0.93, colour: '#FF3333' },
    { name: 'Runner 3', speedMultiplier: 1.02, colour: '#33CC33' }, // can beat you
  ],
}
```

`speedMultiplier` is relative to the player's MAXIMUM possible speed (if they never let go). In practice, the player manages energy so they rarely sustain max — meaning opponents feel competitive without true AI.

### Position display
In the HUD, show `"2ND PLACE"` or `"LEADING"` based on comparing `distance` (player) vs `opponentDistances[i]`. Update every frame. Display it large and bold — it's emotionally important.

### V2: Ghost Mode
In V2, store the player's distance-over-time curve from their best race in AsyncStorage. Render a semi-transparent ghost runner that follows that curve exactly, giving a personal-best challenge.

---

## 11. HUD DESIGN

The HUD is a React Native `View` overlaid on top of the R3F `Canvas`. It uses `position: 'absolute'` and `pointerEvents: 'none'` (except for the hold area).

### Layout (top to bottom, left to right)

```
┌─────────────────────────────────────────────┐
│  [← QUIT]              [2ND PLACE]          │  ← top bar
│                                             │
│                  [3D SCENE]                 │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ ENERGY ████████████████░░░░░░  78%   │   │  ← energy bar (yellow gradient)
│  └──────────────────────────────────────┘   │
│                                             │
│  [●●●●○○○○○○○○○○○○○○○○○○○○○○○○●●●●○]       │  ← 400m progress strip
│                [87m / 400m]                 │
│                                             │
│  Speed: 84 km/h            ⬛⬛⬛⬛⬛       │  ← speed + mini-game incoming dots
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │         HOLD TO SPRINT               │   │  ← hold area (full width, ~30% height)
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Energy Bar
- Full width, 12px height
- Left edge = 0 energy, Right edge = 100 energy
- Colour: Gradient `#FFE500` (left, full) → `#FF6600` (70%) → `#FF2222` (low)
- Use `expo-linear-gradient`
- When energy < 20: the bar pulses (scale up/down using Reanimated `withRepeat`)
- When energy = 0: bar goes fully red and screen edges gain a red vignette

### Speed Display
- Bold italic number, 28px, white text with black outline
- Label: "km/h" in small caps next to it
- The number updates every frame but only the display re-renders (Zustand subscription)

### 400m Progress Strip
- Thin horizontal line across the full width
- A yellow dot represents the player's position
- Small grey dots at the 5 mini-game trigger distances — gives the player advance warning
- When a dot is upcoming (within 30m), it pulses yellow

### Place indicator
- Centre-top of screen
- Bold uppercase: "LEADING" / "2ND" / "3RD" / "4TH"
- Colour: gold when leading, white otherwise
- Font size: 18px, heavy weight

### Hold Area
- Bottom 30% of screen
- Dark semi-transparent (`rgba(0,0,0,0.4)`)
- Bold text: "HOLD TO SPRINT" in small grey uppercase
- When holding: the background flashes very subtly yellow every 0.5s (rhythm feedback since no audio)
- Uses a single `TouchableWithoutFeedback` with `onPressIn` → `setHolding(true)` and `onPressOut` → `setHolding(false)`

---

## 12. UI DESIGN SYSTEM

### Colours (inherited from existing app)
```typescript
export const RACE_COLOURS = {
  yellow:     '#FFE500',   // primary — matches existing app
  black:      '#0A0A0A',   // near-black (not pure black — softer)
  white:      '#FFFFFF',
  offWhite:   '#F8F8F0',   // card backgrounds
  red:        '#FF3B30',   // danger / bonk state
  green:      '#00C851',   // win flash
  energyLow:  '#FF4444',
  energyMid:  '#FF8800',
  energyFull: '#FFE500',
  overlay:    'rgba(10,10,10,0.92)',
}
```

### Typography (match existing app bold style)
```typescript
export const RACE_TYPE = {
  heroNumber:   { fontSize: 56, fontWeight: '900', fontStyle: 'italic' },   // speed display
  screenTitle:  { fontSize: 36, fontWeight: '900', letterSpacing: -1 },      // "READY"
  miniGameTitle:{ fontSize: 22, fontWeight: '800', letterSpacing: 2 },       // "LACTIC MATH"
  label:        { fontSize: 12, fontWeight: '600', letterSpacing: 1.5 },     // "km/h", "ENERGY"
  bodyBold:     { fontSize: 16, fontWeight: '700' },
}
```

### Pre-Race Screen layout
```
Background: #FFE500 (full yellow — matches app home screen)

[← BACK]

"THE 400M"              ← heavy black, huge
"RACE"

Difficulty:  [EASY]  [MEDIUM ✓]  [HARD]   ← pill toggles (black bg when selected)

Your PB: 38.2s
─────────────────────────────────────────
LEADERBOARD PREVIEW
1. Alex T.        34.1s  🥇
2. Jordan K.      35.8s
3. You            38.2s  ← highlighted in black card
─────────────────────────────────────────

[        START RACE        ]   ← full-width black button, yellow text
```

### Reaction Time Screen
```
Background: #0A0A0A (black)

Centre of screen:
"GET"
"READY..."            ← large white text, fades in

After 2 seconds:
Flash screen YELLOW
"GO!"                 ← massive, bold, yellow text scales from 0 to full

Player taps → screen fades out
ReactionTimeMs = Date.now() - flashTimestamp displayed briefly:
"0.24s"  ← small white number
```

### Bonk State Overlay (no separate screen — overlay on HUD)
- Screen edges: red vignette (`position: absolute`, full screen, border only)
- Vignette pulses like a heartbeat: slow fade in/out on repeat
- Bold red text centre-top: **"BONKING"** (with downward arrow)
- The 3D runner animation switches to the "Injured Walk" animation
- Heavy haptic every 1 second: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)`

### Finish Screen
```
Background: #FFE500

"FINISHED!"           ← huge black text

[YOUR TIME]
  38.2s               ← massive italic number

[TOP SPEED]  [MINI-GAMES]  [POSITION]
  87 km/h       3/5 won      2nd place

─────────────────────────────────────
🏆 PERSONAL BEST!   ← yellow badge if PB beaten

LEADERBOARD (updated)
1. You    38.2s  ← NEW
2. Alex T. 34.1s
3. Jordan  35.8s
─────────────────────────────────────

[  RACE AGAIN  ]   [  HOME  ]
```

---

## 13. POST-RACE DATA — PERSONAL RECORDS & LEADERBOARD

### Personal Records (local, AsyncStorage)
```typescript
// /features/race400m/data/personalRecords.ts

import AsyncStorage from '@react-native-async-storage/async-storage'

interface PersonalBest {
  timeMs: number
  topSpeed: number
  miniGamesWon: number
  reactionTimeMs: number
  date: string
}

const PB_KEY = 'race400m_personal_best'

export async function loadPersonalBest(): Promise<PersonalBest | null> {
  const raw = await AsyncStorage.getItem(PB_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function savePersonalBest(data: PersonalBest): Promise<void> {
  const current = await loadPersonalBest()
  if (!current || data.timeMs < current.timeMs) {
    await AsyncStorage.setItem(PB_KEY, JSON.stringify(data))
  }
}
```

### Leaderboard (jsonblob.com — serverless)
```typescript
// /features/race400m/data/leaderboard.ts
// Uses the same jsonblob endpoint pattern as the rest of the app

const BLOB_ID = 'YOUR_LEADERBOARD_BLOB_ID'    // replace with actual blob ID
const BASE_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`

interface LeaderboardEntry {
  name: string       // user's display name from app profile
  timeMs: number
  date: string
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(BASE_URL)
  return res.json()
}

export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  const current = await fetchLeaderboard()
  const updated = [...current, entry]
    .sort((a, b) => a.timeMs - b.timeMs)     // sort fastest first
    .slice(0, 50)                             // keep top 50
  
  await fetch(BASE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  })
}
```

---

## 14. V1 DELIVERABLES CHECKLIST

Antigravity should ship V1 when ALL of the following are complete and tested on a physical device (not simulator — 3D does not work on simulators):

### Infrastructure
- [ ] EAS dev build created and installing correctly on physical device
- [ ] `athlete.glb` exported from Blender with all 5 animations
- [ ] `track_section.glb` placed in assets
- [ ] All npm packages installed, no version conflicts

### Screens
- [ ] PreRaceScreen — difficulty picker, leaderboard preview, PB display
- [ ] ReactionTimeScreen — countdown, GO flash, reaction time recording
- [ ] RaceScreen — 3D scene running at ≥ 45fps on mid-range Android device
- [ ] FinishScreen — all stats displayed, PB badge shown if earned

### Game Loop
- [ ] Hold/release mechanic working correctly
- [ ] Energy drains on hold, regens on release
- [ ] Bonk state triggers at energy = 0, recovers at energy > 20
- [ ] Distance tracks to 400, finish triggers correctly
- [ ] 3 opponents visible and moving at correct scripted speeds

### Mini-Games (all 7)
- [ ] CURVE LEAN (80m)
- [ ] OXYGEN LOCK (150m)
- [ ] LACTIC MATH (200m)
- [ ] WORD SPRINT (220m)
- [ ] CROWD PRESSURE (280m)
- [ ] STROOP EFFECT (320m)
- [ ] REACTION BURST (360m)
- [ ] Overlay animation (slide up/down) working smoothly
- [ ] Win/lose resolution correctly applies energy/speed changes
- [ ] Timer bar works and auto-resolves on timeout
- [ ] Haptic feedback on win and lose

### HUD
- [ ] Energy bar with gradient and pulse when low
- [ ] Speed display updating live
- [ ] 400m progress strip with mini-game indicator dots
- [ ] Place indicator updating correctly (LEADING / 2ND / 3RD / 4TH)
- [ ] Hold area responding to press/release

### Data
- [ ] Personal best saving and loading with AsyncStorage
- [ ] PB comparison on finish screen
- [ ] Leaderboard fetching from jsonblob
- [ ] Leaderboard score submission working

### Polish
- [ ] Bonk state: red vignette, pulse haptic, animation switch
- [ ] Mini-game win: green flash + heavy haptic
- [ ] Mini-game lose: red flash + heavy haptic
- [ ] Reaction time result displayed briefly after GO tap
- [ ] Screen transitions smooth (no jank)

---

## 15. V2 ROADMAP

Ship V1 first. Once stable and tested, these are the V2 additions, in priority order:

### 1. Ghost Runner (highest priority)
Store the player's exact distance-over-time curve from their best race in AsyncStorage. In subsequent races, render a semi-transparent ghost opponent following that curve. The ghost runner becomes a personal motivator — beat yourself.

**Technical note:** Record an array of `{ timestamp, distance }` samples every 200ms during the race. On replay, interpolate between samples each frame.

### 2. Character Customisation
Let the user pick their runner's jersey colour in the app settings. Pass the selected colour as a material override to the `Athlete` component. Store in AsyncStorage.

### 3. Difficulty Progression System
Lock Hard mode behind completing Easy 3 times. Show a progress bar toward unlocking the next tier. Ties the game into the app's habit/streak system naturally.

### 4. Additional Mini-Games (expand the pool)

| Mini-Game | Cognitive Type | Description |
|---|---|---|
| **Flag Decision** | Working memory | 3 flags flash in sequence. Pick the middle one from 4 options. |
| **Breathing Pattern** | Rhythm + pattern | Tap in sync with a displayed breath pattern (in 3, hold 1, out 3). |
| **Number Chain** | Arithmetic | `3 × 4 → ? → 18`. Fill in the missing operation number. |
| **Mirror Move** | Spatial reasoning | A left hand doing a gesture — tap the correct mirror image from 4 options. |
| **Split Time** | Estimation | Estimate elapsed time since race start. Tap when you think 10 seconds have passed (no clock shown). |

### 5. Audio (when ready)
- Crowd ambient loop (quiet, swells near finish)
- Breathing audio that speeds up as energy drops
- Beat/pulse sync with footstep haptics
- Finish line roar

**Library to use:** `expo-av` for audio playback (already in Expo's managed packages).

### 6. Week-in-Review Integration
Pull the player's last 7 race results and show a trend graph on the PreRaceScreen. "You've improved by 2.1s this week." Ties deeply into the app's existing training log concept.

---

*Document prepared for Antigravity development team. All code samples are implementation-ready. Asset links, blob IDs, and Expo account credentials should be substituted by the developer. Test exclusively on physical devices — 3D rendering does not function on iOS Simulator or Android Emulator.*
