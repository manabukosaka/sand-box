# Tracking Feasibility Readiness Note

Date: 2026-05-15
Tester: Codex
Gate: WBS 7.0 / 7.2 sample readiness
Result: Blocked

This note makes the sample-set blocker actionable before any provider/model run.
Do not start candidate execution until the required approved rows, usage-rights
evidence, and local model inventory are all in place.

## Required Sample Rows

| Group | Required rows | Purpose | Current state |
| --- | ---: | --- | --- |
| Good open-side capture | 5 | Baseline single-camera review | Missing |
| Good catcher-view capture | 3 | Non-open-side behavior and limits | Missing |
| Youth/high-school form variation | 3 | Age-group robustness review | Missing |
| College/adult high-intent bullpen | 5 | MVP target population | Missing |
| Closed-side or partially occluded capture | 3 | Warning or suppression behavior | Missing |
| Low light or background clutter | 3 | Low-confidence and failure behavior | Missing |
| Known bad framing | 3 | Expected-failure state | Missing |

Minimum total before gate review: 25 approved samples.

## Consent And Usage Rights

Each approved row must have:

- approved usage-rights status;
- an opaque sample ID;
- a private storage URI outside git, such as `private://tracking-feasibility/<sample_id>`;
- reviewer-visible consent or usage-rights evidence stored outside git;
- no athlete names, faces, jersey numbers, school names, or public links in
  repository-visible fields.

## Capture Metadata Required Per Row

Record at least:

- camera view;
- frame rate;
- resolution;
- duration;
- approximate camera distance;
- whole-body visibility at foot contact;
- whole-body visibility at release;
- lighting quality;
- background clutter;
- throwing arm;
- age group;
- role.

## Local Model Matrix

The browser baseline must use local model assets only.

| Model ID | Expected local file | Run role | Ready for run? |
| --- | --- | --- | --- |
| `pose_landmarker_lite_float16_v1` | `app/models/pose/pose_landmarker_lite.task` | Fast field baseline | Verify locally before candidate run |
| `pose_landmarker_full_float16_v1` | `app/models/pose/pose_landmarker_full.task` | Higher-capacity candidate | Verify locally before candidate run |
| `pose_landmarker_heavy_float16_v1` | `app/models/pose/pose_landmarker_heavy.task` | Highest-capacity candidate | Verify locally before candidate run |

Record model source, version, checksum, and license note outside the binary
file. Do not rely on CDN-hosted model binaries for the prototype review path.

## No Private Media Commit

Do not commit original athlete videos, consent forms, private artifact links,
identifying screenshots, or other private media into git.

Allowed in repository docs:

- opaque sample IDs;
- capture metadata;
- usage-rights state;
- private URI placeholders;
- dated run summaries and failure reasons that stay capture/measurement-focused.

## Next Action

Populate the manifest with approved rows for every required case type, confirm
the local model matrix is present, and then write the first dated baseline run
under `docs/vv/` for the selected candidate.
