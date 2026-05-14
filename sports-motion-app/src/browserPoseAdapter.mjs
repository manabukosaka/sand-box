import {
  buildTrackingQualityReport,
  trackingConfidencePolicy,
  trackingFailureReason
} from "./trackingAdapter.mjs";

export const mediaPipePoseBaselineConfig = Object.freeze({
  adapter_version: "mediapipe-web-baseline.0",
  model_name: "mediapipe_pose_landmarker_web",
  tasks_vision_url: "./vendor/mediapipe/tasks-vision/vision_bundle.mjs",
  wasm_root: "./vendor/mediapipe/tasks-vision/wasm",
  default_model_id: "pose_landmarker_lite_float16_v1",
  sample_count: 5
});

export const poseModelRegistry = Object.freeze([
  {
    id: "pose_landmarker_lite_float16_v1",
    label: "Pose Landmarker Lite",
    model_name: "mediapipe_pose_landmarker_web",
    model_version: "pose_landmarker_lite.float16.v1",
    model_asset_url: "./models/pose/pose_landmarker_lite.task",
    status: "local_required",
    notes: "Fast baseline for local prototype feasibility checks."
  },
  {
    id: "pose_landmarker_full_float16_v1",
    label: "Pose Landmarker Full",
    model_name: "mediapipe_pose_landmarker_web",
    model_version: "pose_landmarker_full.float16.v1",
    model_asset_url: "./models/pose/pose_landmarker_full.task",
    status: "local_required",
    notes: "Higher-capacity baseline candidate; add the local .task file before use."
  },
  {
    id: "pose_landmarker_heavy_float16_v1",
    label: "Pose Landmarker Heavy",
    model_name: "mediapipe_pose_landmarker_web",
    model_version: "pose_landmarker_heavy.float16.v1",
    model_asset_url: "./models/pose/pose_landmarker_heavy.task",
    status: "local_required",
    notes: "Highest-capacity baseline candidate; may be slower on field devices."
  }
]);

export function getPoseModel(modelId = mediaPipePoseBaselineConfig.default_model_id) {
  const model = poseModelRegistry.find((candidate) => candidate.id === modelId);
  if (!model) {
    throw new Error(`unknown pose model: ${modelId}`);
  }
  return model;
}

function waitForEvent(target, eventName) {
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { once: true });
    target.addEventListener("error", () => reject(new Error(`video ${eventName} failed`)), { once: true });
  });
}

