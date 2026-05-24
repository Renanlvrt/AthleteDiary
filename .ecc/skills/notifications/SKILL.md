# Skill: Local Notifications

> Read this before implementing lib/notifications.ts, hooks/useSchedule.ts, or app/schedule.tsx

## What We're Building
Weekly recurring local push notifications that fire 1 hour after each scheduled training slot.
No remote push server. No internet required. 100% on-device via `expo-notifications`.

## Dependencies
```typescript
import * as Notifications from 'expo-notifications';
// Already in expo SDK — no extra install needed beyond expo-notifications package
```

## Permission Handling (iOS requires explicit permission)

```typescript
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

**When to request:** Only on the Schedule Setup screen when user taps "SAVE SCHEDULE".
Do NOT request on app launch — too aggressive.

---

## Scheduling Logic

```typescript
export async function scheduleTrainingReminders(
  slots: TrainingSlot[]
): Promise<void> {
  // Step 1: Cancel all existing to ensure idempotency
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (slots.length === 0) return;

  // Step 2: Schedule one weekly notification per slot
  for (const slot of slots) {
    // Notification fires 1 hour after training starts
    let notifHour = slot.hour + 1;
    let notifMinute = slot.minute;

    // Convert our dayOfWeek (0=Mon) to expo weekday (2=Mon, 3=Tue, ..., 1=Sun)
    let notifDayOfWeek = slot.dayOfWeek;

    // Handle midnight wrap: if training at 23:xx, notification next day at 00:xx
    if (notifHour >= 24) {
      notifHour = notifHour - 24;
      notifDayOfWeek = (notifDayOfWeek + 1) % 7;
    }

    // expo-notifications weekday: 1=Sunday, 2=Monday, ..., 7=Saturday
    // Our dayOfWeek: 0=Monday, 1=Tuesday, ..., 6=Sunday
    const expoWeekday = notifDayOfWeek === 6 ? 1 : notifDayOfWeek + 2;

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
```

---

## Re-scheduling on App Launch

In `app/_layout.tsx`, call this on mount:

```typescript
useEffect(() => {
  async function rescheduleIfNeeded() {
    const schedule = await getSchedule();
    if (schedule.isConfigured && schedule.slots.length > 0) {
      await scheduleTrainingReminders(schedule.slots);
    }
  }
  rescheduleIfNeeded();
}, []);
```

**Why:** iOS clears scheduled notifications after app updates. Re-scheduling on launch ensures they're always active.

---

## Notification Tap → Deep Link to /log

In `app/_layout.tsx`:

```typescript
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const navigateTo = response.notification.request.content.data?.navigateTo;
      if (navigateTo === '/log') {
        router.push('/log');
      }
    }
  );
  return () => subscription.remove();
}, []);
```

---

## Schedule Setup Screen Logic (app/schedule.tsx)

User picks which days they train and at what time.

### State shape:
```typescript
interface DaySlot {
  dayOfWeek: 0|1|2|3|4|5|6; // 0=Mon
  enabled: boolean;
  hour: number;    // 0–23, default 18
  minute: number;  // 0–59, default 0
}

// Initial state: all days enabled=false, time 18:00
const INITIAL_SLOTS: DaySlot[] = [
  { dayOfWeek: 0, enabled: false, hour: 18, minute: 0 }, // Mon
  { dayOfWeek: 1, enabled: false, hour: 18, minute: 0 }, // Tue
  // ... etc
];
```

### Day labels:
```typescript
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
```

### On save:
1. Filter `enabled === true` slots
2. Validate: at least 1 slot enabled
3. Request notification permissions
4. Save schedule to AsyncStorage
5. Schedule notifications
6. Navigate back to Home

---

## Notification Content

```
Title: "AthleteDiary 💪"
Body:  "How did training go? Don't forget to log your session."
```

Simple, direct, no emojis in the sport reference (consistent with D002).
