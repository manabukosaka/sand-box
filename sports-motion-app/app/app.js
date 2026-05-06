import { createSportsMotionMockApi } from "../src/mockApi.mjs";

const translations = {
  en: {
    documentTitle: "Sports Motion App",
    languageLabel: "Language",
    appEyebrow: "Pitching analysis",
    syncLabel: "Sync analysis data",
    summaryLabel: "Analysis summary",
    teamLabel: "College pitching group",
    analysisContext: "Single-camera markerless estimate · specialist support only",
    analysisStatus: "Analysis complete",
    romStatus: (version) => `ROM v${version}`,
    tabs: {
      capture: "Capture",
      metrics: "Metrics",
      rom: "ROM",
      share: "Share"
    },
    videoPreviewLabel: "Pitching video preview with skeleton overlay",
    phaseTimelineLabel: "Pitching phase timeline",
    phases: {
      lift: "Lift",
      footContact: "Foot contact",
      release: "Release"
    },
    captureHeading: "Session",
    teamNameLabel: "Team",
    teamStaffLabel: "Primary staff",
    teamSportLabel: "Sport",
    teamLevelLabel: "Team level",
    teamNotesLabel: "Team notes",
    sports: {
      baseball: "Baseball"
    },
    teamLevels: {
      college_adult: "College/adult",
      high_school: "High school",
      youth: "Youth"
    },
    athleteLabel: "Athlete",
    unnamedAthlete: "Unnamed athlete",
    throwingArm: "Throwing arm",
    throwingArms: {
      right: "Right",
      left: "Left"
    },
    rosterStatus: "Roster status",
    rosterStatuses: {
      active: "Active",
      rehab: "Rehab",
      inactive: "Inactive"
    },
    athleteRole: "Role",
    athleteRoles: {
      pitcher: "Pitcher",
      two_way: "Two-way"
    },
    ageGroup: "Age group",
    ageGroups: {
      college_adult: "College/adult",
      high_school: "High school",
      youth: "Youth"
    },
    heightCm: "Height cm",
    bodyMassKg: "Body mass kg",
    cameraViewLabel: "Camera view",
    cameraViews: {
      open_side: "Open side",
      catcher_view: "Catcher view",
      closed_side: "Closed side"
    },
    frameRateLabel: "Frame rate",
    submitVideo: "Submit video",
    flagLowConfidence: "Flag low confidence",
    sessionLabel: "Session label",
    captureVideo: "Record with camera",
    importVideo: "Import video",
    libraryHeading: "Video library",
    librarySubtitle: "Managed videos for this athlete",
    videoSearch: "Search",
    videoStatusFilter: "Status",
    videoCameraFilter: "Camera view",
    videoAnalysisFilter: "Analysis",
    allStatuses: "All statuses",
    allCameraViews: "All views",
    allAnalysisStates: "All analysis states",
    withAnalysis: "With analysis",
    withoutAnalysis: "Without analysis",
    videoStatus: {
      draft: "Draft",
      uploaded: "Uploaded",
      processing: "Processing",
      analyzed: "Analyzed",
      failed: "Failed",
      archived: "Archived",
      deleted: "Deleted"
    },
    videoActions: {
      submit: "Submit",
      queue: "Queue",
      fail: "Fail",
      archive: "Archive",
      restore: "Restore",
      delete: "Delete"
    },
    metricsHeading: "Evidence metrics",
    modelVersion: "Model prototype.0",
    metricHeaders: ["Metric", "Raw", "ROM adjusted", "Confidence", "Maturity"],
    metricNames: {
      shoulder: "Shoulder max external rotation",
      trunk: "Trunk rotation velocity",
      elbowProxy: "Elbow torque proxy"
    },
    maturity: {
      provisional: "provisional",
      experimental: "experimental"
    },
    notApplicable: "N/A",
    ratio: "ratio",
    romHeading: "ROM profile",
    romSubtitle: "Manual override enabled",
    shoulderRomLabel: "Shoulder external rotation max",
    recalculate: "Recalculate",
    romNote: "Raw AI estimates stay unchanged. Recalculation creates a new ROM-adjusted analysis layer.",
    shareHeading: "External review",
    shareSubtitle: "Analysis result only",
    includeVideo: "Include video overlay",
    includeEvidence: "Include evidence notes",
    createShare: "Create share",
    revokeShare: "Revoke",
    noShare: "No active external share.",
    notices: {
      default: "Specialist evaluation support. Outputs are not medical diagnosis or injury prediction.",
      recalculated: (version) =>
        `Recalculated ROM-adjusted layer with ROM v${version}. Raw tracking values were preserved.`,
      videoStaged: (cameraView, frameRate) =>
        `Video metadata staged: ${cameraView.replace("_", " ")} · ${frameRate} fps.`,
      videoSaved: "Video saved to the managed library before AI tracking.",
      videoQueued: "Video marked processing for the prototype analysis queue.",
      videoFailed: "Video marked failed. The video remains available for review or retry.",
      videoArchived: "Video archived. Analysis history remains available.",
      videoDeleted: "Video marked deleted in the prototype library.",
      profileSaved: "Team and athlete attributes saved for this prototype session.",
      trackingComplete: "Prototype tracking run completed with skeleton, phases, confidence, and model version.",
      lowConfidence: "Low-confidence joints and experimental metrics are flagged before specialist review.",
      shareCreated: "External share created with scoped result access.",
      shareRevoked: "Share access fails closed after revocation."
    },
    shareActive: "Active share: analysis result only · expires in 30 days.",
    shareRevoked: "Share revoked. External viewers can no longer access this result."
  },
  ja: {
    documentTitle: "Sports Motion App",
    languageLabel: "言語",
    appEyebrow: "投球動作解析",
    syncLabel: "解析データを同期",
    summaryLabel: "解析サマリー",
    teamLabel: "大学・社会人投手グループ",
    analysisContext: "単眼カメラのマーカーレス推定 · 専門評価補助",
    analysisStatus: "解析完了",
    romStatus: (version) => `ROM v${version}`,
    tabs: {
      capture: "撮影",
      metrics: "指標",
      rom: "ROM",
      share: "共有"
    },
    videoPreviewLabel: "骨格オーバーレイ付き投球動画プレビュー",
    phaseTimelineLabel: "投球フェーズタイムライン",
    phases: {
      lift: "脚上げ",
      footContact: "接地",
      release: "リリース"
    },
    captureHeading: "セッション",
    teamNameLabel: "チーム",
    teamStaffLabel: "主担当",
    teamSportLabel: "競技",
    teamLevelLabel: "チーム区分",
    teamNotesLabel: "チームメモ",
    sports: {
      baseball: "野球"
    },
    teamLevels: {
      college_adult: "大学・社会人",
      high_school: "高校",
      youth: "ユース"
    },
    athleteLabel: "選手",
    unnamedAthlete: "未設定の選手",
    throwingArm: "投球腕",
    throwingArms: {
      right: "右",
      left: "左"
    },
    rosterStatus: "登録状態",
    rosterStatuses: {
      active: "アクティブ",
      rehab: "リハビリ",
      inactive: "非アクティブ"
    },
    athleteRole: "役割",
    athleteRoles: {
      pitcher: "投手",
      two_way: "二刀流"
    },
    ageGroup: "年代",
    ageGroups: {
      college_adult: "大学・社会人",
      high_school: "高校",
      youth: "ユース"
    },
    heightCm: "身長 cm",
    bodyMassKg: "体重 kg",
    cameraViewLabel: "撮影方向",
    cameraViews: {
      open_side: "オープン側",
      catcher_view: "捕手方向",
      closed_side: "クローズ側"
    },
    frameRateLabel: "フレームレート",
    submitVideo: "動画を送信",
    flagLowConfidence: "低信頼度を表示",
    sessionLabel: "セッション名",
    captureVideo: "カメラで撮影",
    importVideo: "動画をインポート",
    libraryHeading: "動画ライブラリ",
    librarySubtitle: "この選手の管理動画",
    videoSearch: "検索",
    videoStatusFilter: "状態",
    videoCameraFilter: "撮影方向",
    videoAnalysisFilter: "解析",
    allStatuses: "すべての状態",
    allCameraViews: "すべての方向",
    allAnalysisStates: "すべての解析状態",
    withAnalysis: "解析あり",
    withoutAnalysis: "解析なし",
    videoStatus: {
      draft: "下書き",
      uploaded: "アップロード済み",
      processing: "処理中",
      analyzed: "解析済み",
      failed: "失敗",
      archived: "アーカイブ",
      deleted: "削除済み"
    },
    videoActions: {
      submit: "送信",
      queue: "キュー投入",
      fail: "失敗にする",
      archive: "保管",
      restore: "復元",
      delete: "削除"
    },
    metricsHeading: "エビデンス指標",
    modelVersion: "モデル prototype.0",
    metricHeaders: ["指標", "Raw値", "ROM補正", "信頼度", "成熟度"],
    metricNames: {
      shoulder: "肩最大外旋",
      trunk: "体幹回旋速度",
      elbowProxy: "肘トルク proxy"
    },
    maturity: {
      provisional: "暫定",
      experimental: "実験的"
    },
    notApplicable: "対象外",
    ratio: "比率",
    romHeading: "ROMプロファイル",
    romSubtitle: "手入力による上書きが有効",
    shoulderRomLabel: "肩外旋 最大可動域",
    recalculate: "再計算",
    romNote: "Raw AI推定値は変更せず、ROM補正済みの解析レイヤーを新しく作成します。",
    shareHeading: "外部レビュー",
    shareSubtitle: "解析結果のみ",
    includeVideo: "動画オーバーレイを含める",
    includeEvidence: "エビデンス注記を含める",
    createShare: "共有を作成",
    revokeShare: "無効化",
    noShare: "有効な外部共有はありません。",
    notices: {
      default: "専門評価補助です。出力は医療診断や傷害予測ではありません。",
      recalculated: (version) => `ROM v${version} で補正レイヤーを再計算しました。Raw tracking値は保持されています。`,
      videoStaged: (cameraView, frameRate) =>
        `動画メタデータを準備しました: ${translations.ja.cameraViews[cameraView]} · ${frameRate} fps。`,
      videoSaved: "AI tracking前の管理動画として保存しました。",
      videoQueued: "プロトタイプ解析キューで処理中にしました。",
      videoFailed: "動画を失敗状態にしました。レビューまたは再試行用に保持されます。",
      videoArchived: "動画をアーカイブしました。解析履歴は保持されます。",
      videoDeleted: "プロトタイプの動画ライブラリで削除済みにしました。",
      profileSaved: "チームと選手属性をこのプロトタイプセッションに保存しました。",
      trackingComplete: "骨格、フェーズ、信頼度、モデルバージョンを含むプロトタイプ解析が完了しました。",
      lowConfidence: "専門レビュー前に、低信頼度の関節と実験的指標を明示しています。",
      shareCreated: "解析結果に限定した外部共有を作成しました。",
      shareRevoked: "共有を無効化しました。外部アクセスは失敗クローズになります。"
    },
    shareActive: "有効な共有: 解析結果のみ · 30日後に期限切れ。",
    shareRevoked: "共有を無効化しました。外部閲覧者はこの結果にアクセスできません。"
  }
};

