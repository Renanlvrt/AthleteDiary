// ============================================================
// lib/onboarding.ts — Onboarding state persistence
// Tracks whether user has completed onboarding + their profile
// ============================================================

import { STORAGE_KEYS } from './constants';
import { readItem, writeItem } from './storage';
import { SportType } from './types';

export type TrainingGoal =
  | 'consistency'    // Build a training habit
  | 'performance'    // Improve performance
  | 'recovery'       // Manage recovery
  | 'motivation';    // Stay motivated

export interface OnboardingProfile {
  sports: SportType[];         // Multi-select sports
  goal: TrainingGoal | null;   // Single-select goal
  completedAt: number;         // Unix ms
}

export async function isOnboardingComplete(): Promise<boolean> {
  return readItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
}

export async function markOnboardingComplete(): Promise<void> {
  await writeItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
}

export async function saveOnboardingProfile(profile: OnboardingProfile): Promise<void> {
  await writeItem<OnboardingProfile>(STORAGE_KEYS.ONBOARDING_PROFILE, profile);
}

export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  return readItem<OnboardingProfile | null>(STORAGE_KEYS.ONBOARDING_PROFILE, null);
}

// For dev reset (not exposed to UI)
export async function resetOnboarding(): Promise<void> {
  await writeItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
}
