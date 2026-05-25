# Standalone App + AltStore Deep Link Tasks

## Phase A — Code Changes
- [/] `app.json` — restore runtimeVersion, remove sdkVersion
- [ ] `eas.json` — create with development profile
- [ ] `lib/widgetSync.ts` — simplify deepLink to always return `athletediary://log`
- [ ] `Scriptable/AthleteDiaryWidget.js` — update OPEN_URL to `athletediary://log`
- [ ] `npx tsc --noEmit` — confirm zero errors

## Phase B — Deploy + Build
- [ ] `eas update --branch main` — push updated jsonblob payload
- [ ] `eas build --platform ios --profile development` — cloud build (user runs)

## Phase C — User Actions (AltStore)
- [ ] User installs iTunes (direct from apple.com, NOT Microsoft Store)
- [ ] User installs iCloud for Windows (direct from apple.com)
- [ ] User installs AltStore on Windows from altstore.io
- [ ] User installs AltStore on iPhone via USB
- [ ] User sideloads the .ipa from EAS Build download link

## Phase D — Widget Config
- [ ] User opens AthleteDiary standalone app
- [ ] User taps ⊞ → Widget Setup → SYNC NOW
- [ ] User updates Scriptable script with new AthleteDiaryWidget.js
- [ ] User tests widget tap on 5G (WiFi off)
