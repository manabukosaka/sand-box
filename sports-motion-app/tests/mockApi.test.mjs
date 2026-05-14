import assert from "node:assert/strict";
import test from "node:test";

import { createSportsMotionMockApi } from "../src/mockApi.mjs";
import { trackingFailureReason } from "../src/trackingAdapter.mjs";

function createMemoryStorage() {
  const entries = new Map();
  return {
    getItem(key) {
      return entries.get(key) ?? null;
    },
    setItem(key, value) {
      entries.set(key, value);
    },
    removeItem(key) {
      entries.delete(key);
    }
  };
}

test("mock API updates athlete metadata and persists through storage", () => {
  const storage = createMemoryStorage();
  const api = createSportsMotionMockApi({ storage, now: () => "2026-05-05T00:00:00Z" });

  api.updateAthleteProfile({
    display_name: "Pitcher B",
    camera_view: "catcher_view",
    frame_rate_fps: 120
  });

  const restored = createSportsMotionMockApi({ storage, now: () => "2026-05-05T00:00:00Z" });
  const snapshot = restored.getSnapshot();

  assert.equal(snapshot.athlete.display_name, "Pitcher B");
});

test("mock API updates team and athlete profile attributes", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });

  api.updateTeamAttributes({
    name: "Varsity Pitching",
    sport: "baseball",
    level: "college_adult",
    primary_staff: "Coach Rivera",
    notes: "High intent bullpen group"
  });
  const snapshot = api.updateAthleteAttributes({
    display_name: "Pitcher C",
    throwing_arm: "left",
    age_group: "college_adult",
    role: "pitcher",
    roster_status: "active",
    height_cm: 182,
    body_mass_kg: 84
  });

  assert.equal(snapshot.team.name, "Varsity Pitching");
  assert.equal(snapshot.team.primary_staff, "Coach Rivera");
  assert.equal(snapshot.team.level, "college_adult");
  assert.equal(snapshot.team.notes, "High intent bullpen group");
  assert.equal(snapshot.athlete.display_name, "Pitcher C");
  assert.equal(snapshot.athlete.throwing_arm, "left");
  assert.equal(snapshot.athlete.role, "pitcher");
  assert.equal(snapshot.athlete.roster_status, "active");
  assert.equal(snapshot.athlete.height_cm, 182);
});

test("submitting low-confidence video creates a new tracking and analysis run", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const before = api.getSnapshot();
  const after = api.submitVideo({
    camera_view: "open_side",
    frame_rate_fps: 240,
    lowConfidence: true
  });

  assert.notEqual(after.trackingRun.id, before.trackingRun.id);
  assert.notEqual(after.analysisRun.id, before.analysisRun.id);
  assert.equal(after.lowConfidence, true);
  assert.equal(after.trackingRun.overall_confidence, 0.58);
  assert.equal(after.trackingRun.status, "completed_with_warnings");
  assert.equal(after.trackingRun.model_version, "prototype.1");
  assert.equal(after.trackingRun.confidence_policy_version, "prototype-policy.1");
  assert.ok(after.trackingRun.warning_reasons.length > 0);
  assert.ok(after.trackingRun.suppressed_metric_groups.includes("phase_dependent_metrics"));
  assert.equal(after.trackingRun.signal_confidence.shoulder_angle, 0.68);
  assert.equal(after.analysisFreshness.status, "current_tracking");
  assert.equal(after.analysisRun.status, "completed_with_warnings");
  assert.ok(after.analysisRun.warning_reasons.length > 0);
  assert.ok(after.analysisRun.metrics.every((metric) => metric.display_status === "suppressed_low_confidence"));
  assert.equal(after.videos.find((video) => video.id === after.trackingRun.motion_video_id).status, "analyzed");
  assert.equal(after.videos.find((video) => video.id === after.trackingRun.motion_video_id).analysis_available, true);
});

