# Skill: Editorial Design System

> Read this before building any UI component or screen.

## Philosophy
Bold, energetic, magazine-editorial. Think sports brand meets fashion magazine.
The design should HYPE the user up. Massive typography. Solid colour blocks. Zero clutter.

## Visual Reference
- `frontend/home screen.png` — Home screen target
- `frontend/log session.png` — Log Session target
- `frontend/athlete_diary_colorful_redesign.html` — HTML reference

---

## Colour System (all in lib/constants.ts as COLORS)

```typescript
export const COLORS = {
  // Backgrounds
  background:   '#0A0A0A',   // near-black — app root background
  surface:      '#141414',   // card background
  surfaceAlt:   '#1E1E1E',  // secondary cards

  // Colour blocks (the defining visual identity)
  primary:      '#FFE500',   // electric yellow — header blocks, CTAs
  accentRed:    '#E5232A',   // red — recent sessions block, save button block
  black:        '#000000',   // pill backgrounds on yellow

  // Text
  textPrimary:  '#FFFFFF',
  textSecondary:'#888888',
  textMuted:    '#444444',
  textOnYellow: '#000000',   // text on yellow blocks
  textOnRed:    '#FFFFFF',   // text on red blocks

  // Mood colours (5=Great → 1=Terrible)
  mood: {
    5: '#22C55E',  // Great    — bright green
    4: '#86EFAC',  // Good     — soft green
    3: '#FBBF24',  // Okay     — yellow
    2: '#F97316',  // Bad      — orange
    1: '#EF4444',  // Terrible — red
  },

  // Grid
  gridEmpty:    '#EBEBEB',   // no session (in white block)
  gridFuture:   '#F5F5F5',   // future day
  gridToday:    '#EBEBEB',   // today outline: outline 2px #222

  // Mood gradient (for slider track)
  moodGradientStart: '#991B1B',  // far left (terrible)
  moodGradientMid1:  '#EF4444',
  moodGradientMid2:  '#F97316',
  moodGradientMid3:  '#86EFAC',
  moodGradientEnd:   '#22C55E',  // far right (great)
} as const;
```

---

## Typography System (all in lib/constants.ts as TYPOGRAPHY)

```typescript
export const TYPOGRAPHY = {
  // Hero text — TRAIN. LOG. GROW. (on yellow block)
  hero: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: COLORS.textOnYellow,
    letterSpacing: -1.5,
    lineHeight: 36,
    textTransform: 'uppercase' as const,
  },

  // App name — ATHLETE DIARY
  appName: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: COLORS.textOnYellow,
  },

  // Date headline on Log screen — SUNDAY / 25 MAY
  dateHeadline: {
    fontSize: 30,
    fontWeight: '900' as const,
    letterSpacing: -1,
    color: COLORS.textOnYellow,
    textTransform: 'uppercase' as const,
    lineHeight: 30,
  },

  // Section label — THIS YEAR, HOW DID YOU FEEL?
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#BBBBBB',
    marginBottom: 10,
  },

  // Section label on red block — RECENT SESSIONS
  sectionLabelRed: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: COLORS.textOnRed,
    textTransform: 'uppercase' as const,
    letterSpacing: -1,
    lineHeight: 24,
  },

  // Caption / day label / sport name in pill
  caption: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.textSecondary,
  },

  // Streak number
  streakNumber: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
} as const;
```

---

## Spacing Scale (lib/constants.ts as SPACING)

```typescript
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
} as const;
```

---

## Border Radius Scale (lib/constants.ts as RADIUS)

```typescript
export const RADIUS = {
  sm:   4,
  md:   8,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;
```

---

## Key Layout Patterns

### Yellow Block (header on both screens)
```tsx
<View style={{ backgroundColor: COLORS.primary, padding: SPACING.md, paddingBottom: 20 }}>
  {/* content */}
</View>
```

### Red Block (recent sessions + save button)
```tsx
<View style={{ backgroundColor: COLORS.accentRed, padding: SPACING.md }}>
  {/* heading text + white cards */}
</View>
```

### Session Card (white, inside red block)
```tsx
<View style={{
  backgroundColor: '#FFFFFF',
  borderRadius: RADIUS.lg,
  padding: '10px 12px',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.sm,
}}>
```

### Streak Pill (black pill on yellow block)
```tsx
<View style={{
  backgroundColor: COLORS.black,
  borderRadius: RADIUS.full,
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 5,
  paddingHorizontal: 12,
  gap: 6,
  alignSelf: 'flex-start',
}}>
  <Text>🔥</Text>
  <Text style={TYPOGRAPHY.streakNumber}>47</Text>
  <Text style={TYPOGRAPHY.caption}>DAY STREAK</Text>
</View>
```

### Sport Pill (black pill on yellow block, Log screen)
```tsx
<View style={{
  backgroundColor: COLORS.black,
  borderRadius: RADIUS.full,
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 5,
  paddingHorizontal: 14,
  gap: 6,
  alignSelf: 'flex-start',
  marginTop: 12,
}}>
  <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase' }}>
    RUNNING
  </Text>
  <Text style={{ fontSize: 9, color: '#666', letterSpacing: 1 }}>· change</Text>
</View>
```

### Log Session FAB Bar (bottom, white bg)
```tsx
<View style={{ backgroundColor: '#FFFFFF', padding: SPACING.md }}>
  <Pressable
    style={{ backgroundColor: COLORS.black, borderRadius: RADIUS.lg, height: 50,
             flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    accessibilityLabel="Log new session"
  >
    <Text style={{ fontSize: 22, color: COLORS.primary }}>+</Text>
    <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase' }}>
      LOG SESSION
    </Text>
  </Pressable>
</View>
```

---

## Design Rules (never violate)

1. **Colour blocks define sections** — yellow for header/hero, white for data, red for action/recent
2. **No drop shadows** — use solid colour blocks and borders instead
3. **ALL CAPS** for section labels and UI text (not body text)
4. **Generous whitespace** — don't cram data
5. **Haptic feedback** on every meaningful tap
6. **No sport emojis** — text labels only
7. **Mood picker is a slider** — not swatches
8. **Performance picker** = 5 pill buttons (selected = yellow fill)
