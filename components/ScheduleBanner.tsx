// ============================================================
// components/ScheduleBanner.tsx — Prompt on Home when schedule not configured
// Yellow left border, navigates to /schedule
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../lib/constants';

export function ScheduleBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={() => router.push('/schedule')}
      accessible={true}
      accessibilityLabel="Set up your training schedule to get session reminders"
      accessibilityRole="button"
    >
      <View style={styles.leftBorder} />
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={22} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>SET UP YOUR TRAINING SCHEDULE</Text>
        <Text style={styles.sub}>Get reminded to log after each session</Text>
      </View>
      <Text style={styles.cta}>SET UP →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    minHeight: 72,
  },
  leftBorder: {
    width: 6,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  iconContainer: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  sub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    paddingRight: SPACING.md,
    fontWeight: '900',
  },
});
