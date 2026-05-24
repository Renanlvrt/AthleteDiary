// ============================================================
// components/ScheduleBanner.tsx — Prompt on Home when schedule not configured
// Yellow left border, navigates to /schedule
// ============================================================

import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../lib/constants';

export function ScheduleBanner() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push('/schedule')}
      accessible={true}
      accessibilityLabel="Set up your training schedule to get session reminders"
      accessibilityRole="button"
    >
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <Text style={styles.title}>SET UP YOUR TRAINING SCHEDULE</Text>
        <Text style={styles.sub}>Get reminded to log after each session</Text>
      </View>
      <Text style={styles.cta}>SET UP →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    minHeight: 60,
  },
  leftBorder: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 10,
  },
  sub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    paddingRight: SPACING.md,
  },
});
