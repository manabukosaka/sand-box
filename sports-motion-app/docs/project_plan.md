# Project Plan: Sports Motion Analysis MVP

## 1. Objective

Deliver an MVP that lets a college/adult baseball team capture and manage
pitching videos, run AI markerless tracking, review evidence-backed pitching
metrics, apply ROM post-processing, and share selected analysis results with
external specialists.

The product remains specialist evaluation support. It must not present outputs as
medical diagnosis, definitive injury prediction, or guaranteed performance
improvement.

## 2. Current Status

The project is in the latter half of Milestone 1: Product Skeleton Completion.

Implemented prototype capabilities:

- Dependency-free PWA prototype under `sports-motion-app/app/`.
- English/Japanese bilingual UI.
- Domain model in `sports-motion-app/src/domain.mjs`.
- Local mock API in `sports-motion-app/src/mockApi.mjs`.
- Prototype `UploadSession` state in the mock API; tracking submission is gated
  until upload completion is recorded, and prototype processing state cannot be
  entered from a draft video.
- PWA video library controls for starting, interrupting, completing, and retrying
  prototype upload sessions.
- Active upload session creation is idempotent per video, while interrupted
  upload sessions can create a new retry attempt.
- Replaceable prototype tracking adapter contract in
  `sports-motion-app/src/trackingAdapter.mjs`.
- Browser MediaPipe Pose Landmarker baseline adapter in
  `sports-motion-app/src/browserPoseAdapter.mjs`; this can run against a selected
  local video in the PWA and maps pose-landmark confidence into the prototype
  `TrackingRun` / `AnalysisRun` pipeline.
- PWA local video playback for the selected capture/import file, with manual
  foot-contact and ball-release phase correction from the current playback time.
- Prototype `TrackingCorrection` records and corrected derived `TrackingRun` /
  `AnalysisRun` creation; source AI tracking artifacts are not overwritten.
- Local AI runtime/model asset policy in `sports-motion-app/docs/ai_model_assets.md`;
  the PWA model selector supports Lite, Full, and Heavy local pose model entries
  without CDN model loading.
- Prototype tracking failure policy for warning, retryable failure, and unusable
  failure states based on capture/measurement conditions.
- Browser `localStorage` state for the prototype.
- Smartphone camera and video import file inputs.
- Managed video draft, archive, restore, and delete states.
- Prototype team and athlete attribute editing for the active session, including
  team sport/level/notes and athlete role/age group.
- Video library keyword search plus status, camera-view, and analysis-availability
  filters.
- ROM recalculation while preserving raw tracking values.
- Prototype user-review packet for the active analysis, with reviewer role/name,
  summary, action items, caution acknowledgement, submitted review-request
  status, and share-comment scope stored separately from raw and
  ROM-adjusted metrics.
- Prototype share creation and revocation.
- Prototype share comments are included only when the share scope explicitly
  enables comments.
- Local prototype acceptance review notes in
  `sports-motion-app/docs/prototype_acceptance_review.md`.
- Draft Milestone 2 tracking feasibility gate in
  `sports-motion-app/docs/tracking_feasibility_gate.md`.
- Proposed mobile stack ADR in
  `sports-motion-app/docs/adr/0002-mobile-stack-for-field-prototype.md`.
- 2026 mobile stack refresh keeps React Native + Expo as the recommended
  installable field prototype path, but clarifies that production mobile should
  be TypeScript-first rather than plain JavaScript.
- Draft tracking provider/model shortlist in
  `sports-motion-app/docs/tracking_shortlist.md`.
- Draft sample-video manifest in
  `sports-motion-app/docs/sample_video_manifest.md`.
- Draft sample acquisition protocol in
  `sports-motion-app/docs/sample_acquisition_protocol.md`.
- Tracking feasibility sample readiness is blocked because the manifest contains
  only placeholder rows and no approved private sample set yet; see
  `sports-motion-app/docs/vv/tracking_feasibility_results_2026-05-15_sample_readiness.md`
  for the required good, low-quality, and expected-failure rows plus rights and
  capture metadata.
