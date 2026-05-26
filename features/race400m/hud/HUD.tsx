// ============================================================
// features/race400m/hud/HUD.tsx
// Full HUD overlay. Sits absolutely on top of the 3D Canvas.
// pointerEvents="box-none" on most layers to pass touches through.
// Only the hold area intercepts touches.
// ============================================================

import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameStore';
import { EnergyBar }       from './EnergyBar';
import { SpeedDisplay }    from './SpeedDisplay';
import { DistanceTracker } from './DistanceTracker';
import { PlaceIndicator }  from './PlaceIndicator';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

interface HUDProps {
  onQuit: () => void;
}

export function HUD({ onQuit }: HUDProps) {
  const setHolding = useGameStore((s) => s.setHolding);
  const jump       = useGameStore((s) => s.jump);
  const raceType   = useGameStore((s) => s.raceType);

  function handlePressIn() {
    setHolding(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handlePressOut() {
    setHolding(false);
  }

  function handleJump() {
    jump();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* ── Top bar ─── */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={onQuit}>
          <View style={styles.quitButton}>
            <Text style={styles.quitText}>← QUIT</Text>
          </View>
        </TouchableWithoutFeedback>
        <PlaceIndicator />
        <View style={{ width: 60 }} />
      </View>

      {/* ── Spacer — lets 3D scene breathe ── */}
      <View style={{ flex: 1 }} pointerEvents="none" />

      {/* ── Bottom HUD panel ── */}
      <View style={styles.bottomPanel} pointerEvents="box-none">
        {/* Energy bar */}
        <EnergyBar />

        <View style={styles.midRow} pointerEvents="none">
          <SpeedDisplay />
          <View style={{ flex: 1 }} />
        </View>

        {/* 400m progress strip */}
        <DistanceTracker />

        {/* Controls area */}
        <View style={styles.controlsRow} pointerEvents="box-none">
          <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={[styles.controlBtn, raceType === 'flat' && styles.controlBtnFull]}>
              <Text style={styles.controlText}>HOLD TO SPRINT</Text>
            </View>
          </TouchableWithoutFeedback>

          {raceType === 'hurdles' && (
            <TouchableWithoutFeedback onPress={handleJump}>
              <View style={[styles.controlBtn, styles.jumpBtn]}>
                <Text style={[styles.controlText, styles.jumpText]}>TAP TO JUMP</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: RACE_SPACING.md,
    paddingTop: RACE_SPACING.lg,
    paddingBottom: RACE_SPACING.sm,
  },
  quitButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      20,
  },
  quitText: {
    color:       RACE_COLOURS.white,
    fontSize:    12,
    fontWeight:  '700',
    letterSpacing: 0.5,
  },
  bottomPanel: {
    backgroundColor: 'rgba(10,10,10,0.7)',
    gap: RACE_SPACING.sm,
    paddingTop: RACE_SPACING.md,
    paddingBottom: RACE_SPACING.sm,
  },
  midRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: RACE_SPACING.md,
  },
  controlsRow: {
    flexDirection: 'row',
    marginHorizontal: RACE_SPACING.md,
    marginBottom: RACE_SPACING.sm,
    gap: RACE_SPACING.sm,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    height:          110,
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    16,
    borderWidth:     1.5,
    borderColor:     'rgba(255,229,0,0.18)',
  },
  controlBtnFull: {
    width: '100%',
  },
  jumpBtn: {
    backgroundColor: 'rgba(255,229,0,0.15)',
    borderColor: 'rgba(255,229,0,0.6)',
  },
  controlText: {
    fontSize:     13,
    fontWeight:   '700',
    color:        'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  jumpText: {
    color: RACE_COLOURS.yellow,
  },
});
