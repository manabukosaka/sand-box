import {
  buildAnalysisRun,
  createAthlete,
  createMotionVideo,
  createPrototypeDataset,
  createTeam,
  createTrackingRun,
  metricDefinitions,
  updateRomEntry
} from "./domain.mjs";

const DEFAULT_RAW_METRICS = Object.freeze([
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
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextId(prefix, collection) {
  return `${prefix}_${String(collection.length + 1).padStart(3, "0")}`;
}

function makeShareLink({ id, analysisRunId, includeVideo, includeEvidence, now }) {
  const created = new Date(now);
  const expires = new Date(created);
  expires.setDate(created.getDate() + 30);
  return {
    id,
    analysis_run_id: analysisRunId,
    created_by_user_id: "usr_coach",
    scope: "analysis_result_only",
    include_video: includeVideo,
    include_evidence: includeEvidence,
    expires_at: expires.toISOString(),
    revoked_at: null,
    created_at: created.toISOString()
  };
}

export function createSportsMotionMockApi({ storage, now = () => new Date().toISOString() } = {}) {
  const storageKey = "sports-motion-api-state";
  function createInitialState() {
    const initial = createPrototypeDataset();
    return {
      organization: initial.organization,
      team: initial.team,
      athletes: [initial.athlete],
      romProfiles: [initial.romProfile],
      videos: [initial.video],
      trackingRuns: [initial.trackingRun],
      analysisRuns: [initial.analysisRun],
      shareLinks: [],
      activeAthleteId: initial.athlete.id,
      activeAnalysisRunId: initial.analysisRun.id,
      lowConfidence: false
    };
  }

  let state = storage?.getItem(storageKey) ? JSON.parse(storage.getItem(storageKey)) : createInitialState();

  function persist() {
    storage?.setItem(storageKey, JSON.stringify(state));
  }

  function getActiveAthlete() {
    return state.athletes.find((athlete) => athlete.id === state.activeAthleteId);
  }

  function getCurrentRomProfile() {
    return [...state.romProfiles]
      .filter((profile) => profile.athlete_id === state.activeAthleteId)
      .sort((a, b) => b.version - a.version)[0];
  }

  function getActiveAnalysisRun() {
    return state.analysisRuns.find((run) => run.id === state.activeAnalysisRunId);
  }

  function getActiveTrackingRun() {
    const analysisRun = getActiveAnalysisRun();
    return state.trackingRuns.find((run) => run.id === analysisRun.tracking_run_id);
  }

  function buildSnapshot() {
    const activeAthlete = getActiveAthlete();
    const currentRomProfile = getCurrentRomProfile();
    const activeAnalysisRun = getActiveAnalysisRun();
    const activeTrackingRun = getActiveTrackingRun();
    const analyzedVideoIds = new Set(
      state.analysisRuns
        .map((analysisRun) => state.trackingRuns.find((run) => run.id === analysisRun.tracking_run_id))
        .filter(Boolean)
        .map((trackingRun) => trackingRun.motion_video_id)
    );
    const activeShare = state.shareLinks.find(
      (share) => share.analysis_run_id === activeAnalysisRun.id && !share.revoked_at
    );
    return clone({
      organization: state.organization,
      team: state.team,
      athlete: activeAthlete,
      romProfile: currentRomProfile,
      video: state.videos[state.videos.length - 1],
      videos: state.videos.map((video) => ({
        ...video,
        analysis_available: analyzedVideoIds.has(video.id)
      })),
      trackingRun: activeTrackingRun,
      analysisRun: activeAnalysisRun,
      activeShare: activeShare ?? null,
      lowConfidence: state.lowConfidence,
      metricDefinitions
    });
  }

  function createAnalysis({ trackingRun, romProfile, analysisVersion }) {
    const athlete = getActiveAthlete();
    const analysisRun = buildAnalysisRun({
      id: nextId("ana", state.analysisRuns),
      trackingRun,
      athlete,
      romProfile,
      rawMetrics: DEFAULT_RAW_METRICS,
      analysis_version: analysisVersion,
      created_at: now()
    });
    state.analysisRuns.push(analysisRun);
    state.activeAnalysisRunId = analysisRun.id;
    return analysisRun;
  }

  return {
    getSnapshot() {
      return buildSnapshot();
    },

    updateAthleteProfile({ display_name, camera_view, frame_rate_fps }) {
      const athlete = createAthlete({
        ...getActiveAthlete(),
        display_name
      });
      state.athletes = state.athletes.map((candidate) => (candidate.id === athlete.id ? athlete : candidate));
      state.pendingVideoMetadata = {
        camera_view,
        frame_rate_fps
      };
      persist();
      return buildSnapshot();
    },

    updateTeamAttributes({ name, sport, level, primary_staff, notes }) {
      state.team = createTeam({
        ...state.team,
        name,
        sport,
        level,
        primary_staff,
        notes
      });
      persist();
      return buildSnapshot();
    },

    updateAthleteAttributes({
      display_name,
      throwing_arm,
      age_group,
      role,
      roster_status,
      height_cm,
      body_mass_kg
    }) {
      const athlete = createAthlete({
        ...getActiveAthlete(),
        display_name,
        throwing_arm,
        age_group,
        role,
        roster_status,
        height_cm,
        body_mass_kg
      });
      state.athletes = state.athletes.map((candidate) => (candidate.id === athlete.id ? athlete : candidate));
      persist();
      return buildSnapshot();
    },

    saveCapturedVideo({
      capture_source,
      capture_type,
      file_name,
      file_size_bytes,
      camera_view,
      frame_rate_fps,
      session_label,
      notes
    }) {
      const athlete = getActiveAthlete();
      const video = createMotionVideo({
        id: nextId("vid", state.videos),
        athlete_id: athlete.id,
        status: "draft",
        capture_source,
        capture_type,
        camera_view,
        frame_rate_fps,
        session_label,
        file_name,
        file_size_bytes,
        notes,
        captured_at: now(),
        created_at: now()
      });
      state.videos.push(video);
      persist();
      return buildSnapshot();
    },

    submitVideo({ video_id, camera_view, frame_rate_fps, lowConfidence = false }) {
      const athlete = getActiveAthlete();
      let video = video_id ? state.videos.find((candidate) => candidate.id === video_id) : null;
      if (!video) {
        video = createMotionVideo({
          id: nextId("vid", state.videos),
          athlete_id: athlete.id,
          status: "uploaded",
          camera_view,
          frame_rate_fps,
          captured_at: now(),
          created_at: now()
        });
        state.videos.push(video);
      } else {
        video = { ...video, status: "uploaded", camera_view, frame_rate_fps };
        state.videos = state.videos.map((candidate) => (candidate.id === video.id ? video : candidate));
      }
      const trackingRun = createTrackingRun({
        id: nextId("trk", state.trackingRuns),
        motion_video_id: video.id,
        started_at: now(),
        completed_at: now(),
        overall_confidence: lowConfidence ? 0.58 : 0.88,
        phase_events: [
          { name: "foot_contact", frame: 112, confidence: lowConfidence ? 0.58 : 0.91 },
          { name: "ball_release", frame: 184, confidence: lowConfidence ? 0.56 : 0.86 }
        ]
      });
      state.trackingRuns.push(trackingRun);
      state.lowConfidence = lowConfidence;
      createAnalysis({
        trackingRun,
        romProfile: getCurrentRomProfile(),
        analysisVersion: state.analysisRuns.length + 1
      });
      state.videos = state.videos.map((candidate) =>
        candidate.id === video.id ? { ...candidate, status: "analyzed" } : candidate
      );
      persist();
      return buildSnapshot();
    },

    updateVideoStatus({ video_id, status }) {
      state.videos = state.videos.map((video) => {
        if (video.id !== video_id) {
          return video;
        }
        if (status === "archived") {
          return { ...video, status, archived_at: now() };
        }
        if (status === "deleted") {
          return { ...video, status, deleted_at: now() };
        }
        if (status === "uploaded" || status === "draft" || status === "analyzed") {
          return { ...video, status, archived_at: null, deleted_at: null };
        }
        return { ...video, status };
      });
      persist();
      return buildSnapshot();
    },

    updateShoulderExternalRotationMax(value) {
      const profile = getCurrentRomProfile();
      const updated = updateRomEntry(
        profile,
        { joint: "shoulder", movement: "external_rotation", side: "throwing_arm" },
        { individual_max_deg: value, effective_from: now() }
      );
      state.romProfiles.push(updated);
      createAnalysis({
        trackingRun: getActiveTrackingRun(),
        romProfile: updated,
        analysisVersion: state.analysisRuns.length + 1
      });
      persist();
      return buildSnapshot();
    },

    createShare({ includeVideo, includeEvidence }) {
      const activeAnalysis = getActiveAnalysisRun();
      const share = makeShareLink({
        id: nextId("shr", state.shareLinks),
        analysisRunId: activeAnalysis.id,
        includeVideo,
        includeEvidence,
        now: now()
      });
      state.shareLinks.push(share);
      persist();
      return buildSnapshot();
    },

    revokeActiveShare() {
      const snapshot = buildSnapshot();
      if (!snapshot.activeShare) {
        return snapshot;
      }
      state.shareLinks = state.shareLinks.map((share) =>
        share.id === snapshot.activeShare.id ? { ...share, revoked_at: now() } : share
      );
      persist();
      return buildSnapshot();
    },

    reset() {
      storage?.removeItem(storageKey);
      state = createInitialState();
      return buildSnapshot();
    }
  };
}
