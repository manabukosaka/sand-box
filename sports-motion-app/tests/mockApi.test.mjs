import assert from "node:assert/strict";
import test from "node:test";

import { createSportsMotionMockApi } from "../src/mockApi.mjs";

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
  assert.equal(after.videos.find((video) => video.id === after.trackingRun.motion_video_id).status, "analyzed");
  assert.equal(after.videos.find((video) => video.id === after.trackingRun.motion_video_id).analysis_available, true);
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
  const processing = api.updateVideoStatus({ video_id: videoId, status: "processing" });

  assert.equal(processing.videos.find((video) => video.id === videoId).status, "processing");
  assert.equal(processing.videos.find((video) => video.id === videoId).analysis_available, false);

  const failed = api.updateVideoStatus({ video_id: videoId, status: "failed" });

  assert.equal(failed.videos.find((video) => video.id === videoId).status, "failed");
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

test("share creation and revocation is scoped to active analysis", () => {
  const api = createSportsMotionMockApi({ now: () => "2026-05-05T00:00:00Z" });
  const shared = api.createShare({ includeVideo: true, includeEvidence: true });

  assert.equal(shared.activeShare.scope, "analysis_result_only");
  assert.equal(shared.activeShare.include_video, true);
  assert.equal(shared.activeShare.revoked_at, null);

  const revoked = api.revokeActiveShare();

  assert.equal(revoked.activeShare, null);
});
