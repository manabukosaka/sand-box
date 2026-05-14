export const MOTION_TYPE = "baseball_pitching";

export const metricMaturity = Object.freeze({
  FORMAL: "formal",
  PROVISIONAL: "provisional",
  EXPERIMENTAL: "experimental"
});

export const analysisReviewStatus = Object.freeze({
  DRAFT: "draft",
  READY_FOR_USER_REVIEW: "ready_for_user_review",
  REVIEWED: "reviewed"
});

export const reviewerRoles = Object.freeze({
  COACH: "coach",
  TRAINER: "trainer",
  ATHLETE: "athlete",
  EXTERNAL_SPECIALIST: "external_specialist"
});

export const trackingCorrectionEvents = Object.freeze({
  FOOT_CONTACT: "foot_contact",
  BALL_RELEASE: "ball_release"
});

const allowedReviewerRoles = new Set(Object.values(reviewerRoles));
const allowedTrackingCorrectionEvents = new Set(Object.values(trackingCorrectionEvents));

export function createTeam(input) {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("team name is required");
  }
  return {
    id: input.id,
    organization_id: input.organization_id,
    name,
    sport: input.sport ?? "baseball",
    level: input.level ?? "college_adult",
    primary_staff: input.primary_staff ?? "Pitching coach",
    notes: input.notes ?? null,
    created_at: input.created_at ?? new Date().toISOString()
  };
}

export function createAthlete(input) {
  const displayName = input.display_name?.trim();
  if (!displayName) {
    throw new Error("athlete display_name is required");
  }
  return {
    id: input.id,
    team_id: input.team_id,
    display_name: displayName,
    throwing_arm: input.throwing_arm ?? "right",
    age_group: input.age_group ?? "college_adult",
    role: input.role ?? "pitcher",
    roster_status: input.roster_status ?? "active",
    height_cm: input.height_cm ?? null,
    body_mass_kg: input.body_mass_kg ?? null,
    created_at: input.created_at ?? new Date().toISOString()
  };
}

export function createStandardRomProfile({ id, athlete_id, entered_by_user_id, effective_from, measured_at }) {
  const now = new Date().toISOString();
  return {
    id,
    athlete_id,
    version: 1,
    source_type: "standard_with_manual_override",
    effective_from: effective_from ?? now,
    entered_by_user_id,
    measured_at: measured_at ?? now,
    entries: [
      {
        joint: "shoulder",
        movement: "external_rotation",
        side: "throwing_arm",
        standard_min_deg: 0,
        standard_max_deg: 120,
        individual_min_deg: 0,
        individual_max_deg: 115,
        reference_ids: ["ref_ide_2024"]
      },
      {
        joint: "thoracic_spine",
        movement: "rotation",
        side: "throwing_side",
        standard_min_deg: 0,
        standard_max_deg: 55,
        individual_min_deg: 0,
        individual_max_deg: 52,
        reference_ids: ["ref_okamura_2025"]
      }
    ]
  };
}

export function updateRomEntry(profile, match, patch) {
  return {
    ...profile,
    version: profile.version + 1,
    effective_from: patch.effective_from ?? new Date().toISOString(),
    entries: profile.entries.map((entry) => {
      const sameEntry =
        entry.joint === match.joint &&
        entry.movement === match.movement &&
        entry.side === match.side;
      return sameEntry ? { ...entry, ...patch, effective_from: undefined } : entry;
    })
  };
}

export const evidenceReferences = [
  {
    id: "ref_mccutcheon_2025",
    title: "Kinematic Parameters Associated With Elbow Varus Torque in Elite Adult Baseball Pitchers",
    year: 2025,
    pmid: "39906602",
    url: "https://pubmed.ncbi.nlm.nih.gov/39906602/",
    population: "professional and collegiate adult pitchers",
    measurement_context: "laboratory biomechanics database"
  },
  {
    id: "ref_ide_2024",
    title: "Limited Total Arc Glenohumeral Rotation and Shoulder Biomechanics During Baseball Pitching",
    year: 2024,
    pmid: "38446629",
    url: "https://pubmed.ncbi.nlm.nih.gov/38446629/",
    population: "baseball pitchers",
    measurement_context: "shoulder ROM and pitching biomechanics"
  },
  {
    id: "ref_okamura_2025",
    title: "Thoracic Spine Rotation Range, Trunk Contralateral Flexion, and Maximum Elbow Valgus Torque During Pitching",
    year: 2025,
    pmid: null,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11969626/",
    population: "baseball pitchers",
    measurement_context: "ROM and pitching biomechanics"
  }
];

