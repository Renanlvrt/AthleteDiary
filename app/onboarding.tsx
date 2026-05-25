// ============================================================
// app/onboarding.tsx — First Launch Onboarding (5 screens)
// Screen 1: Welcome splash
// Screen 2: Sport selection (multi-select)
// Screen 3: Training goal (single select)
// Screen 4: Schedule setup (with "set up later" skip)
// Screen 5: All set!
// Target: ~45s with schedule, ~15s if skipped
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { DayTimePicker } from '../components/DayTimePicker';
import { useSchedule } from '../hooks/useSchedule';
import { COLORS, RADIUS, SPACING, ALL_SPORTS, SPORT_FULL_NAMES } from '../lib/constants';
import { markOnboardingComplete, saveOnboardingProfile, TrainingGoal } from '../lib/onboarding';
import { requestNotificationPermissions, scheduleTrainingReminders } from '../lib/notifications';
import { DayOfWeek, SportType, TrainingSlot } from '../lib/types';

// ─── Types ───────────────────────────────────────────────────

interface DaySlot {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  hour: number;
  minute: number;
}

const INITIAL_SLOTS: DaySlot[] = [
  { dayOfWeek: 0, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 1, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 2, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 3, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 4, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 5, enabled: false, hour: 18, minute: 0 },
  { dayOfWeek: 6, enabled: false, hour: 18, minute: 0 },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const GOALS: { key: TrainingGoal; label: string; sub: string; icon: string }[] = [
  { key: 'consistency', label: 'BUILD CONSISTENCY', sub: 'Establish a regular training habit', icon: '🔁' },
  { key: 'performance', label: 'PEAK PERFORMANCE', sub: 'Push my limits and track progress', icon: '📈' },
  { key: 'recovery',    label: 'SMART RECOVERY',   sub: 'Train hard, recover harder',         icon: '⚡' },
  { key: 'motivation',  label: 'STAY MOTIVATED',   sub: 'Keep the fire burning daily',        icon: '🔥' },
];

const SPORT_ICONS: Record<SportType, string> = {
  running:    '🏃',
  gym:        '🏋️',
  cycling:    '🚴',
  swimming:   '🏊',
  football:   '⚽',
  basketball: '🏀',
  other:      '🎯',
};

// ─── Main Component ──────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { saveSchedule } = useSchedule();
  const flatListRef = useRef<FlatList>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal | null>(null);
  const [slots, setSlots] = useState<DaySlot[]>(INITIAL_SLOTS);
  const [saving, setSaving] = useState(false);

  // Button scale animation
  const btnScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  function pressIn() { btnScale.value = withSpring(0.97, { damping: 15 }); }
  function pressOut() { btnScale.value = withSpring(1, { damping: 12 }); }

  // ── Sync layout on window resize ──────────────────────────

  useEffect(() => {
    // When resizing the browser window, ensure we stay snapped to the correct step
    flatListRef.current?.scrollToIndex({ index: currentStep, animated: false });
  }, [screenWidth, currentStep]);

  // ── Navigation ────────────────────────────────────────────

  function goToStep(step: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(step);
    flatListRef.current?.scrollToIndex({ index: step, animated: true });
  }

  function handleNext() {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }

  // ── Sport selection ───────────────────────────────────────

  function toggleSport(sport: SportType) {
    void Haptics.selectionAsync();
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  }

  // ── Goal selection ────────────────────────────────────────

  function selectGoal(goal: TrainingGoal) {
    void Haptics.selectionAsync();
    setSelectedGoal(goal);
  }

  // ── Schedule ──────────────────────────────────────────────

  function updateSlot(dayOfWeek: DayOfWeek, updates: Partial<DaySlot>) {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...updates } : s)),
    );
  }

  // ── Finish (with schedule) ────────────────────────────────

  async function handleFinishWithSchedule() {
    const enabled = slots.filter((s) => s.enabled);
    if (enabled.length === 0) {
      Alert.alert('No days selected', 'Select at least one training day, or tap "Set up later".');
      return;
    }

    setSaving(true);
    const granted = await requestNotificationPermissions();

    const trainingSlots: TrainingSlot[] = enabled.map((s) => ({
      id: generateId(),
      dayOfWeek: s.dayOfWeek,
      hour: s.hour,
      minute: s.minute,
    }));

    await saveSchedule({
      slots: trainingSlots,
      isConfigured: true,
      updatedAt: Date.now(),
    });

    if (granted) {
      await scheduleTrainingReminders(trainingSlots);
    }

    await completeOnboarding();
    setSaving(false);
  }

  // ── Finish (skip schedule) ────────────────────────────────

  async function handleSkipSchedule() {
    await completeOnboarding();
  }

  // ── Final step: go to "All set" ───────────────────────────

  async function completeOnboarding() {
    await saveOnboardingProfile({
      sports: selectedSports,
      goal: selectedGoal,
      completedAt: Date.now(),
    });
    goToStep(4);
  }

  // ── Start the app ─────────────────────────────────────────

  async function handleStartApp() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markOnboardingComplete();
    router.replace('/');
  }

  // ─── Render Screens ────────────────────────────────────────

  const screens = [
    <Screen1Welcome
      key="s1"
      insets={insets}
      width={screenWidth}
      onNext={handleNext}
      btnAnimStyle={btnAnimStyle}
      pressIn={pressIn}
      pressOut={pressOut}
    />,
    <Screen2Sports
      key="s2"
      insets={insets}
      width={screenWidth}
      selectedSports={selectedSports}
      onToggle={toggleSport}
      onNext={() => {
        if (selectedSports.length === 0) {
          Alert.alert('Select a sport', 'Choose at least one sport you do.');
          return;
        }
        handleNext();
      }}
      onBack={handleBack}
      btnAnimStyle={btnAnimStyle}
      pressIn={pressIn}
      pressOut={pressOut}
    />,
    <Screen3Goal
      key="s3"
      insets={insets}
      width={screenWidth}
      selectedGoal={selectedGoal}
      onSelect={selectGoal}
      onNext={() => {
        if (!selectedGoal) {
          Alert.alert('Pick a goal', 'Select what brings you here.');
          return;
        }
        handleNext();
      }}
      onBack={handleBack}
      btnAnimStyle={btnAnimStyle}
      pressIn={pressIn}
      pressOut={pressOut}
    />,
    <Screen4Schedule
      key="s4"
      insets={insets}
      width={screenWidth}
      slots={slots}
      onUpdateSlot={updateSlot}
      onSave={handleFinishWithSchedule}
      onSkip={handleSkipSchedule}
      onBack={handleBack}
      saving={saving}
    />,
    <Screen5AllSet
      key="s5"
      insets={insets}
      width={screenWidth}
      selectedSports={selectedSports}
      selectedGoal={selectedGoal}
      hasSchedule={slots.some((s) => s.enabled)}
      onStart={handleStartApp}
      btnAnimStyle={btnAnimStyle}
      pressIn={pressIn}
      pressOut={pressOut}
    />,
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }}>{item}</View>
        )}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({  
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {/* Dot indicators (only steps 1-4, not the final screen) */}
      {currentStep < 4 && (
        <View style={[styles.dotsRow, { bottom: insets.bottom + 24 }]}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Screen 1: Welcome Splash ─────────────────────────────────

function Screen1Welcome({ insets, width, onNext, btnAnimStyle, pressIn, pressOut }: any) {
  return (
    <View style={[s1.root, { width, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}>
      {/* Wordmark */}
      <Text style={s1.wordmark}>ATHLETE DIARY</Text>

      {/* Hero */}
      <View style={s1.heroBlock}>
        <Text style={s1.hero}>YOUR{'\n'}TRAINING{'\n'}DIARY.</Text>
        <Text style={s1.sub}>
          {'Log every session.\nTrack your mood.\nSee how you grow over time.'}
        </Text>
      </View>

      {/* Decorative element */}
      <View style={s1.decorRow}>
        {['🏃', '🏋️', '🚴', '🏊', '⚽'].map((emoji, i) => (
          <View key={i} style={[s1.decorBubble, { transform: [{ rotate: `${(i - 2) * 4}deg` }] }]}>
            <Text style={s1.decorEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <Animated.View style={btnAnimStyle}>
        <Pressable
          style={s1.ctaButton}
          onPress={onNext}
          onPressIn={pressIn}
          onPressOut={pressOut}
          accessible={true}
          accessibilityLabel="Get started"
          accessibilityRole="button"
        >
          <Text style={s1.ctaText}>GET STARTED</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </Pressable>
      </Animated.View>

      <Text style={s1.footer}>Takes about 45 seconds</Text>
    </View>
  );
}

const s1 = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    color: COLORS.textOnYellow,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  heroBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  hero: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -2,
    lineHeight: 54,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textOnYellow,
    opacity: 0.65,
    lineHeight: 22,
    marginTop: SPACING.md,
  },
  decorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  decorBubble: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorEmoji: {
    fontSize: 22,
  },
  ctaButton: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footer: {
    fontSize: 10,
    color: COLORS.textOnYellow,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
});

// ─── Screen 2: Sport Selection ────────────────────────────────

function Screen2Sports({ insets, width, selectedSports, onToggle, onNext, onBack, btnAnimStyle, pressIn, pressOut }: any) {
  return (
    <View style={[s2.root, { width, paddingBottom: insets.bottom + 80 }]}>
      {/* Yellow header */}
      <View style={[s2.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={s2.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={COLORS.textOnYellow} />
        </Pressable>
        <Text style={s2.step}>02 / 04</Text>
        <Text style={s2.headline}>{'WHAT DO\nYOU DO?'}</Text>
        <Text style={s2.sub}>Pick all the sports that apply</Text>
      </View>

      {/* Sports grid */}
      <ScrollView
        style={s2.scroll}
        contentContainerStyle={s2.grid}
        showsVerticalScrollIndicator={false}
      >
        {ALL_SPORTS.map((sport) => {
          const active = selectedSports.includes(sport);
          return (
            <Pressable
              key={sport}
              style={[s2.sportTile, active && s2.sportTileActive]}
              onPress={() => onToggle(sport)}
              accessible={true}
              accessibilityLabel={SPORT_FULL_NAMES[sport]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <Text style={s2.sportEmoji}>{SPORT_ICONS[sport]}</Text>
              <Text style={[s2.sportLabel, active && s2.sportLabelActive]}>
                {SPORT_FULL_NAMES[sport].toUpperCase()}
              </Text>
              {active && (
                <View style={s2.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.primary} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA */}
      <View style={s2.footer}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[s2.ctaButton, selectedSports.length === 0 && s2.ctaDisabled]}
            onPress={onNext}
            onPressIn={pressIn}
            onPressOut={pressOut}
            accessible={true}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
          >
            <Text style={s2.ctaText}>
              {selectedSports.length > 0
                ? `CONTINUE (${selectedSports.length} SELECTED)`
                : 'SELECT AT LEAST ONE'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F0F0' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  step: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textOnYellow,
    opacity: 0.5,
    marginBottom: 4,
  },
  headline: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 40,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textOnYellow,
    opacity: 0.6,
    marginTop: 6,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: 10,
  },
  sportTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  sportTileActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.primary,
  },
  sportEmoji: { fontSize: 28, marginBottom: 6 },
  sportLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#333333',
    textTransform: 'uppercase',
  },
  sportLabelActive: { color: COLORS.primary },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  ctaButton: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// ─── Screen 3: Goal Selection ─────────────────────────────────

function Screen3Goal({ insets, width, selectedGoal, onSelect, onNext, onBack, btnAnimStyle, pressIn, pressOut }: any) {
  return (
    <View style={[s3.root, { width, paddingBottom: insets.bottom + 80 }]}>
      {/* Yellow header */}
      <View style={[s3.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={s3.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={COLORS.textOnYellow} />
        </Pressable>
        <Text style={s3.step}>03 / 04</Text>
        <Text style={s3.headline}>{'WHAT BRINGS\nYOU HERE?'}</Text>
        <Text style={s3.sub}>Choose your primary goal</Text>
      </View>

      {/* Goal cards */}
      <ScrollView
        style={s3.scroll}
        contentContainerStyle={s3.cards}
        showsVerticalScrollIndicator={false}
      >
        {GOALS.map((goal) => {
          const active = selectedGoal === goal.key;
          return (
            <Pressable
              key={goal.key}
              style={[s3.goalCard, active && s3.goalCardActive]}
              onPress={() => onSelect(goal.key)}
              accessible={true}
              accessibilityLabel={goal.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={s3.goalIcon}>{goal.icon}</Text>
              <View style={s3.goalText}>
                <Text style={[s3.goalLabel, active && s3.goalLabelActive]}>{goal.label}</Text>
                <Text style={[s3.goalSub, active && s3.goalSubActive]}>{goal.sub}</Text>
              </View>
              {active && (
                <View style={s3.radioActive}>
                  <View style={s3.radioDot} />
                </View>
              )}
              {!active && <View style={s3.radioInactive} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA */}
      <View style={s3.footer}>
        <Animated.View style={btnAnimStyle}>
          <Pressable
            style={[s3.ctaButton, !selectedGoal && s3.ctaDisabled]}
            onPress={onNext}
            onPressIn={pressIn}
            onPressOut={pressOut}
            accessible={true}
            accessibilityLabel="Continue to schedule setup"
            accessibilityRole="button"
          >
            <Text style={s3.ctaText}>CONTINUE</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const s3 = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F0F0' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  step: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textOnYellow,
    opacity: 0.5,
    marginBottom: 4,
  },
  headline: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textOnYellow,
    opacity: 0.6,
    marginTop: 6,
  },
  scroll: { flex: 1 },
  cards: { padding: SPACING.md, gap: 10 },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.primary,
  },
  goalIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  goalText: { flex: 1 },
  goalLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#111111',
    textTransform: 'uppercase',
  },
  goalLabelActive: { color: COLORS.primary },
  goalSub: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
    lineHeight: 15,
  },
  goalSubActive: { color: '#999999' },
  radioInactive: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: '#DDDDDD',
  },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  footer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  ctaButton: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// ─── Screen 4: Schedule Setup ─────────────────────────────────

function Screen4Schedule({ insets, width, slots, onUpdateSlot, onSave, onSkip, onBack, saving }: any) {
  return (
    <View style={[s4.root, { width }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Yellow header */}
        <View style={[s4.header, { paddingTop: insets.top + 12 }]}>
          <View style={s4.headerTop}>
            <Pressable onPress={onBack} style={s4.backBtn} accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={22} color={COLORS.textOnYellow} />
            </Pressable>
            <Text style={s4.step}>04 / 04</Text>
          </View>
          <Text style={s4.headline}>{'WHEN DO\nYOU TRAIN?'}</Text>
          <Text style={s4.sub}>
            {'Select your training days.\nWe\'ll remind you to log after each session.'}
          </Text>
        </View>

        {/* Day rows */}
        <View style={s4.daysBlock}>
          {slots.map((slot: DaySlot) => (
            <View key={slot.dayOfWeek}>
              <DayTimePicker
                dayOfWeek={slot.dayOfWeek}
                enabled={slot.enabled}
                hour={slot.hour}
                minute={slot.minute}
                onToggle={(enabled: boolean) => onUpdateSlot(slot.dayOfWeek, { enabled })}
                onTimeChange={(hour: number, minute: number) =>
                  onUpdateSlot(slot.dayOfWeek, { hour, minute })
                }
              />
              <View style={s4.rowDivider} />
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s4.actions}>
          <Pressable
            style={[s4.saveButton, saving && s4.saveDisabled]}
            onPress={onSave}
            disabled={saving}
            accessible={true}
            accessibilityLabel="Save training schedule and continue"
            accessibilityRole="button"
          >
            <Text style={s4.saveText}>{saving ? 'SAVING...' : 'SAVE SCHEDULE'}</Text>
          </Pressable>

          <Pressable
            style={s4.skipButton}
            onPress={onSkip}
            accessible={true}
            accessibilityLabel="Set up schedule later"
            accessibilityRole="button"
          >
            <Text style={s4.skipText}>Set up later</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s4 = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F0F0' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  step: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textOnYellow,
    opacity: 0.5,
  },
  headline: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 40,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textOnYellow,
    opacity: 0.6,
    lineHeight: 18,
  },
  daysBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: SPACING.md,
  },
  actions: { padding: SPACING.md, gap: 12 },
  saveButton: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.5 },
  saveText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  skipButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
});

// ─── Screen 5: All Set ────────────────────────────────────────

function Screen5AllSet({ insets, width, selectedSports, selectedGoal, hasSchedule, onStart, btnAnimStyle, pressIn, pressOut }: any) {
  const goalInfo = GOALS.find((g) => g.key === selectedGoal);

  return (
    <View style={[s5.root, { width, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      {/* Hero */}
      <View style={s5.heroBlock}>
        <Text style={s5.checkEmoji}>✅</Text>
        <Text style={s5.headline}>{'ALL\nSET!'}</Text>
        <Text style={s5.sub}>Here's your setup</Text>
      </View>

      {/* Summary cards */}
      <View style={s5.summaryBlock}>
        {/* Sports */}
        <View style={s5.summaryCard}>
          <Text style={s5.summaryLabel}>YOUR SPORTS</Text>
          <View style={s5.sportPills}>
            {selectedSports.length > 0
              ? selectedSports.map((sport: SportType) => (
                  <View key={sport} style={s5.pill}>
                    <Text style={s5.pillText}>
                      {SPORT_ICONS[sport]} {SPORT_FULL_NAMES[sport].toUpperCase()}
                    </Text>
                  </View>
                ))
              : <Text style={s5.summaryValue}>Not set</Text>
            }
          </View>
        </View>

        {/* Goal */}
        <View style={s5.summaryCard}>
          <Text style={s5.summaryLabel}>YOUR GOAL</Text>
          <Text style={s5.summaryValue}>
            {goalInfo ? `${goalInfo.icon} ${goalInfo.label}` : 'Not set'}
          </Text>
        </View>

        {/* Schedule */}
        <View style={s5.summaryCard}>
          <Text style={s5.summaryLabel}>TRAINING SCHEDULE</Text>
          <Text style={s5.summaryValue}>
            {hasSchedule ? '✅ Configured' : '⏭ Set up later'}
          </Text>
        </View>
      </View>

      <View style={s5.spacer} />

      {/* CTA */}
      <Animated.View style={btnAnimStyle}>
        <Pressable
          style={s5.ctaButton}
          onPress={onStart}
          onPressIn={pressIn}
          onPressOut={pressOut}
          accessible={true}
          accessibilityLabel="Start using Athlete Diary"
          accessibilityRole="button"
        >
          <Text style={s5.ctaText}>START TRAINING DIARY</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s5 = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
  },
  heroBlock: {
    paddingVertical: SPACING.lg,
  },
  checkEmoji: { fontSize: 48, marginBottom: 12 },
  headline: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.textOnYellow,
    letterSpacing: -2,
    lineHeight: 62,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 14,
    color: COLORS.textOnYellow,
    opacity: 0.6,
    marginTop: 8,
    fontWeight: '500',
  },
  summaryBlock: { gap: 10 },
  summaryCard: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#666666',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sportPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: '#1A1A1A',
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  spacer: { flex: 1 },
  ctaButton: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// ─── Shared wrapper styles ────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.black,
  },
});
