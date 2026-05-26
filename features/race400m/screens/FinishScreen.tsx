// ============================================================
// features/race400m/screens/FinishScreen.tsx
// Post-race summary. Matches race_leaderboard_design.html design.
// Yellow header, black PB strip, ranked leaderboard, CTA buttons.
// ============================================================

import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS, RACE_SPACING, RACE_RADIUS } from '../game/constants';
import {
  loadPersonalBest,
  savePersonalBest,
  formatRaceTime,
  type PersonalBest,
} from '../data/personalRecords';
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from '../data/leaderboard';

interface FinishScreenProps {
  onRaceAgain: () => void;
  onHome:      () => void;
  playerName:  string;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function getMedal(rank: number): string {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
}

function getPlaceText(rank: number): string {
  return rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`;
}

export function FinishScreen({ onRaceAgain, onHome, playerName }: FinishScreenProps) {
  const insets = useSafeAreaInsets();

  const {
    finishTimeMs,
    topSpeed,
    miniGamesWon,
    miniGamesLost,
    reactionTimeMs,
    opponentDistances,
    distance,
    raceType,
    hurdlesCleared,
    hurdlesHit,
    jumpDistance,
  } = useGameStore();

  const miniGamesTotal = miniGamesWon + miniGamesLost;
  const timeMs         = finishTimeMs ?? 0;
  const aheadCount     = opponentDistances.filter((d) => d > distance).length;
  const playerRank     = aheadCount + 1;

  const [isNewPB,    setIsNewPB]    = useState(false);
  const [pb,         setPb]         = useState<PersonalBest | null>(null);
  const [board,      setBoard]      = useState<LeaderboardEntry[]>([]);
  const [playerIndex, setPlayerIdx] = useState<number>(-1);

  useEffect(() => {
    void (async () => {
      // Save PB
      const pbData: PersonalBest = {
        timeMs,
        topSpeed,
        miniGamesWon,
        miniGamesTotal,
        reactionTimeMs,
        date: new Date().toISOString(),
        ...(raceType === 'hurdles' ? { hurdlesCleared } : {}),
        ...(raceType === 'long_jump' ? { jumpDistance } : {}),
      };
      const wasPB = await savePersonalBest(raceType, pbData);
      setIsNewPB(wasPB);
      const savedPB = await loadPersonalBest(raceType);
      setPb(savedPB);

      // Submit to leaderboard (Skip for Long Jump in V1 since sorting expects timeMs)
      if (raceType !== 'long_jump') {
        await submitScore({
          name: playerName,
          timeMs,
          topSpeed,
          miniGamesWon,
          miniGamesTotal,
          date: new Date().toISOString().slice(0, 10),
        });

        // Fetch updated board
        const updatedBoard = await fetchLeaderboard();
        setBoard(updatedBoard.slice(0, 6));
        const myIdx = updatedBoard.findIndex(
          (e) => e.name === playerName && e.timeMs === timeMs,
        );
        setPlayerIdx(myIdx);
      }

      if (wasPB) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    })();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Yellow header ── */}
      <View style={[styles.header, { paddingTop: insets.top + RACE_SPACING.md }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerTitle}>THE 400M</Text>
        <Text style={styles.headerSub}>Global leaderboard · Updated live</Text>

        {/* Tabs (decorative in V1) */}
        <View style={styles.tabs}>
          {['This week', 'All time'].map((t, i) => (
            <View key={t} style={[styles.tab, i === 0 && styles.tabActive]}>
              <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Black PB strip ── */}
      <View style={styles.pbStrip}>
        <View>
          <Text style={styles.pbLabel}>YOUR PERSONAL BEST</Text>
          {raceType === 'long_jump' ? (
            <Text style={styles.pbValue}>{pb?.jumpDistance ? `${pb.jumpDistance}m` : (jumpDistance ? `${jumpDistance}m` : 'FOUL')}</Text>
          ) : (
            <Text style={styles.pbValue}>{pb ? formatRaceTime(pb.timeMs) : formatRaceTime(timeMs)}</Text>
          )}
        </View>
        <View style={styles.pbRight}>
          {isNewPB && (
            <View style={styles.newPBBadge}>
              <Text style={styles.newPBText}>NEW PB!</Text>
            </View>
          )}
          <Text style={styles.pbMeta}>
            {raceType === 'long_jump' 
              ? `Jump: ${jumpDistance ? `${jumpDistance}m` : 'FOUL'}` 
              : `Race time: ${formatRaceTime(timeMs)}`}
          </Text>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        {[
          { label: 'TOP SPEED',   value: `${Math.round(topSpeed * 1.2)} km/h` },
          { label: 'MINI-GAMES',  value: `${miniGamesWon}/${miniGamesTotal}` },
          ...(raceType === 'hurdles' ? [{ label: 'HURDLES', value: `${hurdlesCleared}/10` }] : 
             raceType === 'long_jump' ? [{ label: 'RESULT', value: jumpDistance ? 'VALID' : 'FOUL' }] :
             [{ label: 'POSITION',    value: getPlaceText(playerRank) }]),
        ].map(({ label, value }) => (
          <View key={label} style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Leaderboard rows ── */}
      {raceType !== 'long_jump' && (
        <View style={styles.lbList}>
          {board.map((entry, i) => {
          const isMe = i === playerIndex;
          return (
            <View key={i} style={[styles.lbRow, isMe && styles.lbRowMe]}>
              <Text style={[styles.lbRank, isMe && styles.lbRankMe]}>
                {getMedal(i + 1) || `${i + 1}`}
              </Text>
              <View style={[styles.lbAvatar, isMe && styles.lbAvatarMe]}>
                <Text style={[styles.lbAvatarText, isMe && styles.lbAvatarTextMe]}>
                  {isMe ? 'YOU' : getInitials(entry.name)}
                </Text>
              </View>
              <View style={styles.lbInfo}>
                <Text style={[styles.lbName, isMe && styles.lbNameMe]}>
                  {isMe ? 'You' : entry.name}
                  {isMe && <Text style={styles.youTag}> YOU</Text>}
                </Text>
                <Text style={[styles.lbMeta, isMe && styles.lbMetaMe]}>
                  {entry.miniGamesWon}/{entry.miniGamesTotal} mini-games ·{' '}
                  {Math.round(entry.topSpeed * 1.2)} km/h top
                </Text>
              </View>
              <View style={styles.lbTimeCol}>
                <Text style={[styles.lbTime, isMe && styles.lbTimeMe]}>
                  {formatRaceTime(entry.timeMs)}
                </Text>
              </View>
            </View>
          );
          })}
        </View>
      )}

      {/* ── CTA buttons ── */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.btnPrimary}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRaceAgain();
          }}
        >
          <Text style={styles.btnPrimaryText}>RACE AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.btnSecondary}
          onPress={onHome}
        >
          <Text style={styles.btnSecondaryText}>HOME</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#F0F0EC' },

  // Header
  header:        { backgroundColor: RACE_COLOURS.yellow, padding: RACE_SPACING.md, paddingBottom: RACE_SPACING.md },
  headerTop:     { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: RACE_SPACING.sm },
  headerDate:    { fontSize: 11, fontWeight: '600', color: RACE_COLOURS.inkMid, letterSpacing: 1 },
  headerTitle:   { fontSize: 36, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -1.5, lineHeight: 38 },
  headerSub:     { fontSize: 13, color: RACE_COLOURS.inkMid, fontWeight: '500', marginBottom: RACE_SPACING.md },
  tabs:          { flexDirection: 'row', gap: 6 },
  tab:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: RACE_COLOURS.black },
  tabActive:     { backgroundColor: RACE_COLOURS.black },
  tabText:       { fontSize: 12, fontWeight: '700', color: RACE_COLOURS.black, textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive: { color: RACE_COLOURS.yellow },

  // PB strip
  pbStrip:    { backgroundColor: RACE_COLOURS.black, marginHorizontal: RACE_SPACING.md, borderRadius: `0 0 ${RACE_RADIUS.lg}px ${RACE_RADIUS.lg}px` as any, padding: RACE_SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pbLabel:    { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1.5, textTransform: 'uppercase' },
  pbValue:    { fontSize: 28, fontWeight: '900', color: RACE_COLOURS.yellow, letterSpacing: -0.5 },
  pbRight:    { alignItems: 'flex-end', gap: 6 },
  newPBBadge: { backgroundColor: RACE_COLOURS.yellow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  newPBText:  { fontSize: 11, fontWeight: '800', color: RACE_COLOURS.black, letterSpacing: 0.5 },
  pbMeta:     { fontSize: 11, color: '#888', fontWeight: '500' },

  // Stats
  statsRow:   { flexDirection: 'row', marginHorizontal: RACE_SPACING.md, marginTop: RACE_SPACING.md, gap: RACE_SPACING.sm },
  statBox:    { flex: 1, backgroundColor: RACE_COLOURS.white, borderRadius: RACE_RADIUS.lg, padding: RACE_SPACING.sm, alignItems: 'center' },
  statValue:  { fontSize: 18, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -0.5 },
  statLabel:  { fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

  // Leaderboard
  lbList:     { marginHorizontal: RACE_SPACING.md, marginTop: RACE_SPACING.md, gap: 6 },
  lbRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: RACE_COLOURS.white, borderRadius: RACE_RADIUS.md, padding: RACE_SPACING.sm, gap: RACE_SPACING.sm, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' },
  lbRowMe:    { backgroundColor: RACE_COLOURS.yellow, borderColor: '#E6CE00' },
  lbRank:     { fontSize: 16, width: 28, textAlign: 'center', color: '#888' },
  lbRankMe:   { color: RACE_COLOURS.black },
  lbAvatar:   { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center' },
  lbAvatarMe: { backgroundColor: RACE_COLOURS.black },
  lbAvatarText:   { fontSize: 11, fontWeight: '800', color: '#555' },
  lbAvatarTextMe: { color: RACE_COLOURS.yellow },
  lbInfo:     { flex: 1, gap: 1 },
  lbName:     { fontSize: 14, fontWeight: '700', color: RACE_COLOURS.black },
  lbNameMe:   { color: RACE_COLOURS.black },
  youTag:     { fontSize: 10, fontWeight: '700', color: RACE_COLOURS.yellow, backgroundColor: RACE_COLOURS.black, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  lbMeta:     { fontSize: 11, color: '#888', fontWeight: '500' },
  lbMetaMe:   { color: RACE_COLOURS.inkMid },
  lbTimeCol:  { alignItems: 'flex-end' },
  lbTime:     { fontSize: 16, fontWeight: '900', color: RACE_COLOURS.black, letterSpacing: -0.5 },
  lbTimeMe:   { color: RACE_COLOURS.black },

  // CTAs
  ctaRow:         { flexDirection: 'row', marginHorizontal: RACE_SPACING.md, marginTop: RACE_SPACING.md, gap: RACE_SPACING.sm },
  btnPrimary:     { flex: 1, backgroundColor: RACE_COLOURS.black, borderRadius: RACE_RADIUS.md, padding: RACE_SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: RACE_COLOURS.black },
  btnPrimaryText: { fontSize: 14, fontWeight: '800', color: RACE_COLOURS.yellow, letterSpacing: 0.5, textTransform: 'uppercase' },
  btnSecondary:     { flex: 1, backgroundColor: 'transparent', borderRadius: RACE_RADIUS.md, padding: RACE_SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: RACE_COLOURS.black },
  btnSecondaryText: { fontSize: 14, fontWeight: '800', color: RACE_COLOURS.black, letterSpacing: 0.5, textTransform: 'uppercase' },
});