function seekVideo(video, seconds) {
  video.currentTime = Math.min(Math.max(seconds, 0), Math.max(video.duration - 0.01, 0));
  return waitForEvent(video, "seeked");
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function landmarkConfidence(landmarks, indexes) {
  return average(
    indexes
      .map((index) => landmarks[index])
      .filter(Boolean)
      .map((landmark) => landmark.visibility ?? landmark.presence ?? 0)
  );
}

function buildSignalConfidence(frames) {
  const detected = frames.filter((frame) => frame.landmarks.length);
  const perFrame = detected.map((frame) => frame.landmarks[0]);
  return {
    shoulder_angle: average(perFrame.map((landmarks) => landmarkConfidence(landmarks, [11, 12, 13, 14]))),
    elbow_angle: average(perFrame.map((landmarks) => landmarkConfidence(landmarks, [13, 14, 15, 16]))),
    trunk_orientation: average(perFrame.map((landmarks) => landmarkConfidence(landmarks, [11, 12, 23, 24]))),
    hip_pelvis: average(perFrame.map((landmarks) => landmarkConfidence(landmarks, [23, 24]))),
    lower_body: average(perFrame.map((landmarks) => landmarkConfidence(landmarks, [25, 26, 27, 28])))
  };
}

export function summarizePoseLandmarkerFrames({
  frames,
  duration_ms,
  frame_rate_fps,
  tracking_run_id,
  now,
  model = getPoseModel()
}) {
  const detectedFrames = frames.filter((frame) => frame.landmarks.length);
  if (!detectedFrames.length) {
    const qualityReport = buildTrackingQualityReport({
      overall_confidence: 0,
      phase_events: [],
      signal_confidence: {},
      failure_reason: trackingFailureReason.LOW_ATHLETE_VISIBILITY
    });
    return {
      status: qualityReport.status,
      model_name: model.model_name,
      model_version: model.model_version,
      started_at: now(),
      completed_at: now(),
      artifact_uri: `local://tracking/${tracking_run_id}/mediapipe-pose-baseline.json`,
      phase_events: [],
      signal_confidence: {},
      overall_confidence: 0,
      confidence_policy_version: trackingConfidencePolicy.version,
      warning_reasons: qualityReport.warning_reasons,
      suppressed_metric_groups: qualityReport.suppressed_metric_groups,
      failure_reason: trackingFailureReason.LOW_ATHLETE_VISIBILITY,
      adapter_version: mediaPipePoseBaselineConfig.adapter_version
    };
  }

  const signalConfidence = buildSignalConfidence(frames);
  const overallConfidence = average(Object.values(signalConfidence));
  const frameRate = frame_rate_fps || 240;
  const durationFrames = Math.max(Math.round((duration_ms / 1000) * frameRate), 1);
  const phaseEvents = [
    { name: "foot_contact", frame: Math.round(durationFrames * 0.38), confidence: overallConfidence },
    { name: "ball_release", frame: Math.round(durationFrames * 0.72), confidence: overallConfidence }
  ];
  const qualityReport = buildTrackingQualityReport({
    overall_confidence: overallConfidence,
    phase_events: phaseEvents,
    signal_confidence: signalConfidence
  });

  return {
    status: qualityReport.status,
    model_name: model.model_name,
    model_version: model.model_version,
    started_at: now(),
    completed_at: now(),
    artifact_uri: `local://tracking/${tracking_run_id}/mediapipe-pose-baseline.json`,
    phase_events: phaseEvents,
    signal_confidence: signalConfidence,
    overall_confidence: overallConfidence,
    confidence_policy_version: trackingConfidencePolicy.version,
    warning_reasons: qualityReport.warning_reasons,
    suppressed_metric_groups: qualityReport.suppressed_metric_groups,
    failure_reason: null,
    adapter_version: mediaPipePoseBaselineConfig.adapter_version
  };
}

export async function runMediaPipePoseBaseline({
  file,
  tracking_run_id,
  frame_rate_fps,
  now = () => new Date().toISOString(),
  config = mediaPipePoseBaselineConfig
}) {
  if (!file) {
    throw new Error("video file is required for MediaPipe baseline analysis");
  }
  const model = getPoseModel(config.model_id ?? config.default_model_id);
  const { FilesetResolver, PoseLandmarker } = await import(config.tasks_vision_url);
  const vision = await FilesetResolver.forVisionTasks(config.wasm_root);
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: model.model_asset_url
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = videoUrl;

  try {
    await waitForEvent(video, "loadedmetadata");
    const durationMs = Math.round((video.duration || 0) * 1000);
    const sampleCount = Math.max(config.sample_count, 1);
    const frames = [];
    for (let index = 0; index < sampleCount; index += 1) {
      const ratio = sampleCount === 1 ? 0.5 : index / (sampleCount - 1);
      await seekVideo(video, (video.duration || 0) * ratio);
      const result = poseLandmarker.detectForVideo(video, Math.round(video.currentTime * 1000));
      frames.push({
        timestamp_ms: Math.round(video.currentTime * 1000),
        landmarks: result.landmarks ?? [],
        world_landmarks: result.worldLandmarks ?? []
      });
    }
    return summarizePoseLandmarkerFrames({
      frames,
      duration_ms: durationMs,
      frame_rate_fps,
      tracking_run_id,
      now,
      model
    });
  } finally {
    poseLandmarker.close?.();
    URL.revokeObjectURL(videoUrl);
  }
}
