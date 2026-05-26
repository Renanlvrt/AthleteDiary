// ============================================================
// features/race400m/hud/DistanceTracker.tsx
// Thin progress strip showing the 400m race progress.
// Yellow dot = player. Grey dots = mini-game trigger distances.
// Upcoming dots pulse yellow when within 30m.
// ============================================================

import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../game/gameStore';
import { getTriggerDistances } from '../game/miniGameTriggers';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

const TRIGGER_DISTANCES = getTriggerDistances();
const PULSE_THRESHOLD   = 30; // metres — dot pulses when player is within this range
const TOTAL_DISTANCE    = 400;

function TriggerDot({ triggerDist, playerDist, barWidth }: {
  triggerDist: number;
  playerDist: number;
  barWidth: number;
}) {
  const x = (triggerDist / TOTAL_DISTANCE) * barWidth - 4;
  const isUpcoming = playerDist < triggerDist && triggerDist - playerDist <= PULSE_THRESHOLD;
  const isPassed   = playerDist >= triggerDist;
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isUpcoming) {
      scale.value = withRepeat(
        withSequence(withTiming(1.6, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1, false,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isUpcoming, scale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.triggerDot,
        { left: x },
        isUpcoming && styles.triggerDotUpcoming,
        isPassed   && styles.triggerDotPassed,
        dotStyle,
      ]}
    />
  );
}

export function DistanceTracker() {
  const { width } = useWindowDimensions();
  const distance  = useGameStore((s) => s.distance);
  const barWidth  = width - RACE_SPACING.md * 2;

  const playerX = Math.min((distance / TOTAL_DISTANCE) * barWidth, barWidth - 8);

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={[styles.bar, { width: barWidth }]}>
        {/* Progress fill */}
        <View style={[styles.fill, { width: playerX }]} />

        {/* Player dot */}
        <View style={[styles.playerDot, { left: Math.max(0, playerX - 5) }]} />

        {/* Trigger dots */}
        {TRIGGER_DISTANCES.map((d) => (
          <TriggerDot
            key={d}
            triggerDist={d}
            playerDist={distance}
            barWidth={barWidth}
          />
        ))}
      </View>

      {/* Distance label */}
      <Text style={styles.label}>
        {Math.round(distance)}m <Text style={styles.labelMuted}>/ 400m</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: RACE_SPACING.md,
    gap: 5,
  },
  bar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 3,
    backgroundColor: 'rgba(255,229,0,0.45)',
    borderRadius: 2,
  },
  playerDot: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RACE_COLOURS.yellow,
  },
  triggerDot: {
    position: 'absolute',
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  triggerDotUpcoming: {
    backgroundColor: RACE_COLOURS.yellow,
  },
  triggerDotPassed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: RACE_COLOURS.white,
    textAlign: 'center',
  },
  labelMuted: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
});
