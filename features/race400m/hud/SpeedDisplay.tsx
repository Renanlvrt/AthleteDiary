// ============================================================
// features/race400m/hud/SpeedDisplay.tsx
// Live speed number. Uses isolated Zustand subscription so only
// this tiny component re-renders each frame, not the whole HUD.
// ============================================================

import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS, TUNING } from '../game/constants';

export function SpeedDisplay() {
  const speed = useGameStore((s) => s.speed);
  const displayKmh = Math.round(speed * TUNING.SPEED_TO_KMH_FACTOR);

  return (
    <View style={styles.container}>
      <Text style={styles.number}>{displayKmh}</Text>
      <Text style={styles.unit}>km/h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  number: {
    fontSize: 42,
    fontWeight: '900',
    fontStyle: 'italic',
    color: RACE_COLOURS.white,
    lineHeight: 44,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  unit: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingBottom: 6,
  },
});
