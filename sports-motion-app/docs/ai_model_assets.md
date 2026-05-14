# AI Model Assets: Local Runtime Policy

Status: Draft implementation policy

The browser AI baseline uses local MediaPipe runtime and model assets. It must
not depend on CDN-hosted model binaries during normal prototype review.

## Local Paths

- Runtime bundle: `app/vendor/mediapipe/tasks-vision/vision_bundle.mjs`
- Runtime wasm root: `app/vendor/mediapipe/tasks-vision/wasm/`
- Pose model files: `app/models/pose/`

## Model Registry

The selectable model registry lives in `src/browserPoseAdapter.mjs`.

Current prototype entries:

| Model ID | Expected local file | Intended use |
| --- | --- | --- |
| `pose_landmarker_lite_float16_v1` | `app/models/pose/pose_landmarker_lite.task` | Fast field baseline |
| `pose_landmarker_full_float16_v1` | `app/models/pose/pose_landmarker_full.task` | Higher-capacity candidate |
| `pose_landmarker_heavy_float16_v1` | `app/models/pose/pose_landmarker_heavy.task` | Highest-capacity candidate |

## Update Rules

- Add a new registry entry for a newer model instead of overwriting an existing
  entry in place.
- Keep previous model entries until related V&V evidence and metric-support
  decisions have been reviewed.
- Record model source, version, checksum, and license note outside the binary
  file itself.
- Re-run the Sports Motion App test suite and add dated V&V evidence before
  treating the model as the preferred baseline.
- Do not promote metric maturity from a model update alone; sample-video review
  and user review gates still apply.

