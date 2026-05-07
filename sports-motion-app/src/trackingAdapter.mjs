export const trackingRunStatus = Object.freeze({
  COMPLETED: "completed",
  COMPLETED_WITH_WARNINGS: "completed_with_warnings",
  FAILED_RETRYABLE: "failed_retryable",
  FAILED_UNUSABLE: "failed_unusable"
});

export const prototypeTrackingArtifact = Object.freeze({
  model_name: "markerless_pitching_tracker",
  model_version: "prototype.1",
  artifact_uri_template: "object://tracking/{tracking_run_id}.json",
  required_signals: ["shoulder", "elbow", "wrist", "hip_pelvis", "knee", "ankle", "phase_events"],
  signal_confidence: {
    shoulder_angle: 0.84,
    elbow_angle: 0.82,
    trunk_orientation: 0.8,
    hip_pelvis: 0.79,
    lower_body: 0.81
  },
  low_confidence_signal_confidence: {
    shoulder_angle: 0.68,
    elbow_angle: 0.66,
    trunk_orientation: 0.72,
    hip_pelvis: 0.71,
    lower_body: 0.69
  },
  phase_events: [
    { name: "foot_contact", frame: 112, confidence: 0.91 },
    { name: "ball_release", frame: 184, confidence: 0.86 }
  ],
  low_confidence_phase_events: [
    { name: "foot_contact", frame: 112, confidence: 0.58 },
    { name: "ball_release", frame: 184, confidence: 0.56 }
  ],
  confidence_policy_version: "prototype-policy.1"
});

export const trackingConfidencePolicy = Object.freeze({
  version: "prototype-policy.1",
  overall_warning_threshold: 0.6,
  phase_event_threshold: 0.7,
  required_signal_threshold: 0.7
});

export const trackingFailureReason = Object.freeze({
  LOW_ATHLETE_VISIBILITY: "low_athlete_visibility",
  MISSING_REQUIRED_PHASES: "missing_required_phases",
  UNSUPPORTED_CAMERA_VIEW: "unsupported_camera_view"
});

export const trackingWarningReason = Object.freeze({
  OVERALL_CONFIDENCE_LOW: "overall_confidence_below_caution_threshold",
  PHASE_CONFIDENCE_LOW: "phase_event_confidence_below_threshold",
  REQUIRED_SIGNAL_CONFIDENCE_LOW: "required_signal_confidence_below_threshold"
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function suppressedGroupsForSignal(signalName) {
  const groups = {
    shoulder_angle: ["shoulder_rotation_metrics", "elbow_torque_proxy"],
    elbow_angle: ["elbow_angle_metrics", "elbow_torque_proxy"],
    trunk_orientation: ["trunk_metrics", "pelvis_trunk_separation", "elbow_torque_proxy"],
    hip_pelvis: ["pelvis_trunk_separation", "stride_metrics"],
    lower_body: ["stride_metrics"]
  };
  return groups[signalName] ?? ["affected_metrics"];
}

export function buildTrackingQualityReport({
  overall_confidence,
  phase_events,
  signal_confidence = {},
  failure_reason = null,
  policy = trackingConfidencePolicy
}) {
  if (failure_reason === trackingFailureReason.UNSUPPORTED_CAMERA_VIEW) {
    return {
      status: trackingRunStatus.FAILED_UNUSABLE,
      warning_reasons: [failure_reason],
      suppressed_metric_groups: ["all_metrics"]
    };
  }
  if (
    failure_reason === trackingFailureReason.LOW_ATHLETE_VISIBILITY ||
    failure_reason === trackingFailureReason.MISSING_REQUIRED_PHASES
  ) {
    return {
      status: trackingRunStatus.FAILED_RETRYABLE,
      warning_reasons: [failure_reason],
      suppressed_metric_groups: ["all_metrics"]
    };
  }
  if (!phase_events.length) {
    return {
      status: trackingRunStatus.FAILED_RETRYABLE,
      warning_reasons: [trackingFailureReason.MISSING_REQUIRED_PHASES],
      suppressed_metric_groups: ["all_metrics"]
    };
  }

  const warningReasons = [];
  const suppressedMetricGroups = new Set();
  const lowestPhaseConfidence = Math.min(...phase_events.map((event) => event.confidence));

  if (overall_confidence < policy.overall_warning_threshold) {
    warningReasons.push(trackingWarningReason.OVERALL_CONFIDENCE_LOW);
    suppressedMetricGroups.add("all_metrics_caution");
  }
  if (lowestPhaseConfidence < policy.phase_event_threshold) {
    warningReasons.push(trackingWarningReason.PHASE_CONFIDENCE_LOW);
    suppressedMetricGroups.add("phase_dependent_metrics");
  }
  Object.entries(signal_confidence).forEach(([signalName, confidence]) => {
    if (confidence < policy.required_signal_threshold) {
      warningReasons.push(`${trackingWarningReason.REQUIRED_SIGNAL_CONFIDENCE_LOW}:${signalName}`);
      suppressedGroupsForSignal(signalName).forEach((group) => suppressedMetricGroups.add(group));
    }
  });

  return {
    status: warningReasons.length ? trackingRunStatus.COMPLETED_WITH_WARNINGS : trackingRunStatus.COMPLETED,
    warning_reasons: warningReasons,
    suppressed_metric_groups: [...suppressedMetricGroups]
  };
}

export function classifyTrackingResult({ overall_confidence, phase_events, signal_confidence = {}, failure_reason = null }) {
  return buildTrackingQualityReport({
    overall_confidence,
    phase_events,
    signal_confidence,
    failure_reason
  }).status;
}

export function createPrototypeTrackingAdapter({ artifact = prototypeTrackingArtifact } = {}) {
  return {
    name: artifact.model_name,
    version: artifact.model_version,

    run({ tracking_run_id, lowConfidence = false, failureReason = null, now }) {
      const phaseEvents = clone(lowConfidence ? artifact.low_confidence_phase_events : artifact.phase_events);
      const signalConfidence = clone(
        lowConfidence ? artifact.low_confidence_signal_confidence : artifact.signal_confidence
      );
      const failed = Boolean(failureReason);
      const overallConfidence = failed ? 0 : lowConfidence ? 0.58 : 0.88;
      const qualityReport = buildTrackingQualityReport({
        overall_confidence: overallConfidence,
        phase_events: failed ? [] : phaseEvents,
        signal_confidence: failed ? {} : signalConfidence,
        failure_reason: failureReason
      });
      return {
        status: qualityReport.status,
        model_name: artifact.model_name,
        model_version: artifact.model_version,
        started_at: now(),
        completed_at: now(),
        artifact_uri: artifact.artifact_uri_template.replace("{tracking_run_id}", tracking_run_id),
        phase_events: failed ? [] : phaseEvents,
        signal_confidence: failed ? {} : signalConfidence,
        overall_confidence: overallConfidence,
        confidence_policy_version: artifact.confidence_policy_version,
        warning_reasons: qualityReport.warning_reasons,
        suppressed_metric_groups: qualityReport.suppressed_metric_groups,
        failure_reason: failureReason
      };
    }
  };
}
