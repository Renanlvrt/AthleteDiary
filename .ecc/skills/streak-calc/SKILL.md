# Skill: Streak Calculation

> Read this before implementing lib/streak.ts or useStreak.ts

## What a Streak Is
Consecutive calendar days with **at least one logged session**.

- If today has a session → today counts, walk backwards
- If today has no session → check yesterday (today hasn't happened yet for this metric)
  - If yesterday has a session → streak continues from yesterday
  - If yesterday has no session → streak = 0

## The Algorithm

```typescript
import { startOfDay, subDays, format, isSameDay } from 'date-fns';

export function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  // Build a Set of unique dates with sessions for O(1) lookup
  const sessionDates = new Set<string>(
    sessions.map(s => s.date) // 'YYYY-MM-DD' strings
  );

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
      // Grace: allow today to be empty (streak runs from yesterday)
      if (streak === 0 && isSameDay(current, today)) {
        current = subDays(current, 1);
        // Check yesterday immediately
        continue;
      }
      // Genuine gap — streak is broken
      break;
    }
  }

  return streak;
}
```

## Edge Cases

| Scenario | Result |
|----------|--------|
| No sessions ever | 0 |
| Only sessions from last month | 0 (gap exists) |
| Sessions every day this week | Count of days |
| Sessions today + all of last week | Count includes today |
| Session yesterday but not today | Streak continues (user hasn't logged yet today) |
| Session 2 days ago, none yesterday | 0 (gap at yesterday) |
| Multiple sessions same day | Only counted once (Set deduplicates by date) |

## Hook Implementation (hooks/useStreak.ts)

```typescript
import { useMemo } from 'react';
import { calculateStreak } from '../lib/streak';
import { Session } from '../lib/types';

export function useStreak(sessions: Session[]): number {
  return useMemo(() => calculateStreak(sessions), [sessions]);
}
```

## Display Logic (StreakCounter component)

```tsx
// streak = 0
<Text style={TYPOGRAPHY.caption}>START YOUR STREAK TODAY</Text>

// streak >= 1
<View>
  <Text style={styles.streakPill}>
    🔥 <Text style={TYPOGRAPHY.streakNumber}>{streak}</Text>
    <Text style={TYPOGRAPHY.caption}> DAY STREAK</Text>
  </Text>
</View>
```

The streak number animates count-up from 0→N with spring easing (600ms) on first mount.
