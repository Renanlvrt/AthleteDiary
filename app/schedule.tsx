// ============================================================
// app/schedule.tsx — Training Schedule Setup Screen
// One-time configuration of recurring training days + times
// Saves to AsyncStorage + schedules local notifications
// ============================================================

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayTimePicker } from '../components/DayTimePicker';
import { useSchedule } from '../hooks/useSchedule';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../lib/constants';
import { requestNotificationPermissions } from '../lib/notifications';
import { DayOfWeek, TrainingSlot } from '../lib/types';

interface DaySlot {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  hour: number;
  minute: number;
}

const INITIAL_SLOTS: DaySlot[] = [
  { dayOfWeek: 0, enabled: false, hour: 18, minute: 0 }, // Mon
  { dayOfWeek: 1, enabled: false, hour: 18, minute: 0 }, // Tue
  { dayOfWeek: 2, enabled: false, hour: 18, minute: 0 }, // Wed
  { dayOfWeek: 3, enabled: false, hour: 18, minute: 0 }, // Thu
  { dayOfWeek: 4, enabled: false, hour: 18, minute: 0 }, // Fri
  { dayOfWeek: 5, enabled: false, hour: 18, minute: 0 }, // Sat
  { dayOfWeek: 6, enabled: false, hour: 18, minute: 0 }, // Sun
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { schedule, saveSchedule } = useSchedule();
  const [slots, setSlots] = useState<DaySlot[]>(INITIAL_SLOTS);
  const [saving, setSaving] = useState(false);

  // Load existing schedule on mount
  useEffect(() => {
    if (schedule.isConfigured && schedule.slots.length > 0) {
      const loaded: DaySlot[] = INITIAL_SLOTS.map((initial) => {
        const existing = schedule.slots.find((s) => s.dayOfWeek === initial.dayOfWeek);
        if (existing) {
          return { ...initial, enabled: true, hour: existing.hour, minute: existing.minute };
        }
        return initial;
      });
      setSlots(loaded);
    }
  }, [schedule]);

  function updateSlot(dayOfWeek: DayOfWeek, updates: Partial<DaySlot>) {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...updates } : s)),
    );
  }

  async function handleSave() {
    const enabled = slots.filter((s) => s.enabled);

    if (enabled.length === 0) {
      Alert.alert('Select at least one day', 'Pick at least one training day to continue.');
      return;
    }

    setSaving(true);

    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Notifications needed',
        'Please enable notifications in Settings to get training reminders.',
      );
      setSaving(false);
      return;
    }

    const trainingSlots: TrainingSlot[] = enabled.map((s) => ({
      id: generateId(),
      dayOfWeek: s.dayOfWeek,
      hour: s.hour,
      minute: s.minute,
    }));

    await saveSchedule({
      slots: trainingSlots,
      isConfigured: true,
      updatedAt: Date.now(),
    });

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── YELLOW HEADER ── */}
        <View style={styles.yellowBlock}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <Text style={styles.headline}>{'SET YOUR\nTRAINING\nSCHEDULE'}</Text>
          <Text style={styles.sub}>
            {'Pick the days and times you train.\nWe\'ll remind you to log after each session.'}
          </Text>
        </View>

        {/* ── DAY ROWS ── */}
        <View style={styles.daysBlock}>
          {slots.map((slot) => (
            <View key={slot.dayOfWeek}>
              <DayTimePicker
                dayOfWeek={slot.dayOfWeek}
                enabled={slot.enabled}
                hour={slot.hour}
                minute={slot.minute}
                onToggle={(enabled) => updateSlot(slot.dayOfWeek, { enabled })}
                onTimeChange={(hour, minute) => updateSlot(slot.dayOfWeek, { hour, minute })}
              />
              <View style={styles.rowDivider} />
            </View>
          ))}
        </View>

        {/* ── SAVE BUTTON ── */}
        <View style={styles.saveBlock}>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessible={true}
            accessibilityLabel="Save training schedule"
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'SAVING...' : 'SAVE SCHEDULE'}
            </Text>
          </Pressable>
          <Text style={styles.hint}>You can update this any time from the home screen.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  yellowBlock: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    paddingBottom: 24,
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  backChevron: {
    fontSize: 20,
    color: COLORS.textOnYellow,
  },
  headline: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1,
    lineHeight: 30,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textOnYellow,
    opacity: 0.5,
    lineHeight: 16,
  },
  daysBlock: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlt,
    marginHorizontal: SPACING.md,
  },
  saveBlock: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...TYPOGRAPHY.appName,
    color: COLORS.textOnYellow,
    fontSize: 13,
  },
  hint: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    letterSpacing: 0.5,
  },
});
