# Animation Patterns — AthleteDiary

## Rule
**Use `react-native-reanimated` for ALL animations.**
Never use the core `Animated` API from `react-native`.

## Required Animations (all must be implemented)

### 1. Mood Slider Thumb — Spring on drag snap
```typescript
// When slider snaps to a mood level, thumb scale springs
const thumbScale = useSharedValue(1);

function onSnapToMood() {
  thumbScale.value = withSequence(
    withSpring(1.2, { damping: 8 }),
    withSpring(1.0, { damping: 12 }),
  );
}

const thumbStyle = useAnimatedStyle(() => ({
  transform: [{ scale: thumbScale.value }],
}));
```

### 2. Performance Pill — Spring on select
```typescript
const scale = useSharedValue(1);

function onSelect() {
  scale.value = withSequence(
    withSpring(0.92, { damping: 8 }),
    withSpring(1.0, { damping: 12 }),
  );
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const animStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### 3. Save Success — Grid cell fade in
```typescript
// On the newly added cell in MoodGrid after save
const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, { duration: 400 });
}, [isNew]);

const cellStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));
```

### 4. Streak Counter — Count-up on mount
```typescript
const displayValue = useSharedValue(0);

useEffect(() => {
  displayValue.value = withSpring(streak, {
    duration: 600,
    dampingRatio: 0.7,
  });
}, [streak]);

// Render using Reanimated's AnimatedText or a JS-driven counter
```

### 5. FAB Press — Scale feedback
```typescript
const fabScale = useSharedValue(1);

function onFabPress() {
  fabScale.value = withSequence(
    withSpring(0.9, { damping: 10 }),
    withSpring(1.0, { damping: 12 }),
  );
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const fabStyle = useAnimatedStyle(() => ({
  transform: [{ scale: fabScale.value }],
}));
```

### 6. Validation Shake — Missing required field
```typescript
const translateX = useSharedValue(0);

function triggerShake() {
  translateX.value = withSequence(
    withTiming(6,  { duration: 50 }),
    withTiming(-6, { duration: 50 }),
    withTiming(6,  { duration: 50 }),
    withTiming(-6, { duration: 50 }),
    withTiming(6,  { duration: 50 }),
    withTiming(0,  { duration: 50 }),
  );
}

const shakeStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

## Animation Constants (use consistent values)
```typescript
const SPRING_GENTLE = { damping: 15, stiffness: 150 };
const SPRING_SNAPPY = { damping: 8, stiffness: 200 };
const TIMING_FADE   = { duration: 400 };
```

## Import Pattern
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
// Wrap animated elements: <Animated.View style={animStyle}>
```
