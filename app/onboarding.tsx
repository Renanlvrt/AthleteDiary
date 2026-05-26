// ============================================================
// app/onboarding.tsx — First Launch Onboarding (5 screens)
// Screen 1: Welcome splash
// Screen 2: Sport selection (multi-select)
// Screen 3: Training goal (single select)
// Screen 4: Schedule setup (with "set up later" skip)
// Screen 5: All set!
// Target: ~45s with schedule, ~15s if skipped
// ============================================================

import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
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
import { LinearGradient } from 'expo-linear-gradient';
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

function renderOnboardingIcon(type: string, color: string, size: number = 32) {
  switch (type) {
    // Sports (Blue)
    case 'running':
      return <MaterialCommunityIcons name="run" size={size} color={color} />;
    case 'gym':
      return <MaterialCommunityIcons name="weight-lifter" size={size} color={color} />;
    case 'cycling':
      return <MaterialCommunityIcons name="bike" size={size} color={color} />;
    case 'swimming':
      return <MaterialCommunityIcons name="swim" size={size} color={color} />;
    case 'football':
      return <MaterialCommunityIcons name="soccer" size={size} color={color} />;
    case 'basketball':
      return <MaterialCommunityIcons name="basketball-hoop-outline" size={size} color={color} />;
    case 'other':
      return <Feather name="target" size={size} color={color} />;
    case 'plus':
      return <Feather name="plus" size={size} color={color} />;

    // Goals (Orange)
    case 'consistency':
      return <MaterialCommunityIcons name="calendar-check-outline" size={size} color={color} />;
    case 'performance':
      return <MaterialCommunityIcons name="trophy-outline" size={size} color={color} />;
    case 'recovery':
      return <Ionicons name="accessibility-outline" size={size} color={color} />;
    case 'motivation':
      return <Ionicons name="flame-outline" size={size} color={color} />;

    // Schedule (Purple) & Streak (Red)
    case 'schedule':
      return <Feather name="calendar" size={size} color={color} />;
    case 'streak':
      return <Ionicons name="flame" size={size} color={color} />;

    default:
      return null;
  }
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
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        data={screens}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth, height: '100%' }}>{item}</View>
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
    </View>
  );
}

// ─── Screen 1: Welcome Splash ─────────────────────────────────

function Screen1Welcome({ insets, width, onNext, btnAnimStyle, pressIn, pressOut }: any) {
  return (
    <View style={[s1.screenWrapper, { width }]}>
      {/* Absolute, scaled background image decoupled from content */}
      {/* Replace the Image component with this exact code */}
      <Image
        source={require('../frontend/image_first_page.avif')}
        style={[StyleSheet.absoluteFillObject, { transform: [{ scale: 1.00 }, { translateY: -15 }, { translateX: 0 }] }]} 
        resizeMode="cover"
      />
      
      {/* Dark gradient overlay — transparent top → pitch black bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)', '#000000']}
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateY: 92 }] }]}
      />

      <SafeAreaView style={s1.contentContainer}>
        {/* Top header anchored normally */}
        <View style={s1.topContent}>
          <Text style={[s1.headerLbl, { marginTop: insets.top > 0 ? 10 : 30 }]}>
            ATHLETE DIARY
          </Text>
        </View>

        {/* The Magic Spacer: This forces everything below it into the gradient */}
        <View style={{ flex: 12 }} />

        {/* Bottom-anchored content */}
        <View style={s1.bottomContent}>
          {/* Hero text */}
          <Text style={s1.heroTitle}>
            {'YOUR\n'}
            <Text style={s1.heroYellow}>{'TRAINING\n'}</Text>
            {'DIARY.'}
          </Text>

          {/* Subtext */}
          <Text style={s1.subText}>
            Log every session.{'\n'}
            Track your mood.{'\n'}
            See how you grow.
          </Text>

          {/* Glass sport icons */}
          <View style={s1.iconRow}>
            {['running', 'gym', 'cycling', 'plus'].map((type, i) => (
              <View key={i} style={s1.glassIcon}>
                {renderOnboardingIcon(type, '#2563EB', 24)}
              </View>
            ))}
          </View>

          {/* CTA button */}
          <Animated.View style={btnAnimStyle}>
            <Pressable
              style={s1.btn}
              onPress={onNext}
              onPressIn={pressIn}
              onPressOut={pressOut}
              accessible={true}
              accessibilityLabel="Get started"
              accessibilityRole="button"
            >
              <Text style={s1.btnText}>GET STARTED</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </Pressable>
          </Animated.View>

          <Text style={s1.btnSub}>TAKES ABOUT 45 SECONDS</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s1 = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    overflow: 'hidden', // Prevents scaled image bleeding
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 60, // Space for pagination dots
  },
  topContent: {
    paddingHorizontal: 24,
  },
  headerLbl: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#FFE500',
  },
  bottomContent: {
    paddingHorizontal: 24,
    marginTop: 212,
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 60,
    letterSpacing: -2,
    marginBottom: 16,
  },
  heroYellow: {
    color: '#FFE500',
  },
  subText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#cccccc',
    lineHeight: 22,
    marginBottom: 28,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 32,
  },
  glassIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(50, 50, 50, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassIconText: {
    color: '#fff',
    fontSize: 22,
  },
  btn: {
    backgroundColor: '#FFE500',
    borderRadius: 100,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    shadowColor: '#FFE500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  btnSub: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
              <View style={{ marginBottom: 6 }}>
                {renderOnboardingIcon(sport, active ? COLORS.black : '#2563EB', 32)}
              </View>
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
    fontSize: 12,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.black,
  },
  sportEmoji: { fontSize: 28, marginBottom: 6 },
  sportLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#333333',
    textTransform: 'uppercase',
  },
  sportLabelActive: { color: COLORS.black },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm},
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// ─── Screen 3: Goal Selection ─────────────────────────────────