export const metricDefinitions = [
  {
    id: "metric_shoulder_max_external_rotation",
    version: 1,
    name: "Shoulder maximum external rotation",
    unit: "deg",
    motion_type: MOTION_TYPE,
    phase: "arm_cocking",
    maturity: metricMaturity.PROVISIONAL,
    required_tracking_signals: ["shoulder_angle", "phase_events"],
    reference_ids: ["ref_ide_2024"],
    display_caution: "Use as specialist context. ROM-adjusted output is not a diagnosis."
  },
  {
    id: "metric_trunk_rotation_velocity",
    version: 1,
    name: "Trunk rotation velocity",
    unit: "deg_per_sec",
    motion_type: MOTION_TYPE,
    phase: "arm_cocking_to_acceleration",
    maturity: metricMaturity.PROVISIONAL,
    required_tracking_signals: ["trunk_orientation", "phase_events"],
    reference_ids: ["ref_mccutcheon_2025"],
    display_caution: "Use as specialist context. Do not interpret as an injury prediction."
  },
  {
    id: "metric_elbow_torque_proxy",
    version: 1,
    name: "Elbow torque proxy",
    unit: "index",
    motion_type: MOTION_TYPE,
    phase: "acceleration",
    maturity: metricMaturity.EXPERIMENTAL,
    required_tracking_signals: ["elbow_angle", "trunk_orientation", "phase_events"],
    reference_ids: ["ref_mccutcheon_2025", "ref_okamura_2025"],
    display_caution: "Experimental load-context indicator only. Do not use as injury prediction."
  }
];

const metricSuppressionGroups = Object.freeze({
  metric_shoulder_max_external_rotation: ["shoulder_rotation_metrics", "phase_dependent_metrics"],
  metric_trunk_rotation_velocity: ["trunk_metrics", "phase_dependent_metrics"],
  metric_elbow_torque_proxy: ["elbow_torque_proxy", "phase_dependent_metrics"]
});

export function createMotionVideo(input) {
  return {
    id: input.id,
    athlete_id: input.athlete_id,
    status: input.status ?? "draft",
    capture_type: input.capture_type ?? "recorded_in_app",
    capture_source: input.capture_source ?? "smartphone_camera",
    motion_type: MOTION_TYPE,
    camera_view: input.camera_view ?? "open_side",
    frame_rate_fps: input.frame_rate_fps ?? 240,
    resolution: input.resolution ?? "1920x1080",
    duration_ms: input.duration_ms ?? null,
    session_label: input.session_label ?? null,
    file_name: input.file_name ?? null,
    file_size_bytes: input.file_size_bytes ?? null,
    notes: input.notes ?? null,
    archived_at: input.archived_at ?? null,
    deleted_at: input.deleted_at ?? null,
    captured_at: input.captured_at ?? new Date().toISOString(),
    created_at: input.created_at ?? new Date().toISOString()
  };
}

export function createUploadSession(input) {
  return {
    id: input.id,
    motion_video_id: input.motion_video_id,
    status: input.status ?? "active",
    upload_method: input.upload_method ?? "prototype_local",
    upload_url: input.upload_url ?? `mock://uploads/${input.id}`,
    expires_at: input.expires_at,
    attempt: input.attempt ?? 1,
    uploaded_bytes: input.uploaded_bytes ?? 0,
    expected_bytes: input.expected_bytes ?? null,
    checksum: input.checksum ?? null,
    last_error: input.last_error ?? null,
    created_at: input.created_at ?? new Date().toISOString(),
    updated_at: input.updated_at ?? new Date().toISOString()
  };
}

const allowedTrackingStatuses = new Set([
  "queued",
  "processing",
  "completed",
  "completed_with_warnings",
  "failed_retryable",
  "failed_unusable"
]);

