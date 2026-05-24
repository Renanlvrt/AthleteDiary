// ============================================================
// lib/storage.ts — Generic AsyncStorage helpers
// All domain-specific logic goes in the domain files (sessions.ts, etc.)
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storage] Failed to read "${key}":`, error);
    return defaultValue;
  }
}

export async function writeItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] Failed to write "${key}":`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] Failed to remove "${key}":`, error);
  }
}
