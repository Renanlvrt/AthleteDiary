// ============================================================
// app/index.tsx — Home Screen (Dashboard)
// Layout (top → bottom):
//   1. Yellow block: ATHLETE DIARY + gear icon + streak + TRAIN.LOG.GROW. + date
//   2. White block: THIS YEAR + mood grid
//   3. Red block: RECENT SESSIONS + white session cards
//   4. White bar: + LOG SESSION black button
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { MoodGrid } from '../components/MoodGrid';
import { ScheduleBanner } from '../components/ScheduleBanner';
import { SessionCard } from '../components/SessionCard';
import { StreakCounter } from '../components/StreakCounter';
import { useSchedule } from '../hooks/useSchedule';
import { useSessions } from '../hooks/useSessions';
import { useStreak } from '../hooks/useStreak';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../lib/constants';
import { format } from '../lib/dates';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const { sessions, refresh } = useSessions();
  const { schedule } = useSchedule();
  const streak = useStreak(sessions);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const fabScale = useSharedValue(1);
  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  function handleFabPress() {
    fabScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.0, { damping: 12 }),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/log');
  }

  // 3 most recent sessions (sorted by date desc)
  const recentSessions = [...sessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  const todayStr = format(new Date(), 'EEEE d MMMM yyyy').toUpperCase();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {/* ── 1. YELLOW BLOCK ── */}
        <View style={[styles.yellowBlock, { paddingTop: insets.top + SPACING.md }]}>
          {/* Nav row */}
          <View style={styles.navRow}>
            <Text style={styles.appName}>ATHLETE DIARY</Text>
            <Pressable
              style={styles.gearButton}
              onPress={() => router.push('/schedule')}
              accessible={true}
              accessibilityLabel="Training schedule settings"
            >
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            </Pressable>
          </View>

          {/* Streak */}
          <StreakCounter streak={streak} />

          {/* Hero text */}
          <Text style={styles.heroText}>{'TRAIN.\nLOG.\nGROW.'}</Text>
          <Text style={styles.heroSub}>{todayStr}</Text>
        </View>

        {/* ── 2. WHITE BLOCK — Mood Grid ── */}
        <View style={styles.whiteBlock}>
          <Text style={styles.sectionLabel}>THIS YEAR</Text>
          <MoodGrid sessions={sessions} />
        </View>

        {/* ── 3. RED BLOCK — Recent Sessions ── */}
        <View style={styles.redBlock}>
          <Text style={styles.recentHeading}>{'RECENT\nSESSIONS'}</Text>

          {recentSessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>NO SESSIONS YET — LOG YOUR FIRST ONE!</Text>
            </View>
          ) : (
            recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </View>

        {/* Schedule banner (if not configured) */}
        {!schedule.isConfigured && <ScheduleBanner />}
      </ScrollView>

      {/* ── 4. BOTTOM BAR — FAB ── */}
      <View style={[styles.fabBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <AnimatedPressable
          style={[styles.fab, fabAnimStyle]}
          onPress={handleFabPress}
          accessible={true}
          accessibilityLabel="Log new session"
          accessibilityRole="button"
        >
          <Text style={styles.fabPlus}>+</Text>
          <Text style={styles.fabText}>LOG SESSION</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Yellow block
  yellowBlock: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  appName: {
    ...TYPOGRAPHY.appName,
  },
  gearButton: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.black,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 36,
    textTransform: 'uppercase',
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textOnYellow,
    opacity: 0.4,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // White block
  whiteBlock: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabel,
    marginBottom: 10,
  },

  // Red block
  redBlock: {
    backgroundColor: COLORS.accentRed,
    padding: SPACING.md,
  },
  recentHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textOnRed,
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // FAB bar
  fabBar: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
  },
  fab: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.lg,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabPlus: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.primary,
    lineHeight: 24,
  },
  fabText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
