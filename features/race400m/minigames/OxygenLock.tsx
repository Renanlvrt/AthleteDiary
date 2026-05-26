// ============================================================
// features/race400m/minigames/OxygenLock.tsx
// Memory sequence game. Watch 3–4 circles flash, then recall them.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

const CIRCLE_COLOURS = [RACE_COLOURS.yellow, '#FFFFFF', '#888888', '#444444'];
const FLASH_INTERVAL_MS = 650;

function getGridSize(difficulty: MiniGameProps['difficulty']): { rows: number; cols: number; seqLen: number } {
  switch (difficulty) {
    case 'easy':   return { rows: 2, cols: 2, seqLen: 3 };
    case 'medium': return { rows: 2, cols: 2, seqLen: 4 };
    case 'hard':   return { rows: 2, cols: 3, seqLen: 4 };
  }
}

export function OxygenLock({ difficulty, onResolve }: MiniGameProps) {
  const { rows, cols, seqLen } = getGridSize(difficulty);
  const total = rows * cols;

  const [sequence]  = useState<number[]>(() => {
    const seq: number[] = [];
    while (seq.length < seqLen) {
      const r = Math.floor(Math.random() * total);
      if (!seq.includes(r)) seq.push(r);
    }
    return seq;
  });

  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);
  const [phase, setPhase]    = useState<'memorise' | 'recall'>('memorise');
  const [tapped, setTapped]  = useState<number[]>([]);
  const resolvedRef = useRef(false);

  // Memorise phase — flash each cell in sequence
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setFlashingIndex(sequence[i] ?? null);
      setTimeout(() => setFlashingIndex(null), FLASH_INTERVAL_MS * 0.7);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('recall'), FLASH_INTERVAL_MS);
      }
    }, FLASH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  function handleTap(index: number) {
    if (phase !== 'recall' || resolvedRef.current) return;
    const expected = sequence[tapped.length];
    if (index !== expected) {
      resolvedRef.current = true;
      onResolve('lose');
      return;
    }
    const newTapped = [...tapped, index];
    setTapped(newTapped);
    if (newTapped.length === sequence.length) {
      resolvedRef.current = true;
      setTimeout(() => onResolve('win'), 200);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {phase === 'memorise' ? 'MEMORISE THE SEQUENCE' : 'TAP IN ORDER'}
      </Text>
      <View style={[styles.grid, { width: cols * 70 }]}>
        {Array.from({ length: total }).map((_, idx) => {
          const isFlashing = flashingIndex === idx;
          const isTapped   = tapped.includes(idx);
          const tapOrder   = tapped.indexOf(idx);

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.75}
              style={[
                styles.cell,
                isFlashing && styles.cellFlash,
                isTapped   && styles.cellTapped,
              ]}
              onPress={() => handleTap(idx)}
            >
              {isTapped && (
                <Text style={styles.tapNumber}>{tapOrder + 1}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RACE_SPACING.lg },
  instruction: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  cell:        { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  cellFlash:   { backgroundColor: RACE_COLOURS.yellow, borderColor: RACE_COLOURS.yellow },
  cellTapped:  { backgroundColor: RACE_COLOURS.green,  borderColor: RACE_COLOURS.green },
  tapNumber:   { fontSize: 20, fontWeight: '900', color: RACE_COLOURS.black },
});
