import assert from "node:assert/strict";
import test from "node:test";

import {
  applyTrackingCorrection,
  createAnalysisReview,
  buildAnalysisRun,
  calculateRomRatio,
  createAthlete,
  createPrototypeDataset,
  createStandardRomProfile,
  createTeam,
  createSharePayload,
  createTrackingCorrection,
  createUploadSession,
  submitAnalysisReview,
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

test("analysis review drafts stay separate from analysis metrics", () => {
  const data = createPrototypeDataset();
  const review = createAnalysisReview({
    id: "rev_test",
    analysis_run_id: data.analysisRun.id,
    reviewer_role: "trainer",
    reviewer_name: "  Trainer A  ",
    summary: "Review phase timing and shoulder ROM context.",
    action_items: "Ask athlete to confirm capture conditions.",
    caution_acknowledged: true,
    created_at: "2026-05-05T00:10:00Z"
  });

  assert.equal(review.analysis_run_id, data.analysisRun.id);
  assert.equal(review.reviewer_role, "trainer");
  assert.equal(review.reviewer_name, "Trainer A");
  assert.equal(review.status, "draft");
  assert.equal(data.analysisRun.metrics.length, 3);
  assert.equal(Object.hasOwn(data.analysisRun, "summary"), false);
});

test("analysis review submission requires caution acknowledgement", () => {
  const review = createAnalysisReview({
    id: "rev_blocked",
    analysis_run_id: "ana_test",
    caution_acknowledged: false
  });

  assert.throws(
    () => submitAnalysisReview(review, { submitted_at: "2026-05-05T00:11:00Z" }),
    /caution_acknowledged/
  );

  const submitted = submitAnalysisReview(
    { ...review, caution_acknowledged: true },
    { submitted_at: "2026-05-05T00:11:00Z" }
  );

  assert.equal(submitted.status, "ready_for_user_review");
  assert.equal(submitted.submitted_at, "2026-05-05T00:11:00Z");
});

test("share payload excludes video, overlays, evidence, and comments by default while keeping raw and ROM metrics separate", () => {
  const data = createPrototypeDataset();
  const share = createSharePayload({
    analysisRun: data.analysisRun
  });
  const expanded = createSharePayload({
    analysisRun: data.analysisRun,
    include_video: true,
    include_overlays: true,
    include_evidence: true,
    include_comments: true,
    video: data.video,
    overlays: [{ type: "phase_timeline", visible: true }],
    evidenceReferences: data.evidenceReferences,
    comments: [{ id: "rev_extra", summary: "Share this note." }]
  });

  assert.equal(share.include_video, false);
  assert.equal(share.include_overlays, false);
  assert.equal(share.include_evidence, false);
  assert.equal(share.include_comments, false);
  assert.equal(share.video, null);
  assert.equal(share.overlays, null);
  assert.equal(share.evidenceReferences, null);
  assert.equal(share.comments, null);
  assert.equal(share.raw_metrics.length, data.analysisRun.metrics.length);
  assert.equal(share.rom_metrics.length, 1);
  assert.equal(share.raw_metrics[0].raw_value, 108);
  assert.equal(share.rom_metrics[0].adjusted_value, 0.939);
  assert.notDeepEqual(share.raw_metrics, share.rom_metrics);

  assert.equal(expanded.include_video, true);
  assert.equal(expanded.include_overlays, true);
  assert.equal(expanded.include_evidence, true);
  assert.equal(expanded.include_comments, true);
  assert.equal(expanded.video.id, data.video.id);
  assert.deepEqual(expanded.overlays, [{ type: "phase_timeline", visible: true }]);
  assert.deepEqual(expanded.evidenceReferences, data.evidenceReferences);
  assert.deepEqual(expanded.comments, [{ id: "rev_extra", summary: "Share this note." }]);
});

test("tracking corrections preserve source tracking and create corrected phase provenance", () => {
  const data = createPrototypeDataset();
  const correction = createTrackingCorrection({
    id: "cor_test",
    tracking_run_id: data.trackingRun.id,
    analysis_run_id: data.analysisRun.id,
    event_name: "foot_contact",
    original_frame: 112,
    corrected_frame: 118,
    corrected_time_ms: 492,
    reason: "Video review aligned foot strike.",
    corrected_by_name: "Coach Rivera",
    created_at: "2026-05-13T00:00:00Z"
  });
  const corrected = applyTrackingCorrection(data.trackingRun, correction, {
    id: "trk_corrected",
    created_at: "2026-05-13T00:01:00Z"
  });

  assert.equal(data.trackingRun.phase_events.find((event) => event.name === "foot_contact").frame, 112);
  assert.equal(corrected.source_tracking_run_id, data.trackingRun.id);
  assert.equal(corrected.correction_status, "manual_corrected");
  assert.deepEqual(corrected.correction_ids, ["cor_test"]);
  assert.equal(corrected.phase_events.find((event) => event.name === "foot_contact").frame, 118);
  assert.equal(corrected.phase_events.find((event) => event.name === "foot_contact").time_ms, 492);
  assert.ok(corrected.warning_reasons.includes("manual_phase_correction"));
});

test("tracking corrections validate supported events and non-negative frame values", () => {
  assert.throws(
    () =>
      createTrackingCorrection({
        id: "cor_bad",
        tracking_run_id: "trk_test",
        event_name: "stride_peak",
        original_frame: 10,
        corrected_frame: 12,
        corrected_time_ms: 50
      }),
    /unsupported correction event_name/
  );

  assert.throws(
    () =>
      createTrackingCorrection({
        id: "cor_bad_frame",
        tracking_run_id: "trk_test",
        event_name: "ball_release",
        original_frame: 10,
        corrected_frame: -1,
        corrected_time_ms: 50
      }),
    /corrected_frame/
  );
});
