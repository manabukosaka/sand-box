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
