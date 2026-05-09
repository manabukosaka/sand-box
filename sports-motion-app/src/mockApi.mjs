import {
  buildAnalysisRun,
  createAthlete,
  createMotionVideo,
  createPrototypeDataset,
  createTeam,
  createTrackingRun,
  createUploadSession,
  metricDefinitions,
  evidenceReferences,
  updateRomEntry
} from "./domain.mjs";
import { createPrototypeTrackingAdapter } from "./trackingAdapter.mjs";

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

function nextShareToken(state, shareId) {
  state.shareTokenCounter += 1;
  return `tok_${shareId}_${state.shareTokenCounter}`;
}

function makeShareLink({
  id,
  analysisRunId,
  includeVideo = false,
  includeEvidence = false,
  includeOverlays = false,
  includeComments = false,
  now
}) {
  const created = new Date(now);
  const expires = new Date(created);
  expires.setDate(created.getDate() + 30);
  return {
    id,
    share_token: `tok_${id}`,
    analysis_run_id: analysisRunId,
    created_by_user_id: "usr_coach",
    scope: "analysis_result_only",
    include_video: Boolean(includeVideo),
    include_evidence: Boolean(includeEvidence),
    include_overlays: Boolean(includeOverlays),
    include_comments: Boolean(includeComments),
    token_last_rotated_at: created.toISOString(),
    expires_at: expires.toISOString(),
    revoked_at: null,
    created_at: created.toISOString()
  };
}

function expiresInMinutes(now, minutes) {
  const expires = new Date(now);
  expires.setMinutes(expires.getMinutes() + minutes);
  return expires.toISOString();
}

