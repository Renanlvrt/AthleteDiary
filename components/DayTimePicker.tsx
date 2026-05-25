// ============================================================
// components/DayTimePicker.tsx — Single row for schedule setup
// Day toggle (on/off) + time picker (iOS/Android only)
// ============================================================

import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View, Modal, TouchableOpacity } from 'react-native';
import { COLORS, DAY_LABELS, RADIUS, SPACING } from '../lib/constants';
import { DayOfWeek } from '../lib/types';

// Lazy-load the native date picker only on native platforms
// to avoid crashing on web
let DateTimePicker: React.ComponentType<{
  value: Date;
  mode: 'time';
  is24Hour?: boolean;
  display?: string;
  onChange: (event: unknown, date?: Date) => void;
}> | null = null;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface DayTimePickerProps {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  hour: number;
  minute: number;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (hour: number, minute: number) => void;
}

export function DayTimePicker({
  dayOfWeek,
  enabled,
  hour,
  minute,
  onToggle,
  onTimeChange,
}: DayTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleToggle(val: boolean) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(val);
  }

  const timeDate = new Date();
  timeDate.setHours(hour, minute, 0, 0);

  const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  function handleTimePress() {
    if (Platform.OS === 'web') {
      // Web fallback: simple prompt
      const input = prompt(`Training time for ${DAY_LABELS[dayOfWeek]} (HH:MM 24h):`, timeLabel);
      if (input) {
        const [h, m] = input.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          onTimeChange(h, m);
        }
      }
    } else {
      setShowPicker(true);
    }
  }

  return (
    <View style={styles.row}>
      {/* Day label */}
      <Text style={styles.dayLabel}>{DAY_LABELS[dayOfWeek]}</Text>

      {/* Toggle */}
      <Switch
        value={enabled}
        onValueChange={handleToggle}
        trackColor={{ false: COLORS.surfaceAlt, true: COLORS.primary }}
        thumbColor={enabled ? COLORS.black : COLORS.textSecondary}
        accessible={true}
        accessibilityLabel={`${DAY_LABELS[dayOfWeek]} training toggle`}
      />

      {/* Time display (only if enabled) */}
      {enabled ? (
        <Pressable
          style={styles.timeButton}
          onPress={handleTimePress}
          accessible={true}
          accessibilityLabel={`Training time for ${DAY_LABELS[dayOfWeek]}: ${timeLabel}`}
        >
          <Text style={styles.timeText}>{timeLabel}</Text>
        </Pressable>
      ) : (
        <Text style={styles.offText}>OFF</Text>
      )}

      {/* Native time picker (iOS/Android only) */}
      {showPicker && Platform.OS !== 'web' && DateTimePicker !== null && (
        Platform.OS === 'ios' ? (
          <Modal visible={true} transparent={true} animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalDoneText}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={timeDate}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onTimeChange(selectedDate.getHours(), selectedDate.getMinutes());
                    }
                  }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={timeDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTimeChange(selectedDate.getHours(), selectedDate.getMinutes());
              }
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    minHeight: 56,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#111111',   // Always dark — renders on white schedule card
    width: 36,
  },
  timeButton: {
    backgroundColor: '#F0F0F0',   // Light grey — visible on white background
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',   // Dark text on light grey button
    letterSpacing: 0.5,
  },
  offText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999999',   // Medium grey — visible on white
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  modalDoneText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