test("mock API can run through an injected tracking adapter", () => {
  const api = createSportsMotionMockApi({
    now: () => "2026-05-05T00:00:00Z",
    trackingAdapter: {
      run({ tracking_run_id, now }) {
        return {
          status: "completed",
          model_name: "sample_tracking_adapter",
          model_version: "sample.1",
          started_at: now(),
          completed_at: now(),
          artifact_uri: `object://sample/${tracking_run_id}.json`,
          phase_events: [{ name: "foot_contact", frame: 88, confidence: 0.95 }],
          overall_confidence: 0.93,
          confidence_policy_version: "sample-policy.1",
          failure_reason: null
        };
      }
    }
  });
  const snapshot = api.submitVideo({
    camera_view: "open_side",
    frame_rate_fps: 240
  });

  assert.equal(snapshot.trackingRun.model_name, "sample_tracking_adapter");
  assert.equal(snapshot.trackingRun.model_version, "sample.1");
  assert.equal(snapshot.trackingRun.artifact_uri, `object://sample/${snapshot.trackingRun.id}.json`);
  assert.equal(snapshot.trackingRun.phase_events[0].frame, 88);
});

test("mock API can ingest browser AI baseline tracking results", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-13T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "baseline.mp4",
    file_size_bytes: 4096,
    camera_view: "open_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;
  const session = api.createUploadSession({ video_id: videoId, expected_bytes: 4096 });
  api.completeUploadSession({
    upload_session_id: session.activeUploadSession.id,
    uploaded_bytes: 4096
  });
  const snapshot = api.submitVideoWithTrackingResult({
    video_id: videoId,
    camera_view: "open_side",
    frame_rate_fps: 240,
    trackingResult: {
      status: "completed",
      model_name: "mediapipe_pose_landmarker_web",
      model_version: "pose_landmarker_lite.float16.v1",
      started_at: "2026-05-13T00:00:00Z",
      completed_at: "2026-05-13T00:00:00Z",
      artifact_uri: "local://tracking/local_1/mediapipe-pose-baseline.json",
      phase_events: [{ name: "foot_contact", frame: 100, confidence: 0.91 }],
      signal_confidence: {
        shoulder_angle: 0.91,
        elbow_angle: 0.9,
        trunk_orientation: 0.88
      },
      overall_confidence: 0.9,
      confidence_policy_version: "prototype-policy.1",
      warning_reasons: [],
      suppressed_metric_groups: [],
      failure_reason: null
    }
  });

  assert.equal(snapshot.trackingRun.model_name, "mediapipe_pose_landmarker_web");
  assert.equal(snapshot.trackingRun.artifact_uri, "local://tracking/local_1/mediapipe-pose-baseline.json");
  assert.equal(snapshot.videos.find((video) => video.id === videoId).status, "analyzed");
  assert.equal(snapshot.analysisRun.tracking_run_id, snapshot.trackingRun.id);
});

test("in-progress tracking run does not create a new analysis run", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "queued.mp4",
    file_size_bytes: 1000,
    camera_view: "open_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;
  const session = api.createUploadSession({ video_id: videoId, expected_bytes: 1000 });
  api.completeUploadSession({
    upload_session_id: session.activeUploadSession.id,
    uploaded_bytes: 1000
  });

  const queued = api.submitVideoWithTrackingResult({
    video_id: videoId,
    camera_view: "open_side",
    frame_rate_fps: 240,
    trackingResult: {
      status: "queued",
      model_name: "mediapipe_pose_landmarker",
      model_version: "local.test",
      started_at: "2026-05-05T00:00:00Z",
      completed_at: null,
      phase_events: [],
      signal_confidence: {},
      overall_confidence: 0,
      warning_reasons: [],
      suppressed_metric_groups: [],
      failure_reason: null
    }
  });

  assert.equal(queued.trackingRun.status, "queued");
  assert.equal(queued.analysisRun.id, saved.analysisRun.id);
  assert.equal(queued.videos.find((video) => video.id === videoId).status, "processing");
});

test("failed tracking run does not create a new analysis run", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "too-dark.mp4",
    file_size_bytes: 1024,
    camera_view: "open_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;
  const session = api.createUploadSession({ video_id: videoId, expected_bytes: 1024 });
  api.completeUploadSession({
    upload_session_id: session.activeUploadSession.id,
    uploaded_bytes: 1024
  });
  const before = api.getSnapshot();
  const failed = api.submitVideo({
    video_id: videoId,
    camera_view: "open_side",
    frame_rate_fps: 240,
    failureReason: trackingFailureReason.LOW_ATHLETE_VISIBILITY
  });

  assert.equal(failed.analysisRun.id, before.analysisRun.id);
  assert.equal(failed.trackingRun.status, "failed_retryable");
  assert.equal(failed.trackingRun.failure_reason, trackingFailureReason.LOW_ATHLETE_VISIBILITY);
  assert.equal(failed.analysisFreshness.status, "last_valid_analysis");
  assert.equal(failed.analysisFreshness.analysis_tracking_run_id, before.trackingRun.id);
  assert.equal(failed.analysisFreshness.tracking_run_id, failed.trackingRun.id);
  assert.equal(failed.videos.find((video) => video.id === videoId).status, "failed_retryable");
  assert.equal(failed.videos.find((video) => video.id === videoId).analysis_available, false);
});

