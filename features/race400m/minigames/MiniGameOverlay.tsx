// ============================================================
// features/race400m/minigames/MiniGameOverlay.tsx
// Shared wrapper for all mini-games.
// - Slides up from bottom (covers ~60% of screen)
// - Countdown timer bar at top
// - Auto-resolves as 'lose' on timeout
// - Reads active game from registry — no switch statements
// ============================================================

import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameStore';
import {
  MINI_GAME_REGISTRY,
  MINI_GAME_TITLES,
  MINI_GAME_TIME_LIMITS,
} from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

const OVERLAY_HEIGHT_RATIO = 0.62; // fraction of screen height

export function MiniGameOverlay() {
  const { height } = useWindowDimensions();

  const currentMiniGame = useGameStore((s) => s.currentMiniGame);
  const difficulty      = useGameStore((s) => s.difficulty);
  const resolveMiniGame = useGameStore((s) => s.resolveMiniGame);
  const phase           = useGameStore((s) => s.phase);

  const translateY   = useSharedValue(height);
  const flashOpacity = useSharedValue(0);
  const timerWidth   = useSharedValue(100); // 0–100 (percent)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvedRef  = useRef(false);

  const isVisible = phase === 'minigame' && currentMiniGame !== null;

  // Slide up / down
  useEffect(() => {
    if (isVisible) {
      resolvedRef.current = false;
      translateY.value = withSpring(0, { damping: 22, stiffness: 300 });
      startTimer();
    } else {
      translateY.value = withSpring(height, { damping: 22, stiffness: 300 });
      clearInterval(timerRef.current ?? undefined);
      timerWidth.value = 100;
    }
  }, [isVisible]);

  function startTimer() {
    if (!currentMiniGame) return;
    const totalMs = MINI_GAME_TIME_LIMITS[currentMiniGame] * 1000;
    const tickMs  = 30;
    let elapsed   = 0;

    timerWidth.value = 100;
    clearInterval(timerRef.current ?? undefined);

    timerRef.current = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.max(0, 100 - (elapsed / totalMs) * 100);
      timerWidth.value = pct;

      if (elapsed >= totalMs && !resolvedRef.current) {
        clearInterval(timerRef.current ?? undefined);
        handleResolve('lose');
      }
    }, tickMs);
  }

  function handleResolve(result: 'win' | 'lose') {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearInterval(timerRef.current ?? undefined);

    const colour = result === 'win' ? RACE_COLOURS.green : RACE_COLOURS.dangerRed;
    const haptic =
      result === 'win'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Heavy;

    void Haptics.impactAsync(haptic);
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, { duration: 300 }),
    );
    setTimeout(() => resolveMiniGame(result), 320);
  }

  const overlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const timerBarStyle = useAnimatedStyle(() => ({
    width: `${timerWidth.value}%`,
    backgroundColor:
      timerWidth.value > 60
        ? RACE_COLOURS.yellow
        : timerWidth.value > 25
        ? RACE_COLOURS.energyMid
        : RACE_COLOURS.dangerRed,
  }));

  if (!currentMiniGame) return null;

  const GameComponent = MINI_GAME_REGISTRY[currentMiniGame];
  const title         = MINI_GAME_TITLES[currentMiniGame];

  const overlayHeight = height * OVERLAY_HEIGHT_RATIO;

  return (
    <Animated.View style={[styles.container, { height: overlayHeight }, overlayStyle]}>
      {/* Timer bar */}
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerBar, timerBarStyle]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Game component */}
      <View style={styles.gameArea}>
        <GameComponent difficulty={difficulty} onResolve={handleResolve} />
      </View>

      {/* Win / Lose flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.flash, flashStyle]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    overflow:        'hidden',
  },
  timerTrack: {
    height:          5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  timerBar: {
    height:          5,
    borderRadius:    2,
  },
  title: {
    fontSize:      18,
    fontWeight:    '800',
    letterSpacing: 2.5,
    color:         RACE_COLOURS.white,
    textTransform: 'uppercase',
    textAlign:     'center',
    paddingTop:    RACE_SPACING.md,
    paddingBottom: RACE_SPACING.sm,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: RACE_SPACING.md,
    paddingBottom:     RACE_SPACING.md,
  },
  flash: {
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
  },
});
