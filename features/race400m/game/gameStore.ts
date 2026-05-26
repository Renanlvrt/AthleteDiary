import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export type Phase = 'idle' | 'reaction' | 'racing' | 'minigame' | 'bonk' | 'finish';

export type MiniGameId =
  | 'curve_lean'
  | 'oxygen_lock'
  | 'lactic_math'
  | 'word_sprint'
  | 'crowd_pressure'
  | 'stroop_effect'
  | 'reaction_burst';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RaceType = 'flat' | 'hurdles' | 'long_jump';

export const HURDLE_DISTANCES = Array.from({ length: 10 }).map((_, i) => 45 + i * 35);
export const LONG_JUMP_BOARD = 40;

interface GameState {
  // ─── Race state ──────────────────────────────────────────
  raceType: RaceType;
  phase: Phase;
  distance: number;          // 0–400 (or 0-40 for long jump)
  speed: number;             // 0–100 (normalised, not km/h)
  energy: number;            // 0–100
  isHolding: boolean;        // is player pressing the screen?
  athleteY: number;          // jump height
  isJumping: boolean;
  jumpStartTime: number | null;
  lastHurdleCrossed: number; // index of last hurdle passed
  timeScale: number;         // engine speed (for slow-mo)

  // ─── Performance tracking ────────────────────────────────
  reactionTimeMs: number | null;
  raceStartTimestamp: number | null;
  topSpeed: number;
  finishTimeMs: number | null;
  jumpDistance: number | null; // For long jump
  miniGamesWon: number;
  miniGamesLost: number;
  hurdlesHit: number;
  hurdlesCleared: number;

  // ─── Mini-game & Feedback ────────────────────────────────
  currentMiniGame: MiniGameId | null;
  miniGameResult: 'win' | 'lose' | null;
  completedMiniGames: MiniGameId[];
  feedbackToast: { type: 'success' | 'fail'; message: string } | null;

  // ─── Opponents ───────────────────────────────────────────
  opponentDistances: [number, number, number];
  opponentY: [number, number, number];
  opponentJumpStartTimes: [number | null, number | null, number | null];
  difficulty: Difficulty;

  // ─── Actions ─────────────────────────────────────────────
  setRaceType: (t: RaceType) => void;
  setPhase: (phase: Phase) => void;
  setHolding: (holding: boolean) => void;
  setDifficulty: (d: Difficulty) => void;
  setReactionTime: (ms: number) => void;
  jump: () => void;
  startRace: () => void;
  tickFrame: (delta: number) => void;
  triggerMiniGame: (id: MiniGameId) => void;
  resolveMiniGame: (result: 'win' | 'lose') => void;
  clearFeedbackToast: () => void;
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
  timeScale: 1.0,

  reactionTimeMs: null as number | null,
  raceStartTimestamp: null as number | null,
  topSpeed: 0,
  finishTimeMs: null as number | null,
  jumpDistance: null as number | null,
  miniGamesWon: 0,
  miniGamesLost: 0,
  hurdlesHit: 0,
  hurdlesCleared: 0,

  currentMiniGame: null as MiniGameId | null,
  miniGameResult: null as 'win' | 'lose' | null,
  completedMiniGames: [] as MiniGameId[],
  feedbackToast: null as { type: 'success' | 'fail'; message: string } | null,

  opponentDistances: [0, 0, 0] as [number, number, number],
  opponentY: [0, 0, 0] as [number, number, number],
  opponentJumpStartTimes: [null, null, null] as [number | null, number | null, number | null],
  difficulty: 'medium' as Difficulty,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...INITIAL_STATE,

