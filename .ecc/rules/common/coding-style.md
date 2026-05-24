# Coding Style — AthleteDiary

These rules apply to EVERY file in this codebase. No exceptions.

## TypeScript
- Strict mode on (`"strict": true` in tsconfig.json)
- No `any` types — ever
- No `@ts-ignore` comments — ever
- All function return types must be explicit
- All component props must have a named interface (e.g. `interface MoodGridProps`)
- Prefer `type` for unions, `interface` for object shapes

## Exports
- Named exports only — no `export default`
- One component or function per file

## Imports
- All colour values: import `COLORS` from `../lib/constants`
- All typography: import `TYPOGRAPHY` from `../lib/constants`
- All spacing: import `SPACING` from `../lib/constants`
- All type definitions: import from `../lib/types`

## Naming Conventions
- Components: PascalCase (`MoodGrid`, `SessionCard`)
- Hooks: camelCase prefixed with `use` (`useSessions`, `useStreak`)
- Pure functions: camelCase (`calculateStreak`, `addSession`)
- Constants: SCREAMING_SNAKE_CASE (`MOOD_COLOURS`, `SPORT_LABELS`)
- Types/interfaces: PascalCase (`Session`, `MoodLevel`)

## Code Style
- `const` over `let` everywhere
- Never use `var`
- Arrow functions for callbacks
- Pure functions where possible — side effects only in hooks and storage helpers
- All async functions use `async/await` — no `.then()` chains

## Commits (conventional commits)
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that doesn't fix a bug or add a feature
- `chore:` — dependency updates, config changes
- `style:` — formatting, missing semicolons, etc.
- `docs:` — documentation changes

## File Organisation
```
lib/constants.ts    — ALL design tokens and mappings (colours, typography, spacing, sport labels, mood colours)
lib/types.ts        — ALL shared TypeScript interfaces (Session, TrainingSlot, etc.)
lib/storage.ts      — generic AsyncStorage helpers only
lib/sessions.ts     — session-specific CRUD
lib/streak.ts       — streak calculation
lib/dates.ts        — date-fns wrappers
lib/notifications.ts — notification helpers
```
