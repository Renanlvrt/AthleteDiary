// ============================================================
// components/StreakCounter.tsx — Fire + count-up streak display
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../lib/constants';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (streak === 0) {
      setDisplayCount(0);
      return;
    }

    // Count up animation
    const duration = 600;
    const steps = Math.min(streak, 30);
    const interval = duration / steps;
    let current = 0;

    animRef.current = setInterval(() => {
      current += Math.ceil(streak / steps);
      if (current >= streak) {
        setDisplayCount(streak);
        if (animRef.current) clearInterval(animRef.current);
      } else {
        setDisplayCount(current);
      }
    }, interval);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [streak]);

  if (streak === 0) {
    return (
      <Text style={styles.noStreak}>START YOUR STREAK TODAY</Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.number}>{displayCount}</Text>
        <Text style={styles.label}>DAY STREAK</Text>
      </View>
      {streak === 1 && (
        <Text style={styles.encouragingText}>Keep it going tomorrow!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.black,
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fire: {
    fontSize: 18,
  },
  number: {
    ...TYPOGRAPHY.streakNumber,
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  noStreak: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  encouragingText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 4,
  },
});
