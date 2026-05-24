// ============================================================
// lib/streak.ts — Streak calculation (pure function, no side effects)
// ============================================================

import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { Session } from './types';

/**
 * Calculates the current streak from a list of sessions.
 *
 * Rules:
 * - Streak = consecutive calendar days with at least one logged session
 * - If today has no session, check yesterday (user might not have logged yet)
 * - If yesterday also has no session, streak = 0
 */
export function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  // Build a Set of unique date strings for O(1) lookup
  const sessionDates = new Set<string>(sessions.map((s) => s.date));

  const today = startOfDay(new Date());
  let streak = 0;
  let current = today;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dateStr = format(current, 'yyyy-MM-dd');

    if (sessionDates.has(dateStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      // Grace period: allow today to be empty (streak runs from yesterday)
      if (streak === 0 && isSameDay(current, today)) {
        current = subDays(current, 1);
        continue; // check yesterday
      }
      break; // genuine gap
    }
  }

  return streak;
}