- Draft metric tracking support matrix in
  `sports-motion-app/docs/metric_tracking_support_matrix.md`.
- Tracking feasibility sample-run execution checklist in
  `sports-motion-app/docs/tracking_sample_run_plan.md` and dated results
  template in `sports-motion-app/docs/vv/tracking_feasibility_results_template.md`.
- Mobile V&V evidence template in
  `sports-motion-app/docs/vv/mobile_test_results_template.md`.
- Sports Motion App development process, autonomous planning queue, and
  retrospective notes are tracked in `sports-motion-app/docs/`.
- Native field prototype WBS is tracked in
  `sports-motion-app/docs/planning/wbs_2026-05-13_native_field_prototype.md`.
- Sub-agent execution defaults to a 3-lane review pattern (Product,
  Architecture, QA) with conditional Security lane for sharing/privacy slices.
- Native field prototype spike plan in
  `sports-motion-app/docs/native_field_prototype_spike.md`.
- Isolated React Native + Expo native scaffold under `sports-motion-app/mobile`
  with capture/import, bilingual navigation, local draft persistence, metrics,
  ROM, sharing prototype surfaces, permission status display, selected-video
  metadata display, `expo-video` local video preview with phase markers, and
  local-only upload retry simulation.
- Native review packet fields now cover reviewer role/name, summary, action
  items, caution acknowledgement, user-review request status, and
  share-comment include/exclude behavior as local prototype state.
- Native emulator/simulator smoke is blocked until the local Node runtime is
  upgraded from `18.19.1` to `>=20.19.4`; the latest blocked runtime check is
  recorded in the native spike, mobile test plan, and dated V&V evidence.
- Mobile TypeScript code-level verification now runs through
  `sports-motion-app/mobile` with `npm run typecheck`; Expo dev-client help is
  available as `npm run check:dev-client`.
- Node test suite covering domain, mock API, upload session gating/retry,
  prototype tracking adapter behavior, tracking failure policy, metric
  suppression, manual phase correction provenance, analysis review packet
  behavior, and share scope behavior.

Not yet implemented:

- Production mobile stack.
- Production backend API, authentication, object storage, or real resumable
  upload transport.
- Post-gate production backend/security planning is now documented in
  `sports-motion-app/docs/planning/wbs_2026-05-15_backend_security_post_gate_plan.md`,
  but implementation remains deferred until the relevant mobile and tracking
  gates close.
- Real AI markerless tracking pipeline.
- Production-approved AI tracking provider/model. The browser MediaPipe baseline
  is an executable feasibility harness, not a formal production provider.
- Multi-team and multi-athlete management beyond the active prototype records.
- Full video filtering by athlete, team, and capture date.
- Production video player overlay editing, frame-accurate scrubbing controls,
  and multi-event correction review are not yet implemented.
- Real access control for external sharing.
- Production backend upload-session state machine and queue-idempotent tracking
  submit flow are still design-only and not implemented.
- Production share-scope enforcement and access-log API behavior remain
  design-level until backend implementation and V&V evidence are completed.

## 3. Milestone 0: Discovery / Stack / Evidence Validation

Purpose: confirm the product direction and remove the highest-risk technical and
domain unknowns before committing to a production mobile/backend stack.

Work items:

- Confirm the target workflow with coaches, trainers, and external specialists.
- Validate smartphone capture constraints for single-camera baseball pitching
  video, including camera view, frame rate, distance, lighting, and athlete fit
  in frame.
- Evaluate mobile stack candidates for installable iOS/Android delivery,
  camera/video capture, overlay rendering, local storage, and team maintainability.
- Shortlist AI tracking providers or models and run a feasibility test with sample
  pitching videos.
- Build the first standard ROM source list and evidence review checklist.
- Review `evidence_metrics.md` with a domain specialist.

Exit criteria:

- One recommended mobile stack and one backup option are documented.
- One recommended AI tracking approach and known limitations are documented.
- A sample pitching-video test set exists with good-quality, low-quality, and
  expected-failure cases.
