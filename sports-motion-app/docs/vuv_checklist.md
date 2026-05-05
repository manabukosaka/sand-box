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

- iOS: capture or import a pitching video, attach athlete metadata, upload, view
  processing status, and open the result.
- Android: capture or import a pitching video, attach athlete metadata, upload,
  view processing status, and open the result.
- Verify interrupted upload recovery or clear retry behavior.
- Verify poor network state does not lose athlete, ROM, or video metadata.
- Verify result views fit common phone sizes without overlapping metric labels,
  controls, video overlays, or caution text.

## 4. AI Tracking Verification

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
- Expired or revoked share links fail closed.
- Share access attempts are logged.

## 8. Security And Privacy Verification

- Users cannot access athletes outside their organization/team scope.
- External share viewers cannot enumerate other athletes, teams, or analysis runs.
- Revoking a share does not delete the analysis but blocks further external
  access.
- User-facing exports or shared views preserve caution labels.
- No generated text claims diagnosis, treatment, injury prediction, or guaranteed
  performance gains.

## 9. Release Evidence

Before release, collect:

- representative iOS and Android smoke-test notes;
- tracking test video matrix and outcomes;
- metric-definition and evidence-reference snapshot;
- ROM recalculation test evidence;
- external sharing access-control evidence;
- known limitations and residual risks.
