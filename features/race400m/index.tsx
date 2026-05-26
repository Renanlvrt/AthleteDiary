// ============================================================
// features/race400m/index.tsx
// State machine entry point for the race feature.
// Controls which screen is shown:
//   idle      → PreRaceScreen
//   reaction  → ReactionTimeScreen (overlaid on RaceScreen)
//   racing    → RaceScreen + ReactionTimeScreen gone
//   minigame  → RaceScreen (MiniGameOverlay handles itself)
//   bonk      → RaceScreen (BonkOverlay handles itself)
//   finish    → FinishScreen
// ============================================================

import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { useGameStore } from './game/gameStore';
import { PreRaceScreen }      from './screens/PreRaceScreen';
import { ReactionTimeScreen } from './screens/ReactionTimeScreen';
import { RaceScreen }         from './RaceScreen';
import { FinishScreen }       from './screens/FinishScreen';

interface RaceEntryProps {
  onNavigateHome: () => void;
  playerName?: string;
  raceType?: 'flat' | 'hurdles' | 'long_jump';
}

export default function RaceEntry({ onNavigateHome, playerName = 'You', raceType = 'flat' }: RaceEntryProps) {
  const { phase, setPhase, resetRace, setRaceType } = useGameStore();

  useEffect(() => {
    setRaceType(raceType);
  }, [raceType]);

  function handleStart() {
    setPhase('reaction');
  }

  function handleReactionDone() {
    // Phase is already set to 'racing' inside ReactionTimeScreen via startRace()
  }

  function handleQuit() {
    resetRace();
    setPhase('idle');
  }

  function handleRaceAgain() {
    resetRace();
    setPhase('idle');
  }

  return (
    <View style={styles.root}>
      {/* PreRace — shown when idle */}
      {phase === 'idle' && (
        <PreRaceScreen
          onStart={handleStart}
          onBack={onNavigateHome}
        />
      )}

      {/* Race screen — shown during reaction, racing, minigame, bonk */}
      {(phase === 'reaction' || phase === 'racing' || phase === 'minigame' || phase === 'bonk') && (
        <RaceScreen onQuit={handleQuit} />
      )}

      {/* Reaction time — overlaid on top of the 3D scene */}
      {phase === 'reaction' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <ReactionTimeScreen onDone={handleReactionDone} />
        </View>
      )}

      {/* Finish screen */}
      {phase === 'finish' && (
        <FinishScreen
          onRaceAgain={handleRaceAgain}
          onHome={onNavigateHome}
          playerName={playerName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