- Capture guidance is clear enough for field testing.
- Evidence metric catalog has a documented review outcome.

## 4. Milestone 1: Product Skeleton Completion

Purpose: complete the runnable product skeleton before integrating real AI
tracking or production infrastructure.

Already completed in prototype:

- PWA shell with capture, metrics, ROM, and sharing views.
- Local domain model and mock API boundary.
- Deterministic prototype `TrackingAdapter` boundary for future provider/model
  replacement.
- PWA summary display for tracking status, model version, confidence policy, and
  phase-event confidence.
- PWA local selected-video playback and manual correction controls for
  foot-contact and ball-release phase markers.
- Smartphone camera/import entry points.
- Managed video records with draft/archive/delete behavior.
- Active-session team and athlete attribute editing, including baseball profile
  fields needed for the MVP skeleton.
- Video library keyword search plus status, camera-view, and analysis-availability
  filters.
- Explicit prototype transitions for processing and failed video states.
- ROM-adjusted recalculation as a separate layer from raw values.
- Manual phase correction as a derived tracking and analysis layer, preserving
  the original model-generated run.
- Prototype result sharing and revocation.
- Prototype metric suppression based on tracking quality and confidence policy.
  - Prototype share scope behavior for video, evidence notes, and comments,
    including comment exclusion by default.
- Local prototype acceptance review notes.

Remaining work:

- Add multi-team and multi-athlete switching or creation once the production
  data boundary is chosen.
- Extend video library filters beyond keyword/status/camera view/analysis
  availability to athlete, team, and capture date.
- Replace manual prototype processing/failed state controls with asynchronous
  worker-driven transitions after the tracking adapter is selected.

Exit criteria:

- A coach can create or edit team and athlete attributes in the prototype.
- A coach can capture or import a video, save it as a managed video record, find
  it later, and submit it for prototype tracking.
- A coach can filter the video library and analysis history by key attributes.
- A coach can edit individual ROM values initialized from standard defaults.
- The prototype clearly distinguishes draft, uploaded, processing, analyzed,
  failed, archived, deleted, and re-analysis states.
- Local prototype acceptance review notes are recorded.
- Local verification passes with `npm test` and
  `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness`.

## 5. Milestone 2: Tracking Feasibility And Metric Pipeline

Purpose: prove that the planned AI tracking and metric pipeline is viable before
promoting metrics into formal product evaluation.

Entry gate:

- `docs/tracking_feasibility_gate.md` is reviewed and moved from draft to a
  Go, Conditional Go, or No-Go decision.
- Mobile stack decision ADR is reviewed and either accepted or sent back for a
  spike.
- Android emulator and iOS simulator smoke results exist for the native
  development build.
- Physical Android and physical iPhone verification results exist for capture,
  import, local draft persistence, upload retry, and overlay review before the
  mobile stack ADR can be accepted.
- AI tracking provider/model shortlist is reviewed with versions, licensing,
  cost, latency, privacy, and validation notes.
- Sample pitching-video test set exists with consent/usage rights and capture
  metadata.
- Metric tracking support matrix is reviewed for each initial evidence metric.
- Markerless tracking confidence and failure policy is drafted from sample-set
  results.
- Formal/provisional/experimental metric promotion policy is agreed.

Work items:

- Integrate the selected AI tracking pipeline behind the existing mock API
  boundary or a replaceable adapter.
- Store `TrackingRun` outputs with model version, skeleton time series, phase
  markers, confidence values, and failure reasons.
- Implement versioned `MetricDefinition` and `EvidenceReference` records as real
  application data rather than hard-coded prototype constants.
- Implement raw metric calculation for the initial pitching metric candidates.
- Implement ROM post-processing while preserving raw values.
- Implement backend-owned upload sessions and prevent tracking jobs from being
  enqueued until upload completion is confirmed.
- Label low-confidence and experimental metrics in all result views.

Exit criteria:

- A sample pitching video produces visible skeleton overlay and phase markers.
- Interrupted upload retry preserves draft/video metadata and tracking submission
  waits for confirmed upload completion.
