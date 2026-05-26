// ============================================================
// features/race400m/minigames/LacticMath.tsx
// Mental arithmetic under pressure. Tap the correct answer.
// ============================================================

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

interface Question { expression: string; answer: number }

function generateQuestion(difficulty: MiniGameProps['difficulty']): Question {
  const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (difficulty) {
    case 'easy': {
      const a = r(2, 9), b = r(2, 9);
      const add = Math.random() > 0.5;
      return { expression: add ? `${a} + ${b}` : `${Math.max(a, b)} - ${Math.min(a, b)}`, answer: add ? a + b : Math.abs(a - b) };
    }
    case 'medium': {
      const a = r(10, 49), b = r(2, 9);
      const add = Math.random() > 0.5;
      return { expression: add ? `${a} + ${b}` : `${a} - ${b}`, answer: add ? a + b : a - b };
    }
    case 'hard': {
      if (Math.random() > 0.5) {
        const a = r(3, 9), b = r(3, 9);
        return { expression: `${a} × ${b}`, answer: a * b };
      }
      const a = r(2, 6), b = r(2, 9), c = r(1, 9);
      return { expression: `${a} × ${b} + ${c}`, answer: a * b + c };
    }
  }
}

function generateOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  opts.add(correct + 1);
  opts.add(correct - 1);
  opts.add(correct + (Math.floor(Math.random() * 7) + 2) * (Math.random() > 0.5 ? 1 : -1));
  opts.add(correct + 10);
  opts.add(correct - 10);
  const arr = Array.from(opts).filter((n) => n >= 0).slice(0, 4);
  return arr.sort(() => Math.random() - 0.5);
}

export function LacticMath({ difficulty, onResolve }: MiniGameProps) {
  const [{ expression, answer }] = useState(() => generateQuestion(difficulty));
  const [options] = useState(() => generateOptions(answer));
  const [chosen, setChosen]     = useState<number | null>(null);

  function handleTap(opt: number) {
    if (chosen !== null) return;
    setChosen(opt);
    setTimeout(() => onResolve(opt === answer ? 'win' : 'lose'), 250);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.expression}>{expression} = ?</Text>
      <View style={styles.optionsGrid}>
        {options.map((opt) => {
          const isChosen  = chosen === opt;
          const isCorrect = opt === answer;
          let bg = 'rgba(255,255,255,0.1)';
          if (isChosen) bg = isCorrect ? RACE_COLOURS.green : RACE_COLOURS.dangerRed;
          return (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.75}
              style={[styles.option, { backgroundColor: bg }]}
              onPress={() => handleTap(opt)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RACE_SPACING.xl },
  expression:   { fontSize: 38, fontWeight: '900', color: RACE_COLOURS.white, letterSpacing: -1 },
  optionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' },
  option:       { width: '44%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  optionText:   { fontSize: 26, fontWeight: '900', color: RACE_COLOURS.white },
});
