# Native Field Prototype Spike

Status: In progress
Owner: Sports Motion mobile / QA
Created: 2026-05-06
Last updated: 2026-05-07

This spike determines whether React Native with Expo development builds can
support the first installable Sports Motion App field prototype.

The spike should stay isolated from the dependency-free PWA until it proves the
core field workflow. Do not replace the current PWA prototype during this spike.

## Goals

- Create a minimal installable React Native + Expo development build.
- Prove the app can carry the Milestone 1 product skeleton on iOS and Android.
- Produce Android emulator and iOS simulator smoke evidence.
- Produce physical Android and physical iPhone verification evidence before the
  mobile stack ADR can move from Proposed to Accepted.
- Identify any native module, capture, storage, or overlay blockers early.

## Non-Goals

- No real AI tracking provider integration.
- No production authentication.
- No object storage integration.
- No real external share-link access control.
- No formal metric promotion.
- No original athlete videos or identifying screenshots committed to git.

## Proposed Work Breakdown

## Current Execution Notes

- Expo SDK 54 scaffold created under `sports-motion-app/mobile`.
- Installed native spike packages: `expo-dev-client` and `expo-image-picker`.
- The generated scaffold was replaced with a minimal Sports Motion native shell:
  capture/import, metrics, ROM, sharing, Japanese/English switching, seed
  team/athlete/session fields, and prototype tracking confidence display.
- Added `@react-native-async-storage/async-storage` for local draft persistence.
  The native shell now restores team, athlete, session, and selected local video
  metadata after app restart, with a reset path for test data.
- Added camera/media-library permission status display, selected-video metadata
  display, and a simple phase-overlay placeholder so emulator and physical-device
  smoke runs have a concrete capture/import review surface.
- Added local-only upload retry simulation. The native shell can move selected
  video metadata through ready, uploading, interrupted, retry, and submitted
  states without sending private media to storage.
- Expo package installation completed, but local emulator/simulator smoke is
  blocked until the local Node runtime is upgraded from `18.19.1` to
  `>=20.19.4`, matching React Native / Metro engine requirements observed during
  install.
- No original athlete videos, identifying screenshots, Android native build
  output, or iOS native build output are committed.

## Suggested Scaffold Commands

Run these only when starting the native spike branch. The current PWA prototype
does not require these dependencies.

```bash
cd sports-motion-app
npx create-expo-app@latest mobile
cd mobile
npx expo install expo-dev-client expo-image-picker
npx expo install @react-native-async-storage/async-storage
npx expo start
```

Initial EAS development build commands, after the Expo app exists:

```bash
cd sports-motion-app/mobile
npm install -g eas-cli
eas login
eas build --platform android --profile development
eas build --platform ios --profile development
```

For iOS simulator builds, create a dedicated EAS profile with
`ios.simulator: true` before building. Physical iPhone development builds require
Apple signing credentials.

Candidate packages for the spike:

- `expo-dev-client` for a customizable development build;
- `expo-image-picker` for camera and media-library video selection;
- `@react-native-async-storage/async-storage` for local draft persistence;
- a video preview/overlay package selected during the spike.

Do not commit generated native build artifacts, private videos, or device
screenshots that include identifying information.

### Slice 1: Native Shell

- Scaffold a React Native + Expo development build in an isolated mobile
  directory.
- Add capture, metrics, ROM, and sharing navigation.
- Add Japanese/English language switching.
- Display seed team, athlete, tracking status, model version, confidence policy,
  and phase confidence.
- Keep domain/API behavior aligned with the PWA prototype.

Done when:

- app launches in Android emulator after Node runtime is upgraded;
- app launches in iOS simulator after Node runtime is upgraded;
- navigation and labels work without layout overlap;
- smoke evidence is recorded with `docs/vv/mobile_test_results_template.md`.

### Slice 2: Local Draft State

- Store active team, athlete, session, capture source, and selected video draft
  metadata locally.
- Preserve local draft metadata after app restart.
- Keep raw tracking and ROM-adjusted layers conceptually separate in the mobile
  state model.
- Add a reset path for test data.

Done when:

- draft state survives app restart in Android emulator and iOS simulator after
  Node runtime is upgraded;
- physical-device verification confirms draft persistence after app restart.

### Slice 3: Camera And Import Spike

- Request camera permission.
- Request media-library permission.
- Capture a representative short pitching video on physical Android and iPhone.
- Import a representative existing pitching video on physical Android and
  iPhone.
- Record frame rate, resolution, file size, duration, and source.

Done when:

- physical Android can capture or import a test video and record metadata;
- physical iPhone can capture or import a test video and record metadata;
- permission or file-handling limitations are documented.
  The current shell records permission status, source, resolution, and duration;
  frame-rate and file-size capture still need physical-device verification and
  any required native media metadata package.

### Slice 4: Preview And Overlay Spike

- Render a video preview from local media.
- Render simple phase markers and skeleton/pose placeholder overlay.
- Confirm common phone sizes do not overlap overlay, controls, labels, or caution
  text.

Done when:

- emulator/simulator preview smoke passes;
- physical Android overlay review is usable;
- physical iPhone overlay review is usable.
  The current shell provides only a non-video overlay placeholder; real local
  video playback remains a later slice after Node/runtime smoke passes.

### Slice 5: Upload Retry Simulation

- Simulate interrupted upload without sending private media to production
  storage.
- Preserve video metadata and local draft after interruption.
- Retry submission into the mock API flow.

Done when:

- physical Android and iPhone both preserve metadata across restart/interruption;
- retry behavior is documented in V&V evidence.
  The current shell provides local-only state transitions; real mock API
  submission and restart verification remain blocked until runtime/device smoke
  passes.

## Quality Gates

Before accepting ADR 0002:

- Android emulator smoke result exists.
- iOS simulator smoke result exists.
- Physical Android verification result exists.
- Physical iPhone verification result exists.
- At least one known limitation or explicit "none observed" note is recorded.
- Any native-module requirement is documented.
- No evidence artifact committed to git contains athlete-identifying media.

## Branch And Directory Guidance

- Use a feature branch such as `feat/sports-motion-native-spike`.
- Keep native spike code under a clearly named sports-motion path.
- Do not modify Mini Datadog implementation.
- Keep the PWA prototype runnable while the native spike is in progress.
- If package dependencies are introduced, document install, build, and smoke-test
  commands in `sports-motion-app/README.md`.

## Go / Conditional Go / No-Go

Go:

- React Native + Expo supports capture/import, local draft, preview overlay,
  upload retry simulation, and internal test builds without major blockers.

Conditional Go:

- React Native + Expo works with documented capture constraints or one contained
  native-module requirement.

No-Go:

- camera/import, local files, overlay performance, app restart behavior, or build
  distribution blocks the field workflow.

## Evidence Links

Add dated evidence files under `docs/vv/` after real runs:

- Android emulator smoke: TBD
- iOS simulator smoke: TBD
- Physical Android verification: TBD
- Physical iPhone verification: TBD
- Scaffold / Node blocker note:
  `docs/vv/mobile_test_results_2026-05-07_native_scaffold.md`

## References

- Expo development builds:
  <https://docs.expo.dev/develop/development-builds/create-a-build>
- EAS Build:
  <https://docs.expo.dev/build/introduction/>
- Expo ImagePicker:
  <https://docs.expo.dev/versions/latest/sdk/imagepicker/>
