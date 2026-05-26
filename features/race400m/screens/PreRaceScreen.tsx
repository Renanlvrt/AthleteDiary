// ============================================================
// features/race400m/screens/PreRaceScreen.tsx
// Yellow background. Difficulty picker, PB display, leaderboard
// preview, START RACE button.
// ============================================================

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGameStore, type Difficulty } from '../game/gameStore';
import { RACE_COLOURS, RACE_SPACING, RACE_RADIUS } from '../game/constants';
import {
  loadPersonalBest,
  formatRaceTime,
  type PersonalBest,
} from '../data/personalRecords';
import { fetchLeaderboard, type LeaderboardEntry } from '../data/leaderboard';

interface PreRaceScreenProps {
  onStart: () => void;
  onBack:  () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

function DifficultyPicker() {
  const { difficulty, setDifficulty } = useGameStore();

  return (
    <View style={styles.diffRow}>
      {DIFFICULTIES.map((d) => (
        <TouchableOpacity
          key={d}
          activeOpacity={0.75}
          style={[styles.diffPill, difficulty === d && styles.diffPillActive]}
          onPress={() => {
            setDifficulty(d);
            void Haptics.selectionAsync();
          }}
        >
          <Text style={[styles.diffPillText, difficulty === d && styles.diffPillTextActive]}>
            {d.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MedalEmoji({ rank }: { rank: number }) {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return <Text style={styles.medal}>{medals[rank] ?? `${rank}.`}</Text>;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function PreRaceScreen({ onStart, onBack }: PreRaceScreenProps) {
  const insets = useSafeAreaInsets();
  const { raceType } = useGameStore();
  const [pb, setPb]               = useState<PersonalBest | null>(null);
  const [board, setBoard]         = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoading] = useState(true);

  useEffect(() => {
    void loadPersonalBest(raceType).then(setPb);
  }, [raceType]);

  useEffect(() => {
    void fetchLeaderboard().then((data) => {
      setBoard(data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  function handleStart() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        {/* Hero title */}
        <Text style={styles.titleLine1}>
            {raceType === 'flat' ? '400M SPRINT' : '400M HURDLES'}
        </Text>

        {/* Difficulty */}
        <Text style={styles.sectionLabel}>DIFFICULTY</Text>
        <DifficultyPicker />

        {/* Personal best */}
        <View style={styles.pbCard}>
          <Text style={styles.pbLabel}>YOUR PERSONAL BEST</Text>
          <Text style={styles.pbValue}>
            {pb ? formatRaceTime(pb.timeMs) : '—'}
          </Text>
          {pb && (
            <Text style={styles.pbMeta}>
              {pb.miniGamesWon}/{pb.miniGamesTotal} mini-games ·{' '}
              {Math.round(pb.topSpeed * 1.2)} km/h top speed
            </Text>
          )}
        </View>

        {/* Leaderboard preview */}
        <Text style={styles.sectionLabel}>LEADERBOARD</Text>
        <View style={styles.lbCard}>
          {loadingBoard ? (
            <ActivityIndicator color={RACE_COLOURS.yellow} />
          ) : board.length === 0 ? (
            <Text style={styles.lbEmpty}>No entries yet — be the first!</Text>
          ) : (
            board.map((entry, i) => (
              <View key={i} style={styles.lbRow}>
                <MedalEmoji rank={i + 1} />
                <View style={styles.lbAvatar}>
                  <Text style={styles.lbAvatarText}>{getInitials(entry.name)}</Text>
                </View>
                <Text style={styles.lbName}>{entry.name}</Text>
                <Text style={styles.lbTime}>{formatRaceTime(entry.timeMs)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* START button */}
      <View style={[styles.startBar, { paddingBottom: insets.bottom + RACE_SPACING.md }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.startButton}
          onPress={handleStart}
        >
          <Text style={styles.startText}>START RACE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: RACE_COLOURS.yellow },
  scroll:        { paddingHorizontal: RACE_SPACING.md, paddingBottom: 120 },
  backBtn:       { paddingVertical: RACE_SPACING.md },
  backText:      { fontSize: 13, fontWeight: '700', color: RACE_COLOURS.inkMid, letterSpacing: 0.5 },
  titleLine1:    { fontSize: 52, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -2, lineHeight: 54 },
  titleLine2:    { fontSize: 52, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -2, lineHeight: 54, marginBottom: RACE_SPACING.xl },
  sectionLabel:  { fontSize: 11, fontWeight: '800', color: RACE_COLOURS.inkMid, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: RACE_SPACING.sm },
  diffRow:       { flexDirection: 'row', gap: RACE_SPACING.sm, marginBottom: RACE_SPACING.xl },
  diffPill:      { flex: 1, paddingVertical: 12, borderRadius: RACE_RADIUS.full, borderWidth: 1.5, borderColor: RACE_COLOURS.black, alignItems: 'center' },
  diffPillActive:{ backgroundColor: RACE_COLOURS.black },
  diffPillText:  { fontSize: 12, fontWeight: '800', color: RACE_COLOURS.black, letterSpacing: 1 },
  diffPillTextActive: { color: RACE_COLOURS.yellow },
  pbCard:        { backgroundColor: RACE_COLOURS.black, borderRadius: RACE_RADIUS.lg, padding: RACE_SPACING.md, marginBottom: RACE_SPACING.xl },
  pbLabel:       { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1.5, textTransform: 'uppercase' },
  pbValue:       { fontSize: 38, fontWeight: '900', color: RACE_COLOURS.yellow, letterSpacing: -1, marginTop: 4 },
  pbMeta:        { fontSize: 12, color: '#888', fontWeight: '500', marginTop: 4 },
  lbCard:        { backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: RACE_RADIUS.lg, padding: RACE_SPACING.md, gap: RACE_SPACING.sm },
  lbRow:         { flexDirection: 'row', alignItems: 'center', gap: RACE_SPACING.sm },
  medal:         { fontSize: 18, width: 28 },
  lbAvatar:      { width: 32, height: 32, borderRadius: 16, backgroundColor: RACE_COLOURS.black, alignItems: 'center', justifyContent: 'center' },
  lbAvatarText:  { fontSize: 11, fontWeight: '800', color: RACE_COLOURS.yellow },
  lbName:        { flex: 1, fontSize: 14, fontWeight: '700', color: RACE_COLOURS.black },
  lbTime:        { fontSize: 16, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -0.5 },
  lbEmpty:       { fontSize: 13, color: RACE_COLOURS.inkMid, textAlign: 'center', paddingVertical: RACE_SPACING.sm },
  startBar:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: RACE_COLOURS.yellow, paddingHorizontal: RACE_SPACING.md, paddingTop: RACE_SPACING.md },
  startButton:   { backgroundColor: RACE_COLOURS.black, borderRadius: RACE_RADIUS.lg, height: 56, alignItems: 'center', justifyContent: 'center' },
  startText:     { fontSize: 14, fontWeight: '900', color: RACE_COLOURS.yellow, letterSpacing: 2, textTransform: 'uppercase' },
});
