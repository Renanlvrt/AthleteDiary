// ============================================================
// app/_layout.tsx — Root layout: dark theme, expo-router setup
// Handles notification tap → deep link to /log
// Re-schedules training reminders on every launch
// ============================================================

import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSchedule } from '../hooks/useSchedule';
import { scheduleTrainingReminders } from '../lib/notifications';

export default function RootLayout() {
  const router = useRouter();
  const { schedule, isLoading } = useSchedule();

  // Re-schedule notifications on every launch
  useEffect(() => {
    if (!isLoading && schedule.isConfigured && schedule.slots.length > 0) {
      void scheduleTrainingReminders(schedule.slots);
    }
  }, [isLoading, schedule]);

  // Notification tap → navigate to /log
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const dest = response.notification.request.content.data?.navigateTo as string | undefined;
        if (dest) {
          router.push(dest as '/log');
        }
      },
    );
    return () => subscription.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0A0A0A' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="log"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="schedule" />
      </Stack>
    </SafeAreaProvider>
  );
}
