// ============================================================
// components/MoodGrid.tsx — GitHub-style annual mood grid
// 53 columns (weeks) × 7 rows (Mon–Sun)
// ============================================================

import { format, isAfter, isSameDay, isToday } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, MOOD_COLOURS, MOOD_LABELS, SPACING, TYPOGRAPHY } from '../lib/constants';
import { buildYearGrid } from '../lib/dates';
import { MoodLevel, Session } from '../lib/types';

interface MoodGridProps {
  sessions: Session[];
}

interface TooltipData {
  date: string;
  mood: MoodLevel;
  sport: string;
  performance: number;
}

const CELL_SIZE = 9;
const CELL_GAP = 2;

export const MoodGrid = React.memo(({ sessions }: MoodGridProps) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Build full year grid — only depends on year (stable)
  const weeks = useMemo(() => buildYearGrid(), []);

  // Build session lookup map
  const sessionMap = useMemo(() => {
    const map = new Map<string, Session>();
    sessions.forEach((s) => map.set(s.date, s));
    return map;
  }, [sessions]);

  // Month labels: one per month start
  const monthLabels = useMemo(() => {
    const labels: { label: string; startCol: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const month = week[0].getMonth();
      if (month !== lastMonth) {
        labels.push({ label: format(week[0], 'MMM').toUpperCase()[0], startCol: i });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  function getCellColour(date: Date): string {
    const today = new Date();
    if (isAfter(date, today) && !isSameDay(date, today)) return COLORS.gridFuture;
    const dateStr = format(date, 'yyyy-MM-dd');
    const session = sessionMap.get(dateStr);
    if (!session) return COLORS.gridEmpty;
    return MOOD_COLOURS[session.mood];
  }

  function onCellPress(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const session = sessionMap.get(dateStr);
    if (!session) return;
    if (tooltip?.date === dateStr) {
      setTooltip(null);
    } else {
      setTooltip({
        date: dateStr,
        mood: session.mood,
        sport: session.sport,
        performance: session.performance,
      });
    }
  }

  return (
    <View>
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {format(new Date(tooltip.date + 'T12:00:00'), 'MMM d')} · {tooltip.sport.toUpperCase()} · {MOOD_LABELS[tooltip.mood]}
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month labels row */}
          <View style={styles.monthRow}>
            {monthLabels.map(({ label, startCol }) => (
              <View
                key={startCol}
                style={[
                  styles.monthLabel,
                  { left: startCol * (CELL_SIZE + CELL_GAP) },
                ]}
              >
                <Text style={styles.monthText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {weeks.map((week, colIdx) => (
              <View key={colIdx} style={styles.column}>
                {week.map((date, rowIdx) => {
                  const colour = getCellColour(date);
                  const todayCell = isToday(date);
                  return (
                    <TouchableOpacity
                      key={rowIdx}
                      onPress={() => onCellPress(date)}
                      accessible={true}
                      accessibilityLabel={format(date, 'MMMM d')}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.cell,
                          { backgroundColor: colour },
                          todayCell && styles.todayCell,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

MoodGrid.displayName = 'MoodGrid';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  column: {
    flexDirection: 'column',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 1.5,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: COLORS.gridTodayBorder,
  },
  monthRow: {
    flexDirection: 'row',
    marginBottom: 4,
    position: 'relative',
    height: 12, // Prevent layout collapse so months are visible
  },
  monthLabel: {
    position: 'absolute',
  },
  monthText: {
    fontSize: 7,
    color: '#888888', // More readable contrast against light cream card background
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tooltip: {
    backgroundColor: COLORS.black,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  tooltipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
  },
});
