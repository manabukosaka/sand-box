import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAnalysisRun,
  calculateRomRatio,
  createAthlete,
  createPrototypeDataset,
  createStandardRomProfile,
  updateRomEntry
} from "../src/domain.mjs";

test("creates an athlete with required identity fields", () => {
  const athlete = createAthlete({
    id: "ath_test",
    team_id: "team_test",
    display_name: "  Pitcher Test  "
  });

  assert.equal(athlete.display_name, "Pitcher Test");
  assert.equal(athlete.throwing_arm, "right");
  assert.equal(athlete.age_group, "college_adult");
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
  assert.equal(shoulderMetric.raw_value, 108);
  assert.equal(shoulderMetric.adjusted_value, 0.939);
  assert.equal(torqueProxy.adjusted_value, null);
  assert.equal(torqueProxy.maturity, "experimental");
  assert.ok(torqueProxy.cautions.includes("experimental_metric"));
});