const api = createSportsMotionMockApi({ storage: localStorage });

const metricKeys = {
  metric_shoulder_max_external_rotation: "shoulder",
  metric_trunk_rotation_velocity: "trunk",
  metric_elbow_torque_proxy: "elbowProxy"
};

const state = {
  language: localStorage.getItem("sports-motion-language") ?? "en",
  athlete: {
    name: "Pitcher A",
    throwingArm: "right",
    role: "pitcher",
    rosterStatus: "active",
    ageGroup: "college_adult",
    heightCm: 185,
    bodyMassKg: 88
  },
  team: {
    name: "College Pitching Group",
    sport: "baseball",
    level: "college_adult",
    primaryStaff: "Pitching coach",
    notes: "Prototype pitching development group"
  },
  cameraView: "open_side",
  frameRate: 240,
  filters: {
    query: "",
    status: "all",
    cameraView: "all",
    analysis: "all"
  },
  selectedVideoId: null,
  romVersion: 1,
  shoulderRomMax: 115,
  lowConfidence: false,
  shareActive: false,
  lastNotice: "default",
  metrics: [],
  videos: []
};

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const languageOptions = document.querySelectorAll(".language-option");
const metricTable = document.querySelector("#metricTable");
const athleteName = document.querySelector("#athleteName");
const teamNameInput = document.querySelector("#teamNameInput");
const teamStaffInput = document.querySelector("#teamStaffInput");
const teamSportInput = document.querySelector("#teamSportInput");
const teamLevelInput = document.querySelector("#teamLevelInput");
const teamNotesInput = document.querySelector("#teamNotesInput");
const athleteInput = document.querySelector("#athleteInput");
const throwingArmInput = document.querySelector("#throwingArmInput");
const athleteRoleInput = document.querySelector("#athleteRoleInput");
const rosterStatusInput = document.querySelector("#rosterStatusInput");
const ageGroupInput = document.querySelector("#ageGroupInput");
const heightInput = document.querySelector("#heightInput");
const bodyMassInput = document.querySelector("#bodyMassInput");
const cameraView = document.querySelector("#cameraView");
const frameRate = document.querySelector("#frameRate");
const sessionLabel = document.querySelector("#sessionLabel");
const captureVideoInput = document.querySelector("#captureVideoInput");
const importVideoInput = document.querySelector("#importVideoInput");
const videoLibrary = document.querySelector("#videoLibrary");
const videoSearchInput = document.querySelector("#videoSearchInput");
const videoStatusFilter = document.querySelector("#videoStatusFilter");
const videoCameraFilter = document.querySelector("#videoCameraFilter");
const videoAnalysisFilter = document.querySelector("#videoAnalysisFilter");
const shoulderRom = document.querySelector("#shoulderRom");
const shoulderRomValue = document.querySelector("#shoulderRomValue");
const notice = document.querySelector("#notice");
const revokeShare = document.querySelector("#revokeShare");
const shareState = document.querySelector("#shareState");

