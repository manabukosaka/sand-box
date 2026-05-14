# AI Baseline Results: Browser MediaPipe Pose Harness

Status: Local prototype evidence
Related shortlist: `../tracking_shortlist.md`
Related API contract: `../api_schema.md`

## Run Metadata

| Field | Value |
| --- | --- |
| Test date | 2026-05-13 |
| Tester | Codex |
| Environment | local mock API / dependency-free PWA prototype |
| Candidate | MediaPipe Pose Landmarker browser baseline |
| Adapter version | `mediapipe-web-baseline.0` |
| Model versions | `pose_landmarker_lite.float16.v1`, `pose_landmarker_full.float16.v1`, `pose_landmarker_heavy.float16.v1` registry entries |
| Result | Pass for deterministic adapter summarization and mock API ingestion |

## Scope

This slice adds a browser-side AI baseline harness that can run on a selected
local video file and convert pose-landmark confidence into the app's
`TrackingRun` / `AnalysisRun` pipeline.

The baseline is configured for local runtime/model assets:

- `app/vendor/mediapipe/tasks-vision/vision_bundle.mjs`
- `app/vendor/mediapipe/tasks-vision/wasm/`
- `app/models/pose/*.task`

It does not approve MediaPipe as a production provider, validate baseball phase
detection, promote metric maturity, or replace the sample-video feasibility gate.

## Automated Evidence

```bash
cd sports-motion-app
npm test
```

Covered cases:

- high-confidence MediaPipe landmark frames produce a completed tracking result;
- low-visibility landmark frames produce warnings and metric suppression;
- missing pose detections produce retryable capture failure;
- mock API ingests browser AI baseline tracking output and creates a new analysis
  run.

## Manual Browser Check

1. Open `http://127.0.0.1:4173/app/`.
2. Import a local `.mp4` or `.mov`.
3. Select `Run AI baseline`.
4. Confirm the result moves through the existing Metrics and Review tabs.

The browser must be able to load local MediaPipe Tasks Vision and model assets.
If those assets are unavailable, the app keeps the prototype tracking path
available and reports the baseline as unavailable.
