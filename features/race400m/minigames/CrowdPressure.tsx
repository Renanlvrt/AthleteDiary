// ============================================================
// features/race400m/minigames/CrowdPressure.tsx
// Find the number that appears twice among 8–12 scattered digits.
// ============================================================

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS } from '../game/constants';

function getCount(difficulty: MiniGameProps['difficulty']): number {
  return difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
}

interface NumberItem { value: number; x: number; y: number; id: number }

function buildItems(count: number, areaW: number, areaH: number): { items: NumberItem[]; duplicate: number } {
  // Pick the duplicate number
  const duplicate = Math.floor(Math.random() * 9) + 1;

  // Build unique pool then add duplicate
  const pool: number[] = [duplicate];
  while (pool.length < count) {
    const n = Math.floor(Math.random() * 9) + 1;
    if (n !== duplicate || pool.filter((x) => x === n).length < 2) {
      if (!pool.includes(n)) pool.push(n);
    }
  }
  pool.push(duplicate); // second occurrence

  // Shuffle
  const shuffled = pool.sort(() => Math.random() - 0.5);

  const MARGIN = 40;
  const items: NumberItem[] = shuffled.map((value, i) => ({
    value,
    id: i,
    x: MARGIN + Math.random() * (areaW - MARGIN * 2),
    y: MARGIN + Math.random() * (areaH - MARGIN * 2),
  }));

  return { items, duplicate };
}

export function CrowdPressure({ difficulty, onResolve }: MiniGameProps) {
  const { width } = useWindowDimensions();
  const AREA_W = width - 32;
  const AREA_H = 260;
  const count  = getCount(difficulty);

  const [{ items, duplicate }] = useState(() => buildItems(count, AREA_W, AREA_H));
  const [chosen, setChosen]    = useState<number | null>(null);

  function handleTap(value: number) {
    if (chosen !== null) return;
    setChosen(value);
    setTimeout(() => onResolve(value === duplicate ? 'win' : 'lose'), 300);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>FIND THE DUPLICATE</Text>
      <View style={[styles.area, { width: AREA_W, height: AREA_H }]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.numberItem,
              { left: item.x - 24, top: item.y - 24 },
              chosen === item.value && item.value === duplicate && styles.correct,
              chosen === item.value && item.value !== duplicate && styles.wrong,
            ]}
            onPress={() => handleTap(item.value)}
          >
            <Text style={styles.numberText}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', gap: 12 },
  instruction: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  area:        { position: 'relative' },
  numberItem:  { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  correct:     { backgroundColor: RACE_COLOURS.green },
  wrong:       { backgroundColor: RACE_COLOURS.dangerRed },
  numberText:  { fontSize: 22, fontWeight: '900', color: RACE_COLOURS.white },
});
