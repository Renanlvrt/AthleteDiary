// ============================================================
// app/index.tsx — Home Screen (Dashboard) - Refactored
// Layout (top → bottom):
//   1. Yellow card: ATHLETE DIARY + calendar/gear + streak + TRAIN.LOG.GROW. + refined date
//   2. White card: THIS YEAR + MoodGrid
//   3. Recent sessions heading + SessionCard white cards
//   4. Bottom integrated bar: LOG SESSION black button bar at the extreme bottom
// Refactored for card-based structure, normalized margins, and full-screen ground (light grey ground).
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
  const { sessions, refresh, updateSessionNote } = useSessions();
  const { schedule } = useSchedule();
  const streak = useStreak(sessions, schedule.isConfigured ? schedule.slots : []);
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

  // Updated date formatting - cleaner, modern dynamic date format
  const todayDateObj = new Date();
  const dayMonthStr = format(todayDateObj, 'EEEE d MMMM').toUpperCase();
  const yearStr = format(todayDateObj, 'yyyy').toUpperCase();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: insets.bottom + 100, // Leaving space for FAB bottom bar
        }]}
      >
        {/* ── 1. REFINED YELLOW HEADER CARD ── */}
        <View style={[styles.yellowCard, { paddingTop: insets.top + SPACING.md }]}>
          {/* Nav row */}
          <View style={styles.navRow}>
            <Text style={styles.appName}>ATHLETE DIARY</Text>
            <View style={styles.navButtons}>
              <Pressable
                style={styles.gearButton}
                onPress={() => router.push('/widget')}
                accessible={true}
                accessibilityLabel="Widget setup"
              >
                <Ionicons name="grid-outline" size={16} color={COLORS.primary} />
              </Pressable>
              <Pressable
                style={styles.gearButton}
                onPress={() => router.push('/schedule')}
                accessible={true}
                accessibilityLabel="Training schedule settings"
              >
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </Pressable>
            </View>
          </View>

          {/* Streak */}
          <StreakCounter streak={streak} />

          {/* Hero text */}
          <Text style={styles.heroText}>{'TRAIN.\nLOG.\nGROW.'}</Text>
          {/* Refined date display */}
          <Text style={styles.heroSub}>{`${dayMonthStr}\n${yearStr}`}</Text>
        </View>

        {/* ── 2. REFINED WHITE CARD — Legible Detailed Heatmap ── */}
        <View style={styles.whiteCard}>
          <Text style={styles.sectionLabel}>THIS YEAR</Text>
          <MoodGrid sessions={sessions} />
        </View>

        {/* ── 3. REFINED RECENT SESSIONS SECTION heading text white cards ── */}
        <View style={styles.recentSection}>
          <Text style={styles.recentHeading}>RECENT{"\n"}SESSIONS</Text>

          {recentSessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>NO SESSIONS YET — LOG YOUR FIRST ONE!</Text>
            </View>
          ) : (
            recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onUpdateNote={updateSessionNote}
              />
            ))
          )}
          
          {/* Schedule banner (if not configured) */}
          <View style={styles.scheduleWrapper}>
            {!schedule.isConfigured && <ScheduleBanner />}
          </View>
        </View>
      </ScrollView>

      {/* ── 4. INTEGRATED BOTTOM ACTION BAR button at the extreme bottom ── */}
      <View style={[styles.fabBarIntegrated, { paddingBottom: insets.bottom + SPACING.md }]}>
        <AnimatedPressable
          style={[styles.fabIntegratedButtonBar, fabAnimStyle]}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={handleFabPress}
          accessible={true}
          accessibilityLabel="Log new session"
          accessibilityRole="button"
        >
          <Text style={styles.fabPlus}>+</Text>
          <Text style={styles.fabTextIntegratedButtonBar}>LOG SESSION</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E8E8E8', // Light grey background
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Yellow card
  yellowCard: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
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
  navButtons: {
    flexDirection: 'row',
    gap: 8,
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

  // Refined White Card
  whiteCard: {
    backgroundColor: '#FFFDE7', // Off-white/faint yellow
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabel,
    marginBottom: 12,
  },

  // Refined Recent Section
  recentSection: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  recentHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.black,
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
    marginHorizontal: SPACING.md,
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
    marginHorizontal: SPACING.md,
  },

  // Refined Integrated BOTTOM BAR button
  fabBarIntegrated: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIntegratedButtonBar: {
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
  fabTextIntegratedButtonBar: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});