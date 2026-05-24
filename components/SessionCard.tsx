// ============================================================
// components/SessionCard.tsx — Recent session summary card
// Inside the red block on Home screen. White background card.
// NO emojis — text sport labels only
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, MOOD_COLOURS, MOOD_LABELS, PERFORMANCE_LABELS, RADIUS, SPACING, SPORT_FULL_NAMES, TYPOGRAPHY } from '../lib/constants';
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
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      {/* Left color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: MOOD_COLOURS[session.mood] }]} />

      <View style={styles.innerContent}>
        {/* Left: sport name */}
        <View style={styles.left}>
          <Text style={styles.sportName}>{SPORT_FULL_NAMES[session.sport]}</Text>
          <Text style={styles.meta}>
            {formatSessionDate(session.date)} · {PERFORMANCE_LABELS[session.performance]}
          </Text>
        </View>

        {/* Right: mood pill + chevron */}
        <View style={styles.right}>
          <View style={styles.moodPill}>
            <View
              style={[styles.moodDot, { backgroundColor: MOOD_COLOURS[session.mood] }]}
              accessible={true}
              accessibilityLabel={`Mood indicator`}
            />
            <Text style={styles.perfLabel}>{MOOD_LABELS[session.mood]}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    minHeight: 64,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  sportName: {
    ...TYPOGRAPHY.cardName,
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  meta: {
    ...TYPOGRAPHY.cardMeta,
    fontSize: 11,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDE7', // Faint yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  perfLabel: {
    ...TYPOGRAPHY.perfLabel,
    color: '#000000',
    fontSize: 10,
  },
});
