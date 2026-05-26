// ============================================================
// features/race400m/game/miniGameTriggers.ts
// Maps race distances to randomised mini-game pools.
// checkMiniGameTriggers() is called every frame from the game loop.
// ============================================================

import type { MiniGameId } from './gameStore';

interface Trigger {
  distance: number;
  pool: MiniGameId[];
}

// Each entry fires once per race at the specified distance.
// If the pool has multiple entries, one is picked randomly.
const TRIGGERS: Trigger[] = [
  { distance: 80,  pool: ['curve_lean'] },                             // Always curve lean at first bend
  { distance: 150, pool: ['oxygen_lock', 'lactic_math'] },
  { distance: 220, pool: ['word_sprint', 'crowd_pressure'] },
  { distance: 300, pool: ['stroop_effect', 'oxygen_lock'] },
  { distance: 360, pool: ['reaction_burst', 'lactic_math'] },
];

const TRIGGER_WINDOW = 2; // metres — fire within this range of trigger distance

/**
 * Called each frame. Returns a MiniGameId to trigger, or null if no trigger.
 * A trigger fires when:
 *   1. The player crosses within TRIGGER_WINDOW metres of the trigger distance
 *   2. No game from that trigger's pool has already fired this race
 */
export function checkMiniGameTriggers(
  distance: number,
  completed: MiniGameId[],
): MiniGameId | null {
  for (const trigger of TRIGGERS) {
    const inWindow =
      distance >= trigger.distance &&
      distance < trigger.distance + TRIGGER_WINDOW;

    if (!inWindow) continue;

    // Has any game from this pool already fired?
    const alreadyFired = trigger.pool.some((id) => completed.includes(id));
    if (alreadyFired) continue;

    // Pick randomly from pool
    const idx = Math.floor(Math.random() * trigger.pool.length);
    return trigger.pool[idx];
  }
  return null;
}

/**
 * Returns the distances at which mini-game dots should appear on the HUD progress strip.
 */
export function getTriggerDistances(): number[] {
  return TRIGGERS.map((t) => t.distance);
}
