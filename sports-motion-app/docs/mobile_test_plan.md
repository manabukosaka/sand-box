# Mobile Test Plan

Status: Draft
Owner: Sports Motion mobile / QA
Created: 2026-05-06

This plan defines when Android emulator, iOS simulator, and physical-device tests
start for Sports Motion App. It complements `docs/vuv_checklist.md` and
`docs/adr/0002-mobile-stack-for-field-prototype.md`.

Native spike execution plan: `docs/native_field_prototype_spike.md`.

Record actual runs with `docs/vv/mobile_test_results_template.md`.

## Runtime Readiness Gate

Native emulator/simulator smoke starts only after the runtime gate in
`docs/native_field_prototype_spike.md` is ready.

Current blocker:

- `sports-motion-app/mobile/package.json` requires Node `>=20.19.4`.
- Local verification on 2026-05-07 and 2026-05-09 observed Node `18.19.1`
  and npm `9.2.0`.
- The Expo dev-client help check can run on Node `18.19.1`, but
  emulator/simulator smoke must remain `Blocked` until the local runtime is
  upgraded or an equivalent EAS simulator path is documented.

Before any native smoke run, record:

- `node --version`;
- `npm --version`;
- whether the Expo dev-client help check runs without engine failure;
- whether Android emulator, iOS simulator, or EAS simulator prerequisites are
  available;
- the dated V&V result file created under `docs/vv/`.

Current dated blocker evidence:

- `docs/vv/mobile_test_results_2026-05-07_native_scaffold.md`
- `docs/vv/mobile_test_results_2026-05-09_runtime_gate.md`

## Test Timing

| Stage | Target | When | Purpose | Gate impact |
| --- | --- | --- | --- | --- |
| PWA smoke | Desktop/mobile browser | Current Milestone 1 prototype | Product flow, layout, bilingual UI, mock API | Supports product skeleton only |
| Android emulator smoke | React Native + Expo development build | First native spike | Launch, navigation, local state, mock flow, preview layout | Required before mobile ADR acceptance |
| iOS simulator smoke | React Native + Expo development build | First native spike | Launch, navigation, local state, mock flow, preview layout | Required before mobile ADR acceptance |
| Physical Android verification | Representative Android phone | Before accepting mobile stack ADR | Camera/import, media permissions, video metadata, local draft persistence, upload retry, overlay review | Required for mobile stack Go/Conditional Go |
| Physical iPhone verification | Representative iPhone | Before accepting mobile stack ADR | Camera/import, media permissions, video metadata, local draft persistence, upload retry, overlay review | Required for mobile stack Go/Conditional Go |

## PWA Smoke Scope

Run this on `http://127.0.0.1:4173/app/` before using the PWA as the product
skeleton reference for native or backend slices:

- app opens in desktop-width and narrow mobile-width browser viewports;
- English and Japanese labels fit without overlap;
- team and athlete edits persist after browser refresh;
- a local non-identifying sample video can be saved as a managed draft;
- video library filters cover status, camera view, and analysis availability;
- upload session can be started for a draft video;
- a second start action does not create duplicate active upload sessions;
- upload session can be interrupted and shows retryable/interrupted state;
- retry creates a new attempt after interruption;
- upload completion changes the video to an uploaded/ready state;
- queue and submit actions are blocked before upload completion or automatically
  complete the prototype upload path before entering processing/tracking;
- retryable and unusable tracking failure controls produce capture-condition
  failure states without creating a new analysis result;
- metrics, ROM recalculation, and share revocation still work after upload retry;
- no user-facing text presents clinical conclusions, health forecasts, treatment
  instructions, or assured performance outcomes.

Record PWA smoke results with `docs/vv/mobile_test_results_template.md`, using
`Platform = PWA browser` and `Test stage = PWA smoke`.

## Emulator And Simulator Smoke Scope

Run this after a minimal native development build exists:

Prerequisite:

- Runtime readiness gate is ready or this run is recorded as blocked.

- app launches without native crash;
- capture, metrics, ROM, and sharing navigation works;
- Japanese and English labels fit without overlap;
- active team and athlete draft state persists locally;
- mock API can submit a sample video record;
- local upload retry simulation preserves video metadata after interruption;
- tracking submission remains separate from local upload retry simulation;
- video preview and simple overlay fit common phone dimensions;
- tracking status, model version, confidence policy, and phase confidence render;
- no user-facing text presents clinical conclusions, health forecasts, treatment
  instructions, or assured performance outcomes.

Known limits:

- emulator/simulator camera behavior is not enough for frame-rate, file-size,
  permission, or real capture decisions;
- emulator/simulator overlay performance is not enough for field-readiness
  decisions;
- emulator/simulator success cannot pass the mobile stack gate alone.

## Physical Device Verification Scope

Run this before accepting the mobile stack ADR:

- record a representative pitching video with the device camera;
- import an existing pitching video from the media library;
- capture actual frame rate, resolution, file size, and duration;
- attach athlete, team, session, camera view, and frame-rate metadata;
- preserve the local draft after app restart;
- simulate interrupted upload and retry without losing metadata;
- confirm backend upload-session completion, not local draft state alone, is the
  gate for formal tracking submission;
- render a video preview with phase markers and overlay;
- verify low-confidence or failed-state text remains capture/measurement focused;
- verify common phone sizes do not overlap controls, metrics, video overlay, or
  caution text.

## Minimum Device Matrix

Before field prototype Go/Conditional Go:

| Platform | Minimum | Notes |
| --- | ---: | --- |
| Android emulator | 1 | Recent Android version with typical phone viewport |
| iOS simulator | 1 | Recent iOS version with typical phone viewport |
| Physical Android | 1 | Mid-range or common field device |
| Physical iPhone | 1 | Recent iPhone likely to be used by coaches/trainers |

Before MVP release candidate:

| Platform | Minimum | Notes |
| --- | ---: | --- |
| Physical Android | 2 | Include at least one mid-range device |
| Physical iPhone | 2 | Include at least one non-latest model |

## Evidence To Record

Each run should record:

- test date;
- tester;
- build ID;
- device or emulator name;
- OS version;
- app version;
- capture/import result;
- frame rate, resolution, file size, and duration for physical videos;
- local draft persistence result;
- upload retry result;
- upload-session completion or blocked-tracking result;
- overlay review result;
- known limitations;
- screenshots or screen recordings when useful.

Do not commit athlete-identifying videos, screenshots, or consent artifacts to
git.

Use `docs/vv/mobile_test_results_template.md` for each run. Dated result files
should live in `docs/vv/` when they contain only safe, non-identifying
summaries. Private media artifacts should be referenced by opaque private URIs
or internal review IDs, not committed to git.
