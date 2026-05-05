# Project Plan: Sports Motion Analysis MVP

## 1. Objective

Deliver an MVP that lets a college/adult baseball team capture pitching videos,
run AI markerless tracking, review evidence-backed pitching metrics, apply ROM
post-processing, and share selected analysis results with external specialists.

## 2. Phase 0: Discovery And Validation

- Confirm target user workflow with coaches, trainers, and external specialists.
- Validate capture constraints for single-camera smartphone pitching video.
- Select candidate mobile stack for a prototype evaluation.
- Select candidate AI tracking approach and run a small pitching-video feasibility
  test.
- Build the first standard ROM source list and evidence review checklist.

Exit criteria:

- One recommended mobile stack and one backup option.
- One recommended tracking approach and known limitations.
- Draft capture guide for MVP tests.
- Evidence metric catalog reviewed by domain specialist.

## 3. Phase 1: Product Skeleton

- Implement organization, team, user, athlete, and role model.
- Implement athlete profile and ROM profile CRUD.
- Implement video capture/import metadata flow in the mobile app.
- Implement backend video metadata and upload orchestration.
- Implement analysis status model and basic result placeholders.

Exit criteria:

- A coach can create an athlete and upload or register a pitching video.
- A coach can edit individual ROM values initialized from standard defaults.
- The system can represent pending, processing, failed, and completed analysis.

## 4. Phase 2: Tracking And Metrics

- Integrate the selected AI tracking pipeline.
- Store `TrackingRun` outputs with model version, skeleton time series, phase
  markers, and confidence values.
- Implement versioned `MetricDefinition` and `EvidenceReference` records.
- Implement raw metric calculation for the initial pitching metric candidates.
- Implement ROM post-processing while preserving raw values.

Exit criteria:

- A sample pitching video produces visible skeleton overlay and phase markers.
- Raw and ROM-adjusted metrics are stored in separate fields or records.
- Metric outputs reference model, metric-definition, and ROM-profile versions.
- Low-confidence and experimental metrics are labeled.

## 5. Phase 3: Review, History, And Sharing

- Build mobile analysis result view with video overlay, phase timeline, metric
  cards, evidence notes, and ROM comparison.
- Build athlete history and prior-analysis comparison.
- Implement comments/annotations for coaches, trainers, and specialists.
- Implement limited external sharing with expiration, revocation, scope, and
  access logging.

Exit criteria:

- A coach can review an athlete's current and prior pitching analyses.
- A coach can share one analysis externally without exposing the full athlete
  history.
- Revoked or expired shares fail closed.

## 6. Phase 4: V&V Readiness

- Create a test set with good-quality, low-quality, failed, and re-analysis
  pitching videos.
- Verify mobile flows on representative iOS and Android devices.
- Verify that metric definitions, evidence references, ROM profiles, and analysis
  outputs are versioned and auditable.
- Review all caution language for diagnosis, injury prediction, and performance
  guarantee risk.
- Document known markerless tracking limitations.

Exit criteria:

- End-to-end workflow passes from athlete creation to external share revocation.
- Raw tracking and ROM-adjusted outputs remain separate in tests.
- Experimental metrics are not used in formal summaries.
- Release notes include residual risks and out-of-scope items.

## 7. MVP Acceptance Scenarios

- Coach creates athlete, edits ROM profile, uploads pitching video, and sees
  processing status.
- Worker creates tracking output with skeleton, phases, confidence, and model
  version.
- Analysis displays raw metrics, ROM-adjusted metrics, ROM ratios, evidence notes,
  and confidence warnings.
- Coach changes ROM profile and triggers re-analysis without overwriting the prior
  analysis.
- Coach shares selected result externally, then revokes the share.

## 8. Risks To Track

- Single-camera markerless tracking may not support every proposed metric with
  enough reliability.
- Torque-related metrics may need to remain proxy or experimental metrics.
- Ball velocity may require manual input or external data if video-only estimates
  are unreliable.
- ROM standardization requires careful source selection and update policy.
- External sharing introduces privacy and access-control requirements early in the
  MVP.
