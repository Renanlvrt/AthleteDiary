// ============================================================
// app/race.tsx
// Expo Router route — thin wrapper that renders the race feature
// and connects navigation back to the main app.
// ============================================================

import { useLocalSearchParams, useRouter } from 'expo-router';
import RaceEntry from '../features/race400m';
import type { RaceType } from '../features/race400m/game/gameStore';

export default function RaceRoute() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: RaceType }>();

  return (
    <RaceEntry
      onNavigateHome={() => router.replace('/')}
      playerName="You"
      raceType={type || 'flat'}
    />
  );
}
