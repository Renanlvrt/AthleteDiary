// ============================================================
// features/race400m/minigames/WordSprint.tsx
// Identify the correctly unscrambled athletics word.
// ============================================================

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MiniGameProps } from './registry';
import { RACE_COLOURS, RACE_SPACING } from '../game/constants';

interface WordEntry { word: string; scrambles: [string, string, string] }

const WORD_BANK: WordEntry[] = [
  { word: 'PACE',   scrambles: ['CAEP',   'AECP',   'ECPA']   },
  { word: 'TRACK',  scrambles: ['CRACKT', 'TARKC',  'KARCT']  },
  { word: 'SPRINT', scrambles: ['NRSPTI', 'PRSNIT', 'TIPRSN'] },
  { word: 'POWER',  scrambles: ['PWERO',  'ROPEW',  'EOPWR']  },
  { word: 'DRIVE',  scrambles: ['VIRDE',  'DERIV',  'IRVED']  },
  { word: 'BLOCK',  scrambles: ['BOLCK',  'LCOBK',  'BKOCL']  },
  { word: 'SPLIT',  scrambles: ['LPSIT',  'TILPS',  'SPITL']  },
  { word: 'SURGE',  scrambles: ['GESUR',  'RSEUG',  'UEGRS']  },
  { word: 'CURVE',  scrambles: ['RVUCE',  'EUCVR',  'CRUEV']  },
  { word: 'FINAL',  scrambles: ['NFALI',  'ANIFL',  'LIFNA']  },
];

export function WordSprint({ onResolve }: MiniGameProps) {
  const [{ word, scrambles }] = useState(
    () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)],
  );
  // Pick one scramble to display; options = [correct word, other 2 scrambles] shuffled
  const [displayScramble] = useState(() => scrambles[Math.floor(Math.random() * 3)]);
  const [options] = useState<string[]>(() =>
    [word, ...scrambles.filter((s) => s !== displayScramble).slice(0, 2)].sort(
      () => Math.random() - 0.5,
    ),
  );
  const [chosen, setChosen] = useState<string | null>(null);

  function handleTap(opt: string) {
    if (chosen !== null) return;
    setChosen(opt);
    setTimeout(() => onResolve(opt === word ? 'win' : 'lose'), 250);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>UNSCRAMBLE</Text>
      <Text style={styles.scrambled}>{displayScramble}</Text>
      <View style={styles.options}>
        {options.map((opt) => {
          const isChosen  = chosen === opt;
          const isCorrect = opt === word;
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
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RACE_SPACING.lg },
  label:      { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' },
  scrambled:  { fontSize: 46, fontWeight: '900', color: RACE_COLOURS.yellow, letterSpacing: 4 },
  options:    { width: '100%', gap: 10 },
  option:     { paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  optionText: { fontSize: 20, fontWeight: '800', color: RACE_COLOURS.white, letterSpacing: 3 },
});
