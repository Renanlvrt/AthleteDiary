// ============================================================
// components/SessionCard.tsx — Recent session summary card
// Inside the red block on Home screen. White background card.
// NO emojis — text sport labels only
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, MOOD_COLOURS, PERFORMANCE_LABELS, RADIUS, SPACING, SPORT_FULL_NAMES, TYPOGRAPHY } from '../lib/constants';
import { format } from '../lib/dates';
import { Session } from '../lib/types';

interface SessionCardProps {
  session: Session;
}

function formatSessionDate(dateStr: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return format(new Date(dateStr + 'T12:00:00'), 'MMM d');
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <View style={styles.card}>
      {/* Left: sport name */}
      <View style={styles.left}>
        <Text style={styles.sportName}>{SPORT_FULL_NAMES[session.sport]}</Text>
        <Text style={styles.meta}>{formatSessionDate(session.date)}</Text>
      </View>

      {/* Right: mood dot + performance label */}
      <View style={styles.right}>
        <View
          style={[styles.moodDot, { backgroundColor: MOOD_COLOURS[session.mood] }]}
          accessible={true}
          accessibilityLabel={`Mood indicator`}
        />
        <Text style={styles.perfLabel}>{PERFORMANCE_LABELS[session.performance]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minHeight: 60,
  },
  left: {
    flex: 1,
  },
  sportName: {
    ...TYPOGRAPHY.cardName,
    color: '#000000',
  },
  meta: {
    ...TYPOGRAPHY.cardMeta,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  perfLabel: {
    ...TYPOGRAPHY.perfLabel,
    color: '#BBBBBB',
  },
});
