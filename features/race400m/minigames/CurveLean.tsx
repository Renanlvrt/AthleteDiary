// ============================================================
// features/race400m/minigames/CurveLean.tsx
// Mini-game at ~80m. Swipe LEFT 3 times in rhythm.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

const SWIPES_NEEDED  = 3;
const RHYTHM_MS      = 900; // ms per arrow pulse
const SWIPE_VELOCITY = 400; // minimum x velocity for a valid swipe

export function CurveLean({ onResolve }: MiniGameProps) {
  const [swipeCount, setSwipeCount]     = useState(0);
  const [arrowIndex, setArrowIndex]     = useState(0);
  const [inWindow, setInWindow]         = useState(false);
  const swipeCountRef = useRef(0);
  const inWindowRef   = useRef(false);
  const resolvedRef   = useRef(false);

  const arrowScale  = useSharedValue(1);
  const arrow0Color = useSharedValue(0);
  const arrow1Color = useSharedValue(0);
  const arrow2Color = useSharedValue(0);

  // Pulsing rhythm — sets the swipe window
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setArrowIndex(idx);
      setInWindow(true);
      inWindowRef.current = true;
      arrowScale.value = withSequence(
        withTiming(1.25, { duration: 200 }),
        withTiming(1.0,  { duration: 200 }),
      );
      setTimeout(() => {
        setInWindow(false);
        inWindowRef.current = false;
        idx++;
        if (idx >= SWIPES_NEEDED + 1) clearInterval(interval);
      }, RHYTHM_MS / 2);
    }, RHYTHM_MS);
    return () => clearInterval(interval);
  }, []);

  function flashArrow(index: number) {
    const vals = [arrow0Color, arrow1Color, arrow2Color];
    vals[index].value = withSequence(withTiming(1, { duration: 0 }), withTiming(0, { duration: 400 }));
  }

  const panGesture = Gesture.Pan().onEnd((e) => {
    if (resolvedRef.current) return;
    if (e.velocityX < -SWIPE_VELOCITY && inWindowRef.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newCount = swipeCountRef.current + 1;
      swipeCountRef.current = newCount;
      flashArrow(Math.min(newCount - 1, 2));
      setSwipeCount(newCount);
      if (newCount >= SWIPES_NEEDED) {
        resolvedRef.current = true;
        setTimeout(() => onResolve('win'), 200);
      }
    }
  });

  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ scale: arrowScale.value }] }));

  function getArrowColour(i: number) {
    if (i < swipeCount) return RACE_COLOURS.green;
    if (i === arrowIndex && inWindow) return RACE_COLOURS.yellow;
    return 'rgba(255,255,255,0.35)';
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Text style={styles.instruction}>SWIPE LEFT IN RHYTHM</Text>
        <Animated.View style={[styles.arrowRow, arrowStyle]}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.arrow, { color: getArrowColour(i) }]}>←</Text>
          ))}
        </Animated.View>
        <Text style={styles.counter}>{swipeCount} / {SWIPES_NEEDED}</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RACE_SPACING.lg },
  instruction: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  arrowRow:    { flexDirection: 'row', gap: RACE_SPACING.xl },
  arrow:       { fontSize: 52, fontWeight: '900' },
  counter:     { fontSize: 20, fontWeight: '900', color: RACE_COLOURS.white },
});
