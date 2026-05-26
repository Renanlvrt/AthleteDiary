// ============================================================
// features/race400m/data/leaderboard.ts
// Serverless leaderboard backed by jsonblob.com.
//
// SETUP: Go to https://jsonblob.com, create a new blob with content [],
// copy the ID from the URL, and replace LEADERBOARD_BLOB_PLACEHOLDER below.
// Do this before the first public release.
// ============================================================

const BLOB_ID: string  = '019e61b5-df4e-78aa-8ba4-24593ccfe370';
const BASE_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

export interface LeaderboardEntry {
  name: string;        // user's display name from onboarding profile
  timeMs: number;
  topSpeed: number;    // normalised 0–100
  miniGamesWon: number;
  miniGamesTotal: number;
  date: string;        // ISO date string
}

const MAX_ENTRIES = 50;

/**
 * Fetches the leaderboard. Returns [] on any network error so the UI
 * degrades gracefully when offline or before the blob is configured.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (BLOB_ID === 'LEADERBOARD_BLOB_PLACEHOLDER') {
    return getMockLeaderboard();
  }
  try {
    const res = await fetch(BASE_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json() as LeaderboardEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Submits a new score. Fetches current board, appends, sorts by fastest,
 * keeps top 50, and PUTs the updated list back.
 */
export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  if (BLOB_ID === 'LEADERBOARD_BLOB_PLACEHOLDER') return; // no-op in dev
  try {
    const current = await fetchLeaderboard();
    const updated = [...current, entry]
      .sort((a, b) => a.timeMs - b.timeMs)   // fastest first
      .slice(0, MAX_ENTRIES);
    await fetch(BASE_URL, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updated),
    });
  } catch {
    // Silently fail — leaderboard is non-critical
  }
}

/** Finds the player's rank in the leaderboard (1-indexed). Returns null if not found. */
export function findPlayerRank(
  board: LeaderboardEntry[],
  playerName: string,
  playerTimeMs: number,
): number | null {
  const idx = board.findIndex(
    (e) => e.name === playerName && e.timeMs === playerTimeMs,
  );
  return idx >= 0 ? idx + 1 : null;
}

// ─── Mock data (used when blob is not configured) ─────────────
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { name: 'Alex T.',   timeMs: 34100, topSpeed: 95, miniGamesWon: 5, miniGamesTotal: 5, date: '2026-05-26' },
    { name: 'Jordan K.', timeMs: 35800, topSpeed: 91, miniGamesWon: 4, miniGamesTotal: 5, date: '2026-05-25' },
    { name: 'Sam R.',    timeMs: 36900, topSpeed: 88, miniGamesWon: 3, miniGamesTotal: 5, date: '2026-05-26' },
    { name: 'Morgan H.', timeMs: 39100, topSpeed: 85, miniGamesWon: 2, miniGamesTotal: 5, date: '2026-05-26' },
    { name: 'Pat L.',    timeMs: 40500, topSpeed: 83, miniGamesWon: 4, miniGamesTotal: 5, date: '2026-05-25' },
  ];
}
