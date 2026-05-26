// ============================================================
// features/race400m/screens/BonkOverlay.tsx
// Red vignette pulsing overlay when energy = 0.
// Not a separate screen — positioned absolute inside RaceScreen.
// ============================================================

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS } from '../game/constants';

export function BonkOverlay() {
  const phase = useGameStore((s) => s.phase);
  const opacity = useSharedValue(0);
  const isBonking = phase === 'bonk';

  useEffect(() => {
    if (isBonking) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 400 }),
          withTiming(0.2,  { duration: 400 }),
        ),
        -1,
        false,
      );

      // Heavy haptic every second
      const interval = setInterval(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1000);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      return () => clearInterval(interval);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isBonking, opacity]);

  const vignetteStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!isBonking) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top edge */}
      <Animated.View style={[styles.edge, styles.edgeTop, vignetteStyle]} />
      {/* Bottom edge */}
      <Animated.View style={[styles.edge, styles.edgeBottom, vignetteStyle]} />
      {/* Left edge */}
      <Animated.View style={[styles.edge, styles.edgeLeft, vignetteStyle]} />
      {/* Right edge */}
      <Animated.View style={[styles.edge, styles.edgeRight, vignetteStyle]} />

      {/* Centre text */}
      <View style={styles.textContainer} pointerEvents="none">
        <Text style={styles.bonkText}>BONKING ↓</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    backgroundColor: RACE_COLOURS.dangerRed,
  },
  edgeTop:    { top: 0,    left: 0, right: 0, height: 60 },
  edgeBottom: { bottom: 0, left: 0, right: 0, height: 60 },
  edgeLeft:   { top: 0, bottom: 0, left: 0,  width: 40  },
  edgeRight:  { top: 0, bottom: 0, right: 0, width: 40  },
  textContainer: {
    position:       'absolute',
    top:            80,
    left:           0,
    right:          0,
    alignItems:     'center',
  },
  bonkText: {
    fontSize:      20,
    fontWeight:    '900',
    color:         RACE_COLOURS.dangerRed,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor:  'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
