# V&V Checklist: Sports Motion Analysis MVP

## 1. Purpose

This checklist defines verification and validation evidence required before an
MVP release candidate. It focuses on the highest-risk claims: AI tracking,
ROM-adjusted outputs, evidence-backed metrics, history, and external sharing.

## 2. Product Validation

- Confirm with at least one coach and one trainer that the MVP workflow matches
  field usage: create athlete, capture/upload video, review analysis, edit ROM,
  compare history, and share externally.
- Confirm that the result screen supports specialist evaluation without implying
  diagnosis, treatment, injury prediction, or guaranteed performance improvement.
- Confirm that experimental metrics are understandable and are not presented as
  formal evaluation summaries.

## 3. Mobile Flow Verification

- PWA prototype smoke: verify the current browser prototype on desktop and mobile
  browser sizes before native work starts, including upload-session retry,
  duplicate active-session prevention, upload-completion gating, ROM
  recalculation, and share revocation.
- Android emulator smoke: after the React Native + Expo development build exists,
  verify launch, navigation, Japanese/English labels, local draft state, mock API
  flow, upload retry simulation, and video-preview layout.
- iOS simulator smoke: after the React Native + Expo development build exists,
  verify launch, navigation, Japanese/English labels, local draft state, mock API
  flow, upload retry simulation, and video-preview layout.
- Physical Android verification: capture or import a pitching video, attach
  athlete metadata, preserve a local draft after app restart, retry upload, view
  processing status, and open the result.
- Physical iPhone verification: capture or import a pitching video, attach
  athlete metadata, preserve a local draft after app restart, retry upload, view
  processing status, and open the result.
- Emulator/simulator results are smoke evidence only. Camera frame rate, video
  file handling, media-library permissions, and overlay performance require
  physical-device evidence before the mobile stack ADR can be accepted.
- Verify interrupted upload recovery or clear retry behavior.
- Verify poor network state does not lose athlete, ROM, or video metadata.
- Verify tracking submission is disabled or rejected until upload completion is
  confirmed by backend upload-session state.
- Verify result views fit common phone sizes without overlapping metric labels,
  controls, video overlays, or caution text.

## 4. AI Tracking Verification

- Sample-video evaluation uses `docs/sample_video_manifest.md` and does not
  commit original videos or identifying athlete metadata to git.
- Good-quality pitching video produces a completed `TrackingRun`.
- Low-quality video produces either a completed run with confidence warnings or a
  failed run with a user-understandable reason.
- Tracking output includes model version, artifact reference, phase events, joint
  confidence, and overall confidence.
- Skeleton overlay aligns with the athlete well enough for specialist review in
  the approved test set.
- Foot contact and ball release markers are visible and expose confidence.
- Raw tracking artifacts are not overwritten by recalculation.

## 5. Metric And Evidence Verification

- Metric support decisions are recorded in
  `docs/metric_tracking_support_matrix.md` before maturity promotion.
- Every displayed metric maps to a `MetricDefinition` version.
- Every formal or provisional metric links to at least one `EvidenceReference`.
- Evidence notes include population and measurement-context limitations.
- Torque-related outputs are displayed as proxy or context metrics unless direct
  validated torque estimation exists.
- Experimental metrics are visibly labeled and excluded from formal summaries.
- Metric definition changes produce new analysis output rather than mutating old
  analysis history.

## 6. ROM Verification

- Athlete ROM profile initializes from standard defaults.
- Coach or trainer can enter individual ROM overrides.
- ROM profile changes create a new version with effective date and entered-by
  metadata.
- Raw values and ROM-adjusted values are displayed separately.
- Recalculation with a new ROM profile creates a new `AnalysisRun`.
- Historical results retain the ROM profile version used at the time.

## 7. History And Sharing Verification

- Athlete history lists videos, tracking status, analysis results, ROM versions,
  and comments in chronological order.
- Prior analyses can be compared without mixing metric versions silently.
- Share link can be created for one analysis result.
- Share scope controls whether video, comments, and evidence notes are visible.
- Share scope controls whether overlays are visible.
- Shared metric tables remain limited to one analysis result and are treated as
  the minimum shared payload in MVP.
- Default share scope excludes video, overlays, comments, and evidence details
  unless explicitly included.
- Expired or revoked share links fail closed.
- Share access attempts are logged.
- Revoked or expired external access attempts are logged as denied.

## 8. Security And Privacy Verification

- Users cannot access athletes outside their organization/team scope.
- External share viewers cannot enumerate other athletes, teams, or analysis runs.
- External share viewers cannot query share access logs.
- Revoking a share does not delete the analysis but blocks further external
  access.
- User-facing exports or shared views preserve caution labels.
- No generated text claims diagnosis, treatment, injury prediction, or guaranteed
  performance gains.

## 9. Release Evidence

Before release, collect:

- representative Android emulator and iOS simulator smoke-test notes;
- representative physical Android and physical iPhone verification notes;
- tracking test video matrix and outcomes;
- metric-definition and evidence-reference snapshot;
- ROM recalculation test evidence;
- external sharing access-control evidence;
- known limitations and residual risks.

Use `docs/vv/mobile_test_results_template.md` for mobile test evidence and keep
completed non-identifying summaries under `docs/vv/`.