test("ROM recalculation after failed tracking uses the last valid analysis tracking run", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const valid = api.getSnapshot();
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "blocked-angle.mp4",
    file_size_bytes: 2048,
    camera_view: "closed_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;
  const session = api.createUploadSession({ video_id: videoId, expected_bytes: 2048 });
  api.completeUploadSession({
    upload_session_id: session.activeUploadSession.id,
    uploaded_bytes: 2048
  });

  const failed = api.submitVideo({
    video_id: videoId,
    camera_view: "closed_side",
    frame_rate_fps: 240,
    failureReason: trackingFailureReason.UNSUPPORTED_CAMERA_VIEW
  });
  const recalculated = api.updateShoulderExternalRotationMax(110);

  assert.equal(failed.trackingRun.status, "failed_unusable");
  assert.equal(recalculated.trackingRun.id, failed.trackingRun.id);
  assert.equal(recalculated.analysisRun.tracking_run_id, valid.trackingRun.id);
  assert.equal(recalculated.analysisFreshness.status, "last_valid_analysis");
  assert.notEqual(recalculated.analysisRun.id, valid.analysisRun.id);
});

test("captured videos are saved as managed draft records before tracking", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const snapshot = api.saveCapturedVideo({
    capture_source: "smartphone_camera",
    capture_type: "recorded_in_app",
    file_name: "bullpen.mov",
    file_size_bytes: 123456,
    camera_view: "open_side",
    frame_rate_fps: 240,
    session_label: "Bullpen",
    notes: "Open-side capture"
  });
  const video = snapshot.videos.at(-1);

  assert.equal(video.status, "draft");
  assert.equal(video.capture_source, "smartphone_camera");
  assert.equal(video.file_name, "bullpen.mov");
});

test("upload sessions gate tracking submission for managed draft videos", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "smartphone_camera",
    capture_type: "recorded_in_app",
    file_name: "upload-gate.mov",
    file_size_bytes: 4096,
    camera_view: "open_side",
    frame_rate_fps: 240,
    session_label: "Upload gate"
  });
  const videoId = saved.videos.at(-1).id;

  assert.throws(
    () =>
      api.submitVideo({
        video_id: videoId,
        camera_view: "open_side",
        frame_rate_fps: 240
      }),
    /upload must be completed/
  );

  const sessionCreated = api.createUploadSession({
    video_id: videoId,
    expected_bytes: 4096,
    file_name: "upload-gate.mov",
    content_type: "video/quicktime"
  });
  const uploadSession = sessionCreated.activeUploadSession;

  assert.equal(uploadSession.status, "active");
  assert.equal(sessionCreated.videos.find((video) => video.id === videoId).status, "upload_session_created");

  const interrupted = api.interruptUploadSession({
    upload_session_id: uploadSession.id,
    uploaded_bytes: 1024
  });

  assert.equal(interrupted.activeUploadSession.status, "interrupted_retryable");
  assert.equal(interrupted.videos.find((video) => video.id === videoId).status, "uploading");

  const completed = api.completeUploadSession({
    upload_session_id: uploadSession.id,
    uploaded_bytes: 4096,
    checksum: "sha256:test"
  });

  assert.equal(completed.activeUploadSession.status, "completed");
  assert.equal(completed.videos.find((video) => video.id === videoId).status, "uploaded");

  const submitted = api.submitVideo({
    video_id: videoId,
    camera_view: "open_side",
    frame_rate_fps: 240
  });

  assert.equal(submitted.videos.find((video) => video.id === videoId).status, "analyzed");
  assert.equal(submitted.trackingRun.motion_video_id, videoId);
});

