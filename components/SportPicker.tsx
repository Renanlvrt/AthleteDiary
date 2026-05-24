// ============================================================
// components/SportPicker.tsx — Horizontal scroll sport pill selector
// Text-only labels (no emojis)
// ============================================================

import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { COLORS, ALL_SPORTS, SPORT_LABELS, RADIUS, SPACING } from '../lib/constants';
import { SportType } from '../lib/types';

interface SportPickerProps {
  value: SportType;
  onChange: (sport: SportType) => void;
}

export function SportPicker({ value, onChange }: SportPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  function handleSelect(sport: SportType) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(sport);
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ALL_SPORTS.map((sport) => {
        const selected = sport === value;
        return (
          <Pressable
            key={sport}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => handleSelect(sport)}
            accessible={true}
            accessibilityLabel={`Sport: ${SPORT_LABELS[sport]}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
              {SPORT_LABELS[sport]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pillTextSelected: {
    color: COLORS.black,
  },
});
