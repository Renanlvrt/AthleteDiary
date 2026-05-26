// ============================================================
// features/race400m/data/personalRecords.ts
// AsyncStorage-backed personal best for the 400m race.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const PB_KEY_FLAT = 'race400m_personal_best';
const PB_KEY_HURDLES = 'race400m_hurdles_personal_best';
const PB_KEY_LONG_JUMP = 'race400m_long_jump_personal_best';

export interface PersonalBest {
  timeMs: number;
  topSpeed: number;      // normalised 0–100
  miniGamesWon: number;
  miniGamesTotal: number;
  reactionTimeMs: number | null;
  date: string;          // ISO date string
  hurdlesCleared?: number; // Only for hurdles mode
  jumpDistance?: number | null; // Only for long jump mode
}

function getPbKey(type: 'flat' | 'hurdles' | 'long_jump'): string {
  if (type === 'long_jump') return PB_KEY_LONG_JUMP;
  return type === 'flat' ? PB_KEY_FLAT : PB_KEY_HURDLES;
}

export async function loadPersonalBest(type: 'flat' | 'hurdles' | 'long_jump'): Promise<PersonalBest | null> {
  try {
    const raw = await AsyncStorage.getItem(getPbKey(type));
    return raw ? (JSON.parse(raw) as PersonalBest) : null;
  } catch {
    return null;
  }
}

/**
 * Saves the new personal best only if it is faster than the current one.
 * Returns true if the record was updated (new PB), false otherwise.
 */
export async function savePersonalBest(type: 'flat' | 'hurdles' | 'long_jump', data: PersonalBest): Promise<boolean> {
  try {
    const current = await loadPersonalBest(type);
    
    // For long jump, bigger distance is better. For races, smaller time is better.
    let isNewPb = false;
    if (!current) {
      isNewPb = true;
    } else if (type === 'long_jump') {
      if (data.jumpDistance && current.jumpDistance && data.jumpDistance > current.jumpDistance) {
        isNewPb = true;
      }
    } else {
      if (data.timeMs < current.timeMs) {
        isNewPb = true;
      }
    }

    if (isNewPb) {
      await AsyncStorage.setItem(getPbKey(type), JSON.stringify(data));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Formats a time in milliseconds to a display string e.g. "38.2s" */
export function formatRaceTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
