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
- Browser `localStorage` state for the prototype.
- Smartphone camera and video import file inputs.
- Managed video draft, archive, restore, and delete states.
- Prototype team and athlete attribute editing for the active session, including
  team sport/level/notes and athlete role/age group.
- Video library keyword search plus status, camera-view, and analysis-availability
  filters.
- ROM recalculation while preserving raw tracking values.
- Prototype share creation and revocation.
- Local prototype acceptance review notes in
  `sports-motion-app/docs/prototype_acceptance_review.md`.
- Draft Milestone 2 tracking feasibility gate in
  `sports-motion-app/docs/tracking_feasibility_gate.md`.
- 14 Node tests covering domain and mock API behavior.

Not yet implemented:

- Production mobile stack.
- Real backend API, authentication, object storage, or upload sessions.
- Real AI markerless tracking pipeline.
- Multi-team and multi-athlete management beyond the active prototype records.
- Full video filtering by athlete, team, and capture date.
- Real access control for external sharing.

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
- Smartphone camera/import entry points.
- Managed video records with draft/archive/delete behavior.
- Active-session team and athlete attribute editing, including baseball profile
  fields needed for the MVP skeleton.
- Video library keyword search plus status, camera-view, and analysis-availability
  filters.
- Explicit prototype transitions for processing and failed video states.
- ROM-adjusted recalculation as a separate layer from raw values.
- Prototype result sharing and revocation.
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
- Mobile stack decision is recorded in an ADR.
- AI tracking provider/model shortlist is recorded with versions, licensing,
  cost, latency, privacy, and validation notes.
- Sample pitching-video test set exists with consent/usage rights and capture
  metadata.
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
- Label low-confidence and experimental metrics in all result views.

Exit criteria:

- A sample pitching video produces visible skeleton overlay and phase markers.
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
