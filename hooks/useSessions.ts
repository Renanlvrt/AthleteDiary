// ============================================================
// hooks/useSessions.ts — Load/save sessions + expose addSession / updateSessionNote
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import {
  addSession as addSessionLib,
  getSessions,
  updateSessionNote as updateSessionNoteLib,
} from '../lib/sessions';
import { Session } from '../lib/types';

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  updateSessionNote: (id: string, note: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getSessions();
    setSessions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addSession = useCallback(async (session: Omit<Session, 'id'>) => {
    const updated = await addSessionLib(session);
    setSessions(updated);
  }, []);

  const updateSessionNote = useCallback(async (id: string, note: string) => {
    const updated = await updateSessionNoteLib(id, note);
    setSessions(updated);
  }, []);

  return { sessions, isLoading, addSession, updateSessionNote, refresh: load };
}
