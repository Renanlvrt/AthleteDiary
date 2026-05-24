// ============================================================
// lib/sessions.ts — Session CRUD with deduplication logic
// ============================================================

import { STORAGE_KEYS } from './constants';
import { readItem, writeItem } from './storage';
import { Session, SportType } from './types';

// ── Simple ID generation (no external dependency) ────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Read ─────────────────────────────────────────────────────
export async function getSessions(): Promise<Session[]> {
  return readItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
}

// ── Write (with deduplication) ────────────────────────────────
// Rule: one session per day per sport type.
// If same date + same sport exists → OVERWRITE. Else → APPEND.
export async function addSession(newSession: Omit<Session, 'id'>): Promise<Session[]> {
  const sessions = await getSessions();
  const id = generateId();

  const existingIndex = sessions.findIndex(
    (s) => s.date === newSession.date && s.sport === newSession.sport,
  );

  if (existingIndex >= 0) {
    // Overwrite — keep the original id
    sessions[existingIndex] = { ...newSession, id: sessions[existingIndex].id };
  } else {
    sessions.push({ ...newSession, id });
  }

  await writeItem(STORAGE_KEYS.SESSIONS, sessions);
  return sessions;
}

// ── Last sport ────────────────────────────────────────────────
export async function getLastSport(): Promise<SportType> {
  return readItem<SportType>(STORAGE_KEYS.LAST_SPORT, 'running');
}

export async function saveLastSport(sport: SportType): Promise<void> {
  await writeItem(STORAGE_KEYS.LAST_SPORT, sport);
}
