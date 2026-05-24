# React Native Component Patterns

## Layout
- Wrap screen root in `<SafeAreaView>` with `style={{ flex: 1 }}`
- Use `<ScrollView>` for screens with variable-height content (Home, Log)
- Use `<FlatList>` only for lists that may grow large (not for 3 session cards — plain map is fine)
- Use `flexDirection: 'row'` + `gap` for horizontal layouts

## Pressables
- Always use `<Pressable>` (not `TouchableOpacity`) for interactive elements
- Every Pressable must have: `accessible={true}` and `accessibilityLabel`
- Minimum touch target: 44×44px (use `minHeight: 44, minWidth: 44` if needed)
- Use `hitSlop` to expand tap area without changing visual size

```tsx
<Pressable
  accessible={true}
  accessibilityLabel="Log new session"
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  onPress={handlePress}
>
```

## Memoisation
- `React.memo` on all components that receive props (prevents re-renders from parent)
- `useMemo` for expensive computations (grid data, session filtering)
- `useCallback` for event handlers passed as props

```tsx
// Good
export const MoodGrid = React.memo(({ sessions }: MoodGridProps) => {
  const gridData = useMemo(() => buildGrid(sessions), [sessions]);
  // ...
});
```

## StyleSheet
- Always use `StyleSheet.create()` — never inline style objects
- Exception: dynamic values (e.g. animated styles, conditional colours)
- Keep styles at bottom of file, after component

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
```

## Colours
- **Never hardcode hex values in StyleSheet or inline styles**
- Always use `COLORS.xxx` from `lib/constants`

```tsx
// WRONG
style={{ backgroundColor: '#0A0A0A' }}

// RIGHT
style={{ backgroundColor: COLORS.background }}
```

## ScrollView Behaviour
- `showsVerticalScrollIndicator={false}` on all ScrollViews
- `showsHorizontalScrollIndicator={false}` on all horizontal ScrollViews
- `keyboardShouldPersistTaps="handled"` on ScrollViews containing text inputs

## Image/Asset Handling
- Fonts go in `assets/fonts/`
- If future images are needed: `assets/images/`
- Reference with `require('../assets/fonts/Anton-Regular.ttf')`

## KeyboardAvoidingView
- Wrap Log Session screen content in `<KeyboardAvoidingView behavior="padding">` so the notes input isn't hidden by keyboard
