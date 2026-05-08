# Architecture: Sports Motion Analysis Mobile App

## 1. Architecture Goals

- Support an installable iOS and Android app for field capture and review.
- Keep formal biomechanics analysis auditable, versioned, and reproducible.
- Separate raw AI tracking, ROM-adjusted interpretation, and human comments.
- Allow evidence-based metric definitions to evolve without corrupting previous
  analysis results.
- Treat the app as specialist evaluation support, not as a medical device or
  diagnostic system.

## 2. System Overview

The MVP uses a hybrid architecture:

- Mobile app: video capture/import, athlete selection, upload, lightweight
  preview, result review, ROM editing, comments, and sharing controls.
- API backend: identity, team/athlete data, video metadata, analysis orchestration,
  metric definitions, ROM profiles, sharing, and audit trails.
- Object storage: original video, derived preview media, overlay assets, and raw
  tracking artifacts.
- Analysis workers: AI tracking, pitching phase detection, metric calculation,
  ROM post-processing, confidence calculation, and re-analysis jobs.
- Evidence registry: versioned metric definitions and references to the literature
  used for each metric.

## 3. Component Responsibilities

### Mobile App

- Capture or import pitching videos.
- Collect capture context such as athlete, throwing arm, session, and camera-view
  notes.
- Keep local draft metadata until backend upload records and object-storage
  upload state are confirmed.
- Upload videos with resumable state where supported, and retry interrupted
  upload attempts without losing athlete, session, camera-view, or selected-video
  metadata.
- Display analysis status, video overlays, phase timeline, metrics, ROM-adjusted
  outputs, evidence notes, and specialist comments.
- Allow coaches and trainers to edit athlete ROM profiles.
- Create, revoke, and inspect external share links.

### API Backend

- Own organizations, teams, users, athletes, permissions, and external shares.
- Store video metadata and issue scoped upload/download access.
- Own upload session state, including retryable interruption, completion, and
  expiration. The backend should not infer formal tracking readiness from local
  mobile draft state alone.
- Create tracking and analysis jobs.
- Persist versioned metric definitions, ROM profiles, tracking runs, analysis
  runs, annotations, and share access logs.
- Enforce that raw tracking outputs are immutable after a tracking run completes.
- Trigger re-analysis when a metric definition or ROM profile changes.

### Analysis Workers

- Consume queued jobs for tracking and analysis.
- Run AI markerless tracking on uploaded pitching video.
- Detect pitching phases and key events.
- Generate raw biomechanical metrics from tracking output.
- Apply ROM post-processing using the selected ROM profile.
- Emit confidence and caution metadata for joints, phases, and metrics.
- Write deterministic analysis artifacts tied to model, metric, and ROM versions.

### Evidence Registry

- Stores the current set of evidence-backed metric definitions.
- Links each metric to references, study population, measurement context, and
  adoption rationale.
- Classifies metrics as formal, provisional, or experimental.
- Keeps historical versions available for audit and re-analysis.

## 4. Data Flow

1. A coach creates or selects an athlete.
2. The coach captures or imports a pitching video in the mobile app.
3. The mobile app stores a local draft containing team, athlete, session,
   camera-view, capture source, and selected-video metadata.
4. The mobile app creates a backend `MotionVideo` draft.
5. The mobile app requests an upload session, uploads video bytes to object
   storage through backend-controlled access, and records retry/interruption
   state locally until the backend confirms completion.
6. The backend marks the `MotionVideo` uploaded and creates a `TrackingRun` job
   only after upload completion is confirmed.
7. The worker produces skeleton time series, phase markers, confidence values,
   and model-version metadata.
8. The backend creates an `AnalysisRun` using the active `MetricDefinition`
   versions and selected `RomProfile`.
9. The worker computes raw metrics, ROM-adjusted metrics, ROM ratios, deviations,
   and caution metadata.
10. The mobile app displays the result and can compare it with the athlete's prior
   analysis runs.
11. A coach can share selected result views with external specialists.

## 5. Core Domain Model

- `Organization`: tenant boundary and billing/administration unit.
- `Team`: roster and staff grouping inside an organization.
- `User`: coach, trainer, athlete, admin, or external specialist identity.
- `Athlete`: player profile and longitudinal motion-analysis subject.
- `MotionVideo`: uploaded/captured video plus capture metadata.
- `UploadSession`: scoped upload lease, retry state, and object-storage target for
  one `MotionVideo`.
- `TrackingRun`: immutable AI tracking output and model provenance.
- `AnalysisRun`: raw and ROM-adjusted derived metrics for one tracking run.
- `RomProfile`: standard and individual ROM values selected for an athlete.
- `MetricDefinition`: versioned calculation and evidence contract.
- `EvidenceReference`: publication metadata and adoption rationale.
- `Annotation`: scoped human comments and review notes.
- `ShareLink`: external access envelope and audit state.

## 6. Key Design Decisions

- Store raw tracking output separately from analysis metrics.
  This preserves the ability to re-run metric and ROM post-processing without
  changing the original AI estimate.
- Version model, metric definition, and ROM profile inputs on every analysis run.
  This makes historical results explainable when evidence or configuration
  changes.
- Use asynchronous cloud analysis for formal results.
  This avoids relying on device performance for compute-heavy tracking while
  keeping the mobile experience lightweight.
- Treat single-camera markerless results as evidence-supported estimates.
  The UI must expose confidence and measurement-context limits.
- Keep external sharing result-scoped, expiring, and revocable.
  Sharing must not grant broad organization or athlete history access by default.
- Make backend `UploadSession` state authoritative for formal tracking readiness.
  Local draft/upload UI state improves continuity but cannot enqueue tracking.

## 7. Failure Modes

- Upload interrupted: keep local pending state and backend upload session state
  separate, allow retry, and do not enqueue tracking until upload completion is
  confirmed.
- Upload session expired: keep local draft metadata, request a new upload
  session, and preserve the original `MotionVideo` draft if the user retries.
- Duplicate upload-session request: return current active session instead of
  creating conflicting active sessions.
- Duplicate tracking submission: treat as idempotent while an existing run is
  queued/processing, and avoid duplicate worker enqueue.
- Unsupported or poor-quality video: mark the tracking run failed with a clear
  reason and keep the original video for review or retry.
- Low-confidence tracking: complete the run only if enough required signals exist,
  then flag low-confidence joints, phases, and metrics.
- Metric definition updated: prior analysis remains unchanged until explicit or
  automatic re-analysis creates a new versioned analysis run.
- ROM profile updated: existing results can be recalculated, but old ROM-adjusted
  outputs remain auditable.
- Share revoked or expired: external access fails closed.

## 8. Open Architecture Decisions

- Select the mobile implementation stack after evaluating React Native, native
  iOS/Android, and Flutter against video capture, upload, overlay rendering, and
  long-term team capability.
- Select initial AI tracking provider or model after validating pitching-specific
  keypoint quality, licensing, cloud cost, latency, and model-version controls.
- Define exact storage technology after choosing deployment target and expected
  video volume.
- Decide whether ball velocity is captured from integrated ball-tracking data,
  manual entry, video estimate, or omitted from MVP formal metrics.
