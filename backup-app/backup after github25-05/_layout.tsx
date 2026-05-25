// ============================================================
// app/_layout.tsx — Root layout: dark status bar, expo-router setup
// Checks onboarding completion on first load and redirects.
// ============================================================

import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSchedule } from '../hooks/useSchedule';
import { scheduleTrainingReminders } from '../lib/notifications';
import { isOnboardingComplete } from '../lib/onboarding';

export default function RootLayout() {
  const router = useRouter();
  const { schedule, isLoading } = useSchedule();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check onboarding on every launch — redirect to onboarding if not complete
  useEffect(() => {
    isOnboardingComplete().then((done) => {
      setOnboardingChecked(true);
      if (!done) {
        router.replace('/onboarding');
      }
    });
  }, [router]);

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
      {/* Status bar uses dark text — works for both yellow and white backgrounds */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
        <Stack.Screen
          name="log"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="schedule" />
      </Stack>
    </SafeAreaProvider>
  );
}