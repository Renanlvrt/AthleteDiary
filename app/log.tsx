// ============================================================
// app/log.tsx — Log Session Modal - Refactored
// Layout (top → bottom):
//   1. Yellow card: ‹ back | TODAY Label | Dynamic Refined Date | sport pill
//   2. White sections: Sport, Mood (slider), Performance (pills), Notes
//   3. Red block: SAVE SESSION button, extending to the bottom edge
// Refactored for edge-to-edge layout, safe areas, and modern aesthetics.
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MoodPicker } from '../components/MoodPicker';
import { PerformancePicker } from '../components/PerformancePicker';
import { SportPicker } from '../components/SportPicker';
import { useSessions } from '../hooks/useSessions';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../lib/constants';
import { getLogScreenDate, getTodayString } from '../lib/dates';
import { getLastSport, saveLastSport } from '../lib/sessions';
import { MoodLevel, PerformanceLevel, SportType } from '../lib/types';

export default function LogScreen() {
  const router = useRouter();
  const { addSession } = useSessions();
  const insets = useSafeAreaInsets();

  const [mood, setMood] = useState<MoodLevel>(5);
  const [performance, setPerformance] = useState<PerformanceLevel | null>(null);
  const [sport, setSport] = useState<SportType>('running');
  const [notes, setNotes] = useState('');
  const [perfError, setPerfError] = useState(false);

  // Load last sport on mount
  React.useEffect(() => {
    getLastSport().then(setSport).catch(() => null);
  }, []);

  // Shake animation for performance validation
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  function triggerShake() {
    shakeX.value = withSequence(
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }

  async function handleSave() {
    if (!performance) {
      setPerfError(true);
      triggerShake();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const today = getTodayString();

    await addSession({
      date: today,
      timestamp: Date.now(),
      sport,
      mood,
      performance,
      notes: notes.trim() || undefined,
    });

    await saveLastSport(sport);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const { dayName, dayMonth } = getLogScreenDate();

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── 1. YELLOW HEADER BLOCK (Edge-to-Edge) ── */}
          <View style={[styles.yellowBlock, { paddingTop: insets.top + SPACING.md }]}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.textOnYellow} />
            </Pressable>

            <Text style={styles.todayLabel}>TODAY</Text>
            <Text style={styles.dateHeadline}>{`${dayName}\n${dayMonth}`}</Text>

            {/* Sport pill */}
            <View style={styles.sportPill}>
              <Text style={styles.sportPillText}>{sport.toUpperCase()}</Text>
              <Text style={styles.sportPillChange}>· change below</Text>
            </View>
          </View>

          {/* Wrapper for white picker sections */}
          <View style={styles.mainContent}>
            {/* Sport picker */}
            <View style={styles.whiteSection}>
              <Text style={styles.sectionLabel}>SPORT</Text>
              <SportPicker value={sport} onChange={setSport} />
            </View>

            <View style={styles.divider} />

            {/* ── 2. MOOD SLIDER ── */}
            <View style={styles.whiteSection}>
              <MoodPicker value={mood} onChange={setMood} />
            </View>

            <View style={styles.divider} />

            {/* ── 3. PERFORMANCE PILLS ── */}
            <Animated.View style={shakeStyle}>
              <PerformancePicker
                value={performance}
                onChange={(p) => {
                  setPerformance(p);
                  setPerfError(false);
                }}
                hasError={perfError}
              />
            </Animated.View>

            <View style={styles.divider} />

            {/* ── 4. NOTES ── */}
            <View style={[styles.whiteSection, styles.notesSection]}>
              <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Felt strong today..."
                  placeholderTextColor="#CCCCCC"
                  value={notes}
                  onChangeText={setNotes}
                  multiline={false}
                  returnKeyType="done"
                  accessible={true}
                  accessibilityLabel="Session notes"
                />
              </View>
            </View>
          </View>

          {/* ── 5. RED BLOCK — Save (Stretches to absolute bottom) ── */}
          <View style={[styles.redBlock, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
              accessible={true}
              accessibilityLabel="Save session"
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>SAVE SESSION</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
  },

  // Yellow block
  yellowBlock: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: 22,
  },
  backButton: {
    marginBottom: SPACING.md,
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.textOnYellow,
    opacity: 0.4,
  },
  dateHeadline: {
    ...TYPOGRAPHY.dateHeadline,
    marginTop: 2,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  sportPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sportPillChange: {
    fontSize: 9,
    color: '#666666',
    letterSpacing: 1,
  },

  // White sections
  whiteSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: SPACING.sm,
  },
  notesSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabel,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 12,
    color: COLORS.textPrimary,
    minHeight: 44,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },

  // Red block
  redBlock: {
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.accentRed,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});