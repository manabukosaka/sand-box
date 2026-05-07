import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAnalysisRun,
  calculateRomRatio,
  createAthlete,
  createPrototypeDataset,
  createStandardRomProfile,
  createTeam,
  createUploadSession,
  updateRomEntry
} from "../src/domain.mjs";

test("creates a team with baseball defaults and editable attributes", () => {
  const team = createTeam({
    id: "team_test",
    organization_id: "org_test",
    name: "  Pitching Lab  "
  });

  assert.equal(team.name, "Pitching Lab");
  assert.equal(team.sport, "baseball");
  assert.equal(team.level, "college_adult");
});

test("creates an athlete with required identity fields", () => {
  const athlete = createAthlete({
    id: "ath_test",
    team_id: "team_test",
    display_name: "  Pitcher Test  "
  });

  assert.equal(athlete.display_name, "Pitcher Test");
  assert.equal(athlete.throwing_arm, "right");
  assert.equal(athlete.age_group, "college_adult");
  assert.equal(athlete.role, "pitcher");
  assert.equal(athlete.roster_status, "active");
});

test("rejects empty athlete display names", () => {
  assert.throws(
    () =>
      createAthlete({
        id: "ath_bad",
        team_id: "team_test",
        display_name: " "
      }),
    /display_name/
  );
});

test("ROM ratios use individual ROM without mutating raw values", () => {
  const profile = createStandardRomProfile({
    id: "rom_test",
    athlete_id: "ath_test",
    entered_by_user_id: "usr_test"
  });
  const shoulder = profile.entries.find((entry) => entry.joint === "shoulder");

  assert.equal(calculateRomRatio(108, shoulder), 0.939);
});

test("ROM updates create a new profile version", () => {
  const profile = createStandardRomProfile({
    id: "rom_test",
    athlete_id: "ath_test",
    entered_by_user_id: "usr_test"
  });
  const updated = updateRomEntry(
    profile,
    { joint: "shoulder", movement: "external_rotation", side: "throwing_arm" },
    { individual_max_deg: 110, effective_from: "2026-05-06T00:00:00Z" }
  );

  assert.equal(profile.version, 1);
  assert.equal(updated.version, 2);
  assert.equal(updated.entries.find((entry) => entry.joint === "shoulder").individual_max_deg, 110);
});

test("analysis keeps raw metrics, ROM-adjusted metrics, versions, and experimental labels separate", () => {
  const data = createPrototypeDataset();
  const analysis = buildAnalysisRun({
    id: "ana_test",
    trackingRun: data.trackingRun,
    athlete: data.athlete,
    romProfile: data.romProfile,
    rawMetrics: [
      {
        metric_definition_id: "metric_shoulder_max_external_rotation",
        raw_value: 108,
        unit: "deg",
        confidence: 0.84
      },
      {
        metric_definition_id: "metric_elbow_torque_proxy",
        raw_value: 0.73,
        unit: "index",
        confidence: 0.64
      }
    ]
  });

  const shoulderMetric = analysis.metrics.find(
    (metric) => metric.metric_definition_id === "metric_shoulder_max_external_rotation"
  );
  const torqueProxy = analysis.metrics.find((metric) => metric.metric_definition_id === "metric_elbow_torque_proxy");

  assert.equal(analysis.rom_profile_version, 1);
  assert.equal(analysis.status, "completed");
  assert.deepEqual(analysis.warning_reasons, []);
  assert.equal(shoulderMetric.raw_value, 108);
  assert.equal(shoulderMetric.adjusted_value, 0.939);
  assert.equal(torqueProxy.adjusted_value, null);
  assert.equal(torqueProxy.maturity, "experimental");
  assert.ok(torqueProxy.cautions.includes("experimental_metric"));
});

test("analysis suppresses affected metrics when tracking quality flags required signals", () => {
  const data = createPrototypeDataset();
  const trackingRun = {
    ...data.trackingRun,
    warning_reasons: ["required_signal_confidence_below_threshold:shoulder_angle"],
    suppressed_metric_groups: ["shoulder_rotation_metrics", "elbow_torque_proxy"]
  };
  const analysis = buildAnalysisRun({
    id: "ana_suppressed",
    trackingRun,
    athlete: data.athlete,
    romProfile: data.romProfile,
    rawMetrics: [
      {
        metric_definition_id: "metric_shoulder_max_external_rotation",
        raw_value: 108,
        unit: "deg",
        confidence: 0.84
      },
      {
        metric_definition_id: "metric_trunk_rotation_velocity",
        raw_value: 620,
        unit: "deg_per_sec",
        confidence: 0.82
      },
      {
        metric_definition_id: "metric_elbow_torque_proxy",
        raw_value: 0.73,
        unit: "index",
        confidence: 0.64
      }
    ]
  });

  const shoulderMetric = analysis.metrics.find(
    (metric) => metric.metric_definition_id === "metric_shoulder_max_external_rotation"
  );
  const trunkMetric = analysis.metrics.find(
    (metric) => metric.metric_definition_id === "metric_trunk_rotation_velocity"
  );
  const torqueProxy = analysis.metrics.find((metric) => metric.metric_definition_id === "metric_elbow_torque_proxy");

  assert.equal(analysis.status, "completed_with_warnings");
  assert.deepEqual(analysis.warning_reasons, ["required_signal_confidence_below_threshold:shoulder_angle"]);
  assert.equal(shoulderMetric.raw_value, 108);
  assert.equal(shoulderMetric.adjusted_value, null);
  assert.equal(shoulderMetric.display_status, "suppressed_low_confidence");
  assert.ok(shoulderMetric.cautions.includes("tracking_signal_suppressed"));
  assert.equal(trunkMetric.display_status, "available");
  assert.equal(torqueProxy.display_status, "suppressed_low_confidence");
});

test("creates upload sessions separate from motion video tracking readiness", () => {
  const session = createUploadSession({
    id: "upl_test",
    motion_video_id: "vid_test",
    expected_bytes: 123456,
    expires_at: "2026-05-05T00:15:00Z",
    created_at: "2026-05-05T00:00:00Z",
    updated_at: "2026-05-05T00:00:00Z"
  });

  assert.equal(session.status, "active");
  assert.equal(session.motion_video_id, "vid_test");
  assert.equal(session.upload_method, "prototype_local");
  assert.equal(session.expected_bytes, 123456);
  assert.equal(session.uploaded_bytes, 0);
});