const textTargets = {
  appEyebrow: "appEyebrow",
  teamLabel: "teamLabel",
  analysisContext: "analysisContext",
  analysisStatus: "analysisStatus",
  captureTab: "tabs.capture",
  metricsTab: "tabs.metrics",
  shareTab: "tabs.share",
  phaseFootContact: "phases.footContact",
  phaseRelease: "phases.release",
  phaseLift: "phases.lift",
  timelineFootContact: "phases.footContact",
  timelineRelease: "phases.release",
  captureHeading: "captureHeading",
  teamNameLabel: "teamNameLabel",
  teamStaffLabel: "teamStaffLabel",
  teamSportLabel: "teamSportLabel",
  sportBaseball: "sports.baseball",
  teamLevelLabel: "teamLevelLabel",
  levelCollegeAdult: "teamLevels.college_adult",
  levelHighSchool: "teamLevels.high_school",
  levelYouth: "teamLevels.youth",
  teamNotesLabel: "teamNotesLabel",
  athleteLabel: "athleteLabel",
  throwingArmLabel: "throwingArm",
  throwingRight: "throwingArms.right",
  throwingLeft: "throwingArms.left",
  athleteRoleLabel: "athleteRole",
  rolePitcher: "athleteRoles.pitcher",
  roleTwoWay: "athleteRoles.two_way",
  rosterStatusLabel: "rosterStatus",
  rosterActive: "rosterStatuses.active",
  rosterRehab: "rosterStatuses.rehab",
  rosterInactive: "rosterStatuses.inactive",
  ageGroupLabel: "ageGroup",
  ageCollegeAdult: "ageGroups.college_adult",
  ageHighSchool: "ageGroups.high_school",
  ageYouth: "ageGroups.youth",
  heightLabel: "heightCm",
  bodyMassLabel: "bodyMassKg",
  cameraViewLabel: "cameraViewLabel",
  cameraOpenSide: "cameraViews.open_side",
  cameraCatcherView: "cameraViews.catcher_view",
  cameraClosedSide: "cameraViews.closed_side",
  frameRateLabel: "frameRateLabel",
  sessionLabelText: "sessionLabel",
  captureVideoLabel: "captureVideo",
  importVideoLabel: "importVideo",
  submitVideo: "submitVideo",
  mockFailure: "flagLowConfidence",
  libraryHeading: "libraryHeading",
  librarySubtitle: "librarySubtitle",
  videoSearchLabel: "videoSearch",
  videoStatusFilterLabel: "videoStatusFilter",
  videoCameraFilterLabel: "videoCameraFilter",
  videoAnalysisFilterLabel: "videoAnalysisFilter",
  filterAllStatuses: "allStatuses",
  filterAllCameraViews: "allCameraViews",
  filterAllAnalysis: "allAnalysisStates",
  filterWithAnalysis: "withAnalysis",
  filterWithoutAnalysis: "withoutAnalysis",
  metricsHeading: "metricsHeading",
  modelVersion: "modelVersion",
  romHeading: "romHeading",
  romSubtitle: "romSubtitle",
  shoulderRomLabel: "shoulderRomLabel",
  applyRom: "recalculate",
  shareHeading: "shareHeading",
  shareSubtitle: "shareSubtitle",
  includeVideoLabel: "includeVideo",
  includeEvidenceLabel: "includeEvidence",
  createShare: "createShare",
  revokeShare: "revokeShare"
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((candidate) => candidate.classList.toggle("active", candidate === tab));
    views.forEach((view) => view.classList.toggle("active", view.id === tab.dataset.view));
  });
});

