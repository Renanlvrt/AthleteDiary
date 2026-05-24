# V1 Scope Guard — AthleteDiary

## V1 Contains EXACTLY These Three Screens
1. **Home** (`app/index.tsx`) — dashboard
2. **Log Session** (`app/log.tsx`) — modal
3. **Schedule Setup** (`app/schedule.tsx`) — pushed screen

## Explicitly OUT OF SCOPE for V1

Do NOT build any of the following. If asked to, flag scope creep and decline.

- User accounts, authentication, or any backend
- Remote push notifications (local only is in scope)
- Statistics, insights, or charts screen
- Settings screen
- Social features (sharing, following, leaderboards)
- Apple Health integration
- Widgets or lock screen extensions
- Android-specific optimisations (Android parity is V2)
- Onboarding flow or tutorial
- Dark/light mode toggle (dark-only blocks are always in effect)
- Export/import of session data
- Session editing or deletion in V1
- Custom sport types (7 predefined types only)
- AI-powered insights or recommendations
- Subscription or in-app purchases

## What IS In Scope (V1 complete list)
- Home dashboard: mood grid, streak counter, 3 recent session cards, FAB
- Log Session modal: mood slider, performance pills, sport picker, notes, save
- Schedule Setup: day+time picker for recurring training, local notifications
- All animations listed in spec Section 11
- All haptic feedback
- Training schedule notifications (1h after slot, weekly recurring)
- AsyncStorage persistence

## Responding to Out-of-Scope Requests
When the user asks for something out of V1 scope, respond:
> "That's a great V2 idea. I'll note it in DECISION_LOG.md but won't build it in V1.
> Should I add it to a V2 backlog?"
