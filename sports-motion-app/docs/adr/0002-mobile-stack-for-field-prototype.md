# ADR 0002: Mobile Stack For Field Prototype

## Status

Proposed

## Date

2026-05-06

## 2026-05-13 Refresh

The original decision still stands with one clarification: production mobile
implementation should be TypeScript-first React Native with Expo development
builds, not plain JavaScript. The dependency-free JavaScript PWA remains a fast
prototype and acceptance reference only.

This refresh was made after revisiting current mobile stack signals:

- React Native New Architecture is production-ready and enabled by default in
  current React Native projects. Its bridge removal and JSI path are especially
  relevant for video, camera, and native-module escape hatches.
- React Native 0.84 makes Hermes V1 the default JavaScript engine and continues
  removing legacy architecture paths, which improves the long-term outlook for
  React Native performance and maintenance.
- Expo EAS Build remains a strong internal distribution path for installable iOS
  and Android field prototypes.
- Flutter remains the backup when custom overlay rendering or cross-platform UI
  smoothness becomes the dominant risk.
- Kotlin Multiplatform / Compose Multiplatform is now a credible modern option,
  but it adds Kotlin/iOS interop complexity and is a better fit if the team wants
  Kotlin-shared product/domain logic or a more native-first organization.
- Fully native SwiftUI and Jetpack Compose remain the performance ceiling, but
  they create two product implementations before tracking and metric feasibility
  are settled.

## Context

Sports Motion App must become an installable iOS and Android app for field
capture, video import, local draft state, upload retry, overlay review, ROM
editing, and result sharing.

The current runnable product skeleton is a dependency-free PWA prototype. That
prototype is useful for product flow validation, but it does not settle the
production mobile stack or native camera/upload behavior.

The mobile stack decision is a Milestone 2 entry gate because the selected stack
will shape:

- camera and media-library APIs;
- high-frame-rate video capture constraints;
- offline draft storage and upload retry;
- video overlay rendering;
- native module escape hatches for future model or video-processing work;
- app distribution for field testing;
- long-term maintainability for a small product team.

The app remains specialist evaluation support. The mobile stack must not push
the product toward medical diagnosis, definitive injury prediction, or
guaranteed performance claims.

## Decision

Use TypeScript-first React Native with Expo development builds as the
recommended stack for the first installable field prototype.

Use Flutter as the backup stack if the React Native/Expo spike fails on camera
capture, local video handling, overlay performance, build/distribution
constraints, or team maintainability.

Keep the existing PWA prototype as the product-flow reference until the native
prototype reaches parity for the Milestone 1 acceptance scenarios.

## Rationale

TypeScript-first React Native with Expo is the best fit for the next slice
because:

- the current prototype is JavaScript-based, so domain behavior and API contract
  tests can be migrated incrementally while adding static typing;
- TypeScript gives better maintainability than plain JavaScript for the app's
  evolving analysis, review, correction, and sharing contracts;
- Expo development builds support installable internal test builds while keeping
  a faster iteration loop than fully native apps;
- EAS Build supports development, preview, and production build profiles for iOS
  and Android;
- React Native has native-module escape hatches through the New Architecture and
  Turbo Native Modules if the app needs native video, storage, or model
  integration later;
- the hybrid architecture already keeps formal AI tracking in cloud workers, so
  the mobile app does not need to run the full biomechanics pipeline on-device in
  the first field prototype.

Flutter remains a credible backup because:

- it provides a mature cross-platform UI toolkit;
- official camera and video plugins cover core capture/playback workflows;
- Flutter can also reach iOS and Android from one codebase;
- its rendering model may be attractive for custom overlays if the React Native
  implementation is not smooth enough.

Native iOS/Android is not recommended for the first field prototype because it
would create two product surfaces before the tracking provider/model and metric
pipeline have passed feasibility.

## Alternatives Considered

### React Native With Expo Development Builds

Recommended.

Strengths:

- strong fit with the existing JavaScript prototype;
- TypeScript can harden API/domain contracts without losing the current
  iteration speed;
- good internal distribution path through EAS profiles;
- faster field-prototype iteration;
- native module escape hatch when needed;
- can preserve a shared TypeScript domain/API client later.

Risks:

- high-frame-rate capture behavior must be tested on real iOS and Android
  devices;
