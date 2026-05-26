// ============================================================
// features/race400m/game/gameStore.ts
// Zustand store — ALL game state. Never use useState in the game loop.
// useFrame reads this store directly each frame without triggering re-renders.
// ============================================================

import { create } from 'zustand';

export type Phase =
  | 'idle'       // pre-race screen
  | 'reaction'   // READY… GO! countdown
  | 'racing'     // active race
  | 'minigame'   // mini-game overlay is active
  | 'bonk'       // energy = 0, sluggish mode
  | 'finish';    // crossed 400m line

export type MiniGameId =
  | 'curve_lean'
  | 'oxygen_lock'
  | 'lactic_math'
  | 'word_sprint'
  | 'crowd_pressure'
  | 'stroop_effect'
  | 'reaction_burst';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RaceType = 'flat' | 'hurdles';

interface GameState {
  // ─── Race state ──────────────────────────────────────────
  raceType: RaceType;
  phase: Phase;
  distance: number;          // 0–400 (metres equivalent)
  speed: number;             // 0–100 (normalised, not km/h)
  energy: number;            // 0–100
  isHolding: boolean;        // is player pressing the screen?
  athleteY: number;          // jump height
  isJumping: boolean;
  jumpStartTime: number | null;
  lastHurdleCrossed: number; // index of last hurdle passed

  // ─── Performance tracking ────────────────────────────────
  reactionTimeMs: number | null;
  raceStartTimestamp: number | null;
  topSpeed: number;
  finishTimeMs: number | null;
  miniGamesWon: number;
  miniGamesLost: number;
  hurdlesHit: number;
  hurdlesCleared: number;

  // ─── Mini-game ───────────────────────────────────────────
  currentMiniGame: MiniGameId | null;
  miniGameResult: 'win' | 'lose' | null;
  completedMiniGames: MiniGameId[];   // tracks which have fired this race

  // ─── Opponents ───────────────────────────────────────────
  opponentDistances: [number, number, number]; // one per opponent

  // ─── Difficulty ──────────────────────────────────────────
  difficulty: Difficulty;

  // ─── Actions ─────────────────────────────────────────────
  setRaceType: (t: RaceType) => void;
  setPhase: (phase: Phase) => void;
  setHolding: (holding: boolean) => void;
  setDifficulty: (d: Difficulty) => void;
  setReactionTime: (ms: number) => void;
  jump: () => void;
  startRace: () => void;
  tickFrame: (delta: number) => void;   // called every frame by useFrame
  triggerMiniGame: (id: MiniGameId) => void;
  resolveMiniGame: (result: 'win' | 'lose') => void;
  resetRace: () => void;
}