languageOptions.forEach((option) => {
  option.addEventListener("click", () => {
    setLanguage(option.dataset.lang);
  });
});

function t(path) {
  return path.split(".").reduce((value, part) => value?.[part], translations[state.language]);
}

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.textContent = value;
  }
}

function formatMetricValue(metric) {
  if (metric.unit === "index") {
    return metric.raw.toFixed(2);
  }
  if (metric.unit === "deg_per_sec") {
    return `${metric.raw} deg/s`;
  }
  return `${metric.raw}${metric.unit === "deg" ? "°" : ` ${metric.unit}`}`;
}

function confidenceLabel(value) {
  return `${Math.round(value * 100)}%`;
}

function optionalNumber(value) {
  return value === "" ? null : Number(value);
}

function localizedNotice() {
  if (state.lastNotice === "recalculated") {
    return t("notices.recalculated")(state.romVersion);
  }
  if (state.lastNotice === "videoStaged") {
    return t("notices.videoStaged")(state.cameraView, state.frameRate);
  }
  return t(`notices.${state.lastNotice}`) ?? t("notices.default");
}

function renderVideoLibrary() {
  videoLibrary.innerHTML = state.videos
    .filter((video) => video.status !== "deleted")
    .filter((video) => state.filters.status === "all" || video.status === state.filters.status)
    .filter((video) => state.filters.cameraView === "all" || video.camera_view === state.filters.cameraView)
    .filter((video) => {
      if (state.filters.analysis === "with_analysis") {
        return video.analysis_available;
      }
      if (state.filters.analysis === "without_analysis") {
        return !video.analysis_available;
      }
      return true;
    })
    .filter((video) => {
      const query = state.filters.query.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return [video.session_label, video.file_name, video.id, video.status, video.camera_view]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .map((video) => {
      const selected = video.id === state.selectedVideoId ? " selected" : "";
      const label = video.session_label || video.file_name || video.id;
      const analysisState = video.analysis_available ? t("withAnalysis") : t("withoutAnalysis");
      const meta = `${t(`videoStatus.${video.status}`)} · ${t(`cameraViews.${video.camera_view}`)} · ${analysisState} · ${video.frame_rate_fps} fps`;
      const archiveAction =
        video.status === "archived"
          ? `<button class="mini-action" type="button" data-video-action="restore" data-video-id="${video.id}">${t("videoActions.restore")}</button>`
          : `<button class="mini-action" type="button" data-video-action="archive" data-video-id="${video.id}">${t("videoActions.archive")}</button>`;
      const workflowActions =
        video.status === "archived"
          ? ""
          : `
            <button class="mini-action" type="button" data-video-action="queue" data-video-id="${video.id}">${t("videoActions.queue")}</button>
            <button class="mini-action" type="button" data-video-action="fail" data-video-id="${video.id}">${t("videoActions.fail")}</button>
          `;
      return `
        <div class="video-row${selected}">
          <div>
            <strong>${label}</strong>
            <small>${meta}</small>
          </div>
          <span class="status-pill status-${video.status}">${t(`videoStatus.${video.status}`)}</span>
          <div class="video-actions">
            <button class="mini-action" type="button" data-video-action="submit" data-video-id="${video.id}">${t("videoActions.submit")}</button>
            ${workflowActions}
            ${archiveAction}
            <button class="mini-action" type="button" data-video-action="delete" data-video-id="${video.id}">${t("videoActions.delete")}</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderMetrics() {
  const headers = t("metricHeaders");
  const rows = [
    `<div class="metric-row">
      ${headers.map((header) => `<span>${header}</span>`).join("")}
    </div>`
  ];

  state.metrics.forEach((metric) => {
    const romAdjusted =
      metric.romAdjusted === null ? t("notApplicable") : `${metric.romAdjusted.toFixed(3)} ${t("ratio")}`;
    rows.push(`
      <div class="metric-row">
        <div class="metric-name">
          <strong>${t(`metricNames.${metric.key}`)}</strong>
          <span>${metric.evidence}</span>
        </div>
        <span>${formatMetricValue(metric)}</span>
        <span>${romAdjusted}</span>
        <span>${confidenceLabel(state.lowConfidence ? Math.min(metric.confidence, 0.58) : metric.confidence)}</span>
        <span class="maturity ${metric.maturity}">${t(`maturity.${metric.maturity}`)}</span>
      </div>
    `);
  });

  metricTable.innerHTML = rows.join("");
}

function renderStaticText() {
  document.documentElement.lang = state.language;
  document.title = t("documentTitle");
  document.querySelector(".language-switch").setAttribute("aria-label", t("languageLabel"));
  document.querySelector("#summaryBand").setAttribute("aria-label", t("summaryLabel"));
  document.querySelector("#syncButton").setAttribute("aria-label", t("syncLabel"));
  document.querySelector("#syncButton").setAttribute("title", t("syncLabel"));
  document.querySelector("#videoStage").setAttribute("aria-label", t("videoPreviewLabel"));
  document.querySelector("#phaseTimeline").setAttribute("aria-label", t("phaseTimelineLabel"));
  document.querySelector("nav.tabs").setAttribute("aria-label", t("tabs.metrics"));

  Object.entries(textTargets).forEach(([id, path]) => setText(id, t(path)));
  [...videoStatusFilter.options].forEach((option) => {
    if (option.value !== "all") {
      option.textContent = t(`videoStatus.${option.value}`);
    }
  });
  [...videoCameraFilter.options].forEach((option) => {
    if (option.value !== "all") {
      option.textContent = t(`cameraViews.${option.value}`);
    }
  });
  setText("romStatus", t("romStatus")(state.romVersion));
  setText("shareState", state.shareActive ? t("shareActive") : t("noShare"));
  setText("notice", localizedNotice());

  languageOptions.forEach((option) => {
    const active = option.dataset.lang === state.language;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
}

function syncFromSnapshot(snapshot) {
  const shoulderRom = snapshot.romProfile.entries.find(
    (entry) => entry.joint === "shoulder" && entry.movement === "external_rotation"
  );
  state.athlete.name = snapshot.athlete.display_name;
  state.athlete.throwingArm = snapshot.athlete.throwing_arm;
  state.athlete.role = snapshot.athlete.role;
  state.athlete.rosterStatus = snapshot.athlete.roster_status;
  state.athlete.ageGroup = snapshot.athlete.age_group;
  state.athlete.heightCm = snapshot.athlete.height_cm;
  state.athlete.bodyMassKg = snapshot.athlete.body_mass_kg;
  state.team.name = snapshot.team.name;
  state.team.sport = snapshot.team.sport;
  state.team.level = snapshot.team.level;
  state.team.primaryStaff = snapshot.team.primary_staff;
  state.team.notes = snapshot.team.notes;
  state.cameraView = snapshot.video.camera_view;
  state.frameRate = snapshot.video.frame_rate_fps;
  state.romVersion = snapshot.romProfile.version;
  state.shoulderRomMax = shoulderRom.individual_max_deg;
  state.lowConfidence = snapshot.lowConfidence;
  state.shareActive = Boolean(snapshot.activeShare);
  state.videos = snapshot.videos;
  state.selectedVideoId = snapshot.video.id;
  state.metrics = snapshot.analysisRun.metrics.map((metric) => {
    const definition = snapshot.metricDefinitions.find(
      (candidate) => candidate.id === metric.metric_definition_id
    );
    return {
      key: metricKeys[metric.metric_definition_id],
      raw: metric.raw_value,
      unit: metric.unit,
      confidence: metric.confidence,
      maturity: metric.maturity,
      evidence: definition.reference_ids.join(", "),
      romAdjusted: metric.adjusted_value
    };
  });

  athleteInput.value = state.athlete.name;
  teamNameInput.value = state.team.name;
  teamStaffInput.value = state.team.primaryStaff;
  teamSportInput.value = state.team.sport;
  teamLevelInput.value = state.team.level;
  teamNotesInput.value = state.team.notes ?? "";
  throwingArmInput.value = state.athlete.throwingArm;
  athleteRoleInput.value = state.athlete.role;
  rosterStatusInput.value = state.athlete.rosterStatus;
  ageGroupInput.value = state.athlete.ageGroup;
  heightInput.value = state.athlete.heightCm;
  bodyMassInput.value = state.athlete.bodyMassKg;
  cameraView.value = state.cameraView;
  frameRate.value = state.frameRate;
  shoulderRom.value = state.shoulderRomMax;
  revokeShare.disabled = !state.shareActive;
}

function renderAll() {
  athleteName.textContent = state.athlete.name;
  shoulderRomValue.textContent = `${state.shoulderRomMax}°`;
  renderStaticText();
  setText("teamLabel", state.team.name);
  renderMetrics();
  renderVideoLibrary();
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem("sports-motion-language", language);
  renderAll();
}

function recalculateRom() {
  syncFromSnapshot(api.updateShoulderExternalRotationMax(state.shoulderRomMax));
  state.lastNotice = "recalculated";
  renderAll();
}

function updateAthlete() {
  api.updateTeamAttributes({
    name: teamNameInput.value.trim() || state.team.name,
    sport: teamSportInput.value,
    level: teamLevelInput.value,
    primary_staff: teamStaffInput.value.trim() || state.team.primaryStaff,
    notes: teamNotesInput.value.trim() || null
  });
  syncFromSnapshot(
    api.updateAthleteAttributes({
      display_name: athleteInput.value.trim() || t("unnamedAthlete"),
      throwing_arm: throwingArmInput.value,
      age_group: ageGroupInput.value,
      role: athleteRoleInput.value,
      roster_status: rosterStatusInput.value,
      height_cm: optionalNumber(heightInput.value),
      body_mass_kg: optionalNumber(bodyMassInput.value)
    })
  );
  api.updateAthleteProfile({
    display_name: athleteInput.value.trim() || t("unnamedAthlete"),
    camera_view: cameraView.value,
    frame_rate_fps: Number(frameRate.value)
  });
  state.lastNotice = "profileSaved";
  renderAll();
}

function saveVideoFromFile(file, source) {
  if (!file) {
    return;
  }
  api.updateAthleteProfile({
    display_name: athleteInput.value.trim() || t("unnamedAthlete"),
    camera_view: cameraView.value,
    frame_rate_fps: Number(frameRate.value)
  });
  syncFromSnapshot(
    api.saveCapturedVideo({
      capture_source: source,
      capture_type: source === "smartphone_camera" ? "recorded_in_app" : "imported_from_library",
      file_name: file.name,
      file_size_bytes: file.size,
      camera_view: cameraView.value,
      frame_rate_fps: Number(frameRate.value),
      session_label: sessionLabel.value.trim() || file.name,
      notes: source
    })
  );
  state.lastNotice = "videoSaved";
  renderAll();
}

document.querySelector("#submitVideo").addEventListener("click", () => {
  updateAthlete();
  api.updateAthleteProfile({
    display_name: athleteInput.value.trim() || t("unnamedAthlete"),
    camera_view: cameraView.value,
    frame_rate_fps: Number(frameRate.value)
  });
  syncFromSnapshot(
    api.submitVideo({
      video_id: state.selectedVideoId,
      camera_view: cameraView.value,
      frame_rate_fps: Number(frameRate.value),
      lowConfidence: false
    })
  );
  state.lastNotice = "trackingComplete";
  renderAll();
});

document.querySelector("#mockFailure").addEventListener("click", () => {
  syncFromSnapshot(
    api.submitVideo({
      video_id: state.selectedVideoId,
      camera_view: cameraView.value,
      frame_rate_fps: Number(frameRate.value),
      lowConfidence: true
    })
  );
  state.lastNotice = "lowConfidence";
  renderAll();
});

shoulderRom.addEventListener("input", () => {
  state.shoulderRomMax = Number(shoulderRom.value);
  shoulderRomValue.textContent = `${state.shoulderRomMax}°`;
});

captureVideoInput.addEventListener("change", () => {
  saveVideoFromFile(captureVideoInput.files[0], "smartphone_camera");
  captureVideoInput.value = "";
});

importVideoInput.addEventListener("change", () => {
  saveVideoFromFile(importVideoInput.files[0], "media_library");
  importVideoInput.value = "";
});

[
  teamNameInput,
  teamStaffInput,
  teamSportInput,
  teamLevelInput,
  teamNotesInput,
  athleteInput,
  throwingArmInput,
  athleteRoleInput,
  rosterStatusInput,
  ageGroupInput,
  heightInput,
  bodyMassInput
].forEach((input) => {
  input.addEventListener("change", updateAthlete);
});

videoSearchInput.addEventListener("input", () => {
  state.filters.query = videoSearchInput.value;
  renderVideoLibrary();
});

videoStatusFilter.addEventListener("change", () => {
  state.filters.status = videoStatusFilter.value;
  renderVideoLibrary();
});

videoCameraFilter.addEventListener("change", () => {
  state.filters.cameraView = videoCameraFilter.value;
  renderVideoLibrary();
});

videoAnalysisFilter.addEventListener("change", () => {
  state.filters.analysis = videoAnalysisFilter.value;
  renderVideoLibrary();
});

videoLibrary.addEventListener("click", (event) => {
  const button = event.target.closest("[data-video-action]");
  if (!button) {
    return;
  }
  const videoId = button.dataset.videoId;
  const action = button.dataset.videoAction;
  if (action === "submit") {
    syncFromSnapshot(
      api.submitVideo({
        video_id: videoId,
        camera_view: cameraView.value,
        frame_rate_fps: Number(frameRate.value),
        lowConfidence: false
      })
    );
    state.lastNotice = "trackingComplete";
  } else if (action === "queue") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "processing" }));
    state.lastNotice = "videoQueued";
  } else if (action === "fail") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "failed" }));
    state.lastNotice = "videoFailed";
  } else if (action === "archive") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "archived" }));
    state.lastNotice = "videoArchived";
  } else if (action === "restore") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "draft" }));
    state.lastNotice = "videoSaved";
  } else if (action === "delete") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "deleted" }));
    state.lastNotice = "videoDeleted";
  }
  renderAll();
});

document.querySelector("#applyRom").addEventListener("click", recalculateRom);

document.querySelector("#createShare").addEventListener("click", () => {
  syncFromSnapshot(
    api.createShare({
      includeVideo: document.querySelector("#includeVideo").checked,
      includeEvidence: document.querySelector("#includeEvidence").checked
    })
  );
  state.lastNotice = "shareCreated";
  renderAll();
});

revokeShare.addEventListener("click", () => {
  syncFromSnapshot(api.revokeActiveShare());
  state.lastNotice = "shareRevoked";
  renderAll();
  shareState.textContent = t("shareRevoked");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

syncFromSnapshot(api.getSnapshot());
renderAll();