  setRaceType: (raceType) => set({ raceType }),
  setPhase: (phase) => set({ phase }),
  setHolding: (isHolding) => set({ isHolding }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setReactionTime: (ms) => set({ reactionTimeMs: ms }),
  clearFeedbackToast: () => set({ feedbackToast: null }),

  jump: () => {
    const state = get();
    if (state.phase !== 'racing') return;

    if (state.raceType === 'long_jump') {
      // Execute Long Jump
      if (state.distance > LONG_JUMP_BOARD + 0.2) {
        // FOUL
        set({ jumpDistance: 0, phase: 'finish' });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        // Calculate jump distance based on speed + board proximity
        const maxJump = 8.5; // absolute perfect jump
        const speedFactor = state.speed / 100; // 0.0 - 1.0
        
        // Closer to LONG_JUMP_BOARD = better. Perfect is exactly 40.0.
        const accuracyDist = LONG_JUMP_BOARD - state.distance;
        let accuracyFactor = 1.0;
        if (accuracyDist > 0) {
          // Lose 10% distance for every meter early
          accuracyFactor = Math.max(0.5, 1.0 - (accuracyDist * 0.1));
        }

        const distanceJumped = maxJump * speedFactor * accuracyFactor;
        
        set({ jumpDistance: parseFloat(distanceJumped.toFixed(2)), phase: 'finish' });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return;
    }

    if (!state.isJumping) {
      set({ isJumping: true, jumpStartTime: Date.now() });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  startRace: () =>
    set({
      ...INITIAL_STATE,
      raceType: get().raceType,
      difficulty: get().difficulty,
      phase: 'racing',
      raceStartTimestamp: Date.now(),
    }),

  triggerMiniGame: (id) =>
    set((state) => ({
      phase: 'minigame',
      currentMiniGame: id,
      isHolding: false,
    })),

  resolveMiniGame: (result) =>
    set((state) => {
      const isWin = result === 'win';
      if (isWin) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      return {
        miniGameResult: result,
        phase: 'racing',
        miniGamesWon: isWin ? state.miniGamesWon + 1 : state.miniGamesWon,
        miniGamesLost: !isWin ? state.miniGamesLost + 1 : state.miniGamesLost,
        speed: isWin ? Math.min(100, state.speed + 25) : Math.max(0, state.speed - 30),
        energy: isWin ? Math.min(100, state.energy + 15) : Math.max(0, state.energy - 15),
        completedMiniGames: state.currentMiniGame
          ? [...state.completedMiniGames, state.currentMiniGame]
          : state.completedMiniGames,
        feedbackToast: isWin
          ? { type: 'success', message: '+ SPEED BOOST!' }
          : { type: 'fail', message: 'STUMBLED!' },
      };
    }),

  resetRace: () =>
    set({
      ...INITIAL_STATE,
      raceType: get().raceType,
      difficulty: get().difficulty,
    }),

  tickFrame: (delta: number) => {
    const state = get();
    if (state.phase !== 'racing' && state.phase !== 'bonk') return;

    const { speed, energy, isHolding, distance, difficulty, opponentDistances, isJumping, jumpStartTime } = state;

    // ── Tuning constants ─────────────────────────────────────
    const ACCEL        = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 22 : 28;
    const DECEL        = 12;
    const ENERGY_DRAIN = difficulty === 'easy' ? 14 : difficulty === 'medium' ? 18 : 24;
    const ENERGY_REGEN = 6;
    const BONK_SPEED   = 0.3;   // multiplier while bonked
    const MAX_SPEED    = 100;
    const METRES_PER_SEC_AT_MAX = 8;
    const JUMP_DURATION_MS = 600;
    const JUMP_HEIGHT  = 1.1;
    const HURDLE_CLEARANCE = 0.7; // Y height needed to clear hurdle

    // Base opponent speeds
    const BASE_OPP_SPEEDS: [number, number, number] =
      difficulty === 'easy'   ? [0.65, 0.70, 0.80] :
      difficulty === 'medium' ? [0.78, 0.85, 0.90] :
                                [0.93, 0.97, 1.02];

    // AI Realism: dynamic pacing based on Date.now() sine wave
    const nowSecs = Date.now() / 1000;
    const OPPONENT_SPEEDS = BASE_OPP_SPEEDS.map((base, i) => 
      base + Math.sin(nowSecs * 0.5 + i * 2) * 0.05
    ) as [number, number, number];

    // ── SLOW MOTION LOGIC ────────────────────────────────────
    let newTimeScale = 1.0;
    if (state.raceType === 'long_jump') {
      // Slow mo between 35m and 40m
      if (distance > LONG_JUMP_BOARD - 5 && distance < LONG_JUMP_BOARD + 0.5) {
        newTimeScale = 0.3;
      }
    } else if (state.raceType === 'hurdles') {
      // Slow mo approaching hurdles
      const nextHurdle = HURDLE_DISTANCES.find(h => h > distance - 1);
      if (nextHurdle && nextHurdle - distance < 4) {
        newTimeScale = 0.3;
      }
    }

    // Apply timeScale to delta
    const scaledDelta = delta * newTimeScale;

    // ── PLAYER PHYSICS ───────────────────────────────────────
    let newSpeed  = speed;
    let newEnergy = energy;
    let newPhase  = state.phase;
    let newAthleteY = state.athleteY;
    let newIsJumping = isJumping;

    // Jump logic
    if (isJumping && jumpStartTime) {
      // For jump animation, we use real unscaled time so it doesn't look weirdly slow
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
      newEnergy = Math.min(100, energy + ENERGY_REGEN * 0.5 * scaledDelta);
      newSpeed  = Math.max(0, speed - DECEL * scaledDelta);
      if (newEnergy > 20) newPhase = 'racing';
    } else {
      if (isHolding) {
        newSpeed  = Math.min(MAX_SPEED, speed + ACCEL * scaledDelta);
        newEnergy = Math.max(0, energy - ENERGY_DRAIN * (speed / MAX_SPEED) * scaledDelta);
      } else {
        newSpeed  = Math.max(0, speed - DECEL * scaledDelta);
        newEnergy = Math.min(100, energy + ENERGY_REGEN * scaledDelta);
      }

      if (newEnergy <= 0) {
        newSpeed  = newSpeed * BONK_SPEED;
        newPhase  = 'bonk';
        newEnergy = 0;
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    const newDistance = distance + (newSpeed / 100) * METRES_PER_SEC_AT_MAX * scaledDelta;

    // ── LONG JUMP FOUL ───────────────────────────────────────
    if (state.raceType === 'long_jump' && newDistance >= LONG_JUMP_BOARD + 0.5 && state.phase === 'racing') {
      set({ jumpDistance: 0, phase: 'finish' });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // ── HURDLE COLLISION ─────────────────────────────────────
    let newHurdlesHit = state.hurdlesHit;
    let newHurdlesCleared = state.hurdlesCleared;
    let newLastHurdleCrossed = state.lastHurdleCrossed;

    if (state.raceType === 'hurdles') {
      const hurdleIndex = HURDLE_DISTANCES.findIndex((h) => h >= distance && h <= newDistance);
      
      if (hurdleIndex !== -1 && hurdleIndex > state.lastHurdleCrossed) {
        newLastHurdleCrossed = hurdleIndex;
        if (newAthleteY < HURDLE_CLEARANCE) {
          // Hit!
          newHurdlesHit++;
          newSpeed *= 0.6;
          newEnergy = Math.max(0, newEnergy - 15);
          if (newEnergy === 0) newPhase = 'bonk';
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          set({ feedbackToast: { type: 'fail', message: 'HURDLE HIT!' }});
        } else {
          // Cleared!
          newHurdlesCleared++;
        }
      }
    }

    // ── OPPONENT PHYSICS ─────────────────────────────────────
    const newOpponentDistances = opponentDistances.map(
      (d, i) => d + OPPONENT_SPEEDS[i] * METRES_PER_SEC_AT_MAX * scaledDelta,
    ) as [number, number, number];

    const newOpponentY = [...state.opponentY] as [number, number, number];
    const newOppJumpStartTimes = [...state.opponentJumpStartTimes] as [number | null, number | null, number | null];

    if (state.raceType === 'hurdles') {
      newOpponentDistances.forEach((oppDist, i) => {
        // AI jumps exactly 2 meters before a hurdle
        const nextHurdle = HURDLE_DISTANCES.find(h => h > oppDist);
        if (nextHurdle && nextHurdle - oppDist < 2.0 && newOppJumpStartTimes[i] === null) {
          // Chance to clip it (90% success rate)
          if (Math.random() > 0.1) {
            newOppJumpStartTimes[i] = Date.now();
          }
        }

        if (newOppJumpStartTimes[i] !== null) {
          const elapsed = Date.now() - newOppJumpStartTimes[i]!;
          if (elapsed >= JUMP_DURATION_MS) {
            newOpponentY[i] = 0;
            newOppJumpStartTimes[i] = null;
          } else {
            const t = elapsed / JUMP_DURATION_MS;
            newOpponentY[i] = Math.sin(t * Math.PI) * JUMP_HEIGHT;
          }
        }
      });
    }

    const updates: Partial<GameState> = {
      speed: newSpeed,
      energy: newEnergy,
      distance: newDistance,
      timeScale: newTimeScale,
      topSpeed: Math.max(state.topSpeed, newSpeed),
      opponentDistances: newOpponentDistances,
      opponentY: newOpponentY,
      opponentJumpStartTimes: newOppJumpStartTimes,
      phase: newPhase,
      athleteY: newAthleteY,
      isJumping: newIsJumping,
      lastHurdleCrossed: newLastHurdleCrossed,
      hurdlesHit: newHurdlesHit,
      hurdlesCleared: newHurdlesCleared,
    };

    if (newDistance >= 400 && state.raceType !== 'long_jump') {
      updates.phase = 'finish';
      updates.finishTimeMs = Date.now() - (state.raceStartTimestamp ?? Date.now());
    }

    set(updates);
  },
}));
