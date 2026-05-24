// ============================================================
// hooks/useStreak.ts — Derived streak count from sessions
// ============================================================

import { useMemo } from 'react';
import { calculateStreak } from '../lib/streak';
import { Session, TrainingSlot } from '../lib/types';

export function useStreak(sessions: Session[], slots?: TrainingSlot[]): number {
  return useMemo(() => calculateStreak(sessions, slots), [sessions, slots]);
}