const INITIAL_STATE = {
  raceType: 'flat' as RaceType,
  phase: 'idle' as Phase,
  distance: 0,
  speed: 0,
  energy: 100,
  isHolding: false,
  athleteY: 0,
  isJumping: false,
  jumpStartTime: null as number | null,
  lastHurdleCrossed: -1,
  reactionTimeMs: null as number | null,
  raceStartTimestamp: null as number | null,
  topSpeed: 0,
  finishTimeMs: null as number | null,
  miniGamesWon: 0,
  miniGamesLost: 0,
  hurdlesHit: 0,
  hurdlesCleared: 0,
  currentMiniGame: null as MiniGameId | null,
  miniGameResult: null as 'win' | 'lose' | null,
  completedMiniGames: [] as MiniGameId[],
  opponentDistances: [0, 0, 0] as [number, number, number],
  difficulty: 'medium' as Difficulty,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...INITIAL_STATE,

  setRaceType: (raceType) => set({ raceType }),
  setPhase: (phase) => set({ phase }),
  setHolding: (isHolding) => set({ isHolding }),
  setDifficulty: (difficulty) => set({ difficulty }),

  setReactionTime: (ms) => set({ reactionTimeMs: ms }),

  jump: () => {
    const state = get();
    if (state.phase === 'racing' && !state.isJumping) {
      set({ isJumping: true, jumpStartTime: Date.now() });
    }
  },

  startRace: () =>
    set({
      phase: 'racing',
      raceStartTimestamp: Date.now(),
      distance: 0,
      speed: 0,
      energy: 100,
      topSpeed: 0,
      athleteY: 0,
      isJumping: false,
      jumpStartTime: null,
      lastHurdleCrossed: -1,
      miniGamesWon: 0,
      miniGamesLost: 0,
      hurdlesHit: 0,
      hurdlesCleared: 0,
      completedMiniGames: [],
      opponentDistances: [0, 0, 0],
      currentMiniGame: null,
      miniGameResult: null,
      finishTimeMs: null,
    }),

  tickFrame: (delta) => {
    const state = get();
    if (state.phase !== 'racing' && state.phase !== 'bonk') return;

    const { speed, energy, isHolding, distance, difficulty, opponentDistances, isJumping, jumpStartTime } = state;

    // ── Tuning constants ─────────────────────────────────────
    const ACCEL        = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 22 : 28;
    const DECEL        = 12;
    const ENERGY_DRAIN = difficulty === 'easy' ? 14 : difficulty === 'medium' ? 18 : 24;
    const ENERGY_REGEN = 6;
    const BONK_SPEED   = 0.3;   // speed multiplier while bonked
    const MAX_SPEED    = 100;
    const METRES_PER_SEC_AT_MAX = 8;
    const JUMP_DURATION_MS = 600;
    const JUMP_HEIGHT  = 1.1;
    const HURDLE_CLEARANCE = 0.7; // Y height needed to clear hurdle

    // Opponent scripted speeds (relative to player's max possible)
    const OPPONENT_SPEEDS: [number, number, number] =
      difficulty === 'easy'   ? [0.65, 0.70, 0.80] :
      difficulty === 'medium' ? [0.78, 0.85, 0.90] :
                                [0.93, 0.97, 1.02];

    let newSpeed  = speed;
    let newEnergy = energy;
    let newPhase  = state.phase;
    let newAthleteY = state.athleteY;
    let newIsJumping = isJumping;

    // Jump logic
    if (isJumping && jumpStartTime) {
      const elapsed = Date.now() - jumpStartTime;
      if (elapsed >= JUMP_DURATION_MS) {
        newIsJumping = false;
        newAthleteY = 0;
      } else {
        const t = elapsed / JUMP_DURATION_MS;
        newAthleteY = Math.sin(t * Math.PI) * JUMP_HEIGHT;
      }
    }

    if (state.phase === 'bonk') {
      // Slowly regen energy; speed is capped low
      newEnergy = Math.min(100, energy + ENERGY_REGEN * 0.5 * delta);
      newSpeed  = Math.max(0, speed - DECEL * delta);
      if (newEnergy > 20) {
        newPhase = 'racing';
      }
    } else {
      // Normal racing
      if (isHolding) {
        newSpeed  = Math.min(MAX_SPEED, speed + ACCEL * delta);
        newEnergy = Math.max(0, energy - ENERGY_DRAIN * (speed / MAX_SPEED) * delta);
      } else {
        newSpeed  = Math.max(0, speed - DECEL * delta);
        newEnergy = Math.min(100, energy + ENERGY_REGEN * delta);
      }

      if (newEnergy <= 0) {
        newSpeed  = newSpeed * BONK_SPEED;
        newPhase  = 'bonk';
        newEnergy = 0;
      }
    }

    const newDistance = distance + (newSpeed / 100) * METRES_PER_SEC_AT_MAX * delta;

    // Hurdle Collision Logic
    let newHurdlesHit = state.hurdlesHit;
    let newHurdlesCleared = state.hurdlesCleared;
    let newLastHurdleCrossed = state.lastHurdleCrossed;

    if (state.raceType === 'hurdles') {
      const HURDLES = Array.from({ length: 10 }).map((_, i) => 45 + i * 35);
      const hurdleIndex = HURDLES.findIndex((h) => h >= distance && h <= newDistance);
      
      if (hurdleIndex !== -1 && hurdleIndex > state.lastHurdleCrossed) {
        newLastHurdleCrossed = hurdleIndex;
        // Check Y height at collision moment
        if (newAthleteY < HURDLE_CLEARANCE) {
          // Hit!
          newHurdlesHit++;
          newSpeed *= 0.6; // 40% speed drop
          newEnergy = Math.max(0, newEnergy - 15);
          if (newEnergy === 0) newPhase = 'bonk';
        } else {
          // Cleared!
          newHurdlesCleared++;
        }
      }
    }

    const newOpponentDistances = opponentDistances.map(
      (d, i) => d + OPPONENT_SPEEDS[i] * METRES_PER_SEC_AT_MAX * delta,
    ) as [number, number, number];

    const updates: Partial<GameState> = {
      speed: newSpeed,
      energy: newEnergy,
      distance: newDistance,
      topSpeed: Math.max(state.topSpeed, newSpeed),
      opponentDistances: newOpponentDistances,
      phase: newPhase,
      athleteY: newAthleteY,
      isJumping: newIsJumping,
      lastHurdleCrossed: newLastHurdleCrossed,
      hurdlesHit: newHurdlesHit,
      hurdlesCleared: newHurdlesCleared,
    };

    if (newDistance >= 400) {
      updates.phase = 'finish';
      updates.finishTimeMs = Date.now() - (state.raceStartTimestamp ?? Date.now());
    }

    set(updates);
  },

  triggerMiniGame: (id) =>
    set({ phase: 'minigame', currentMiniGame: id, miniGameResult: null }),

  resolveMiniGame: (result) => {
    const state = get();
    const ENERGY_GAIN = 22;
    const ENERGY_LOSS = 18;
    const SPEED_GAIN  = 15;

    set({
      phase: 'racing',
      currentMiniGame: null,
      miniGameResult: result,
      completedMiniGames: [...state.completedMiniGames, state.currentMiniGame!],
      energy:
        result === 'win'
          ? Math.min(100, state.energy + ENERGY_GAIN)
          : Math.max(0, state.energy - ENERGY_LOSS),
      speed:
        result === 'win'
          ? Math.min(100, state.speed + SPEED_GAIN)
          : state.speed,
      miniGamesWon:  result === 'win'  ? state.miniGamesWon  + 1 : state.miniGamesWon,
      miniGamesLost: result === 'lose' ? state.miniGamesLost + 1 : state.miniGamesLost,
    });
  },

  resetRace: () => set({ ...INITIAL_STATE }),
}));
