// ============================================================
// features/race400m/hud/PlaceIndicator.tsx
// Shows LEADING / 2ND / 3RD / 4TH relative to 3 opponents.
// Gold colour when leading. Updates on every distance tick.
// ============================================================

import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../game/gameStore';
import { RACE_COLOURS } from '../game/constants';

function getPlaceText(rank: number): string {
  switch (rank) {
    case 1:  return 'LEADING';
    case 2:  return '2ND';
    case 3:  return '3RD';
    default: return '4TH';
  }
}

export function PlaceIndicator() {
  const distance          = useGameStore((s) => s.distance);
  const opponentDistances = useGameStore((s) => s.opponentDistances);

  // Count how many opponents are ahead of the player
  const aheadCount = opponentDistances.filter((d) => d > distance).length;
  const rank = aheadCount + 1; // 1 = leading, 4 = last

  const isLeading = rank === 1;
  const placeText = getPlaceText(rank);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isLeading && styles.textGold]}>
        {placeText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '900',
    color: RACE_COLOURS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  textGold: {
    color: RACE_COLOURS.gold,
  },
});
