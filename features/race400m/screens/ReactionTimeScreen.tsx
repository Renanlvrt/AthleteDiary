// ============================================================
// features/race400m/screens/ReactionTimeScreen.tsx
// READY → GO! flash. Records reaction time. Transitions to race.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS } from '../game/constants';

interface ReactionTimeScreenProps {
  onDone: () => void;
}

type ReactionPhase = 'ready' | 'flash' | 'done';

export function ReactionTimeScreen({ onDone }: ReactionTimeScreenProps) {
  const [phase, setPhase]          = useState<ReactionPhase>('ready');
  const [tooEarly, setTooEarly]    = useState(false);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const flashTime   = useRef<number | null>(null);
  const resolvedRef = useRef(false);
  const readyOpacity = useSharedValue(0);
  const bgColor      = useSharedValue(0); // 0 = black, 1 = yellow
  const goScale      = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  const setReactionTime = useGameStore((s) => s.setReactionTime);
  const startRace       = useGameStore((s) => s.startRace);

  // Fade in READY text
  useEffect(() => {
    readyOpacity.value = withTiming(1, { duration: 600 });

    // Flash after 2s
    const timer = setTimeout(() => {
      setPhase('flash');
      flashTime.current = Date.now();
      bgColor.value  = withTiming(1, { duration: 80 });
      goScale.value  = withSpring(1, { damping: 10, stiffness: 260 });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  function handleTap() {
    if (resolvedRef.current) return;

    if (phase === 'ready') {
      // Too early — show message and re-flash
      setTooEarly(true);
      setTimeout(() => setTooEarly(false), 800);
      return;
    }

    if (phase === 'flash' && flashTime.current !== null) {
      resolvedRef.current = true;
      const ms = Date.now() - flashTime.current;
      setReactionMs(ms);
      setReactionTime(ms);
      resultOpacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 400 }),
      );
      setPhase('done');
      startRace();
      setTimeout(onDone, 1200);
    }
  }

  const readyStyle  = useAnimatedStyle(() => ({ opacity: readyOpacity.value }));
  const bgStyle     = useAnimatedStyle(() => ({
    backgroundColor: bgColor.value > 0.5 ? RACE_COLOURS.yellow : RACE_COLOURS.black,
  }));
  const goStyle     = useAnimatedStyle(() => ({
    transform: [{ scale: goScale.value }],
    opacity:   goScale.value,
  }));
  const resultStyle = useAnimatedStyle(() => ({ opacity: resultOpacity.value }));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Animated.View style={[styles.container, bgStyle]}>
        {phase === 'ready' && (
          <Animated.View style={[styles.centre, readyStyle]}>
            <Text style={styles.readyText}>GET</Text>
            <Text style={styles.readyText}>READY…</Text>
            {tooEarly && (
              <Text style={styles.tooEarly}>TOO EARLY!</Text>
            )}
          </Animated.View>
        )}

        {(phase === 'flash' || phase === 'done') && (
          <Animated.Text style={[styles.goText, goStyle]}>GO!</Animated.Text>
        )}

        {reactionMs !== null && (
          <Animated.Text style={[styles.resultText, resultStyle]}>
            {(reactionMs / 1000).toFixed(2)}s
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  centre: { alignItems: 'center', gap: 4 },
  readyText: {
    fontSize:      52,
    fontWeight:    '900',
    color:         RACE_COLOURS.white,
    letterSpacing: -2,
    lineHeight:    56,
  },
  tooEarly: {
    marginTop:  16,
    fontSize:   16,
    fontWeight: '800',
    color:      RACE_COLOURS.dangerRed,
    letterSpacing: 2,
  },
  goText: {
    fontSize:      88,
    fontWeight:    '900',
    color:         RACE_COLOURS.black,
    letterSpacing: -3,
  },
  resultText: {
    position:   'absolute',
    bottom:     80,
    fontSize:   24,
    fontWeight: '800',
    color:      RACE_COLOURS.black,
    letterSpacing: 1,
  },
});