export function createTrackingRun(input) {
  const status = input.status ?? "completed";
  if (!allowedTrackingStatuses.has(status)) {
    throw new Error(`unsupported tracking status: ${status}`);
  }
  return {
    id: input.id,
    motion_video_id: input.motion_video_id,
    status,
    model_name: input.model_name ?? "markerless_pitching_tracker",
    model_version: input.model_version ?? "prototype.0",
    started_at: input.started_at,
    completed_at: input.completed_at,
    artifact_uri: input.artifact_uri ?? `object://tracking/${input.id}.json`,
    phase_events: input.phase_events ?? [
      { name: "foot_contact", frame: 112, confidence: 0.91 },
      { name: "ball_release", frame: 184, confidence: 0.86 }
    ],
    signal_confidence: input.signal_confidence ?? {},
    overall_confidence: input.overall_confidence ?? 0.88,
    confidence_policy_version: input.confidence_policy_version ?? "prototype-policy.0",
    warning_reasons: input.warning_reasons ?? [],
    suppressed_metric_groups: input.suppressed_metric_groups ?? [],
    failure_reason: input.failure_reason ?? null,
    adapter_version: input.adapter_version ?? null,
    source_tracking_run_id: input.source_tracking_run_id ?? null,
    correction_status: input.correction_status ?? "ai_generated",
    correction_ids: input.correction_ids ?? []
  };
}

export function createTrackingCorrection(input) {
  if (!input.tracking_run_id) {
    throw new Error("tracking_run_id is required");
  }
  if (!allowedTrackingCorrectionEvents.has(input.event_name)) {
    throw new Error(`unsupported correction event_name: ${input.event_name}`);
  }
  if (!Number.isInteger(input.original_frame) || input.original_frame < 0) {
    throw new Error("original_frame must be a non-negative integer");
  }
  if (!Number.isInteger(input.corrected_frame) || input.corrected_frame < 0) {
    throw new Error("corrected_frame must be a non-negative integer");
  }
  if (!Number.isFinite(input.corrected_time_ms) || input.corrected_time_ms < 0) {
    throw new Error("corrected_time_ms must be a non-negative number");
  }
  const reason = input.reason?.trim();
  return {
    id: input.id,
    tracking_run_id: input.tracking_run_id,
    analysis_run_id: input.analysis_run_id ?? null,
    event_name: input.event_name,
    original_frame: input.original_frame,
    corrected_frame: input.corrected_frame,
    corrected_time_ms: Math.round(input.corrected_time_ms),
    reason: reason || "Manual video review",
    corrected_by_user_id: input.corrected_by_user_id ?? "usr_coach",
    corrected_by_role: input.corrected_by_role ?? reviewerRoles.COACH,
    corrected_by_name: input.corrected_by_name?.trim() || "Pitching coach",
    created_at: input.created_at ?? new Date().toISOString()
  };
}

export function applyTrackingCorrection(trackingRun, correction, { id, created_at } = {}) {
  if (correction.tracking_run_id !== trackingRun.id) {
    throw new Error("correction must target the source tracking run");
  }
  const sourceEvent = trackingRun.phase_events.find((event) => event.name === correction.event_name);
  if (!sourceEvent) {
    throw new Error(`phase event not found: ${correction.event_name}`);
  }
  return createTrackingRun({
    ...trackingRun,
    id,
    started_at: trackingRun.started_at,
    completed_at: created_at ?? new Date().toISOString(),
    artifact_uri: `local://tracking/${id}/manual-phase-correction.json`,
    phase_events: trackingRun.phase_events.map((event) =>
      event.name === correction.event_name
        ? {
            ...event,
            frame: correction.corrected_frame,
            time_ms: correction.corrected_time_ms,
            correction_id: correction.id,
            corrected_from_frame: sourceEvent.frame
          }
        : event
    ),
    source_tracking_run_id: trackingRun.source_tracking_run_id ?? trackingRun.id,
    correction_status: "manual_corrected",
    correction_ids: [...(trackingRun.correction_ids ?? []), correction.id],
    warning_reasons: [...new Set([...(trackingRun.warning_reasons ?? []), "manual_phase_correction"])],
    failure_reason: null
  });
}

export function calculateRomRatio(rawValue, romEntry) {
  const range = romEntry.individual_max_deg - romEntry.individual_min_deg;
  if (range <= 0) {
    throw new Error("ROM range must be positive");
  }
  return Number(((rawValue - romEntry.individual_min_deg) / range).toFixed(3));
}

