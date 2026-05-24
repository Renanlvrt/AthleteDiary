// ============================================================
// hooks/useSessions.ts — Load/save sessions + expose addSession
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { addSession as addSessionLib, getSessions } from '../lib/sessions';
import { Session } from '../lib/types';

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
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

  return { sessions, isLoading, addSession, refresh: load };
}
