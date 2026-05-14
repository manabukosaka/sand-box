# AI Model Assets: Local Runtime Policy

Status: Draft implementation policy

The browser AI baseline uses local MediaPipe runtime and model assets. It must
not depend on CDN-hosted model binaries during normal prototype review.

WBS 7.1 remains a local-asset readiness task: the repo documents the expected
bundle and model inventory, but it does not ship binary assets and it does not
download them during docs work.

## Local Paths

- Runtime bundle: `app/vendor/mediapipe/tasks-vision/vision_bundle.mjs`
- Runtime wasm root: `app/vendor/mediapipe/tasks-vision/wasm/`
- Pose model files: `app/models/pose/`

## Inventory Expectations

Every local MediaPipe asset should be tracked in a text manifest or registry
entry with these fields:

- `asset_id` or model registry key;
- local file path relative to the app root;
- MediaPipe package or bundle version;
- model family and variant name;
- replacement date or added date;
- checksum, preferably `sha256`;
- license or usage note;
- source reference for where the file came from;
- retirement status, if the file is superseded.

## Model Registry

The selectable model registry lives in `src/browserPoseAdapter.mjs`.

Current prototype entries:

| Model ID | Expected local file | Intended use |
| --- | --- | --- |
| `pose_landmarker_lite_float16_v1` | `app/models/pose/pose_landmarker_lite.task` | Fast field baseline |
| `pose_landmarker_full_float16_v1` | `app/models/pose/pose_landmarker_full.task` | Higher-capacity candidate |
| `pose_landmarker_heavy_float16_v1` | `app/models/pose/pose_landmarker_heavy.task` | Highest-capacity candidate |

## Replacement Procedure

Use the Lite, Full, and Heavy entries as versioned replacement slots rather
than mutable names.

1. Add a new registry entry with a new model ID when a newer task file is
   introduced.
2. Keep the previous file and registry entry until V&V evidence has been
   updated and the replacement has been accepted.
3. Record the new file's version, checksum, and license note in the text
   manifest before promoting it to the default baseline.
4. Update any references in the shortlist or V&V notes that depend on the
   preferred local baseline.
5. Remove retired binaries only after the replacement is no longer needed for
   evidence traceability.

## Update Rules

- Add a new registry entry for a newer model instead of overwriting an existing
  entry in place.
- Keep previous model entries until related V&V evidence and metric-support
  decisions have been reviewed.
- Record model source, version, checksum, and license note outside the binary
  file itself. The checksum field should be stable enough to detect accidental
  replacement.
- Re-run the Sports Motion App test suite and add dated V&V evidence before
  treating the model as the preferred baseline.
- Do not promote metric maturity from a model update alone; sample-video review
  and user review gates still apply.

## Current Blocker

- No verified local MediaPipe bundle inventory has been recorded yet for the
  prototype review path.
- The Lite, Full, and Heavy task files are expected at the documented paths,
  but they are not being downloaded or checked in by this docs task.
- WBS 7.1 stays blocked until the local files can be inventoried, checksummed,
  and matched to a license/source note in the asset manifest.
