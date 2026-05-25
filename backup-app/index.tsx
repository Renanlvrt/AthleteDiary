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

  function handleFabPressIn() {
    fabScale.value = withSpring(0.97, { damping: 15 });
  }

  function handleFabPressOut() {
    fabScale.value = withSpring(1.0, { damping: 12 });
  }

  function handleFabPress() {
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
        contentContainerStyle={styles.scrollContent}
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
          
          {/* Schedule banner (if not configured) */}
          <View style={styles.scheduleWrapper}>
            {!schedule.isConfigured && <ScheduleBanner />}
          </View>
        </View>
      </ScrollView>

      {/* ── 4. BOTTOM BAR — FAB ── */}
      <View style={[styles.fabBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <AnimatedPressable
          style={[styles.fab, fabAnimStyle]}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.accentRed,
  },

  // Yellow block
  yellowBlock: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    ...TYPOGRAPHY.appName,
  },
  gearButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.black,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textOnYellow,
    opacity: 0.6,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  // White block
  whiteBlock: {
    backgroundColor: '#FFFDE7', // Off-white/faint yellow
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabel,
    marginBottom: 12,
  },

  // Red block
  redBlock: {
    flexGrow: 1,
    backgroundColor: COLORS.accentRed,
    padding: SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8, // Slight overlap for card stacking effect
    paddingTop: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  recentHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textOnRed,
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: 24,
    marginBottom: SPACING.lg,
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
  scheduleWrapper: {
    marginTop: SPACING.md,
  },

  // FAB bar
  fabBar: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabPlus: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.primary,
    lineHeight: 26,
  },
  fabText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
