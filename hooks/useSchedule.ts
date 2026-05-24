// ============================================================
// hooks/useSchedule.ts — Load/save training schedule + trigger notifications
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { scheduleTrainingReminders } from '../lib/notifications';
import { readItem, writeItem } from '../lib/storage';
import { TrainingSchedule } from '../lib/types';

const DEFAULT_SCHEDULE: TrainingSchedule = {
  slots: [],
  isConfigured: false,
  updatedAt: 0,
};

interface UseScheduleReturn {
  schedule: TrainingSchedule;
  isLoading: boolean;
  saveSchedule: (schedule: TrainingSchedule) => Promise<void>;
}

export function useSchedule(): UseScheduleReturn {
  const [schedule, setSchedule] = useState<TrainingSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await readItem<TrainingSchedule>(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
      setSchedule(data);
      setIsLoading(false);

      // Re-schedule notifications on every app launch
      if (data.isConfigured && data.slots.length > 0) {
        await scheduleTrainingReminders(data.slots);
      }
    }
    void load();
  }, []);

  const saveSchedule = useCallback(async (newSchedule: TrainingSchedule) => {
    await writeItem(STORAGE_KEYS.SCHEDULE, newSchedule);
    setSchedule(newSchedule);

    if (newSchedule.slots.length > 0) {
      await scheduleTrainingReminders(newSchedule.slots);
    }
  }, []);

  return { schedule, isLoading, saveSchedule };
}