function Screen3Goal({ insets, width, selectedGoal, onSelect, onNext, onBack, btnAnimStyle, pressIn, pressOut }: any) {
  return (
    <View style={[s3.root, { width, paddingBottom: insets.bottom + 150 }]}>
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
              <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
                {renderOnboardingIcon(goal.key, active ? COLORS.black : '#EA580C', 32)}
              </View>
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
    fontSize: 12,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.black,
  },
  goalIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  goalText: { flex: 1 },
  goalLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#111111',
    textTransform: 'uppercase',
  },
  goalLabelActive: { color: COLORS.black },
  goalSub: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    lineHeight: 15,
  },
  goalSubActive: { color: '#444444' },
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
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.black,
  },
  footer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, marginTop: 85 },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.black,
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
        <View style={[s4.actions, { paddingBottom: insets.bottom + 20 }]}> 
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
    fontSize: 12,
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
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveDisabled: { opacity: 0.5 },
  saveText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.black,
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
    <View style={[s5.root, { width, height: '100%' }]}>
      <View style={[s5.heroBlock, { paddingTop: insets.top + 40 }]}>
        <Text style={s5.watermark} numberOfLines={1}>✅</Text>
        <Text style={s5.stepLbl}>All Done</Text>
        <Text style={s5.headline}>{'YOU\'RE\nALL SET.'}</Text>
        <Text style={s5.subText}>Time to start logging your sessions.</Text>
      </View>
      
      <View style={s5.contentBlock}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        >
          <Text style={s5.sectionTitle}>What's Ready</Text>
          
          <View style={s5.bentoGrid}>
            {/* Row 1: Sports & Goal */}
            <View style={s5.row}>
              <View style={[s5.bentoCard, s5.bentoCardHalf]}>
                <View style={s5.iconCircle}>
                  {renderOnboardingIcon(selectedSports[0] || 'running', COLORS.black, 20)}
                </View>
                <View style={s5.cardTextGroup}>
                  <Text style={s5.cardLabel}>Sports</Text>
                  <Text style={s5.cardValue}>
                    {selectedSports.length > 0 
                      ? selectedSports.map((s: SportType) => SPORT_FULL_NAMES[s]).join(', ')
                      : 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={[s5.bentoCard, s5.bentoCardHalf]}>
                <View style={s5.iconCircle}>
                  {renderOnboardingIcon(selectedGoal || 'motivation', COLORS.black, 20)}
                </View>
                <View style={s5.cardTextGroup}>
                  <Text style={s5.cardLabel}>Goal</Text>
                  <Text style={s5.cardValue}>{goalInfo ? goalInfo.label : 'Not set'}</Text>
                </View>
              </View>
            </View>

            {/* Row 2: Schedule (Full Width) */}
            <View style={[s5.bentoCard, s5.bentoCardFull]}>
              <View style={s5.iconCircle}>
                {renderOnboardingIcon('schedule', COLORS.black, 20)}
              </View>
              <View style={s5.cardTextGroup}>
                <Text style={s5.cardLabel}>Schedule</Text>
                <Text style={s5.cardValue}>{hasSchedule ? 'Reminders on' : 'Set up later'}</Text>
              </View>
            </View>

            {/* Row 3: Streak (Full Width Inactive) */}
            <View style={[s5.bentoCard, s5.bentoCardFull, s5.bentoInactive]}>
              <View style={[s5.iconCircle, s5.iconInactive]}>
                {renderOnboardingIcon('streak', '#888888', 20)}
              </View>
              <View style={s5.cardTextGroup}>
                <Text style={s5.cardLabel}>Streak</Text>
                <Text style={s5.cardValue}>Log today to start</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Animated.View style={[btnAnimStyle, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
          <Pressable
            style={s5.btn}
            onPress={onStart}
            onPressIn={pressIn}
            onPressOut={pressOut}
          >
            <Text style={s5.btnText}>START LOGGING</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const s5 = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  heroBlock: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -20,
    top: -20,
    fontSize: 160,
    opacity: 0.08,
    lineHeight: 160,
    transform: [{ rotate: '10deg' }],
  },
  stepLbl: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 16,
  },
  headline: {
    fontSize: 54,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    lineHeight: 52,
    letterSpacing: -2,
    marginBottom: 12,
  },
  subText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.7)',
  },
  contentBlock: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#AAA',
    marginBottom: 16,
  },
  bentoGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: 'column',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  bentoCardHalf: {
    flex: 1,
  },
  bentoCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bentoInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInactive: {
    backgroundColor: '#EEEEEE',
  },
  iconTxt: {
    fontSize: 16,
  },
  cardTextGroup: {
    flexDirection: 'column',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btn: {
    backgroundColor: '#000',
    borderRadius: 100,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});

// ─── Shared wrapper styles ────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});