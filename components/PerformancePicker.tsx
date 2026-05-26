// ============================================================
// components/PerformancePicker.tsx — 5 pill buttons (POOR → PEAK)
// Selected state: yellow background, black text, weight 900
// ============================================================

import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { COLORS, PERFORMANCE_LABELS, RADIUS, SPACING } from '../lib/constants';
import { PerformanceLevel } from '../lib/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PerformancePickerProps {
  value: PerformanceLevel | null;
  onChange: (level: PerformanceLevel) => void;
  hasError?: boolean;
}

const LEVELS: PerformanceLevel[] = [1, 2, 3, 4, 5];

function PerfPill({
  level,
  selected,
  onPress,
}: {
  level: PerformanceLevel;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(0.92, { damping: 8 }),
      withSpring(1.0, { damping: 12 }),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Animated.View style={[styles.pillWrap, animStyle]}>
      <Pressable
        style={[styles.pill, selected && styles.pillSelected]}
        onPress={handlePress}
        accessible={true}
        accessibilityLabel={`Performance: ${PERFORMANCE_LABELS[level]}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
          {PERFORMANCE_LABELS[level]}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function PerformancePicker({ value, onChange, hasError }: PerformancePickerProps) {
  return (
    <View style={[styles.container, hasError && styles.containerError]}>
      <Text style={styles.label}>HOW DID YOU PERFORM?</Text>
      <View style={styles.row}>
        {LEVELS.map((level) => (
          <PerfPill
            key={level}
            level={level}
            selected={value === level}
            onPress={() => onChange(level)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderRadius: RADIUS.md,
  },
  containerError: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#BBBBBB',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  pillWrap: {
    flex: 1,
  },
  pill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BBBBBB',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pillTextSelected: {
    color: COLORS.black,
    fontWeight: '900',
  },
});
