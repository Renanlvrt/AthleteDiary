// ============================================================
// hooks/useStreak.ts — Derived streak count from sessions
// ============================================================

import { useMemo } from 'react';
import { calculateStreak } from '../lib/streak';
import { Session } from '../lib/types';

export function useStreak(sessions: Session[]): number {
  return useMemo(() => calculateStreak(sessions), [sessions]);
}
