# Mobile Test Result: Native Scaffold

Date: 2026-05-07
Tester: Codex
Build ID: Expo SDK 54 scaffold, `sports-motion-app/mobile`
App version: 1.0.0
Result: Blocked before emulator/simulator smoke

## Scope

- Created an isolated React Native + Expo field prototype scaffold.
- Installed `expo-dev-client` and `expo-image-picker`.
- Installed `@react-native-async-storage/async-storage` for local draft
  persistence.
- Added a minimal native shell for capture/import, metrics, ROM, sharing, and
  Japanese/English switching.
- Added seed team, athlete, session, tracking status, model version, confidence
  policy, and phase confidence display.
- Added local restoration and reset behavior for team, athlete, session, and
  selected local video metadata. App-restart persistence still requires
  emulator/simulator and physical-device verification.
- Added camera/media-library permission status, selected-video metadata display,
  and a non-video phase-overlay placeholder. Real permission behavior, frame
  rate, file size, and playback overlay remain unverified until device smoke
  runs.
- Added local-only upload retry simulation for ready, uploading, interrupted,
  retry, and submitted states. It does not send private media to storage.
- Backend-style upload-session gating is implemented in the PWA/mock API but has
  not yet been wired into the native shell. Native upload behavior remains a
  local-only simulation until the mobile runtime and backend integration slices
  are available.

## Environment

- Local Node: `18.19.1`
- Local npm: `9.2.0`
- Generated dependencies include React Native / Metro packages that report Node
  engine requirements of Node `>=20.19.4` or compatible Node 20 versions.

## Emulator And Simulator Status

| Target | Status | Notes |
| --- | --- | --- |
| Android emulator | Not run | Blocked until local Node is upgraded to `>=20.19.4`. |
| iOS simulator | Not run | Blocked until local Node is upgraded to `>=20.19.4`; iOS simulator execution also requires an appropriate macOS/Xcode host or EAS simulator build path. |

## Verification Notes

- Package installation completed with engine warnings on Node `18.19.1`.
- npm reported four moderate audit findings in generated mobile dependencies.
  No forced dependency upgrade was applied during this scaffold slice.
- The UI can display source, resolution, and duration returned by
  `expo-image-picker`. File size and frame-rate metadata are not yet captured in
  this scaffold.
- Upload retry behavior is implemented as local state only. App restart and
  interrupted-upload persistence still require emulator/simulator and physical
  device verification after the Node runtime upgrade.
- Native duplicate-session prevention, retry attempt count, and tracking/processing
  gate behavior are not verified in this scaffold note.
- No private athlete media, device screenshots, signing credentials, generated
  Android project, generated iOS project, or EAS output was committed.

## Next Action

Upgrade the local mobile development runtime to Node `>=20.19.4`, then run the
Android emulator and iOS simulator smoke cases from `docs/mobile_test_plan.md`.
