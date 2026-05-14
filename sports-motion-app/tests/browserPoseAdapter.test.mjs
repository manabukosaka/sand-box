import assert from "node:assert/strict";
import test from "node:test";

import {
  getPoseModel,
  mediaPipePoseBaselineConfig,
  poseModelRegistry,
  summarizePoseLandmarkerFrames
} from "../src/browserPoseAdapter.mjs";

function visibleLandmark(visibility = 0.92) {
  return {
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility,
    presence: visibility
  };
}

function landmarksWithVisibility(visibility) {
  return Array.from({ length: 33 }, () => visibleLandmark(visibility));
}

test("summarizes MediaPipe pose frames into app tracking output", () => {
  const result = summarizePoseLandmarkerFrames({
    tracking_run_id: "trk_media_001",
    duration_ms: 4000,
    frame_rate_fps: 240,
    now: () => "2026-05-13T00:00:00Z",
    frames: [
      { timestamp_ms: 0, landmarks: [landmarksWithVisibility(0.94)] },
      { timestamp_ms: 1000, landmarks: [landmarksWithVisibility(0.91)] },
      { timestamp_ms: 2000, landmarks: [landmarksWithVisibility(0.89)] }
    ]
  });

  assert.equal(result.status, "completed");
  assert.equal(result.model_name, mediaPipePoseBaselineConfig.model_name);
  assert.equal(result.model_version, getPoseModel().model_version);
  assert.equal(result.adapter_version, mediaPipePoseBaselineConfig.adapter_version);
  assert.equal(result.artifact_uri, "local://tracking/trk_media_001/mediapipe-pose-baseline.json");
  assert.equal(result.phase_events.length, 2);
  assert.equal(result.signal_confidence.shoulder_angle, 0.913);
});

test("MediaPipe baseline uses local runtime and selectable local model registry", () => {
  assert.equal(mediaPipePoseBaselineConfig.tasks_vision_url, "./vendor/mediapipe/tasks-vision/vision_bundle.mjs");
  assert.equal(mediaPipePoseBaselineConfig.wasm_root, "./vendor/mediapipe/tasks-vision/wasm");
  assert.equal(poseModelRegistry.length, 3);
  assert.ok(poseModelRegistry.every((model) => model.model_asset_url.startsWith("./models/pose/")));
  assert.equal(getPoseModel("pose_landmarker_full_float16_v1").model_version, "pose_landmarker_full.float16.v1");
  assert.throws(() => getPoseModel("cdn_model"), /unknown pose model/);
});

test("summarizes selected model version into tracking provenance", () => {
  const result = summarizePoseLandmarkerFrames({
    tracking_run_id: "trk_media_full",
    duration_ms: 4000,
    frame_rate_fps: 240,
    now: () => "2026-05-13T00:00:00Z",
    model: getPoseModel("pose_landmarker_full_float16_v1"),
    frames: [{ timestamp_ms: 0, landmarks: [landmarksWithVisibility(0.9)] }]
  });

  assert.equal(result.model_version, "pose_landmarker_full.float16.v1");
});

test("summarizes low visibility MediaPipe frames with warnings and suppression", () => {
  const result = summarizePoseLandmarkerFrames({
    tracking_run_id: "trk_media_low",
    duration_ms: 4000,
    frame_rate_fps: 120,
    now: () => "2026-05-13T00:00:00Z",
    frames: [
      { timestamp_ms: 0, landmarks: [landmarksWithVisibility(0.62)] },
      { timestamp_ms: 1000, landmarks: [landmarksWithVisibility(0.66)] }
    ]
  });

  assert.equal(result.status, "completed_with_warnings");
  assert.ok(result.warning_reasons.some((reason) => reason.includes("required_signal_confidence_below_threshold")));
  assert.ok(result.suppressed_metric_groups.includes("shoulder_rotation_metrics"));
  assert.equal(result.failure_reason, null);
});

test("summarizes missing pose detections as retryable capture failure", () => {
  const result = summarizePoseLandmarkerFrames({
    tracking_run_id: "trk_media_missing",
    duration_ms: 4000,
    frame_rate_fps: 120,
    now: () => "2026-05-13T00:00:00Z",
    frames: [
      { timestamp_ms: 0, landmarks: [] },
      { timestamp_ms: 1000, landmarks: [] }
    ]
  });

  assert.equal(result.status, "failed_retryable");
  assert.equal(result.failure_reason, "low_athlete_visibility");
  assert.deepEqual(result.suppressed_metric_groups, ["all_metrics"]);
});
