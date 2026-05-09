# Sample Pitching Video Manifest

Status: Draft template, no approved sample set yet
Owner: Sports Motion product / QA
Created: 2026-05-06
Last reviewed: 2026-05-09

This manifest defines the sample-video set needed for the Milestone 2 tracking
feasibility gate. Do not commit original videos, athlete names, faces, consent
forms, or identifying metadata to this repository.

The product remains specialist evaluation support. Sample-video evaluation must
not be used for clinical conclusions, health forecasts, treatment instructions,
or assured performance claims.

## Storage And Privacy Rules

- Store original videos outside git in an approved private object store or secure
  review folder.
- Use opaque sample IDs in this repository.
- Keep consent and usage-right evidence outside git with access limited to
  approved reviewers.
- Record only coarse athlete descriptors needed for tracking evaluation:
  age group, throwing arm, role, and capture context.
- Remove or avoid unnecessary faces, names, jerseys, school names, and location
  identifiers in derived artifacts.
- Derived tracking artifacts must preserve model version, adapter version,
  confidence policy version, and sample ID.

## Required Sample Set

| Case | Required count | Current count | Status |
| --- | ---: | ---: | --- |
| Good open-side capture | 5 | 0 | Missing |
| Good catcher-view capture | 3 | 0 | Missing |
| Closed-side or partially occluded capture | 3 | 0 | Missing |
| Low light or background clutter | 3 | 0 | Missing |
| Youth/high-school form variation | 3 | 0 | Missing |
| College/adult high-intent bullpen | 5 | 0 | Missing |
| Known bad framing | 3 | 0 | Missing |

Minimum total before gate review: 25 samples.

Current readiness decision: `blocked`. The repository contains placeholder rows
only. No private sample has approved usage rights, complete metadata, and a
non-identifying artifact reference ready for candidate evaluation.

## Manifest Fields

Each sample row must include:

| Field | Required | Notes |
| --- | --- | --- |
| `sample_id` | yes | Opaque ID such as `sma_open_001` |
| `case_type` | yes | One of the required sample cases |
| `storage_uri` | yes | Private URI, never a public link |
| `usage_rights_status` | yes | `approved`, `pending`, or `rejected` |
| `age_group` | yes | `youth`, `high_school`, `college_adult` |
| `throwing_arm` | yes | `right` or `left` |
| `role` | yes | `pitcher` or `two_way` |
| `camera_view` | yes | `open_side`, `catcher_view`, `closed_side`, or `other` |
| `frame_rate_fps` | yes | Actual source frame rate |
| `resolution` | yes | Example: `1920x1080` |
| `duration_ms` | yes | Clip duration in milliseconds |
| `capture_distance_m` | yes | Approximate camera distance |
| `whole_body_visible_foot_contact` | yes | `yes`, `partial`, or `no` |
| `whole_body_visible_release` | yes | `yes`, `partial`, or `no` |
| `lighting_quality` | yes | `good`, `mixed`, or `poor` |
| `background_clutter` | yes | `low`, `medium`, or `high` |
| `expected_outcome` | yes | `complete`, `warning`, `failed_retryable`, `failed_unusable` |
| `review_notes` | no | Capture-context notes only |

## Draft Rows

Use this table as a working manifest once private sample IDs exist.

| sample_id | case_type | storage_uri | usage_rights_status | age_group | throwing_arm | role | camera_view | frame_rate_fps | resolution | duration_ms | capture_distance_m | whole_body_visible_foot_contact | whole_body_visible_release | lighting_quality | background_clutter | expected_outcome | review_notes |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | ---: | ---: | --- | --- | --- | --- | --- | --- |
| `sma_open_001` | Good open-side capture | `private://pending/sma_open_001` | pending | college_adult | right | pitcher | open_side | 240 | TBD | TBD | TBD | TBD | TBD | good | low | complete | Placeholder only |
| `sma_low_light_001` | Low light or background clutter | `private://pending/sma_low_light_001` | pending | college_adult | right | pitcher | open_side | 120 | TBD | TBD | TBD | TBD | TBD | poor | medium | warning | Placeholder only |
| `sma_bad_frame_001` | Known bad framing | `private://pending/sma_bad_frame_001` | pending | high_school | left | pitcher | open_side | 60 | TBD | TBD | TBD | no | partial | mixed | high | failed_retryable | Placeholder only |

## Evaluation Output Fields

Each adapter/provider run against a sample must produce:

| Field | Required | Notes |
| --- | --- | --- |
| `sample_id` | yes | Must match manifest |
| `candidate_id` | yes | Provider/model from `tracking_shortlist.md` |
| `candidate_version` | yes | Exact tested version |
| `adapter_version` | yes | App adapter version |
| `run_id` | yes | Tracking run or test run ID |
| `run_status` | yes | `completed`, `completed_with_warnings`, `failed_retryable`, `failed_unusable` |
| `overall_confidence` | yes | Normalized 0.0-1.0 when available |
| `phase_event_confidence` | yes | Foot contact and release confidence or reason missing |
| `required_signal_support` | yes | Per-signal pass/warn/fail |
| `artifact_uri` | yes | Private artifact URI |
| `failure_reason` | required on failure | Capture/measurement reason only |
| `metric_support_notes` | yes | Link to metric support matrix review |

## Run Batch Header

For each dated evaluation batch, record:

| Field | Required | Notes |
| --- | --- | --- |
| `run_batch_id` | yes | Example: `tv_2026_05_20_a` |
| `run_date` | yes | ISO date |
| `candidate_id` | yes | From shortlist |
| `candidate_version` | yes | Exact tested version |
| `adapter_version` | yes | Tracking adapter version |
| `confidence_policy_version` | yes | Policy version used for suppression/failures |
| `manifest_version` | yes | Snapshot or commit reference |
| `results_doc` | yes | Dated results file under `docs/vv/` |

## Gate Use

The sample set can support a Conditional Go only when:

- every required case type has at least one approved sample;
- at least one candidate has been run on the approved samples;
- failed and low-confidence outcomes are documented;
- metric support decisions are recorded in
  `docs/metric_tracking_support_matrix.md`;
- no sample evaluation text claims clinical conclusions, health forecasts,
  treatment instructions, or assured performance outcomes.
