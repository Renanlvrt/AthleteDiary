// ============================================================
// features/race400m/game/constants.ts
// Race-specific design tokens. Do NOT import from lib/constants here
// to keep the race feature self-contained.
// ============================================================

import type { Difficulty } from './gameStore';

// ─── Colours ─────────────────────────────────────────────────
export const RACE_COLOURS = {
  yellow:      '#FFE500',
  yellowDark:  '#E6CE00',
  black:       '#0A0A0A',
  ink:         '#0A0A0A',
  inkMid:      '#3A3A3A',
  inkSoft:     '#888888',
  white:       '#FFFFFF',
  offWhite:    '#F8F8F0',
  surface:     '#141414',
  surfaceAlt:  '#1E1E1E',
  red:         '#E5232A',
  dangerRed:   '#FF3B30',
  green:       '#00C851',
  energyLow:   '#FF4444',
  energyMid:   '#FF6600',
  energyFull:  '#FFE500',
  overlay:     'rgba(10,10,10,0.92)',
  gold:        '#FFD700',
} as const;

// ─── Typography ───────────────────────────────────────────────
export const RACE_TYPE = {
  heroNumber:    { fontSize: 56, fontWeight: '900', fontStyle: 'italic' } as const,
  screenTitle:   { fontSize: 36, fontWeight: '900', letterSpacing: -1 } as const,
  miniGameTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 2 } as const,
  label:         { fontSize: 12, fontWeight: '600', letterSpacing: 1.5 } as const,
  bodyBold:      { fontSize: 16, fontWeight: '700' } as const,
  placeText:     { fontSize: 18, fontWeight: '900', letterSpacing: 2 } as const,
} as const;

// ─── Spacing ─────────────────────────────────────────────────
export const RACE_SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
} as const;

export const RACE_RADIUS = {
  sm: 4, md: 8, lg: 12, xl: 20, full: 9999,
} as const;

// ─── Opponent profiles ────────────────────────────────────────
export interface OpponentProfile {
  name: string;
  speedMultiplier: number;
  colour: string;
}

export const OPPONENT_PROFILES: Record<Difficulty, OpponentProfile[]> = {
  easy: [
    { name: 'Runner A', speedMultiplier: 0.65, colour: '#2255FF' },
    { name: 'Runner B', speedMultiplier: 0.70, colour: '#FF3333' },
    { name: 'Runner C', speedMultiplier: 0.80, colour: '#33CC33' },
  ],
  medium: [
    { name: 'Runner A', speedMultiplier: 0.78, colour: '#2255FF' },
    { name: 'Runner B', speedMultiplier: 0.85, colour: '#FF3333' },
    { name: 'Runner C', speedMultiplier: 0.90, colour: '#33CC33' },
  ],
  hard: [
    { name: 'Runner A', speedMultiplier: 0.93, colour: '#2255FF' },
    { name: 'Runner B', speedMultiplier: 0.97, colour: '#FF3333' },
    { name: 'Runner C', speedMultiplier: 1.02, colour: '#33CC33' }, // can beat you
  ],
};

// ─── Game tuning ─────────────────────────────────────────────
export const TUNING = {
  METRES_PER_SEC_AT_MAX:    8,    // at speed=100, this many metres/second
  MAX_SPEED:                100,
  BONK_RECOVERY_THRESHOLD:  20,   // energy level at which bonk ends
  ENERGY_GAIN_WIN:          22,
  ENERGY_LOSS_LOSE:         18,
  SPEED_GAIN_WIN:           15,
  MINI_GAME_TRIGGER_WINDOW:  2,   // ± metres around trigger distance
  TRACK_SECTION_LENGTH:     30,   // metres per repeating track section
  SPEED_TO_KMH_FACTOR:      1.2,  // display: speed * factor = km/h shown
} as const;

// ─── Mini-game trigger distances ──────────────────────────────
export const MINI_GAME_DISTANCES = [80, 150, 220, 300, 360] as const;
