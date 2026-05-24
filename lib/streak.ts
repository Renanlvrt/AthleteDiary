import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { Session, TrainingSlot } from './types';

/**
 * Calculates the current streak from a list of sessions, respecting the training schedule.
 *
 * Rules:
 * - If schedule is not configured or empty, fall back to standard consecutive calendar days streak.
 * - If schedule is configured:
 *   - Only scheduled training days MUST have a logged session.
 *   - Missed scheduled days reset the streak.
 *   - Sessions logged on non-scheduled days add to the streak, but are not required.
 *   - Today is always given a grace period (does not break the streak if not logged yet).
 */
export function calculateStreak(sessions: Session[], scheduleSlots: TrainingSlot[] = []): number {
  if (sessions.length === 0) return 0;

  // Build a Set of unique date strings for O(1) lookup
  const sessionDates = new Set<string>(sessions.map((s) => s.date));

  // Find the oldest session to prevent infinite back-traversal
  const sortedSessions = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const oldestDate = startOfDay(new Date(sortedSessions[0].timestamp));

  const today = startOfDay(new Date());
  let streak = 0;
  let current = today;

  const hasSchedule = scheduleSlots && scheduleSlots.length > 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Stop if we go back past the oldest session
    if (current < oldestDate) {
      break;
    }

    const dateStr = format(current, 'yyyy-MM-dd');
    const hasSession = sessionDates.has(dateStr);

    if (hasSession) {
      streak++;
      current = subDays(current, 1);
    } else {
      // If it's today, we grant a grace period (user might log it later today)
      if (isSameDay(current, today)) {
        current = subDays(current, 1);
        continue;
      }

      if (hasSchedule) {
        // Convert JS dayOfWeek (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        // to our type DayOfWeek (0 = Monday, ..., 6 = Sunday)
        const jsDay = current.getDay();
        const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

        const isScheduled = scheduleSlots.some((slot) => slot.dayOfWeek === dayOfWeek);

        if (isScheduled) {
          // Missed a scheduled training day! Streak is broken.
          break;
        } else {
          // Not a scheduled training day, and they didn't train. That's fine!
          // Skip this day without breaking the streak.
          current = subDays(current, 1);
        }
      } else {
        // Fallback: standard consecutive calendar days streak
        break;
      }
    }
  }

  return streak;
}
