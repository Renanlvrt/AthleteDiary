// ============================================================
// components/MoodPicker.tsx — Gradient slider for mood selection
// Horizontal gradient track (red→green) with draggable thumb
// Maps position 0–1 to mood levels 1–5
// ============================================================

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, MOOD_COLOURS, MOOD_GRADIENT, MOOD_LABELS, SPACING } from '../lib/constants';
import { MoodLevel } from '../lib/types';

interface MoodPickerProps {
  value: MoodLevel;
  onChange: (mood: MoodLevel) => void;
}

function positionToMood(position: number): MoodLevel {
  if (position < 0.2) return 1;
  if (position < 0.4) return 2;
  if (position < 0.6) return 3;
  if (position < 0.8) return 4;
  return 5;
}

const THUMB_SIZE = 28;

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const trackWidth = useRef(0);
  const [thumbPosition, setThumbPosition] = useState<number>(
    // Map initial value to position
    ((value - 1) / 4) * (1 - 0.05) + 0.025
  );

  const lastMood = useRef<MoodLevel>(value);

  const updateFromPosition = useCallback((rawX: number) => {
    const clamped = Math.max(0, Math.min(1, rawX / trackWidth.current));
    setThumbPosition(clamped);
    const newMood = positionToMood(clamped);
    if (newMood !== lastMood.current) {
      lastMood.current = newMood;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newMood);
    }
  }, [onChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateFromPosition(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateFromPosition(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const currentColour = MOOD_COLOURS[value];
  // trackWidth is 0 on first render; thumb position is a ratio 0-1
  const thumbLeftRatio = thumbPosition;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>HOW DID YOU FEEL?</Text>

      <View
        style={styles.trackContainer}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
        accessible={true}
        accessibilityLabel={`Mood level: ${MOOD_LABELS[value]}`}
        accessibilityRole="adjustable"
      >
        <LinearGradient
          colors={[MOOD_GRADIENT[0], MOOD_GRADIENT[1], MOOD_GRADIENT[2], MOOD_GRADIENT[3], MOOD_GRADIENT[4]] as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.track}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${Math.round(thumbLeftRatio * 100)}%` as `${number}%`,
              borderColor: currentColour,
            },
          ]}
        />
      </View>

      <View style={styles.labelsRow}>
        <Text style={[styles.endLabel, { color: COLORS.moodTerrible }]}>TERRIBLE</Text>
        <Text style={[styles.endLabel, { color: COLORS.moodGreat }]}>GREAT</Text>
      </View>

      <Text style={[styles.currentLabel, { color: currentColour }]}>
        {MOOD_LABELS[value]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#BBBBBB',
    marginBottom: SPACING.md,
  },
  trackContainer: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 14,
    borderRadius: 7,
    marginTop: 15,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    top: 8,
    marginLeft: -(THUMB_SIZE / 2),
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  endLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  currentLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 6,
  },
});
