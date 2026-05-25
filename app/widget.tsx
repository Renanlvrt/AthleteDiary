// ============================================================
// app/widget.tsx — Widget Setup Screen
// Shows the user their personal jsonblob.com data URL so they
// can paste it into the Scriptable widget script.
// Also lets them force-sync widget data on demand.
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../lib/constants';
import { getWidgetUrl, syncWidgetData } from '../lib/widgetSync';

type SyncState = 'idle' | 'syncing' | 'success' | 'error';

export default function WidgetScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();

  const [url,       setUrl]       = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [copied,    setCopied]    = useState(false);

  // Load any existing blob URL from storage
  useEffect(() => {
    getWidgetUrl().then(setUrl).catch(() => null);
  }, []);

  const handleSync = useCallback(async () => {
    setSyncState('syncing');
    setCopied(false);
    try {
      const newUrl = await syncWidgetData();
      setUrl(newUrl);
      setSyncState('success');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSyncState('error');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2500);
  }, [url]);

  return (
    <View style={styles.root}>
      {/* ── Yellow header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={COLORS.textOnYellow} />
        </Pressable>
        <Text style={styles.screenLabel}>HOME SCREEN</Text>
        <Text style={styles.screenTitle}>{'Widget\nSetup'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── Step 1 ── */}
        <StepCard
          number="1"
          title="Install Scriptable"
          description="Download the free Scriptable app from the App Store. It lets you build iOS widgets with JavaScript."
          action={null}
        />

        {/* ── Step 2 ── */}
        <StepCard
          number="2"
          title="Add the Widget Script"
          description={'Open Scriptable → tap "+" → paste the contents of:\n\nScriptable/AthleteDiaryWidget.js\n\nfrom the project folder.\nName it "AthleteDiaryWidget".'}
          action={null}
        />

        {/* ── Step 3: Sync & get URL ── */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepTitle}>Generate Your Data URL</Text>
          </View>
          <Text style={styles.stepDesc}>
            Press the button below to sync your athlete data to a free anonymous cloud store. A unique URL will be generated for you.
          </Text>

          <Pressable
            style={[styles.syncBtn, syncState === 'syncing' && styles.syncBtnDisabled]}
            onPress={handleSync}
            disabled={syncState === 'syncing'}
            accessibilityLabel="Sync widget data"
          >
            {syncState === 'syncing' ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.syncBtnText}>
                {syncState === 'success' ? '✓ SYNCED!' : '⟳ SYNC NOW'}
              </Text>
            )}
          </Pressable>

          {url ? (
            <View style={styles.urlBox}>
              <Text style={styles.urlLabel}>YOUR DATA URL</Text>
              <Text style={styles.urlText} numberOfLines={2}>{url}</Text>
              <Pressable style={styles.copyBtn} onPress={handleCopy} accessibilityLabel="Copy URL">
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={COLORS.primary} />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy URL'}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.urlBoxEmpty}>
              <Text style={styles.urlEmptyText}>Sync once to generate your URL →</Text>
            </View>
          )}
        </View>

        {/* ── Step 4 ── */}
        <StepCard
          number="4"
          title="Paste URL into the Script"
          description={'In Scriptable, find line 20 of AthleteDiaryWidget.js:\n\nconst DATA_URL = "PASTE_YOUR_DATA_URL_HERE";\n\nReplace the placeholder with your copied URL.'}
          action={null}
        />

        {/* ── Step 5 ── */}
        <StepCard
          number="5"
          title="Add Widget to Home Screen"
          description={'Long-press your iPhone Home Screen → tap "+" → search "Scriptable" → pick a size (small, medium, or large) → tap the widget → choose "AthleteDiaryWidget".'}
          action={null}
        />

        {/* ── Colour legend ── */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>Colour Legend</Text>
          <Text style={styles.stepDesc}>Each grid cell colour shows your session mood:</Text>
          <View style={styles.legend}>
            {[
              { color: '#22C55E', label: '5 — Peak' },
              { color: '#86EFAC', label: '4 — Good' },
              { color: '#F97316', label: '3 — Okay' },
              { color: '#EF4444', label: '1–2 — Struggling' },
              { color: '#EBEBEB', label: 'No session' },
            ].map(({ color, label }) => (
              <View key={label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Small reusable step card ──────────────────────────────────

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  action: null;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.stepRow}>
        <View style={styles.stepBadge}><Text style={styles.stepNum}>{number}</Text></View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <Text style={styles.stepDesc}>{description}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: SPACING.md,
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  screenLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.textOnYellow,
    opacity: 0.4,
  },
  screenTitle: {
    ...TYPOGRAPHY.dateHeadline,
    marginTop: 2,
  },

  // Body
  body: {
    padding: SPACING.md,
    gap: 12,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    flex: 1,
  },
  stepDesc: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 18,
    fontFamily: 'System',
  },

  // Sync button
  syncBtn: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  syncBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // URL box
  urlBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 6,
  },
  urlBoxEmpty: {
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  urlLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#AAAAAA',
  },
  urlText: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 16,
  },
  urlEmptyText: {
    fontSize: 11,
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  copyBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  // Legend
  legend: {
    gap: 6,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '600',
  },
});
