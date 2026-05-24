// ============================================================
// lib/constants.ts — ALL design tokens and data mappings
// NEVER hardcode colours or typography elsewhere — always import from here
// ============================================================

import { MoodLevel, PerformanceLevel, SportType } from './types';

// ── Colours ──────────────────────────────────────────────────
export const COLORS = {
  // App backgrounds
  background:   '#0A0A0A',
  surface:      '#141414',
  surfaceAlt:   '#1E1E1E',

  // Colour blocks (defining visual identity)
  primary:      '#FFE500',   // electric yellow — header blocks
  accentRed:    '#E5232A',   // red — recent sessions + save button block
  black:        '#000000',   // pill backgrounds on yellow blocks

  // Text
  textPrimary:  '#FFFFFF',
  textSecondary:'#888888',
  textMuted:    '#444444',
  textOnYellow: '#000000',
  textOnRed:    '#FFFFFF',

  // Mood colours: 5 (Great) → 1 (Terrible) — green → yellow → orange → red
  moodGreat:    '#22C55E',
  moodGood:     '#86EFAC',
  moodOkay:     '#FBBF24',
  moodBad:      '#F97316',
  moodTerrible: '#EF4444',

  // Grid cells
  gridEmpty:    '#EBEBEB',
  gridFuture:   '#F5F5F5',
  gridTodayBorder: '#222222',

  // UI chrome
  divider:      '#F0F0F0',
  inputBg:      '#F7F7F7',
  border:        '#EEEEEE',
  borderDark:   '#333333',
} as const;

// ── Mood colour map ───────────────────────────────────────────
export const MOOD_COLOURS: Record<MoodLevel, string> = {
  5: COLORS.moodGreat,
  4: COLORS.moodGood,
  3: COLORS.moodOkay,
  2: COLORS.moodBad,
  1: COLORS.moodTerrible,
};

// ── Mood gradient stops (for slider track) ───────────────────
export const MOOD_GRADIENT: string[] = [
  '#991B1B',   // far left — terrible
  '#EF4444',
  '#F97316',
  '#86EFAC',
  '#22C55E',   // far right — great
];

// ── Mood labels ───────────────────────────────────────────────
export const MOOD_LABELS: Record<MoodLevel, string> = {
  5: 'GREAT',
  4: 'GOOD',
  3: 'OKAY',
  2: 'BAD',
  1: 'TERRIBLE',
};

// ── Performance labels ────────────────────────────────────────
export const PERFORMANCE_LABELS: Record<PerformanceLevel, string> = {
  5: 'PEAK',
  4: 'GOOD',
  3: 'AVG',
  2: 'BELOW',
  1: 'POOR',
};

// ── Sport labels (text only — no emojis) ─────────────────────
export const SPORT_LABELS: Record<SportType, string> = {
  running:    'RUN',
  gym:        'GYM',
  cycling:    'CYCLE',
  swimming:   'SWIM',
  football:   'BALL',
  basketball: 'BBALL',
  other:      'OTHER',
};

export const SPORT_FULL_NAMES: Record<SportType, string> = {
  running:    'Running',
  gym:        'Gym',
  cycling:    'Cycling',
  swimming:   'Swimming',
  football:   'Football',
  basketball: 'Basketball',
  other:      'Other',
};

export const ALL_SPORTS: SportType[] = [
  'running', 'gym', 'cycling', 'swimming', 'football', 'basketball', 'other',
];

// ── AsyncStorage keys ─────────────────────────────────────────
export const STORAGE_KEYS = {
  SESSIONS:   '@athlete_diary:sessions',
  LAST_SPORT: '@athlete_diary:last_sport',
  SCHEDULE:   '@athlete_diary:schedule',
} as const;

// ── Spacing ───────────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ── Border radius ─────────────────────────────────────────────
export const RADIUS = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   24,
  full: 9999,
} as const;

// ── Typography ────────────────────────────────────────────────
// Note: fontFamily will be overridden with Anton once expo-font loads
export const TYPOGRAPHY = {
  // TRAIN. LOG. GROW. — large hero text on yellow block
  hero: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 36,
    textTransform: 'uppercase' as const,
  },

  // App name — ATHLETE DIARY
  appName: {
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: COLORS.textOnYellow,
  },

  // Date headline on Log screen
  dateHeadline: {
    fontSize: 30,
    fontWeight: '900' as const,
    letterSpacing: -1,
    color: COLORS.textOnYellow,
    textTransform: 'uppercase' as const,
    lineHeight: 30,
  },

  // Muted date caption below hero text
  dateSub: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: COLORS.textOnYellow,
    opacity: 0.4,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginTop: 4,
  },

  // Section labels (THIS YEAR, HOW DID YOU FEEL?)
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#BBBBBB',
  },

  // RECENT SESSIONS heading (on red block, large)
  sectionLabelRed: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: COLORS.textOnRed,
    textTransform: 'uppercase' as const,
    letterSpacing: -1,
    lineHeight: 24,
  },

  // Small caption (TODAY, DAY STREAK, sport labels)
  caption: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.textSecondary,
  },

  // Streak number
  streakNumber: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  // Card title (sport name)
  cardName: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
  },

  // Card meta (date, muted)
  cardMeta: {
    fontSize: 10,
    color: '#AAAAAA',
    marginTop: 1,
  },

  // Performance pill label
  perfLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },

  // Mood current label (large, centred, coloured)
  moodCurrent: {
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    marginTop: 6,
  },
} as const;

// ── Day labels (for schedule screen) ────────────────────────
export const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