export function createSportsMotionMockApi({
  storage,
  now = () => new Date().toISOString(),
  trackingAdapter = createPrototypeTrackingAdapter()
} = {}) {
  const storageKey = "sports-motion-api-state";
  function createInitialState() {
    const initial = createPrototypeDataset();
    return {
      organization: initial.organization,
      team: initial.team,
      athletes: [initial.athlete],
      romProfiles: [initial.romProfile],
      videos: [initial.video],
      uploadSessions: [],
      trackingRuns: [initial.trackingRun],
      analysisRuns: [initial.analysisRun],
      shareLinks: [],
      shareAccessLogs: [],
      shareTokenCounter: 0,
      activeAthleteId: initial.athlete.id,
      activeAnalysisRunId: initial.analysisRun.id,
      activeTrackingRunId: initial.trackingRun.id,
      lowConfidence: false
    };
  }

  let state = storage?.getItem(storageKey) ? JSON.parse(storage.getItem(storageKey)) : createInitialState();
  state.uploadSessions ??= [];
  state.shareAccessLogs ??= [];
  state.shareTokenCounter ??= 0;
  state.activeTrackingRunId ??= getActiveAnalysisRun()?.tracking_run_id;

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

  function getActiveAnalysisTrackingRun() {
    const analysisRun = getActiveAnalysisRun();
    return state.trackingRuns.find((run) => run.id === analysisRun.tracking_run_id);
  }

  function getActiveTrackingRun() {
    return (
      state.trackingRuns.find((run) => run.id === state.activeTrackingRunId) ??
      getActiveAnalysisTrackingRun()
    );
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
      uploadSessions: state.uploadSessions,
      activeUploadSession: state.uploadSessions.at(-1) ?? null,
      videos: state.videos.map((video) => ({
        ...video,
        analysis_available: analyzedVideoIds.has(video.id)
      })),
      trackingRun: activeTrackingRun,
      analysisRun: activeAnalysisRun,
      analysisFreshness: {
        status:
          activeAnalysisRun.tracking_run_id === activeTrackingRun.id
            ? "current_tracking"
            : "last_valid_analysis",
        tracking_run_id: activeTrackingRun.id,
        analysis_tracking_run_id: activeAnalysisRun.tracking_run_id
      },
      activeShare: activeShare ?? null,
      lowConfidence: state.lowConfidence,
      metricDefinitions
    });
  }

  function createAnalysis({ trackingRun, romProfile, analysisVersion, activateTracking = true }) {
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
    if (activateTracking) {
      state.activeTrackingRunId = trackingRun.id;
    }
    return analysisRun;
  }

  function appendShareAccessLog({
    share_link_id,
    analysis_run_id = null,
    result,
    reason = null,
    requester_scope = "external_viewer",
    requester_id = null,
    client_fingerprint = "sha256:prototype",
    ip_country_code = "JP"
  }) {
    state.shareAccessLogs.push({
      id: nextId("sal", state.shareAccessLogs),
      share_link_id,
      analysis_run_id,
      accessed_at: now(),
      requester_scope,
      requester_id,
      client_fingerprint,
      ip_country_code,
      result,
      reason
    });
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

    createUploadSession({ video_id, expected_bytes, file_name, content_type }) {
      const video = state.videos.find((candidate) => candidate.id === video_id);
      if (!video) {
        throw new Error(`unknown video: ${video_id}`);
      }
      if (video.status === "deleted" || video.status === "archived") {
        throw new Error(`cannot upload video in status: ${video.status}`);
      }
      if (video.status === "uploaded" || video.status === "processing" || video.status === "analyzed") {
        throw new Error(`upload already completed for video status: ${video.status}`);
      }
      const latestSession = [...state.uploadSessions]
        .reverse()
        .find((session) => session.motion_video_id === video_id);
      if (latestSession?.status === "active") {
        return buildSnapshot();
      }
      const previousAttempts = state.uploadSessions.filter(
        (session) => session.motion_video_id === video_id
      ).length;
      const uploadSession = createUploadSession({
        id: nextId("upl", state.uploadSessions),
        motion_video_id: video_id,
        status: "active",
        attempt: previousAttempts + 1,
        expected_bytes: expected_bytes ?? video.file_size_bytes ?? null,
        upload_method: "prototype_local",
        upload_url: `mock://uploads/${video_id}/${previousAttempts + 1}`,
        expires_at: expiresInMinutes(now(), 15),
        created_at: now(),
        updated_at: now()
      });
      state.uploadSessions.push({
        ...uploadSession,
        file_name: file_name ?? video.file_name ?? null,
        content_type: content_type ?? "video/mp4"
      });
      state.videos = state.videos.map((candidate) =>
        candidate.id === video_id ? { ...candidate, status: "upload_session_created" } : candidate
      );
      persist();
      return buildSnapshot();
    },

    interruptUploadSession({ upload_session_id, uploaded_bytes = 0, last_error = "network_interrupted" }) {
      const session = state.uploadSessions.find((candidate) => candidate.id === upload_session_id);
      if (!session) {
        throw new Error(`unknown upload session: ${upload_session_id}`);
      }
      state.uploadSessions = state.uploadSessions.map((candidate) =>
        candidate.id === upload_session_id
          ? {
              ...candidate,
              status: "interrupted_retryable",
              uploaded_bytes,
              last_error,
              updated_at: now()
            }
          : candidate
      );
      state.videos = state.videos.map((video) =>
        video.id === session.motion_video_id ? { ...video, status: "uploading" } : video
      );
      persist();
      return buildSnapshot();
    },

    completeUploadSession({ upload_session_id, uploaded_bytes, checksum = null }) {
      const session = state.uploadSessions.find((candidate) => candidate.id === upload_session_id);
      if (!session) {
        throw new Error(`unknown upload session: ${upload_session_id}`);
      }
      state.uploadSessions = state.uploadSessions.map((candidate) =>
        candidate.id === upload_session_id
          ? {
              ...candidate,
              status: "completed",
              uploaded_bytes: uploaded_bytes ?? candidate.expected_bytes ?? candidate.uploaded_bytes,
              checksum,
              last_error: null,
              updated_at: now()
            }
          : candidate
      );
      state.videos = state.videos.map((video) =>
        video.id === session.motion_video_id ? { ...video, status: "uploaded" } : video
      );
      persist();
      return buildSnapshot();
    },

    submitVideo({ video_id, camera_view, frame_rate_fps, lowConfidence = false, failureReason = null }) {
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
        if (video.status !== "uploaded" && video.status !== "analyzed") {
          throw new Error(`video upload must be completed before tracking: ${video.status}`);
        }
        video = { ...video, status: "uploaded", camera_view, frame_rate_fps };
        state.videos = state.videos.map((candidate) => (candidate.id === video.id ? video : candidate));
      }
      const trackingRunId = nextId("trk", state.trackingRuns);
      const trackingResult = trackingAdapter.run({
        tracking_run_id: trackingRunId,
        video,
        lowConfidence,
        failureReason,
        now
      });
      const trackingRun = createTrackingRun({
        id: trackingRunId,
        motion_video_id: video.id,
        ...trackingResult
      });
      state.trackingRuns.push(trackingRun);
      state.activeTrackingRunId = trackingRun.id;
      state.lowConfidence = lowConfidence;
      if (trackingRun.status === "failed_retryable" || trackingRun.status === "failed_unusable") {
        state.videos = state.videos.map((candidate) =>
          candidate.id === video.id ? { ...candidate, status: trackingRun.status } : candidate
        );
        persist();
        return buildSnapshot();
      }
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
      const currentVideo = state.videos.find((video) => video.id === video_id);
      if (!currentVideo) {
        throw new Error(`unknown video: ${video_id}`);
      }
      if (
        status === "processing" &&
        currentVideo.status !== "uploaded" &&
        currentVideo.status !== "processing" &&
        currentVideo.status !== "analyzed"
      ) {
        throw new Error(`video upload must be completed before processing: ${currentVideo.status}`);
      }
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
        trackingRun: getActiveAnalysisTrackingRun(),
        romProfile: updated,
        analysisVersion: state.analysisRuns.length + 1,
        activateTracking: false
      });
      persist();
      return buildSnapshot();
    },

    createShare({ includeVideo, includeEvidence, includeOverlays, includeComments }) {
      const activeAnalysis = getActiveAnalysisRun();
      state.shareLinks = state.shareLinks.map((candidate) =>
        candidate.analysis_run_id === activeAnalysis.id && !candidate.revoked_at
          ? { ...candidate, revoked_at: now(), revoked_reason: "superseded_by_new_share" }
          : candidate
      );
      const share = makeShareLink({
        id: nextId("shr", state.shareLinks),
        analysisRunId: activeAnalysis.id,
        includeVideo,
        includeEvidence,
        includeOverlays,
        includeComments,
        now: now()
      });
      share.share_token = nextShareToken(state, share.id);
      state.shareLinks.push(share);
      persist();
      return buildSnapshot();
    },

    rotateShareToken({ share_link_id }) {
      const share = state.shareLinks.find((candidate) => candidate.id === share_link_id);
      if (!share) {
        throw new Error(`unknown share link: ${share_link_id}`);
      }
      if (share.revoked_at || new Date(share.expires_at) <= new Date(now())) {
        throw new Error("share expired or revoked");
      }
      state.shareLinks = state.shareLinks.map((candidate) =>
        candidate.id === share_link_id
          ? { ...candidate, token_last_rotated_at: now(), updated_at: now() }
          : candidate
      );
      state.shareLinks = state.shareLinks.map((candidate) =>
        candidate.id === share_link_id
          ? { ...candidate, share_token: nextShareToken(state, candidate.id) }
          : candidate
      );
      appendShareAccessLog({
        share_link_id: share.id,
        analysis_run_id: share.analysis_run_id,
        result: "allowed",
        reason: "token_rotated",
        requester_scope: "internal_staff"
      });
      persist();
      return buildSnapshot();
    },

    getSharedAnalysis({ share_token, requester_scope = "external_viewer", requester_id = null }) {
      const share = state.shareLinks.find(
        (candidate) => candidate.share_token === share_token
      );
      if (!share) {
        throw new Error(`unknown share token: ${share_token}`);
      }
      if (share.revoked_at || new Date(share.expires_at) <= new Date(now())) {
        appendShareAccessLog({
          share_link_id: share.id,
          analysis_run_id: share.analysis_run_id,
          result: "denied",
          reason: "expired_or_revoked",
          requester_scope,
          requester_id
        });
        persist();
        throw new Error("share expired or revoked");
      }
      const analysisRun = state.analysisRuns.find((run) => run.id === share.analysis_run_id);
      if (!analysisRun) {
        appendShareAccessLog({
          share_link_id: share.id,
          analysis_run_id: share.analysis_run_id,
          result: "denied",
          reason: "analysis_not_found",
          requester_scope,
          requester_id
        });
        persist();
        throw new Error(`unknown shared analysis: ${share.analysis_run_id}`);
      }
      const trackingRun = state.trackingRuns.find((run) => run.id === analysisRun.tracking_run_id);
      const video = state.videos.find((candidate) => candidate.id === trackingRun?.motion_video_id);
      const response = clone({
        shareLink: share,
        analysisRun,
        metricDefinitions: share.include_evidence ? metricDefinitions : [],
        evidenceReferences: share.include_evidence ? evidenceReferences : [],
        overlays: share.include_overlays ? [] : null,
        comments: share.include_comments ? [] : null,
        trackingRun: share.include_video ? trackingRun : null,
        video: share.include_video ? video : null
      });
      appendShareAccessLog({
        share_link_id: share.id,
        analysis_run_id: share.analysis_run_id,
        result: "allowed",
        reason: null,
        requester_scope,
        requester_id
      });
      persist();
      return response;
    },

    getShareAccessLogs({ share_link_id, requester_scope = "internal_staff" }) {
      if (requester_scope !== "internal_staff") {
        throw new Error("share access logs require internal staff scope");
      }
      const share = state.shareLinks.find((candidate) => candidate.id === share_link_id);
      if (!share) {
        throw new Error(`unknown share link: ${share_link_id}`);
      }
      return clone(
        state.shareAccessLogs
          .filter((log) => log.share_link_id === share_link_id)
          .sort((a, b) => new Date(a.accessed_at).getTime() - new Date(b.accessed_at).getTime())
      );
    },

    revokeActiveShare() {
      const snapshot = buildSnapshot();
      if (!snapshot.activeShare) {
        return snapshot;
      }
      state.shareLinks = state.shareLinks.map((share) =>
        share.id === snapshot.activeShare.id
          ? { ...share, revoked_at: now(), revoked_reason: "manual_revoke" }
          : share
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
