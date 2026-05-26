// ============================================================
// features/race400m/hud/EnergyBar.tsx
// Animated gradient energy bar. Width tracks energy 0–100.
// Pulses when energy is critically low.
// ============================================================

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

const BAR_HEIGHT = 12;

export function EnergyBar() {
  const energy  = useGameStore((s) => s.energy);
  const widthPct = useSharedValue(100);
  const pulseScale = useSharedValue(1);

  // Animate bar width
  useEffect(() => {
    widthPct.value = withTiming(energy, { duration: 80, easing: Easing.out(Easing.quad) });
  }, [energy, widthPct]);

  // Pulse when low
  useEffect(() => {
    if (energy < 20) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 350 }),
          withTiming(1.00, { duration: 350 }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [energy < 20, pulseScale]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: pulseScale.value }],
  }));

  // Choose gradient colours based on energy level
  const gradientColors: [string, string, string] =
    energy > 50
      ? [RACE_COLOURS.energyFull, RACE_COLOURS.energyMid, RACE_COLOURS.energyMid]
      : energy > 20
      ? [RACE_COLOURS.energyMid, RACE_COLOURS.energyLow, RACE_COLOURS.energyLow]
      : ['#FF2222', RACE_COLOURS.energyLow, '#FF2222'];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>ENERGY</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <Text style={styles.pct}>{Math.round(energy)}%</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RACE_SPACING.sm,
    paddingHorizontal: RACE_SPACING.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: RACE_COLOURS.inkSoft,
    letterSpacing: 1.5,
    width: 54,
  },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  pct: {
    fontSize: 11,
    fontWeight: '700',
    color: RACE_COLOURS.white,
    width: 34,
    textAlign: 'right',
  },
});
