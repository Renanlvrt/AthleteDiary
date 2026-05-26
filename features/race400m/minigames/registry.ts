// ============================================================
// features/race400m/minigames/registry.ts
// Plug-in registry — maps every MiniGameId to its component.
//
// To add a V2 mini-game:
//   1. Create the component in /minigames/ implementing MiniGameProps
//   2. Import it here and add one line to MINI_GAME_REGISTRY
//   3. Add the new id to MiniGameId in gameStore.ts
//   4. Optionally add a trigger distance in miniGameTriggers.ts
//
// MiniGameOverlay.tsx uses this registry — no switch statements anywhere.
// ============================================================

import type { ComponentType } from 'react';
import type { MiniGameId } from '../game/gameStore';
import type { Difficulty } from '../game/gameStore';

/** Props every mini-game component must accept */
export interface MiniGameProps {
  difficulty: Difficulty;
  onResolve: (result: 'win' | 'lose') => void;
}

// Lazy imports so each game's code is only evaluated when first used
import { CurveLean }      from './CurveLean';
import { OxygenLock }     from './OxygenLock';
import { LacticMath }     from './LacticMath';
import { WordSprint }     from './WordSprint';
import { CrowdPressure }  from './CrowdPressure';
import { StroopEffect }   from './StroopEffect';
import { ReactionBurst }  from './ReactionBurst';

export const MINI_GAME_REGISTRY: Record<MiniGameId, ComponentType<MiniGameProps>> = {
  curve_lean:     CurveLean,
  oxygen_lock:    OxygenLock,
  lactic_math:    LacticMath,
  word_sprint:    WordSprint,
  crowd_pressure: CrowdPressure,
  stroop_effect:  StroopEffect,
  reaction_burst: ReactionBurst,
};

/** Human-readable titles for each mini-game (shown in the overlay header) */
export const MINI_GAME_TITLES: Record<MiniGameId, string> = {
  curve_lean:     'CURVE LEAN',
  oxygen_lock:    'OXYGEN LOCK',
  lactic_math:    'LACTIC MATH',
  word_sprint:    'WORD SPRINT',
  crowd_pressure: 'CROWD PRESSURE',
  stroop_effect:  'STROOP EFFECT',
  reaction_burst: 'REACTION BURST',
};

/** Time limits (in seconds) for each mini-game */
export const MINI_GAME_TIME_LIMITS: Record<MiniGameId, number> = {
  curve_lean:     4,
  oxygen_lock:    6,
  lactic_math:    5,
  word_sprint:    5,
  crowd_pressure: 4,
  stroop_effect:  4,
  reaction_burst: 3, // total window; burst itself is random 0.5–1.5s + 0.4s reaction
};