test("upload session creation reuses active sessions and creates new retry attempts after interruption", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "retry-attempt.mp4",
    file_size_bytes: 2048,
    camera_view: "open_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;
  const first = api.createUploadSession({ video_id: videoId, expected_bytes: 2048 });
  const second = api.createUploadSession({ video_id: videoId, expected_bytes: 2048 });

  assert.equal(second.uploadSessions.filter((session) => session.motion_video_id === videoId).length, 1);

  api.interruptUploadSession({
    upload_session_id: first.activeUploadSession.id,
    uploaded_bytes: 512
  });
  const retry = api.createUploadSession({ video_id: videoId, expected_bytes: 2048 });
  const attempts = retry.uploadSessions.filter((session) => session.motion_video_id === videoId);

  assert.equal(attempts.length, 2);
  assert.equal(attempts.at(-1).attempt, 2);
  assert.equal(attempts.at(-1).status, "active");
});

test("managed videos can be archived and restored without deleting analysis history", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "import.mp4",
    file_size_bytes: 222,
    camera_view: "catcher_view",
    frame_rate_fps: 120
  });
  const videoId = saved.videos.at(-1).id;
  const archived = api.updateVideoStatus({ video_id: videoId, status: "archived" });

  assert.equal(archived.videos.find((video) => video.id === videoId).status, "archived");
  assert.equal(archived.analysisRun.id, saved.analysisRun.id);

  const restored = api.updateVideoStatus({ video_id: videoId, status: "draft" });

  assert.equal(restored.videos.find((video) => video.id === videoId).status, "draft");
});

test("managed videos can move through processing and failed prototype states", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const saved = api.saveCapturedVideo({
    capture_source: "media_library",
    capture_type: "imported_from_library",
    file_name: "retry.mp4",
    file_size_bytes: 333,
    camera_view: "closed_side",
    frame_rate_fps: 240
  });
  const videoId = saved.videos.at(-1).id;

  assert.throws(
    () => api.updateVideoStatus({ video_id: videoId, status: "processing" }),
    /upload must be completed/
  );

  const sessionCreated = api.createUploadSession({
    video_id: videoId,
    expected_bytes: 333,
    file_name: "retry.mp4",
    content_type: "video/mp4"
  });

  api.completeUploadSession({
    upload_session_id: sessionCreated.activeUploadSession.id,
    uploaded_bytes: 333
  });

  const processing = api.updateVideoStatus({ video_id: videoId, status: "processing" });

  assert.equal(processing.videos.find((video) => video.id === videoId).status, "processing");
  assert.equal(processing.videos.find((video) => video.id === videoId).analysis_available, false);

  assert.throws(
    () => api.updateVideoStatus({ video_id: videoId, status: "failed" }),
    /unsupported video status/
  );

  const failed = api.updateVideoStatus({ video_id: videoId, status: "failed_retryable" });

  assert.equal(failed.videos.find((video) => video.id === videoId).status, "failed_retryable");
  assert.equal(failed.analysisRun.id, saved.analysisRun.id);
});

test("ROM update creates a new ROM profile and recalculated analysis without replacing tracking", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const before = api.getSnapshot();
  const after = api.updateShoulderExternalRotationMax(110);
  const shoulder = after.analysisRun.metrics.find(
    (metric) => metric.metric_definition_id === "metric_shoulder_max_external_rotation"
  );

  assert.equal(after.romProfile.version, before.romProfile.version + 1);
  assert.equal(after.trackingRun.id, before.trackingRun.id);
  assert.notEqual(after.analysisRun.id, before.analysisRun.id);
  assert.equal(shoulder.adjusted_value, 0.982);
});