function isMetricSuppressed(metricDefinitionId, trackingRun) {
  const suppressedGroups = trackingRun.suppressed_metric_groups ?? [];
  if (suppressedGroups.includes("all_metrics")) {
    return true;
  }
  const metricGroups = metricSuppressionGroups[metricDefinitionId] ?? [];
  return metricGroups.some((group) => suppressedGroups.includes(group));
}

export function buildAnalysisRun({ id, trackingRun, athlete, romProfile, rawMetrics, analysis_version, created_at }) {
  const metrics = rawMetrics.map((rawMetric) => {
    const definition = metricDefinitions.find((metric) => metric.id === rawMetric.metric_definition_id);
    if (!definition) {
      throw new Error(`unknown metric definition: ${rawMetric.metric_definition_id}`);
    }
    const shoulderRom = romProfile.entries.find(
      (entry) => entry.joint === "shoulder" && entry.movement === "external_rotation"
    );
    const suppressed = isMetricSuppressed(definition.id, trackingRun);
    const adjustedValue =
      !suppressed && rawMetric.unit === "deg" && shoulderRom
        ? calculateRomRatio(rawMetric.raw_value, shoulderRom)
        : null;
    return {
      metric_definition_id: definition.id,
      raw_value: rawMetric.raw_value,
      unit: rawMetric.unit,
      adjusted_value: adjustedValue,
      adjusted_unit: adjustedValue === null ? null : "rom_ratio",
      confidence: rawMetric.confidence,
      maturity: definition.maturity,
      display_status: suppressed ? "suppressed_low_confidence" : "available",
      suppression_reasons: suppressed ? trackingRun.warning_reasons ?? [] : [],
      cautions: [
        "single_camera_estimate",
        ...(definition.maturity === metricMaturity.EXPERIMENTAL ? ["experimental_metric"] : []),
        ...(suppressed ? ["tracking_signal_suppressed"] : [])
      ]
    };
  });
  const analysisWarningReasons = [
    ...new Set(metrics.flatMap((metric) => metric.suppression_reasons ?? []))
  ];
  const analysisStatus = metrics.some((metric) => metric.display_status !== "available")
    ? "completed_with_warnings"
    : "completed";

  return {
    id,
    tracking_run_id: trackingRun.id,
    athlete_id: athlete.id,
    status: analysisStatus,
    warning_reasons: analysisWarningReasons,
    analysis_version: analysis_version ?? 1,
    metric_definition_versions: metricDefinitions.map((metric) => ({
      metric_definition_id: metric.id,
      version: metric.version
    })),
    rom_profile_id: romProfile.id,
    rom_profile_version: romProfile.version,
    created_at: created_at ?? new Date().toISOString(),
    metrics
  };
}

export function createAnalysisReview(input) {
  if (!input.analysis_run_id) {
    throw new Error("analysis_run_id is required");
  }
  const reviewerRole = input.reviewer_role ?? reviewerRoles.COACH;
  if (!allowedReviewerRoles.has(reviewerRole)) {
    throw new Error(`unsupported reviewer_role: ${reviewerRole}`);
  }
  return {
    id: input.id,
    analysis_run_id: input.analysis_run_id,
    reviewer_role: reviewerRole,
    reviewer_name: input.reviewer_name?.trim() || "Pitching coach",
    summary: input.summary ?? "",
    action_items: input.action_items ?? "",
    status: input.status ?? analysisReviewStatus.DRAFT,
    caution_acknowledged: Boolean(input.caution_acknowledged),
    created_at: input.created_at ?? new Date().toISOString(),
    submitted_at: input.submitted_at ?? null
  };
}

