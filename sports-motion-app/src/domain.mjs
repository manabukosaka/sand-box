export const MOTION_TYPE = "baseball_pitching";

export const metricMaturity = Object.freeze({
  FORMAL: "formal",
  PROVISIONAL: "provisional",
  EXPERIMENTAL: "experimental"
});

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

export function createMotionVideo(input) {
  return {
    id: input.id,
    athlete_id: input.athlete_id,
    status: input.status ?? "uploaded",
    capture_type: input.capture_type ?? "recorded_in_app",
    motion_type: MOTION_TYPE,
    camera_view: input.camera_view ?? "open_side",
    frame_rate_fps: input.frame_rate_fps ?? 240,
    resolution: input.resolution ?? "1920x1080",
    captured_at: input.captured_at ?? new Date().toISOString(),
    created_at: input.created_at ?? new Date().toISOString()
  };
}

export function createTrackingRun(input) {
  return {
    id: input.id,
    motion_video_id: input.motion_video_id,
    status: input.status ?? "completed",
    model_name: "markerless_pitching_tracker",
    model_version: input.model_version ?? "prototype.0",
    started_at: input.started_at,
    completed_at: input.completed_at,
    artifact_uri: input.artifact_uri ?? `object://tracking/${input.id}.json`,
    phase_events: input.phase_events ?? [
      { name: "foot_contact", frame: 112, confidence: 0.91 },
      { name: "ball_release", frame: 184, confidence: 0.86 }
    ],
    overall_confidence: input.overall_confidence ?? 0.88
  };
}

export function calculateRomRatio(rawValue, romEntry) {
  const range = romEntry.individual_max_deg - romEntry.individual_min_deg;
  if (range <= 0) {
    throw new Error("ROM range must be positive");
  }
  return Number(((rawValue - romEntry.individual_min_deg) / range).toFixed(3));
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
    const adjustedValue =
      rawMetric.unit === "deg" && shoulderRom ? calculateRomRatio(rawMetric.raw_value, shoulderRom) : null;
    return {
      metric_definition_id: definition.id,
      raw_value: rawMetric.raw_value,
      unit: rawMetric.unit,
      adjusted_value: adjustedValue,
      adjusted_unit: adjustedValue === null ? null : "rom_ratio",
      confidence: rawMetric.confidence,
      maturity: definition.maturity,
      cautions: [
        "single_camera_estimate",
        ...(definition.maturity === metricMaturity.EXPERIMENTAL ? ["experimental_metric"] : [])
      ]
    };
  });

  return {
    id,
    tracking_run_id: trackingRun.id,
    athlete_id: athlete.id,
    status: "completed",
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

  return {
    organization: {
      id: "org_001",
      name: "Example Baseball Academy",
      created_at: "2026-05-05T00:00:00Z"
    },
    team: {
      id: "team_pitching_lab",
      organization_id: "org_001",
      name: "College Pitching Group",
      created_at: "2026-05-05T00:00:00Z"
    },
    athlete,
    romProfile,
    video,
    trackingRun,
    analysisRun,
    metricDefinitions,
    evidenceReferences
  };
}