test("phase correction creates a derived tracking run, new analysis, and correction history", () => {
  const tick = (() => {
    const stamps = ["2026-05-13T00:00:00Z", "2026-05-13T00:01:00Z", "2026-05-13T00:02:00Z"];
    let index = 0;
    return () => stamps[Math.min(index++, stamps.length - 1)];
  })();
  const api = createSportsMotionMockApi({ now: tick });
  const before = api.getSnapshot();
  const corrected = api.applyPhaseCorrection({
    event_name: "ball_release",
    corrected_frame: 190,
    corrected_time_ms: 792,
    reason: "Manual video review matched release frame.",
    corrected_by_name: "Coach Rivera"
  });
  const sourceRelease = before.trackingRun.phase_events.find((event) => event.name === "ball_release");
  const correctedRelease = corrected.trackingRun.phase_events.find((event) => event.name === "ball_release");

  assert.notEqual(corrected.trackingRun.id, before.trackingRun.id);
  assert.notEqual(corrected.analysisRun.id, before.analysisRun.id);
  assert.equal(corrected.trackingRun.source_tracking_run_id, before.trackingRun.id);
  assert.equal(corrected.trackingRun.correction_status, "manual_corrected");
  assert.equal(sourceRelease.frame, 184);
  assert.equal(correctedRelease.frame, 190);
  assert.equal(correctedRelease.time_ms, 792);
  assert.equal(corrected.trackingCorrections.length, 1);
  assert.equal(corrected.trackingCorrections[0].original_frame, 184);
  assert.equal(corrected.trackingCorrections[0].corrected_frame, 190);
  assert.equal(corrected.trackingCorrections[0].analysis_run_id, before.analysisRun.id);
  assert.equal(corrected.analysisRun.tracking_run_id, corrected.trackingRun.id);
});

test("phase correction requires an existing phase event", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-13T00:00:00Z" });

  assert.throws(
    () =>
      api.applyPhaseCorrection({
        event_name: "stride_peak",
        corrected_frame: 120,
        corrected_time_ms: 500
      }),
    /phase event not found/
  );
});

test("share creation and revocation is scoped to active analysis", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const shared = api.createShare({ includeVideo: true, includeEvidence: true });

  assert.equal(shared.activeShare.scope, "analysis_result_only");
  assert.equal(shared.activeShare.include_video, true);
  assert.equal(shared.activeShare.revoked_at, null);

  const sharedView = api.getSharedAnalysis({ share_token: shared.activeShare.share_token });

  assert.equal(sharedView.analysisRun.id, shared.analysisRun.id);
  assert.equal(sharedView.trackingRun.id, shared.analysisRun.tracking_run_id);
  assert.equal(sharedView.video.id, shared.trackingRun.motion_video_id);
  assert.equal(Object.hasOwn(sharedView, "team"), false);
  assert.equal(Object.hasOwn(sharedView, "athlete"), false);
  assert.equal(Object.hasOwn(sharedView, "analysisRuns"), false);
  assert.equal(Object.hasOwn(sharedView, "athletes"), false);
  assert.ok(sharedView.metricDefinitions.length > 0);
  assert.ok(sharedView.evidenceReferences.length > 0);

  const revoked = api.revokeActiveShare();

  assert.equal(revoked.activeShare, null);
  assert.throws(
    () => api.getSharedAnalysis({ share_token: shared.activeShare.share_token }),
    /share expired or revoked/
  );
});

test("shared analysis view omits video and evidence when not included", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const shared = api.createShare({ includeVideo: false, includeEvidence: false });
  const sharedView = api.getSharedAnalysis({ share_token: shared.activeShare.share_token });

  assert.equal(sharedView.analysisRun.id, shared.analysisRun.id);
  assert.equal(sharedView.trackingRun, null);
  assert.equal(sharedView.video, null);
  assert.deepEqual(sharedView.metricDefinitions, []);
  assert.deepEqual(sharedView.evidenceReferences, []);
  assert.equal(sharedView.overlays, null);
  assert.equal(sharedView.comments, null);
});

test("shared analysis includes overlays and comments only when explicitly scoped", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const drafted = api.updateAnalysisReviewDraft({
    reviewer_role: "coach",
    reviewer_name: "Coach Rivera",
    summary: "Share only after the caution labels are acknowledged.",
    action_items: "Review phase timing with the athlete.",
    caution_acknowledged: true
  });
  api.submitAnalysisReview({
    analysis_review_id: drafted.activeAnalysisReview.id
  });
  const shared = api.createShare({
    includeOverlays: true,
    includeComments: true,
    includeVideo: false,
    includeEvidence: false
  });
  const sharedView = api.getSharedAnalysis({ share_token: shared.activeShare.share_token });

  assert.deepEqual(sharedView.overlays, []);
  assert.equal(sharedView.comments.length, 1);
  assert.equal(sharedView.comments[0].summary, "Share only after the caution labels are acknowledged.");
  assert.equal(sharedView.trackingRun, null);
  assert.equal(sharedView.video, null);
  assert.deepEqual(sharedView.metricDefinitions, []);
  assert.deepEqual(sharedView.evidenceReferences, []);
});

