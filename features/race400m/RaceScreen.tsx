// ============================================================
// features/race400m/RaceScreen.tsx
// Full-screen wrapper during an active race:
//   - 3D Canvas (Scene)
//   - HUD overlay
//   - MiniGameOverlay (conditional)
//   - BonkOverlay (conditional)
// ============================================================

import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Scene }           from './3d/Scene';
import { HUD }             from './hud/HUD';
import { MiniGameOverlay } from './minigames/MiniGameOverlay';
import { BonkOverlay }     from './screens/BonkOverlay';

interface RaceScreenProps {
  onQuit: () => void;
}

export function RaceScreen({ onQuit }: RaceScreenProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        {/* 3D World */}
        <Scene />

        {/* HUD overlay — absolute on top of canvas */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <HUD onQuit={onQuit} />
        </View>

        {/* Bonk vignette */}
        <BonkOverlay />

        {/* Mini-game overlay (slides up when active) */}
        <MiniGameOverlay />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
});