- video overlay performance must be measured with representative clips;
- native modules may still be needed for edge cases around video metadata,
  background upload, or local file management.

### Flutter

Backup.

Strengths:

- strong cross-platform rendering and predictable UI performance;
- official camera and video plugin path;
- broad mobile deployment support;
- useful if overlay-heavy UI becomes the dominant mobile risk.

Risks:

- less direct reuse from the current JavaScript prototype;
- adds Dart to the project;
- backend/API/domain sharing with JavaScript prototype would become a translation
  task.

### Kotlin Multiplatform With Compose Multiplatform

Watch-list / conditional alternative.

Strengths:

- modern declarative UI with Android-native roots and iOS support;
- useful if the team prefers Kotlin for shared domain and data logic;
- can share more strongly typed product contracts across platforms than a
  JavaScript PWA.

Risks:

- smaller iOS production-history surface than React Native or Flutter for many
  teams;
- native video/camera packages and iOS interop must be spiked carefully;
- would require a larger language and tooling shift from the current prototype.

### Native iOS And Native Android

Rejected for the next slice.

Strengths:

- maximum control over camera, video, background upload, and platform behavior.

Risks:

- two implementations before product and tracking feasibility are fully known;
- slower iteration for coach/trainer workflow validation;
- more coordination cost for a small early-stage team.

### PWA Only

Rejected for production, retained as prototype reference.

Strengths:

- already running;
- very fast iteration;
- useful for requirements and acceptance flow validation.

Risks:

- does not satisfy the installable iOS/Android product requirement;
- native capture, file handling, background upload, and app distribution behavior
  are not representative enough for field rollout.

## Field Prototype Spike

Execution plan: `docs/native_field_prototype_spike.md`.

Before this ADR can move from Proposed to Accepted, complete a short spike:

- create a minimal React Native + Expo development build;
- run Android emulator smoke for launch, navigation, local draft state,
  Japanese/English labels, mock API flow, and video-preview layout;
- run iOS simulator smoke for launch, navigation, local draft state,
  Japanese/English labels, mock API flow, and video-preview layout;
- capture or import a representative pitching video on physical iOS and Android
  devices;
- store a local draft record with athlete, team, camera view, frame rate, and
  session metadata;
- render a video preview with a simple overlay and phase markers;
- retry a simulated upload after app restart;
- verify Japanese/English labels fit on common phone sizes;
- document device model, OS version, frame rate, video resolution, file size, and
  any capture/import limitations.

Emulator and simulator results are early smoke evidence only. The ADR cannot be
accepted from emulator/simulator evidence alone because camera frame rate,
media-library permissions, local file behavior, upload retry, and overlay
performance must be verified on physical devices.

Go/No-Go:

- Go: React Native + Expo satisfies camera/import, draft state, overlay, and
  internal distribution needs for the field prototype.
- Conditional Go: React Native + Expo works with documented capture constraints
  or one known native-module requirement.
- No-Go: camera/import, overlay, distribution, or local file handling blocks the
  core field workflow.

## Consequences

- The next code spike should be isolated from the dependency-free PWA until the
  native prototype proves the field workflow.
- The PWA remains the acceptance reference for product behavior.
- Mobile API client and domain contracts should be designed so they can later be
  shared or translated cleanly.
- Formal tracking still remains cloud-worker responsibility until a separate
  tracking feasibility gate changes that boundary.

## References

- Expo EAS Build setup and build profiles:
  <https://docs.expo.dev/build/setup>
- Expo `eas.json` build profile documentation:
  <https://docs.expo.dev/build/eas-json/>
- React Native New Architecture overview:
  <https://reactnative.dev/architecture/landing-page>
- React Native 0.84 release notes:
  <https://reactnative.dev/blog/2026/02/11/react-native-0.84>
- React Native Turbo Native Modules introduction:
  <https://reactnative.dev/docs/turbo-native-modules-introduction>
- Flutter camera plugin recipe:
  <https://docs.flutter.dev/cookbook/plugins/picture-using-camera>
- Flutter video player recipe:
  <https://docs.flutter.dev/cookbook/plugins/play-video>
- Flutter performance best practices:
  <https://docs.flutter.dev/perf/best-practices>
- Compose Multiplatform compatibility:
  <https://kotlinlang.org/docs/multiplatform/compose-compatibility-and-versioning.html>
