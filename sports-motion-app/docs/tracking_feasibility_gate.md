# Tracking Feasibility Gate

Review owner: Sports Motion product / mobile architecture
Initial gate date: 2026-05-06
Status: Draft gate, not yet passed

This gate must pass before the project moves from Milestone 1 product skeleton
work into Milestone 2 real tracking and metric pipeline implementation.

The app remains specialist evaluation support. The gate must not promote any
output as medical diagnosis, definitive injury prediction, or guaranteed
performance improvement.

## 1. Gate Outcome

The gate can end in one of three states:

- Go: one tracking approach is approved for a bounded prototype integration.
- Conditional Go: one approach is approved with explicit capture constraints,
  metric limits, and failure handling.
- No-Go: tracking quality, licensing, cost, latency, or auditability is not
  sufficient for the next implementation slice.

The decision record must include date, reviewers, candidate versions, sample
video set version, known limitations, and the exact metrics allowed to proceed.

## 2. Required Decisions

### Mobile Stack

Record one recommended stack and one backup option for:

- iOS and Android installable delivery.
- Camera capture and media-library import.
- Local draft state and upload retry.
- Video overlay rendering.
- Offline-tolerant field workflow.
- Long-term team maintainability.

No production stack is selected in this document. The decision must be captured
in an ADR when made.

### Tracking Provider Or Model Shortlist

Create a shortlist with at least two credible options. For each candidate,
record:

- model or provider name and version;
- deployment mode: cloud, device, hybrid, or research-only;
- license and commercial-use constraints;
- required video input format and frame-rate assumptions;
- available keypoints and whether pelvis, trunk, shoulder, elbow, wrist, and
  lower-body signals are usable for pitching;
- model versioning and artifact retention support;
- expected latency and cost;
- privacy and data residency constraints;
- known failure modes;
- evidence source or validation source reviewed.

Current state: not selected.

### Sample Pitching Video Test Set

Build a test set before choosing a tracking approach. The set must include:

| Case | Minimum count | Purpose |
| --- | ---: | --- |
| Good open-side capture | 5 | Baseline single-camera pitching review |
| Good catcher-view capture | 3 | Validate non-open-side behavior and limits |
| Closed-side or partially occluded capture | 3 | Expected caution/failure behavior |
| Low light or background clutter | 3 | Confidence and failure policy |
| Youth/high-school form variation | 3 | Age-group robustness review |
| College/adult high-intent bullpen | 5 | MVP target population |
| Known bad framing | 3 | User-understandable failed state |

Each sample must record consent/usage rights, athlete age group, camera view,
frame rate, resolution, duration, capture distance, and whether the whole body
is visible at foot contact and release.

## 3. Tracking Acceptance Criteria

A candidate can pass the gate only if it can produce, for the approved capture
contexts:

- stable skeleton time series for the required joints;
- foot contact and ball release phase markers or enough data for a phase adapter;
- model name, model version, run timestamp, and artifact URI;
- per-joint or per-signal confidence where available;
- overall confidence;
- deterministic enough output to support re-analysis provenance;
- failed-state reasons that a coach can act on.

Minimum required signals for the first implementation slice:

- shoulder, elbow, wrist, hip/pelvis, knee, ankle keypoints;
- trunk or shoulder-hip orientation estimate;
- frame-level timestamps or frame indices;
- foot contact event candidate;
- ball release event candidate or explicit "not available" reason.

## 4. Confidence And Failure Policy

The first real tracking adapter must classify each run as:

- completed: required signals are available above threshold;
- completed_with_warnings: core output exists but one or more metric groups are
  low confidence;
- failed_retryable: capture or processing issue may be fixed by retrying;
- failed_unusable: video cannot support the requested analysis.

User-facing failure and warning text must focus on capture or measurement
conditions, not athlete health, pain, injury, or readiness.

Initial policy thresholds are placeholders until measured on the sample set:

- overall confidence below 0.60: fail or require specialist caution;
- phase-event confidence below 0.70: hide phase-dependent formal metrics;
- keypoint confidence below 0.70 for required joints: suppress affected metrics;
- repeated occlusion around foot contact or release: fail phase-dependent
  metrics even if other frames look usable.

Thresholds must be versioned with the tracking adapter and reviewed after the
sample-video evaluation.

## 5. Metric Promotion Policy

Metric maturity must follow `docs/evidence_metrics.md`.

Promotion from experimental to provisional, or provisional to formal, requires:

- required tracking signals are reliably available in the approved capture
  context;
- calculation is deterministic and versioned;
- evidence reference, population, and measurement context are visible;
- low-confidence behavior suppresses or labels the metric correctly;
- historical re-analysis does not overwrite raw tracking artifacts;
- QA has tests for good, low-confidence, failed, and re-analysis cases;
- the UI avoids diagnosis, treatment, injury prediction, or performance
  guarantee language.

Torque-related metrics remain proxy or experimental unless direct validated
estimation is separately justified.

## 6. Implementation Slice After Gate

If the gate passes, the next implementation slice should add a replaceable
tracking adapter behind the existing mock API boundary:

- `TrackingAdapter` contract for video input, run metadata, phase events,
  confidence values, and failure reasons.
- sample artifact loader for deterministic local tests;
- `TrackingRun` status mapping for queued, processing, completed,
  completed_with_warnings, failed_retryable, and failed_unusable;
- metric suppression based on required signal confidence;
- evidence and metric maturity labels preserved in the UI.

Do not add production authentication, object storage, or real share-link access
control in the same slice unless the mobile/backend boundary has been selected.

## 7. Verification Evidence Required

Before the gate can pass, attach or link:

- mobile stack decision ADR;
- tracking shortlist review table;
- sample-video set manifest;
- sample-video evaluation result summary;
- confidence/failure policy version;
- metric promotion decision list;
- updated V&V checklist items for the selected adapter.

## 8. Open Questions

- Is ball velocity in MVP supplied manually, from an external source, omitted, or
  treated as experimental?
- Which camera views are allowed for formal/provisional metrics?
- Are youth/high-school users in the first field trial, or is the first trial
  limited to college/adult pitchers?
- What data-retention policy applies to original videos and derived tracking
  artifacts during feasibility testing?
- Who signs off on evidence metric promotion: product, biomechanics specialist,
  QA, or all three?
