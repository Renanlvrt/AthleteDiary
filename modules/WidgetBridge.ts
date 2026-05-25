// ============================================================
// modules/WidgetBridge.ts — TypeScript wrapper for the native
// WidgetBridge module. Writes JSON to the iOS App Group so
// WidgetKit can read it and refresh widget timelines.
//
// On Android / Web this is a no-op.
// ============================================================

import { NativeModules, Platform } from 'react-native';

const { WidgetBridge: NativeWidgetBridge } = NativeModules;

/**
 * Write widget data JSON to the shared App Group UserDefaults
 * and trigger a WidgetKit timeline reload.
 *
 * Safe to call on any platform — it is a no-op on Android/Web.
 */
export async function setWidgetData(json: string): Promise<void> {
  if (Platform.OS !== 'ios') return;
  if (!NativeWidgetBridge) {
    // Module not linked yet (e.g. running in Expo Go before EAS build)
    console.warn('[WidgetBridge] Native module not available — skipping widget sync.');
    return;
  }
  return NativeWidgetBridge.setWidgetData(json);
}