test("shared analysis hides draft review comments even when comments scope is enabled", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  api.updateAnalysisReviewDraft({
    reviewer_role: "coach",
    reviewer_name: "Coach Rivera",
    summary: "Draft comment should not leave the review packet.",
    action_items: "Wait for user review request.",
    caution_acknowledged: true
  });
  const shared = api.createShare({
    includeComments: true
  });
  const sharedView = api.getSharedAnalysis({ share_token: shared.activeShare.share_token });

  assert.deepEqual(sharedView.comments, []);
});

test("share defaults to minimum disclosure and logs successful access", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const shared = api.createShare({});

  assert.equal(shared.activeShare.include_video, false);
  assert.equal(shared.activeShare.include_evidence, false);
  assert.equal(shared.activeShare.include_overlays, false);
  assert.equal(shared.activeShare.include_comments, false);
  assert.ok(shared.activeShare.token_last_rotated_at);
  assert.ok(shared.activeShare.share_token);

  api.getSharedAnalysis({
    share_token: shared.activeShare.share_token,
    requester_scope: "external_viewer",
    requester_id: "ext_demo"
  });

  const logs = api.getShareAccessLogs({
    share_link_id: shared.activeShare.id,
    requester_scope: "internal_staff"
  });
  const successLog = logs.at(-1);
  assert.equal(successLog.result, "allowed");
  assert.equal(successLog.analysis_run_id, shared.analysisRun.id);
  assert.equal(successLog.requester_scope, "external_viewer");
  assert.equal(successLog.requester_id, "ext_demo");
});

test("share access denial is logged and logs are not exposed externally", () => {
  const tick = (() => {
    const stamps = ["2026-05-05T00:00:00Z", "2026-06-10T00:00:00Z", "2026-06-10T00:00:10Z"];
    let index = 0;
    return () => stamps[Math.min(index++, stamps.length - 1)];
  })();
  const api = createSportsMotionMockApi({ now: tick });
  const shared = api.createShare({ includeVideo: true, includeEvidence: true });

  assert.throws(
    () => api.getSharedAnalysis({ share_token: shared.activeShare.share_token, requester_scope: "external_viewer" }),
    /share expired or revoked/
  );

  const logs = api.getShareAccessLogs({
    share_link_id: shared.activeShare.id,
    requester_scope: "internal_staff"
  });
  const deniedLog = logs.at(-1);
  assert.equal(deniedLog.result, "denied");
  assert.equal(deniedLog.reason, "expired_or_revoked");
  assert.equal(deniedLog.analysis_run_id, shared.analysisRun.id);

  assert.throws(
    () => api.getShareAccessLogs({ share_link_id: shared.activeShare.id, requester_scope: "external_viewer" }),
    /require internal staff scope/
  );
});

test("creating a new share revokes previous active share for the same analysis", () => {
  const tick = (() => {
    const stamps = ["2026-05-05T00:00:00Z", "2026-05-05T00:01:00Z", "2026-05-05T00:02:00Z"];
    let index = 0;
    return () => stamps[Math.min(index++, stamps.length - 1)];
  })();
  const api = createSportsMotionMockApi({ now: tick });
  const first = api.createShare({ includeVideo: true, includeEvidence: false });
  const firstShareId = first.activeShare.id;
  const second = api.createShare({ includeVideo: false, includeEvidence: true });

  assert.notEqual(second.activeShare.id, firstShareId);
  assert.equal(second.activeShare.revoked_at, null);
  assert.throws(
    () => api.getSharedAnalysis({ share_token: first.activeShare.share_token }),
    /share expired or revoked/
  );
});

test("active share token can be rotated", () => {
  const tick = (() => {
    const stamps = ["2026-05-05T00:00:00Z", "2026-05-05T00:10:00Z", "2026-05-05T00:20:00Z"];
    let index = 0;
    return () => stamps[Math.min(index++, stamps.length - 1)];
  })();
  const api = createSportsMotionMockApi({ now: tick });
  const created = api.createShare({});
  const shareId = created.activeShare.id;
  const firstToken = created.activeShare.share_token;
  const firstRotatedAt = created.activeShare.token_last_rotated_at;

  const rotated = api.rotateShareToken({ share_link_id: shareId });

  assert.equal(rotated.activeShare.id, shareId);
  assert.notEqual(rotated.activeShare.share_token, firstToken);
  assert.notEqual(rotated.activeShare.token_last_rotated_at, firstRotatedAt);
  assert.throws(() => api.getSharedAnalysis({ share_token: firstToken }), /unknown share token/);
});

