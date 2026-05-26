// ============================================================
// features/race400m/minigames/StroopEffect.tsx
// Tap the INK colour of the word, not what the word says.
// ============================================================

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

interface StroopPair {
  word:     string;   // colour name displayed
  inkColor: string;   // the actual hex colour of the text
  answer:   string;   // which swatch to tap ('red' | 'blue' | 'yellow' | 'black')
}

const PAIRS: StroopPair[] = [
  { word: 'RED',    inkColor: '#2255FF',             answer: 'blue'   },
  { word: 'YELLOW', inkColor: '#0A0A0A',             answer: 'black'  },
  { word: 'BLACK',  inkColor: RACE_COLOURS.yellow,   answer: 'yellow' },
  { word: 'BLUE',   inkColor: '#E5232A',             answer: 'red'    },
  { word: 'GREEN',  inkColor: RACE_COLOURS.yellow,   answer: 'yellow' },
  { word: 'WHITE',  inkColor: '#0A0A0A',             answer: 'black'  },
  { word: 'RED',    inkColor: RACE_COLOURS.yellow,   answer: 'yellow' },
  { word: 'BLUE',   inkColor: '#0A0A0A',             answer: 'black'  },
];

const SWATCHES: Array<{ label: string; hex: string }> = [
  { label: 'red',    hex: '#E5232A' },
  { label: 'blue',   hex: '#2255FF' },
  { label: 'yellow', hex: RACE_COLOURS.yellow },
  { label: 'black',  hex: '#0A0A0A' },
];

export function StroopEffect({ onResolve }: MiniGameProps) {
  const [pair] = useState<StroopPair>(
    () => PAIRS[Math.floor(Math.random() * PAIRS.length)],
  );
  const [chosen, setChosen] = useState<string | null>(null);

  function handleTap(label: string) {
    if (chosen !== null) return;
    setChosen(label);
    setTimeout(() => onResolve(label === pair.answer ? 'win' : 'lose'), 280);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>TAP THE INK COLOUR</Text>
      <Text style={[styles.word, { color: pair.inkColor }]}>{pair.word}</Text>
      <View style={styles.swatches}>
        {SWATCHES.map((s) => {
          const isChosen = chosen === s.label;
          const correct  = s.label === pair.answer;
          return (
            <TouchableOpacity
              key={s.label}
              activeOpacity={0.8}
              style={[
                styles.swatch,
                { backgroundColor: s.hex },
                isChosen && correct && styles.swatchCorrect,
                isChosen && !correct && styles.swatchWrong,
              ]}
              onPress={() => handleTap(s.label)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RACE_SPACING.xl },
  hint:          { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' },
  word:          { fontSize: 52, fontWeight: '900', letterSpacing: 2 },
  swatches:      { flexDirection: 'row', gap: RACE_SPACING.md },
  swatch:        { width: 64, height: 64, borderRadius: 12, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.25)' },
  swatchCorrect: { borderColor: RACE_COLOURS.green, borderWidth: 3.5 },
  swatchWrong:   { borderColor: RACE_COLOURS.dangerRed, borderWidth: 3.5 },
});
