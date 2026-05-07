# Metric Tracking Support Matrix

Status: Draft, pending sample-video evaluation
Owner: Sports Motion biomechanics / product / QA
Created: 2026-05-06

This matrix maps baseball pitching metric candidates to the tracking signals
needed before a metric can be shown as formal, provisional, experimental, or
unsupported in the MVP.

No metric in this document is a medical diagnosis, definitive injury prediction,
treatment instruction, or guaranteed performance improvement.

## Support Levels

- Formal candidate: can be considered for formal MVP display after sample-video
  evaluation proves reliable tracking in the approved capture context.
- Provisional: useful for specialist review with visible confidence and capture
  limitations.
- Experimental: visible only with caution labels; not used in summaries,
  automated interpretation, health/readiness/risk scores, or performance
  guarantees.
- Unsupported: hide or omit for the current capture/tracking configuration.

## Signal Quality Gates

| Gate | Default threshold | Metric behavior |
| --- | ---: | --- |
| Overall tracking confidence | 0.60 | Below threshold: fail or caution all metrics |
| Phase-event confidence | 0.70 | Below threshold: suppress phase-dependent formal/provisional metrics |
| Required keypoint confidence | 0.70 | Below threshold: suppress affected metric |
| Required segment visible at foot contact/release | yes | If no: suppress affected phase-dependent metric |
| Tracking artifact versioned | yes | If no: do not use for stored analysis |

Thresholds are placeholders until the sample-video evaluation produces measured
results. Threshold changes must be versioned with the tracking adapter or
confidence policy.

## Initial Matrix

| Metric | Current catalog maturity | Required tracking signals | Phase dependency | Minimum capture context | Gate behavior before sample results |
| --- | --- | --- | --- | --- | --- |
| Shoulder maximum external rotation | Provisional | shoulder, elbow, wrist, trunk/torso orientation, phase events | Arm cocking | Open-side preferred; whole throwing arm visible | Provisional only; suppress if throwing arm is occluded or phase confidence is low |
| Elbow flexion at key events | Provisional | shoulder, elbow, wrist, phase events | Foot contact, arm cocking, release | Open-side preferred; arm visible | Provisional only; suppress affected key event when joint confidence is low |
| Trunk rotation timing/velocity | Provisional | shoulder/hip orientation, trunk orientation, frame timestamps, phase events | Arm cocking to acceleration | Open-side or catcher-view only after validation | Provisional only; suppress when torso/pelvis orientation is unstable |
| Pelvis-trunk separation | Provisional | pelvis/hip orientation, shoulder/trunk orientation, phase events | Foot contact to release | Requires reliable shoulder and hip orientation | Experimental until sample set proves orientation stability |
| Stride length | Provisional | hip/pelvis, knees, ankles, mound/scale context or normalized body measure | Foot contact | Whole lower body visible | Provisional if normalized; unsupported for absolute distance without scale |
| Trunk lateral tilt at release | Provisional | trunk orientation, shoulder/hip landmarks, release event | Release | Open-side or catcher-view after validation | Provisional only; suppress when release confidence is low |
| Release posture | Provisional | full-body keypoints, release event, camera view metadata | Release | Whole body visible at release | Provisional for qualitative/specialist review |
| Elbow varus/valgus torque proxy | Experimental | elbow angle, shoulder/hip orientation, trunk timing, phase events | Acceleration/release | Requires stable upstream signals | Experimental only; never display as injury prediction |
| Ball velocity | Conditional | external velocity source or validated video estimate | Release | External source preferred | Unsupported unless reliable source is present |
| Shoulder total arc ROM relation | Provisional | raw shoulder external rotation metric plus ROM profile | Arm cocking / ROM profile | ROM profile available | Provisional as ROM context; raw and ROM-adjusted values stay separate |
| Thoracic rotation / trunk contralateral flexion relation | Experimental | thoracic/trunk orientation, release event, ROM profile | Release | Requires trunk orientation validation | Experimental only; specialist context |

## Capture-Context Rules

- Open-side capture is the default candidate for first-pass provisional metrics.
- Catcher-view capture may support selected trunk/stride/release review only
  after sample-video evaluation.
- Closed-side or partially occluded capture defaults to warning or unsupported
  for throwing-arm metrics.
- Known bad framing must produce failed or suppressed metrics rather than
  misleading numeric output.
- Youth/high-school samples are required before age-group comparisons or
  standard-ROM defaults are treated as reliable for those groups.

## Metric Promotion Review

Each metric needs a promotion record before its maturity changes:

| Field | Required content |
| --- | --- |
| Metric ID | Stable `MetricDefinition.id` |
| Current maturity | From `docs/evidence_metrics.md` |
| Proposed maturity | Formal candidate, provisional, experimental, or unsupported |
| Sample-set version | Manifest version used for evaluation |
| Candidate/provider version | Tracking model/provider version |
| Required signal pass rate | Summary from sample evaluation |
| Failure/suppression behavior | How low-confidence output is handled |
| Evidence references | Population and measurement context |
| Reviewer sign-off | Product, biomechanics, and QA |

## Open Decisions

- Whether ball velocity is omitted, manually entered, imported from a ball-tracking
  source, or treated as experimental.
- Whether catcher-view capture is allowed for any provisional metric in the first
  field prototype.
- Whether youth/high-school metrics are in the first field trial or explicitly
  deferred.
- Whether pelvis-trunk separation can stay provisional with single-camera
  tracking or must move to experimental until a 3D/multi-view workflow exists.

## First Sample-Run Update Rules

When the first executable sample run is completed:

- add a dated summary section that references the results file under `docs/vv/`;
- record signal pass/warn/fail counts for each required signal group;
- mark each metric row as unchanged, promoted, demoted, or still blocked;
- state any suppression behavior that was confirmed by sample runs;
- keep unresolved metrics as provisional/experimental until review sign-off.