test("revoked share access attempt is denied and logged", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const shared = api.createShare({});
  api.revokeActiveShare();

  assert.throws(
    () => api.getSharedAnalysis({ share_token: shared.activeShare.share_token, requester_scope: "external_viewer" }),
    /share expired or revoked/
  );

  const logs = api.getShareAccessLogs({
    share_link_id: shared.activeShare.id,
    requester_scope: "internal_staff"
  });
  const denied = logs.at(-1);
  assert.equal(denied.result, "denied");
  assert.equal(denied.reason, "expired_or_revoked");
});

test("analysis review draft persists and submission preserves caution evidence", () => {
  const storage = createMemoryStorage();
  const api = createSportsMotionMockApi({ storage, now: () => "2026-05-05T00:00:00Z" });
  api.submitVideo({
    camera_view: "open_side",
    frame_rate_fps: 240,
    lowConfidence: true
  });
  const drafted = api.updateAnalysisReviewDraft({
    reviewer_role: "coach",
    reviewer_name: "Coach Rivera",
    summary: "Review the suppressed metrics before sharing.",
    action_items: "Confirm capture quality and repeat if visibility remains low.",
    caution_acknowledged: true
  });

  assert.equal(drafted.activeAnalysisReview.status, "draft");
  assert.equal(drafted.activeAnalysisReview.caution_acknowledged, true);
  assert.equal(drafted.analysisRun.status, "completed_with_warnings");
  assert.ok(drafted.analysisRun.warning_reasons.length > 0);

  const restored = createSportsMotionMockApi({ storage, now: () => "2026-05-05T00:01:00Z" });
  const submitted = restored.submitAnalysisReview({
    analysis_review_id: drafted.activeAnalysisReview.id
  });

  assert.equal(submitted.activeAnalysisReview.status, "ready_for_user_review");
  assert.equal(submitted.activeAnalysisReview.submitted_at, "2026-05-05T00:01:00Z");
  assert.equal(submitted.analysisRun.metrics.every((metric) => metric.display_status === "suppressed_low_confidence"), true);
});

test("editing a submitted analysis review creates a new draft and preserves submitted review", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const drafted = api.updateAnalysisReviewDraft({
    reviewer_role: "coach",
    reviewer_name: "Coach Rivera",
    summary: "Submitted summary.",
    action_items: "Submitted action.",
    caution_acknowledged: true
  });
  const submitted = api.submitAnalysisReview({
    analysis_review_id: drafted.activeAnalysisReview.id
  });

  const edited = api.updateAnalysisReviewDraft({
    reviewer_role: "coach",
    reviewer_name: "Coach Rivera",
    summary: "New draft summary.",
    action_items: "New draft action.",
    caution_acknowledged: false
  });

  assert.notEqual(edited.activeAnalysisReview.id, submitted.activeAnalysisReview.id);
  assert.equal(edited.activeAnalysisReview.status, "draft");
  assert.equal(edited.activeAnalysisReview.submitted_at, null);
  assert.equal(edited.activeAnalysisReview.summary, "New draft summary.");

  const shared = api.createShare({ includeComments: true });
  const sharedView = api.getSharedAnalysis({ share_token: shared.activeShare.share_token });
  assert.equal(sharedView.comments.length, 1);
  assert.equal(sharedView.comments[0].id, submitted.activeAnalysisReview.id);
  assert.equal(sharedView.comments[0].summary, "Submitted summary.");
});

test("analysis review submission blocks until cautions are acknowledged", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const drafted = api.updateAnalysisReviewDraft({
    reviewer_role: "trainer",
    reviewer_name: "Trainer A",
    summary: "Ready for review after caution acknowledgement.",
    action_items: "Confirm ROM profile source.",
    caution_acknowledged: false
  });

  assert.throws(
    () => api.submitAnalysisReview({ analysis_review_id: drafted.activeAnalysisReview.id }),
    /caution_acknowledged/
  );
});
