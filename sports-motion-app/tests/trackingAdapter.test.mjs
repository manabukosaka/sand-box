import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTrackingQualityReport,
  classifyTrackingResult,
  createPrototypeTrackingAdapter,
  trackingFailureReason,
  trackingRunStatus,
  trackingWarningReason
} from "../src/trackingAdapter.mjs";

test("prototype tracking adapter returns deterministic completed artifact metadata", () => {
  const adapter = createPrototypeTrackingAdapter();
  const result = adapter.run({
    tracking_run_id: "trk_999",
    lowConfidence: false,
    now: () => "2026-05-05T00:00:00Z"
  });

  assert.equal(result.status, trackingRunStatus.COMPLETED);
  assert.equal(result.model_name, "markerless_pitching_tracker");
  assert.equal(result.model_version, "prototype.1");
  assert.equal(result.artifact_uri, "object://tracking/trk_999.json");
  assert.equal(result.phase_events.length, 2);
  assert.deepEqual(result.warning_reasons, []);
  assert.deepEqual(result.suppressed_metric_groups, []);
  assert.equal(result.signal_confidence.shoulder_angle, 0.84);
  assert.equal(result.confidence_policy_version, "prototype-policy.1");
});

test("prototype tracking adapter classifies low-confidence runs with warnings", () => {
  const adapter = createPrototypeTrackingAdapter();
  const result = adapter.run({
    tracking_run_id: "trk_low",
    lowConfidence: true,
    now: () => "2026-05-05T00:00:00Z"
  });

  assert.equal(result.status, trackingRunStatus.COMPLETED_WITH_WARNINGS);
  assert.equal(result.overall_confidence, 0.58);
  assert.equal(result.phase_events[0].confidence, 0.58);
  assert.ok(result.warning_reasons.includes(trackingWarningReason.OVERALL_CONFIDENCE_LOW));
  assert.ok(result.warning_reasons.includes(trackingWarningReason.PHASE_CONFIDENCE_LOW));
  assert.ok(result.warning_reasons.includes(`${trackingWarningReason.REQUIRED_SIGNAL_CONFIDENCE_LOW}:shoulder_angle`));
  assert.ok(result.suppressed_metric_groups.includes("phase_dependent_metrics"));
  assert.ok(result.suppressed_metric_groups.includes("shoulder_rotation_metrics"));
});

test("tracking confidence classifier warns on low phase confidence", () => {
  const status = classifyTrackingResult({
    overall_confidence: 0.88,
    phase_events: [
      { name: "foot_contact", frame: 100, confidence: 0.92 },
      { name: "ball_release", frame: 180, confidence: 0.62 }
    ]
  });

  assert.equal(status, trackingRunStatus.COMPLETED_WITH_WARNINGS);
});

test("tracking quality report suppresses affected metric groups for low required signals", () => {
  const report = buildTrackingQualityReport({
    overall_confidence: 0.91,
    phase_events: [
      { name: "foot_contact", frame: 100, confidence: 0.92 },
      { name: "ball_release", frame: 180, confidence: 0.9 }
    ],
    signal_confidence: {
      shoulder_angle: 0.69,
      trunk_orientation: 0.65
    }
  });

  assert.equal(report.status, trackingRunStatus.COMPLETED_WITH_WARNINGS);
  assert.ok(report.warning_reasons.includes(`${trackingWarningReason.REQUIRED_SIGNAL_CONFIDENCE_LOW}:shoulder_angle`));
  assert.ok(report.warning_reasons.includes(`${trackingWarningReason.REQUIRED_SIGNAL_CONFIDENCE_LOW}:trunk_orientation`));
  assert.ok(report.suppressed_metric_groups.includes("shoulder_rotation_metrics"));
  assert.ok(report.suppressed_metric_groups.includes("trunk_metrics"));
  assert.ok(report.suppressed_metric_groups.includes("elbow_torque_proxy"));
});

test("tracking adapter classifies capture-condition failures as retryable", () => {
  const adapter = createPrototypeTrackingAdapter();
  const result = adapter.run({
    tracking_run_id: "trk_retry",
    failureReason: trackingFailureReason.LOW_ATHLETE_VISIBILITY,
    now: () => "2026-05-05T00:00:00Z"
  });

  assert.equal(result.status, trackingRunStatus.FAILED_RETRYABLE);
  assert.equal(result.failure_reason, trackingFailureReason.LOW_ATHLETE_VISIBILITY);
  assert.equal(result.phase_events.length, 0);
  assert.equal(result.overall_confidence, 0);
  assert.deepEqual(result.warning_reasons, [trackingFailureReason.LOW_ATHLETE_VISIBILITY]);
  assert.deepEqual(result.suppressed_metric_groups, ["all_metrics"]);
});

test("tracking adapter classifies unsupported capture setup as unusable", () => {
  const status = classifyTrackingResult({
    overall_confidence: 0,
    phase_events: [],
    failure_reason: trackingFailureReason.UNSUPPORTED_CAMERA_VIEW
  });

  assert.equal(status, trackingRunStatus.FAILED_UNUSABLE);
});
