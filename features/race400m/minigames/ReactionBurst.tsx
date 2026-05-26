// ============================================================
// features/race400m/minigames/ReactionBurst.tsx
// Wait for the yellow flash, then tap within 400ms.
// Tapping before the flash is an instant lose (anti-cheat).
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS } from '../game/constants';

const REACTION_WINDOW_MS = 400; // ms after flash to tap
const MIN_DELAY_MS       = 500;
const MAX_DELAY_MS       = 1500;

export function ReactionBurst({ onResolve }: MiniGameProps) {
  const [state, setState] = useState<'waiting' | 'flashed' | 'done'>('waiting');
  const flashTimestamp = useRef<number | null>(null);
  const resolvedRef    = useRef(false);
  const bgOpacity  = useSharedValue(0);
  const textScale  = useSharedValue(0);

  useEffect(() => {
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = setTimeout(() => {
      setState('flashed');
      flashTimestamp.current = Date.now();
      bgOpacity.value  = withTiming(1, { duration: 0 });
      textScale.value  = withSpring(1, { damping: 10, stiffness: 300 });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  function handleTap() {
    if (resolvedRef.current) return;

    if (state === 'waiting') {
      // Tapped before the flash — instant lose (anti-cheat)
      resolvedRef.current = true;
      setState('done');
      onResolve('lose');
      return;
    }

    if (state === 'flashed' && flashTimestamp.current !== null) {
      const delta = Date.now() - flashTimestamp.current;
      resolvedRef.current = true;
      setState('done');
      onResolve(delta <= REACTION_WINDOW_MS ? 'win' : 'lose');
    }
  }

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        {/* Dark waiting state */}
        {state === 'waiting' && (
          <Text style={styles.waitText}>WAIT…</Text>
        )}

        {/* Yellow flash */}
        {state !== 'waiting' && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.flashBg, bgStyle]} />
        )}
        {state === 'flashed' && (
          <Animated.Text style={[styles.nowText, textStyle]}>NOW!</Animated.Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16, overflow: 'hidden' },
  flashBg:   { backgroundColor: RACE_COLOURS.yellow, borderRadius: 16 },
  waitText:  { fontSize: 32, fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: 4 },
  nowText:   { fontSize: 64, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -2, zIndex: 2 },
});