export function createSharePayload({
  analysisRun,
  include_video = false,
  include_overlays = false,
  include_evidence = false,
  include_comments = false,
  video = null,
  overlays = [],
  evidenceReferences = [],
  comments = []
}) {
  if (!analysisRun?.id) {
    throw new Error("analysisRun.id is required");
  }
  if (!Array.isArray(analysisRun.metrics)) {
    throw new Error("analysisRun.metrics must be an array");
  }

  const includeVideo = Boolean(include_video);
  const includeOverlays = Boolean(include_overlays);
  const includeEvidence = Boolean(include_evidence);
  const includeComments = Boolean(include_comments);
  const videoPayload = includeVideo ? video : null;

  if (includeVideo && (!videoPayload || !videoPayload.id)) {
    throw new Error("video is required when include_video is true");
  }
  if (includeOverlays && overlays != null && !Array.isArray(overlays)) {
    throw new Error("overlays must be an array when include_overlays is true");
  }
  if (includeEvidence && evidenceReferences != null && !Array.isArray(evidenceReferences)) {
    throw new Error("evidenceReferences must be an array when include_evidence is true");
  }
  if (includeComments && comments != null && !Array.isArray(comments)) {
    throw new Error("comments must be an array when include_comments is true");
  }

  const rawMetrics = analysisRun.metrics.map((metric) => ({
    metric_definition_id: metric.metric_definition_id,
    raw_value: metric.raw_value,
    unit: metric.unit,
    confidence: metric.confidence ?? null,
    maturity: metric.maturity ?? null,
    display_status: metric.display_status ?? null,
    suppression_reasons: metric.suppression_reasons ?? []
  }));
  const romMetrics = analysisRun.metrics
    .filter((metric) => metric.adjusted_value !== null)
    .map((metric) => ({
      metric_definition_id: metric.metric_definition_id,
      raw_value: metric.raw_value,
      adjusted_value: metric.adjusted_value,
      adjusted_unit: metric.adjusted_unit,
      confidence: metric.confidence
    }));

  return {
    analysis_run_id: analysisRun.id,
    include_video: includeVideo,
    include_overlays: includeOverlays,
    include_evidence: includeEvidence,
    include_comments: includeComments,
    video: videoPayload,
    overlays: includeOverlays ? (overlays ?? []) : null,
    evidenceReferences: includeEvidence ? (evidenceReferences ?? []) : null,
    comments: includeComments ? (comments ?? []) : null,
    raw_metrics: rawMetrics,
    rom_metrics: romMetrics
  };
}

export function submitAnalysisReview(review, { submitted_at } = {}) {
  if (!review.caution_acknowledged) {
    throw new Error("caution_acknowledged is required before user review submission");
  }
  return {
    ...review,
    status: analysisReviewStatus.READY_FOR_USER_REVIEW,
    submitted_at: submitted_at ?? new Date().toISOString()
  };
}

export function createPrototypeDataset() {
  const athlete = createAthlete({
    id: "ath_001",
    team_id: "team_pitching_lab",
    display_name: "Pitcher A",
    throwing_arm: "right",
    age_group: "college_adult",
    height_cm: 185,
    body_mass_kg: 88,
    created_at: "2026-05-05T00:00:00Z"
  });
  const romProfile = createStandardRomProfile({
    id: "rom_001",
    athlete_id: athlete.id,
    entered_by_user_id: "usr_coach",
    effective_from: "2026-05-05T00:00:00Z",
    measured_at: "2026-05-05T00:00:00Z"
  });
  const video = createMotionVideo({
    id: "vid_001",
    athlete_id: athlete.id,
    captured_at: "2026-05-05T00:00:00Z",
    created_at: "2026-05-05T00:00:00Z"
  });
  const trackingRun = createTrackingRun({
    id: "trk_001",
    motion_video_id: video.id,
    started_at: "2026-05-05T00:01:00Z",
    completed_at: "2026-05-05T00:03:00Z"
  });
  const analysisRun = buildAnalysisRun({
    id: "ana_001",
    trackingRun,
    athlete,
    romProfile,
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
  const analysisReview = createAnalysisReview({
    id: "rev_001",
    analysis_run_id: analysisRun.id,
    reviewer_role: reviewerRoles.COACH,
    reviewer_name: "Pitching coach",
    summary: "",
    action_items: "",
    caution_acknowledged: false,
    created_at: "2026-05-05T00:04:00Z"
  });

  return {
    organization: {
      id: "org_001",
      name: "Example Baseball Academy",
      created_at: "2026-05-05T00:00:00Z"
    },
    team: {
      ...createTeam({
        id: "team_pitching_lab",
        organization_id: "org_001",
        name: "College Pitching Group",
        sport: "baseball",
        level: "college_adult",
        primary_staff: "Pitching coach",
        notes: "Prototype pitching development group",
        created_at: "2026-05-05T00:00:00Z"
      })
    },
    athlete,
    romProfile,
    video,
    trackingRun,
    analysisRun,
    analysisReview,
    metricDefinitions,
    evidenceReferences
  };
}
