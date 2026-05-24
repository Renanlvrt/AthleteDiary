// ============================================================
// lib/notifications.ts — Local notification scheduling helpers
// LOCAL ONLY — no remote push server
// ============================================================

import * as Notifications from 'expo-notifications';
import { TrainingSlot } from './types';

// Set default handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request notification permissions (call only when user saves schedule) */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Cancel all existing and reschedule from slots.
 * Always idempotent — safe to call multiple times.
 * Notifications fire 1 hour after the training slot time.
 */
export async function scheduleTrainingReminders(slots: TrainingSlot[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (slots.length === 0) return;

  for (const slot of slots) {
    let notifHour = slot.hour + 1;
    let notifMinute = slot.minute;
    let notifDay = slot.dayOfWeek; // 0=Mon

    // Handle midnight wrap (training at 23:xx → notification next day 00:xx)
    if (notifHour >= 24) {
      notifHour = notifHour - 24;
      notifDay = ((notifDay + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }

    // expo-notifications weekday: 1=Sun, 2=Mon, 3=Tue, ..., 7=Sat
    // Our dayOfWeek: 0=Mon, 1=Tue, ..., 6=Sun
    const expoWeekday = notifDay === 6 ? 1 : notifDay + 2;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AthleteDiary 💪',
        body: "How did training go? Don't forget to log your session.",
        data: { navigateTo: '/log' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour: notifHour,
        minute: notifMinute,
      },
    });
  }
}

/** Cancel all scheduled notifications */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
