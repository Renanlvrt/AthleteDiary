# Skill: Mood Grid (GitHub-Style Annual View)

> Read this before building MoodGrid.tsx

## What It Is
A GitHub contribution graph adapted for mood data.
Full calendar year (Jan 1 → Dec 31). 53 columns (weeks) × 7 rows (Mon–Sun).
Each cell is a small coloured square representing one day's logged mood.

## Visual Reference
- `frontend/home screen.png` — see the "THIS YEAR" section
- HTML: `.cell { width: 9px; height: 9px; border-radius: 1.5px; }`

---

## Cell Sizing & Layout
```
Cell size:     9×9px squares (or 10×10px — match the reference)
Cell gap:      2px between cells
Column gap:    2px between weeks
Layout:        Horizontal scroll if needed (ScrollView horizontal)
Month labels:  Row above grid, one per ~4 columns, very small (7px, #CCC)
```

## Cell Colour Logic
```typescript
function getCellClass(date: Date, sessions: Session[]): string {
  const today = startOfDay(new Date());
  const dateStr = format(date, 'yyyy-MM-dd');

  if (isAfter(date, today)) return 'future';   // #F5F5F5

  const session = sessions.find(s => s.date === dateStr);
  if (!session) return 'empty';                 // #EBEBEB

  return `mood-${session.mood}`;               // MOOD_COLOURS[session.mood]
}
```

## Today Cell
```tsx
// Today gets an outline ring, not a different colour
if (isToday(date)) {
  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: COLORS.gridEmpty, borderWidth: 2, borderColor: '#222' }
      ]}
    />
  );
}
```

## Grid Data Structure
```typescript
// Pre-compute once with useMemo, only recompute when sessions change
const gridData = useMemo(() => {
  const startDate = startOfYear(new Date());
  const endDate = endOfYear(new Date());
  const weeks: Date[][] = [];

  // Start from Monday of the first week
  let current = startOfWeek(startDate, { weekStartsOn: 1 }); // 1 = Monday

  while (!isAfter(current, endDate)) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(addDays(current, i));
    }
    weeks.push(week);
    current = addDays(current, 7);
  }

  return weeks; // weeks[col][row]
}, []); // grid structure never changes within a year
```

## Month Labels
```typescript
// One label per month — find first column where month starts
const monthLabels = useMemo(() => {
  const labels: { month: string; colIndex: number }[] = [];
  gridData.forEach((week, i) => {
    const firstDay = week[0];
    if (i === 0 || getMonth(firstDay) !== getMonth(gridData[i-1][0])) {
      labels.push({
        month: format(firstDay, 'MMM').toUpperCase()[0], // 'J', 'F', etc.
        colIndex: i,
      });
    }
  });
  return labels;
}, [gridData]);
```

## Tap Behaviour (filled cells only)
```typescript
const [tooltipData, setTooltipData] = useState<{
  date: string;
  mood: MoodLevel;
  performance: PerformanceLevel;
  sport: SportType;
} | null>(null);

// Tap a filled cell → show tooltip
// Tap anywhere else → dismiss tooltip
// V1: tooltip shows date + sport label + mood label + performance label
```

## Performance
- Memoize `gridData` with `useMemo` — only depends on current year
- Memoize cell colour computation per session array
- Use `FlatList` or direct `ScrollView` (only ~53 columns × 7 rows = 371 cells — not heavy)
- Do NOT re-compute on every render

## Full Component Signature
```typescript
interface MoodGridProps {
  sessions: Session[];
}

export function MoodGrid({ sessions }: MoodGridProps): JSX.Element
```
