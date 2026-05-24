# AthleteDiary — Agent Delegation Map

> When delegating work to a sub-agent, pick the right agent from this file and pass them the relevant skill(s) to read first.

## Available Agents

| Agent | File | Use When |
|-------|------|----------|
| planner | `.ecc/agents/planner.md` | Breaking down features, phasing work, identifying dependencies |
| ui-builder | `.ecc/agents/ui-builder.md` | Building any React Native component or screen UI |
| data-architect | `.ecc/agents/data-architect.md` | AsyncStorage schema, CRUD logic, streak calc, notification scheduling |
| qa-tester | `.ecc/agents/qa-tester.md` | Verifying implementation against spec, TypeScript audit, accessibility check |

## Agent → Skill Pairings

| Task | Agent | Skills to Load |
|------|-------|----------------|
| Build MoodGrid | ui-builder | editorial-design, mood-grid |
| Build MoodPicker (slider) | ui-builder | editorial-design |
| Build PerformancePicker | ui-builder | editorial-design |
| Build SessionCard | ui-builder | editorial-design |
| Build StreakCounter | ui-builder | editorial-design |
| Build SportPicker | ui-builder | editorial-design |
| Build DayTimePicker | ui-builder | editorial-design |
| Build Home screen | ui-builder | editorial-design, mood-grid |
| Build Log screen | ui-builder | editorial-design, session-logging |
| Build Schedule screen | ui-builder | editorial-design, notifications |
| Design storage schema | data-architect | session-logging |
| Implement sessions.ts | data-architect | session-logging |
| Implement streak.ts | data-architect | streak-calc |
| Implement notifications.ts | data-architect | notifications |
| Full QA pass | qa-tester | (all) |
| Phase planning | planner | (none — reads spec directly) |

## How to Invoke an Agent (Antigravity)

1. Invoke the relevant subagent
2. Tell it: "Read `.ecc/agents/<name>.md` and `.ecc/skills/<skill>/SKILL.md` before starting"
3. Give it the specific task
4. After it completes, update `PROGRESS.md`
