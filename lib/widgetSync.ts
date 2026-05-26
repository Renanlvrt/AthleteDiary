// ============================================================
// lib/widgetSync.ts — Syncs app data to a free jsonblob.com
// relay so the Scriptable iOS widget can read it.
//
// Flow:
//   1. First call → POST to jsonblob.com to CREATE a new blob,
//      save the blob ID in AsyncStorage.
//   2. Subsequent calls → PUT to UPDATE the existing blob.
//   3. Returns the public read URL so the user can paste it
//      into their Scriptable widget script.
//
// Call syncWidgetData() after every successful session save.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from './constants';
import { Session, TrainingSchedule } from './types';

const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob';

// ── Public types ──────────────────────────────────────────────

export interface HeatmapCell {
  date: string;  // 'YYYY-MM-DD'
  mood: number;  // 0 = no session, 1–5 = mood level
}

export interface WidgetPayload {
  streak: number;
  weeklyMoods: number[];        // 7 entries Mon–Sun, 0 = no session
  heatmapCells: HeatmapCell[];  // Last 28 days for the grid widget
  lastSession: {
    sport: string;
    performance: number;
    mood: number;
    date: string;
    notes: string;
  } | null;
  nextSchedule: {
    dayOfWeek: number;
    hour: number;
    minute: number;
  } | null;
  weeklyTarget: {
    scheduledDays: number[];
    completedDays: number[];
  };
  updatedAt: string;     // ISO timestamp so widget can show staleness
  deepLinkUrl: string;   // URL Scriptable uses when the widget is tapped
}

// ── Main entry point ──────────────────────────────────────────

/**
 * Reads all app data, builds the widget payload, and pushes it
 * to the jsonblob.com relay.  Returns the public read URL.
 */
export async function syncWidgetData(): Promise<string | null> {
  // Web doesn't use widgets — skip silently
  if (Platform.OS === 'web') return null;

  try {
    const [sessionsRaw, scheduleRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
      AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE),
    ]);

    const sessions: Session[] = sessionsRaw ? (JSON.parse(sessionsRaw) as Session[]) : [];
    const schedule: TrainingSchedule | null = scheduleRaw
      ? (JSON.parse(scheduleRaw) as TrainingSchedule)
      : null;

    const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    const lastSession = sorted[0] ?? null;

    const payload: WidgetPayload = {
      streak:          computeStreak(sessions),
      weeklyMoods:     computeWeeklyMoods(sessions),
      heatmapCells:    computeHeatmap(sessions, 28),
      lastSession: lastSession
        ? {
            sport:       lastSession.sport,
            performance: lastSession.performance,
            mood:        lastSession.mood,
            date:        lastSession.date,
            notes:       lastSession.notes ?? '',
          }
        : null,
      nextSchedule:  computeNextSchedule(schedule),
      weeklyTarget:  computeWeeklyTarget(sessions, schedule),
      updatedAt:     new Date().toISOString(),
      deepLinkUrl:   computeDeepLinkUrl(),
    };

    const blobUrl = await upsertBlob(payload);
    return blobUrl;
  } catch (e) {
    console.warn('[widgetSync] Failed to sync widget data:', e);
    return null;
  }
}

/**
 * Returns the stored widget URL without syncing.
 * Useful for displaying the URL in the UI.
 */
export async function getWidgetUrl(): Promise<string | null> {
  const blobId = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_BLOB_ID);
  if (!blobId) return null;
  return `${JSONBLOB_API}/${blobId}`;
}

// ── jsonblob.com API ──────────────────────────────────────────

async function upsertBlob(payload: WidgetPayload): Promise<string | null> {
  const storedId = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_BLOB_ID);
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };

  if (storedId) {
    // Update existing blob
    await fetch(`${JSONBLOB_API}/${storedId}`, {
      method: 'PUT',
      headers,
      body,
    });
    return `${JSONBLOB_API}/${storedId}`;
  }

  // Create a new blob — response Location header contains the ID
  const res = await fetch(JSONBLOB_API, { method: 'POST', headers, body });
  const location = res.headers.get('Location');       // e.g. https://jsonblob.com/api/jsonBlob/12345
  const blobId   = location?.split('/').pop() ?? null;

  if (blobId) {
    await AsyncStorage.setItem(STORAGE_KEYS.WIDGET_BLOB_ID, blobId);
    return `${JSONBLOB_API}/${blobId}`;
  }

  return null;
}

// ── Computation helpers ─────────────────────────────────────

/**
 * Returns the best URL to open the Log Session screen.
 * Uses expo-linking to robustly generate the correct deep link
 * whether running in local Expo Go, published Expo Go, or standalone.
 */
function computeDeepLinkUrl(): string {
  try {
    return Linking.createURL('log');
  } catch (e) {
    return 'athletediary://log';
  }
}

function dateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function todayString(): string {
  return dateString(new Date());
}

function computeStreak(sessions: Session[]): number {
  const sessionDates = new Set(sessions.map((s) => s.date));
  const today = todayString();
  let streak = 0;
  const d = new Date();

  for (let i = 0; i < 365; i++) {
    const ds = dateString(d);
    if (ds === today && !sessionDates.has(ds)) {
      // Today not yet logged — grace period
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (sessionDates.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function computeWeeklyMoods(sessions: Session[]): number[] {
  const moods: number[] = Array(7).fill(0);
  const now = new Date();
  const dayJS = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayJS + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = dateString(d);
    const s = sessions.find((x) => x.date === ds);
    moods[i] = s ? s.mood : 0;
  }
  return moods;
}

function computeHeatmap(sessions: Session[], days: number): HeatmapCell[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const existing = map.get(s.date) ?? 0;
    if (s.mood > existing) map.set(s.date, s.mood);
  }

  const cells: HeatmapCell[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = dateString(d);
    cells.push({ date: ds, mood: map.get(ds) ?? 0 });
  }
  return cells;
}

function computeNextSchedule(
  schedule: TrainingSchedule | null,
): WidgetPayload['nextSchedule'] {
  if (!schedule?.isConfigured || schedule.slots.length === 0) return null;

  const now = new Date();
  const todayJS = now.getDay();                          // 0=Sun
  const todaySched = todayJS === 0 ? 6 : todayJS - 1;   // 0=Mon
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const sorted = [...schedule.slots].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
  });

  for (const slot of sorted) {
    const slotMins = slot.hour * 60 + slot.minute;
    if (
      slot.dayOfWeek > todaySched ||
      (slot.dayOfWeek === todaySched && slotMins > currentMins)
    ) {
      return { dayOfWeek: slot.dayOfWeek, hour: slot.hour, minute: slot.minute };
    }
  }

  const first = sorted[0];
  return { dayOfWeek: first.dayOfWeek, hour: first.hour, minute: first.minute };
}

function computeWeeklyTarget(
  sessions: Session[],
  schedule: TrainingSchedule | null,
): WidgetPayload['weeklyTarget'] {
  const scheduledDays = schedule?.slots.map((s) => s.dayOfWeek) ?? [];

  const now = new Date();
  const dayJS = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayJS + 6) % 7));

  const completedDays: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = dateString(d);
    if (sessions.some((s) => s.date === ds)) completedDays.push(i);
  }

  return { scheduledDays, completedDays };
}