- Raw and ROM-adjusted metrics are stored separately and reference model,
  metric-definition, and ROM-profile versions.
- Low-confidence videos produce understandable failed or caution states.
- Experimental metrics are not used in formal summaries.
- Tracking limitations are documented for product, QA, and specialist review.

## 6. Milestone 3: Review, History, And Sharing

Purpose: make the app useful for repeated team review and controlled specialist
collaboration.

Work items:

- Build athlete history with videos, tracking runs, analysis runs, ROM profile
  versions, and annotations.
- Build prior-analysis comparison for the same athlete.
- Add comments and annotations for coaches, trainers, athletes, and external
  specialists.
- Implement limited external sharing with expiration, revocation, scope, and
  access logging.
- Ensure shared views can include or exclude video, overlays, evidence notes, and
  comments.

Exit criteria:

- A coach can review an athlete's current and prior pitching analyses.
- A coach can compare analyses without silently mixing metric versions.
- A coach can share one analysis externally without exposing the full athlete
  history.
- Revoked or expired shares fail closed.
- Share access attempts are auditable.

## 7. Milestone 4: Production Readiness / V&V

Purpose: prepare a release candidate with enough verification, validation, and
operational evidence for controlled MVP rollout.

Work items:

- Verify mobile flows on representative iOS and Android devices.
- Verify capture/import, upload, processing, failed, re-analysis, archive, delete,
  sharing, and revocation paths.
- Verify that metric definitions, evidence references, ROM profiles, tracking
  runs, and analysis outputs are versioned and auditable.
- Review all user-facing language for diagnosis, injury prediction, and
  performance guarantee risk.
- Document known markerless tracking limitations and residual risks.
- Define retention, export, deletion, and recovery policy for videos and analysis
  artifacts.

Exit criteria:

- End-to-end workflow passes from team/athlete setup to external share revocation.
- Raw tracking and ROM-adjusted outputs remain separate in tests.
- Experimental metrics are not used in formal summaries.
- Access control and sharing behavior have security review evidence.
- Release notes include known limitations, residual risks, and rollback/recovery
  considerations.

## 8. MVP Acceptance Scenarios

- Coach creates or edits a team, then creates or edits an athlete with baseball
  profile attributes.
- Coach captures a pitching video with the smartphone camera, saves it as a draft
  managed video, finds it in the video library, and submits it for tracking.
- Coach imports an existing pitching video from the media library and manages it
  through draft, uploaded, archived, restored, and deleted states.
- Worker or adapter creates tracking output with skeleton, phases, confidence,
  model version, and failure/caution metadata.
- Analysis displays raw metrics, ROM-adjusted metrics, ROM ratios, evidence notes,
  and confidence warnings without presenting diagnosis or injury prediction.
- Coach changes ROM profile and triggers re-analysis without overwriting prior raw
  tracking or historical analysis versions.
- Coach shares selected analysis externally, then revokes access and verifies the
  external view is unavailable.
- Coach confirms shared-result defaults are minimum disclosure and metric tables
  remain the required minimum payload for a valid shared analysis.
- Coach confirms share expiry policy behavior (fixed MVP TTL) and verifies denied
  external access after expiry.
- Internal staff confirms share access logs capture allowed and denied attempts,
  including revoked or expired access attempts.

## 9. Risks And Decision Gates

- Single-camera markerless tracking may not support every proposed metric with
  enough reliability.
- Torque-related metrics may need to remain proxy or experimental metrics.
- Ball velocity may require manual input or external data if video-only estimates
  are unreliable.
- ROM standardization requires careful source selection and update policy.
- External sharing introduces privacy and access-control requirements early in the
  MVP.
- Production stack selection should not happen until camera capture, overlay
  rendering, and AI tracking feasibility are tested against real pitching videos.
- Phase 2 implementation should not start until the tracking provider/model,
  confidence policy, and metric promotion policy are documented.

## 10. Verification Commands

Use these commands for this project plan and related Sports Motion App changes:

```bash
npm test
.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
```

For local UI review, run the prototype and open:

```text
http://127.0.0.1:4173/app/
```
