import { createSportsMotionMockApi } from "../src/mockApi.mjs";
import {
  mediaPipePoseBaselineConfig,
  poseModelRegistry,
  runMediaPipePoseBaseline
} from "../src/browserPoseAdapter.mjs";
import { trackingFailureReason } from "../src/trackingAdapter.mjs";

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
    trackingStatus: {
      completed: "Tracking complete",
      completed_with_warnings: "Tracking warnings",
      failed_retryable: "Tracking retry needed",
      failed_unusable: "Tracking failed"
    },
    trackingSummary: ({ modelVersion, policyVersion, confidence }) =>
      `Model ${modelVersion} · policy ${policyVersion} · ${confidence}% confidence`,
    trackingFailureSummary: ({ modelVersion, policyVersion, reason }) =>
      `Model ${modelVersion} · policy ${policyVersion} · ${reason}`,
    analysisFreshness: {
      current_tracking: "Metrics match the current tracking run.",
      last_valid_analysis: "Metrics show the last valid analysis; the latest tracking run has no metric output.",
      completed_with_warnings: "Analysis completed with suppressed low-confidence metrics."
    },
    trackingFailureReasons: {
      low_athlete_visibility: "Athlete visibility too low",
      missing_required_phases: "Required pitching phases not detected",
      unsupported_camera_view: "Unsupported camera view"
    },
    trackingWarningReasons: {
      overall_confidence_below_caution_threshold: "Overall confidence below caution threshold",
      phase_event_confidence_below_threshold: "Phase-event confidence below threshold",
      required_signal_confidence_below_threshold: "Required signal confidence below threshold"
    },
    trackingSignals: {
      shoulder_angle: "shoulder angle",
      elbow_angle: "elbow angle",
      trunk_orientation: "trunk orientation",
      hip_pelvis: "hip/pelvis",
      lower_body: "lower body"
    },
    romStatus: (version) => `ROM v${version}`,
    tabs: {
      capture: "Capture",
      metrics: "Metrics",
      rom: "ROM",
      review: "Review",
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
    poseModelLabel: "AI model",
    selectedVideoLabel: "Selected pitching video",
    correctionHeading: "Manual phase correction",
    correctionHelp: "Set phase markers from the current video time.",
    correctionReasonLabel: "Correction note",
    setFootContact: "Set foot contact",
    setRelease: "Set release",
    correctionEmpty: "No manual corrections yet.",
    correctionRow: ({ eventName, frame, timeMs, source }) =>
      `${eventName.replace("_", " ")} · frame ${frame} · ${(timeMs / 1000).toFixed(2)}s · ${source}`,
    submitVideo: "Submit video",
    runAiBaseline: "Run AI baseline",
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
      upload_session_created: "Upload session",
      uploading: "Uploading",
      uploaded: "Uploaded",
      processing: "Processing",
      analyzed: "Analyzed",
      failed: "Failed",
      failed_retryable: "Retry needed",
      failed_unusable: "Unusable",
      archived: "Archived",
      deleted: "Deleted"
    },
    videoActions: {
      startUpload: "Start upload",
      interruptUpload: "Interrupt upload",
      completeUpload: "Complete upload",
      submit: "Submit",
      queue: "Queue",
      fail: "Fail",
      failRetryable: "Retry tracking",
      failUnusable: "Reject tracking",
      archive: "Archive",
      restore: "Restore",
      delete: "Delete"
    },
    metricsHeading: "Evidence metrics",
    modelVersion: "Model prototype.",
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
    suppressed: "Suppressed",
    ratio: "ratio",
    romHeading: "ROM profile",
    romSubtitle: "Manual override enabled",
    shoulderRomLabel: "Shoulder external rotation max",
    recalculate: "Recalculate",
    romNote: "Raw AI estimates stay unchanged. Recalculation creates a new ROM-adjusted analysis layer.",
    reviewHeading: "User review packet",
    reviewSubtitle: "Analysis values stay unchanged",
    reviewerRole: "Reviewer role",
    reviewerName: "Reviewer name",
    reviewSummaryLabel: "Review summary",
    reviewActionsLabel: "Action items",
    reviewCautionLabel: "Caution labels acknowledged",
    saveReviewDraft: "Save draft",
    submitReview: "Request user review",
    reviewStatus: {
      draft: "Review draft",
      ready_for_user_review: "User review requested",
      reviewed: "Reviewed"
    },
    reviewerRoles: {
      coach: "Coach",
      trainer: "Trainer",
      athlete: "Athlete",
      external_specialist: "External specialist"
    },
    reviewSummaryItems: {
      analysis: "Analysis",
      tracking: "Tracking",
      provenance: "Provenance",
      phases: "Phase confidence",
      rom: "ROM version",
      warnings: "Warnings",
      suppressed: "Suppressed metrics",
      caution: "Single-camera estimates, experimental metrics, and suppressed outputs remain caution-labeled."
    },
    shareHeading: "External review",
    shareSubtitle: "Analysis result only",
    includeVideo: "Include video overlay",
    includeEvidence: "Include evidence notes",
    includeOverlays: "Include metric overlays",
    includeComments: "Include specialist comments",
    createShare: "Create share",
    rotateShareToken: "Rotate token",
    loadShareLogs: "Load access logs",
    revokeShare: "Revoke",
    noShare: "No active external share.",
    shareLogsEmpty: "No access log entries yet.",
    shareLogsDenied: "Access logs require internal staff scope.",
    shareLogRow: ({ result, scope, reason, time }) =>
      `${time} · ${result} · ${scope}${reason ? ` · ${reason}` : ""}`,
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
      aiBaselineStarted: "Running local MediaPipe pose baseline on the selected video.",
      aiBaselineComplete: "AI baseline completed from local video frames. Review confidence before sharing.",
      aiBaselineUnavailable: "AI baseline needs a selected local video file plus local MediaPipe bundle, wasm, and model files.",
      trackingRetryable: "Prototype tracking failed from capture conditions. The video remains available for retry.",
      trackingUnusable: "Prototype tracking rejected this capture setup. Recapture with supported conditions.",
      lowConfidence: "Low-confidence joints and experimental metrics are flagged before specialist review.",
      reviewDraftSaved: "Review draft saved without changing analysis values.",
      reviewSubmitted: "User review requested. Caution labels stay attached to the analysis packet.",
      reviewNeedsCaution: "Acknowledge caution labels before requesting user review.",
      phaseCorrectionApplied: "Manual phase correction saved as a new tracking and analysis run.",
      phaseCorrectionNeedsVideo: "Select a local video and run or submit analysis before correcting phase markers.",
      shareCreated: "External share created with scoped result access.",
      shareTokenRotated: "Share token rotated. Previous token should be treated as invalid.",
      shareRevoked: "Share access fails closed after revocation.",
      uploadStarted: "Prototype upload session created. Tracking is still gated until completion.",
      uploadInterrupted: "Prototype upload interrupted. Video metadata remains available for retry.",
      uploadCompleted: "Prototype upload completed. Tracking or processing can now start."
    },
    shareActive: "Active share: analysis result only · expires in 3 days.",
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
    trackingStatus: {
      completed: "Tracking完了",
      completed_with_warnings: "Tracking注意",
      failed_retryable: "Tracking再試行",
      failed_unusable: "Tracking失敗"
    },
    trackingSummary: ({ modelVersion, policyVersion, confidence }) =>
      `モデル ${modelVersion} · policy ${policyVersion} · 信頼度 ${confidence}%`,
    trackingFailureSummary: ({ modelVersion, policyVersion, reason }) =>
      `モデル ${modelVersion} · policy ${policyVersion} · ${reason}`,
    analysisFreshness: {
      current_tracking: "指標は現在のtracking runに対応しています。",
      last_valid_analysis: "指標は最後の有効解析を表示しています。最新tracking runには指標出力がありません。",
      completed_with_warnings: "低信頼度の指標を抑制したうえで解析が完了しました。"
    },
    trackingFailureReasons: {
      low_athlete_visibility: "選手の視認性が低すぎます",
      missing_required_phases: "必要な投球フェーズを検出できません",
      unsupported_camera_view: "未対応の撮影方向です"
    },
    trackingWarningReasons: {
      overall_confidence_below_caution_threshold: "全体信頼度が注意閾値未満",
      phase_event_confidence_below_threshold: "フェーズ信頼度が閾値未満",
      required_signal_confidence_below_threshold: "必須シグナル信頼度が閾値未満"
    },
    trackingSignals: {
      shoulder_angle: "肩角度",
      elbow_angle: "肘角度",
      trunk_orientation: "体幹方向",
      hip_pelvis: "股関節/骨盤",
      lower_body: "下肢"
    },
    romStatus: (version) => `ROM v${version}`,
    tabs: {
      capture: "撮影",
      metrics: "指標",
      rom: "ROM",
      review: "レビュー",
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
    poseModelLabel: "AIモデル",
    selectedVideoLabel: "選択中の投球動画",
    correctionHeading: "手動フェーズ補正",
    correctionHelp: "現在の動画再生位置からフェーズマーカーを設定します。",
    correctionReasonLabel: "補正メモ",
    setFootContact: "接地を設定",
    setRelease: "リリースを設定",
    correctionEmpty: "手動補正はまだありません。",
    correctionRow: ({ eventName, frame, timeMs, source }) =>
      `${eventName === "foot_contact" ? "接地" : "リリース"} · frame ${frame} · ${(timeMs / 1000).toFixed(2)}秒 · ${source}`,
    submitVideo: "動画を送信",
    runAiBaseline: "AI baseline解析",
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
      upload_session_created: "アップロード準備",
      uploading: "アップロード中",
      uploaded: "アップロード済み",
      processing: "処理中",
      analyzed: "解析済み",
      failed: "失敗",
      failed_retryable: "再試行が必要",
      failed_unusable: "使用不可",
      archived: "アーカイブ",
      deleted: "削除済み"
    },
    videoActions: {
      startUpload: "アップロード開始",
      interruptUpload: "アップロード中断",
      completeUpload: "アップロード完了",
      submit: "送信",
      queue: "キュー投入",
      fail: "失敗にする",
      failRetryable: "Tracking再試行",
      failUnusable: "Tracking不可",
      archive: "保管",
      restore: "復元",
      delete: "削除"
    },
    metricsHeading: "エビデンス指標",
    modelVersion: "モデル prototype.",
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
    suppressed: "抑制",
    ratio: "比率",
    romHeading: "ROMプロファイル",
    romSubtitle: "手入力による上書きが有効",
    shoulderRomLabel: "肩外旋 最大可動域",
    recalculate: "再計算",
    romNote: "Raw AI推定値は変更せず、ROM補正済みの解析レイヤーを新しく作成します。",
    reviewHeading: "ユーザーレビュー依頼",
    reviewSubtitle: "解析値は変更しません",
    reviewerRole: "レビュアー種別",
    reviewerName: "レビュアー名",
    reviewSummaryLabel: "レビュー要約",
    reviewActionsLabel: "アクション項目",
    reviewCautionLabel: "注意ラベルを確認済み",
    saveReviewDraft: "下書き保存",
    submitReview: "ユーザーレビュー依頼",
    reviewStatus: {
      draft: "レビュー下書き",
      ready_for_user_review: "ユーザーレビュー依頼済み",
      reviewed: "レビュー済み"
    },
    reviewerRoles: {
      coach: "コーチ",
      trainer: "トレーナー",
      athlete: "選手",
      external_specialist: "外部専門家"
    },
    reviewSummaryItems: {
      analysis: "解析",
      tracking: "Tracking",
      provenance: "由来",
      phases: "フェーズ信頼度",
      rom: "ROMバージョン",
      warnings: "注意",
      suppressed: "抑制指標",
      caution: "単眼カメラ推定、実験的指標、抑制された出力の注意ラベルは保持されます。"
    },
    shareHeading: "外部レビュー",
    shareSubtitle: "解析結果のみ",
    includeVideo: "動画オーバーレイを含める",
    includeEvidence: "エビデンス注記を含める",
    includeOverlays: "指標オーバーレイを含める",
    includeComments: "専門家コメントを含める",
    createShare: "共有を作成",
    rotateShareToken: "トークン更新",
    loadShareLogs: "アクセスログを取得",
    revokeShare: "無効化",
    noShare: "有効な外部共有はありません。",
    shareLogsEmpty: "アクセスログはまだありません。",
    shareLogsDenied: "アクセスログの参照には内部スタッフ権限が必要です。",
    shareLogRow: ({ result, scope, reason, time }) =>
      `${time} · ${result} · ${scope}${reason ? ` · ${reason}` : ""}`,
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
      aiBaselineStarted: "選択したローカル動画で MediaPipe pose baseline を実行しています。",
      aiBaselineComplete: "ローカル動画フレームからAI baseline解析が完了しました。共有前に信頼度を確認してください。",
      aiBaselineUnavailable: "AI baselineには選択済みローカル動画と、ローカルMediaPipe bundle、wasm、model fileが必要です。",
      trackingRetryable: "撮影条件によりプロトタイプtrackingが失敗しました。動画は再試行用に保持されます。",
      trackingUnusable: "この撮影条件ではプロトタイプtrackingを利用できません。対応した条件で再撮影してください。",
      lowConfidence: "専門レビュー前に、低信頼度の関節と実験的指標を明示しています。",
      reviewDraftSaved: "解析値を変更せず、レビュー下書きを保存しました。",
      reviewSubmitted: "ユーザーレビューを依頼しました。注意ラベルは解析パケットに保持されます。",
      reviewNeedsCaution: "ユーザーレビュー依頼前に注意ラベルを確認してください。",
      phaseCorrectionApplied: "手動フェーズ補正を新しい tracking / analysis run として保存しました。",
      phaseCorrectionNeedsVideo: "フェーズ補正前にローカル動画を選択し、解析を送信または実行してください。",
      shareCreated: "解析結果に限定した外部共有を作成しました。",
      shareTokenRotated: "共有トークンを更新しました。以前のトークンは無効として扱います。",
      shareRevoked: "共有を無効化しました。外部アクセスは失敗クローズになります。",
      uploadStarted: "プロトタイプのアップロードセッションを作成しました。完了するまでtrackingには進めません。",
      uploadInterrupted: "プロトタイプのアップロードを中断しました。動画メタデータは再試行用に保持されます。",
      uploadCompleted: "プロトタイプのアップロードが完了しました。trackingまたはprocessingに進めます。"
    },
    shareActive: "有効な共有: 解析結果のみ · 3日後に期限切れ。",
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
  poseModelId: mediaPipePoseBaselineConfig.default_model_id,
  filters: {
    query: "",
    status: "all",
    cameraView: "all",
    analysis: "all"
  },
  selectedVideoId: null,
  romVersion: 1,
  shoulderRomMax: 115,
  tracking: {
    status: "completed",
    modelVersion: "prototype.0",
    confidencePolicyVersion: "prototype-policy.0",
    overallConfidence: 0.88,
    phaseEvents: [],
    failureReason: null
  },
  analysisFreshness: "current_tracking",
  analysisRunStatus: "completed",
  selectedVideoFile: null,
  selectedVideoUrl: null,
  trackingCorrections: [],
  analysisReview: {
    id: null,
    reviewerRole: "coach",
    reviewerName: "Pitching coach",
    summary: "",
    actionItems: "",
    status: "draft",
    cautionAcknowledged: false
  },
  shareActive: false,
  lastNotice: "default",
  metrics: [],
  uploadSessions: [],
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
const poseModel = document.querySelector("#poseModel");
const videoPlayer = document.querySelector("#videoPlayer");
const correctionReason = document.querySelector("#correctionReason");
const correctionState = document.querySelector("#correctionState");
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
const rotateShareToken = document.querySelector("#rotateShareToken");
const shareState = document.querySelector("#shareState");
const loadShareLogs = document.querySelector("#loadShareLogs");
const shareLogList = document.querySelector("#shareLogList");
const reviewSummary = document.querySelector("#reviewSummary");
const reviewerRole = document.querySelector("#reviewerRole");
const reviewerName = document.querySelector("#reviewerName");
const reviewSummaryInput = document.querySelector("#reviewSummaryInput");
const reviewActionsInput = document.querySelector("#reviewActionsInput");
const reviewCautionAcknowledged = document.querySelector("#reviewCautionAcknowledged");
const reviewState = document.querySelector("#reviewState");

const textTargets = {
  appEyebrow: "appEyebrow",
  teamLabel: "teamLabel",
  analysisContext: "analysisContext",
  analysisStatus: "analysisStatus",
  captureTab: "tabs.capture",
  metricsTab: "tabs.metrics",
  reviewTab: "tabs.review",
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
  poseModelLabel: "poseModelLabel",
  cameraOpenSide: "cameraViews.open_side",
  cameraCatcherView: "cameraViews.catcher_view",
  cameraClosedSide: "cameraViews.closed_side",
  frameRateLabel: "frameRateLabel",
  sessionLabelText: "sessionLabel",
  correctionHeading: "correctionHeading",
  correctionHelp: "correctionHelp",
  correctionReasonLabel: "correctionReasonLabel",
  setFootContact: "setFootContact",
  setRelease: "setRelease",
  captureVideoLabel: "captureVideo",
  importVideoLabel: "importVideo",
  submitVideo: "submitVideo",
  runAiBaseline: "runAiBaseline",
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
  reviewHeading: "reviewHeading",
  reviewSubtitle: "reviewSubtitle",
  reviewerRoleLabel: "reviewerRole",
  reviewerNameLabel: "reviewerName",
  reviewSummaryLabel: "reviewSummaryLabel",
  reviewActionsLabel: "reviewActionsLabel",
  reviewCautionLabel: "reviewCautionLabel",
  saveReviewDraft: "saveReviewDraft",
  submitReview: "submitReview",
  reviewerCoach: "reviewerRoles.coach",
  reviewerTrainer: "reviewerRoles.trainer",
  reviewerAthlete: "reviewerRoles.athlete",
  reviewerExternalSpecialist: "reviewerRoles.external_specialist",
  shareHeading: "shareHeading",
  shareSubtitle: "shareSubtitle",
  includeVideoLabel: "includeVideo",
  includeEvidenceLabel: "includeEvidence",
  includeOverlaysLabel: "includeOverlays",
  includeCommentsLabel: "includeComments",
  createShare: "createShare",
  rotateShareToken: "rotateShareToken",
  loadShareLogs: "loadShareLogs",
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

poseModelRegistry.forEach((model) => {
  const option = document.createElement("option");
  option.value = model.id;
  option.textContent = `${model.label} · ${model.model_version}`;
  poseModel.append(option);
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

function confidencePercent(value) {
  return Math.round(value * 100);
}

function optionalNumber(value) {
  return value === "" ? null : Number(value);
}

function localizedSuppressionReasons(reasons) {
  return reasons
    .map((reason) => {
      const [reasonKey, signalKey] = reason.split(":");
      const reasonLabel = t(`trackingWarningReasons.${reasonKey}`) ?? reasonKey;
      if (!signalKey) {
        return reasonLabel;
      }
      return `${reasonLabel}: ${t(`trackingSignals.${signalKey}`) ?? signalKey}`;
    })
    .join(" · ");
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

function reviewWarnings() {
  const warnings = [];
  if (state.analysisRunStatus === "completed_with_warnings") {
    warnings.push(t("analysisFreshness.completed_with_warnings"));
  }
  const suppressed = state.metrics
    .filter((metric) => metric.displayStatus === "suppressed_low_confidence")
    .map((metric) => t(`metricNames.${metric.key}`));
  const experimental = state.metrics
    .filter((metric) => metric.maturity === "experimental")
    .map((metric) => t(`metricNames.${metric.key}`));
  return {
    warnings,
    suppressed,
    experimental
  };
}

function renderCorrectionState() {
  if (!state.trackingCorrections.length) {
    correctionState.textContent = t("correctionEmpty");
    return;
  }
  correctionState.innerHTML = state.trackingCorrections
    .map((correction) => {
      const row = t("correctionRow")({
        eventName: correction.event_name,
        frame: correction.corrected_frame,
        timeMs: correction.corrected_time_ms,
        source: correction.corrected_by_name
      });
      return `<div><strong>${row}</strong><small>${correction.reason}</small></div>`;
    })
    .join("");
}

function trackingContextLabel() {
  if (state.tracking.failureReason) {
    return t("trackingFailureSummary")({
      modelVersion: state.tracking.modelVersion,
      policyVersion: state.tracking.confidencePolicyVersion,
      reason: t(`trackingFailureReasons.${state.tracking.failureReason}`)
    }) + ` · ${t(`analysisFreshness.${state.analysisFreshness}`)}`;
  }
  const trackingSummary = t("trackingSummary")({
    modelVersion: state.tracking.modelVersion,
    policyVersion: state.tracking.confidencePolicyVersion,
    confidence: confidencePercent(state.tracking.overallConfidence)
  });
  const warningSummary =
    state.analysisRunStatus === "completed_with_warnings"
      ? ` · ${t("analysisFreshness.completed_with_warnings")}`
      : "";
  return `${trackingSummary} · ${t(`analysisFreshness.${state.analysisFreshness}`)}${warningSummary}`;
}

function correctionProvenanceLabel() {
  if (!state.trackingCorrections.length) {
    return "AI baseline / prototype tracking";
  }
  const lastCorrection = state.trackingCorrections.at(-1);
  return `Manual correction from ${lastCorrection.corrected_by_name} · ${lastCorrection.event_name.replace("_", " ")}`;
}

function latestUploadSession(videoId) {
  return [...state.uploadSessions].reverse().find((session) => session.motion_video_id === videoId) ?? null;
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
      const uploadSession = latestUploadSession(video.id);
      const selected = video.id === state.selectedVideoId ? " selected" : "";
      const label = video.session_label || video.file_name || video.id;
      const analysisState = video.analysis_available ? t("withAnalysis") : t("withoutAnalysis");
      const uploadState = uploadSession ? ` · upload ${uploadSession.status}` : "";
      const meta = `${t(`videoStatus.${video.status}`)}${uploadState} · ${t(`cameraViews.${video.camera_view}`)} · ${analysisState} · ${video.frame_rate_fps} fps`;
      const isLocked = ["archived", "uploaded", "processing", "analyzed"].includes(video.status);
      const canStartUpload = !isLocked && uploadSession?.status !== "active";
      const canInterruptUpload = uploadSession?.status === "active";
      const canCompleteUpload =
        uploadSession?.status === "active" || uploadSession?.status === "interrupted_retryable";
      const uploadActions = [
        canStartUpload
          ? `<button class="mini-action" type="button" data-video-action="startUpload" data-video-id="${video.id}">${t("videoActions.startUpload")}</button>`
          : "",
        canInterruptUpload
          ? `<button class="mini-action" type="button" data-video-action="interruptUpload" data-video-id="${video.id}">${t("videoActions.interruptUpload")}</button>`
          : "",
        canCompleteUpload
          ? `<button class="mini-action" type="button" data-video-action="completeUpload" data-video-id="${video.id}">${t("videoActions.completeUpload")}</button>`
          : ""
      ].join("");
      const archiveAction =
        video.status === "archived"
          ? `<button class="mini-action" type="button" data-video-action="restore" data-video-id="${video.id}">${t("videoActions.restore")}</button>`
          : `<button class="mini-action" type="button" data-video-action="archive" data-video-id="${video.id}">${t("videoActions.archive")}</button>`;
      const workflowActions =
        video.status === "archived"
          ? ""
          : `
            ${uploadActions}
            <button class="mini-action" type="button" data-video-action="queue" data-video-id="${video.id}">${t("videoActions.queue")}</button>
            <button class="mini-action" type="button" data-video-action="fail" data-video-id="${video.id}">${t("videoActions.fail")}</button>
            <button class="mini-action" type="button" data-video-action="failRetryable" data-video-id="${video.id}">${t("videoActions.failRetryable")}</button>
            <button class="mini-action" type="button" data-video-action="failUnusable" data-video-id="${video.id}">${t("videoActions.failUnusable")}</button>
          `;
      const submitAction =
        video.status === "archived"
          ? ""
          : `<button class="mini-action" type="button" data-video-action="submit" data-video-id="${video.id}">${t("videoActions.submit")}</button>`;
      return `
        <div class="video-row${selected}">
          <div>
            <strong>${label}</strong>
            <small>${meta}</small>
          </div>
          <span class="status-pill status-${video.status}">${t(`videoStatus.${video.status}`)}</span>
          <div class="video-actions">
            ${submitAction}
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
    const isSuppressed = metric.displayStatus === "suppressed_low_confidence";
    const rawValue = isSuppressed ? t("suppressed") : formatMetricValue(metric);
    const romAdjusted =
      isSuppressed
        ? t("suppressed")
        : metric.romAdjusted === null
          ? t("notApplicable")
          : `${metric.romAdjusted.toFixed(3)} ${t("ratio")}`;
    rows.push(`
      <div class="metric-row">
        <div class="metric-name">
          <strong>${t(`metricNames.${metric.key}`)}</strong>
          <span>${metric.evidence}</span>
          ${
            isSuppressed && metric.suppressionReasons.length
              ? `<span>${localizedSuppressionReasons(metric.suppressionReasons)}</span>`
              : ""
          }
        </div>
        <span>${rawValue}</span>
        <span>${romAdjusted}</span>
        <span>${confidenceLabel(state.lowConfidence ? Math.min(metric.confidence, .8) : metric.confidence)}</span>
        <span class="maturity ${metric.maturity}">${t(`maturity.${metric.maturity}`)}</span>
      </div>
    `);
  });

  metricTable.innerHTML = rows.join("");
}

function renderReview() {
  const phaseSummary = state.tracking.phaseEvents.length
    ? state.tracking.phaseEvents
        .map((event) => `${event.name.replace("_", " ")} ${confidenceLabel(event.confidence)}`)
        .join(" · ")
    : t("notApplicable");
  const reviewRisk = reviewWarnings();
  const warningText = [
    ...reviewRisk.warnings,
    reviewRisk.experimental.length
      ? `${t("maturity.experimental")}: ${reviewRisk.experimental.join(", ")}`
      : "",
    reviewRisk.suppressed.length
      ? `${t("reviewSummaryItems.suppressed")}: ${reviewRisk.suppressed.join(", ")}`
      : ""
  ].filter(Boolean);

  reviewSummary.innerHTML = `
    <div class="review-card">
      <strong>${t("reviewSummaryItems.analysis")}</strong>
      <span>${state.analysisRunStatus} · ${t(`analysisFreshness.${state.analysisFreshness}`)}</span>
    </div>
    <div class="review-card">
      <strong>${t("reviewSummaryItems.tracking")}</strong>
      <span>${state.tracking.modelVersion} · ${confidenceLabel(state.tracking.overallConfidence)}</span>
    </div>
    <div class="review-card">
      <strong>${t("reviewSummaryItems.provenance")}</strong>
      <span>${correctionProvenanceLabel()}</span>
    </div>
    <div class="review-card">
      <strong>${t("reviewSummaryItems.phases")}</strong>
      <span>${phaseSummary}</span>
    </div>
    <div class="review-card">
      <strong>${t("reviewSummaryItems.rom")}</strong>
      <span>${state.romVersion}</span>
    </div>
    <div class="review-card review-card-wide">
      <strong>${t("reviewSummaryItems.warnings")}</strong>
      <span>${warningText.length ? warningText.join(" · ") : t("reviewSummaryItems.caution")}</span>
    </div>
  `;
  setText("reviewState", t(`reviewStatus.${state.analysisReview.status}`));
}

function renderStaticText() {
  document.documentElement.lang = state.language;
  document.title = t("documentTitle");
  document.querySelector(".language-switch").setAttribute("aria-label", t("languageLabel"));
  document.querySelector("#summaryBand").setAttribute("aria-label", t("summaryLabel"));
  document.querySelector("#syncButton").setAttribute("aria-label", t("syncLabel"));
  document.querySelector("#syncButton").setAttribute("title", t("syncLabel"));
  document.querySelector("#videoStage").setAttribute("aria-label", t("videoPreviewLabel"));
  videoPlayer.setAttribute("aria-label", t("selectedVideoLabel"));
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
  setText("analysisStatus", t(`trackingStatus.${state.tracking.status}`));
  document.querySelector("#analysisStatus").className =
    state.tracking.status === "completed"
      ? "status-pill status-complete"
      : `status-pill status-${state.tracking.status}`;
  setText("shareState", state.shareActive ? t("shareActive") : t("noShare"));
  setText("reviewState", t(`reviewStatus.${state.analysisReview.status}`));
  setText("notice", localizedNotice());

  languageOptions.forEach((option) => {
    const active = option.dataset.lang === state.language;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
}

function renderShareLogs(logs, errorKey = null) {
  if (errorKey) {
    shareLogList.innerHTML = `<div class="share-log-row"><strong>${t(errorKey)}</strong></div>`;
    return;
  }
  if (!logs.length) {
    shareLogList.innerHTML = `<div class="share-log-row"><strong>${t("shareLogsEmpty")}</strong></div>`;
    return;
  }
  shareLogList.innerHTML = logs
    .map((entry) => {
      const row = t("shareLogRow")({
        result: entry.result,
        scope: entry.requester_scope,
        reason: entry.reason,
        time: new Date(entry.accessed_at).toLocaleString(state.language === "ja" ? "ja-JP" : "en-US")
      });
      return `<div class="share-log-row"><strong>${row}</strong><small>${entry.id}</small></div>`;
    })
    .join("");
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
  state.tracking.status = snapshot.trackingRun.status;
  state.tracking.modelVersion = snapshot.trackingRun.model_version;
  state.tracking.confidencePolicyVersion = snapshot.trackingRun.confidence_policy_version;
  state.tracking.overallConfidence = snapshot.trackingRun.overall_confidence;
  state.tracking.phaseEvents = snapshot.trackingRun.phase_events;
  state.tracking.failureReason = snapshot.trackingRun.failure_reason;
  state.analysisFreshness = snapshot.analysisFreshness.status;
  state.analysisRunStatus = snapshot.analysisRun.status;
  state.trackingCorrections = snapshot.trackingCorrections ?? [];
  state.analysisReview = {
    id: snapshot.activeAnalysisReview.id,
    reviewerRole: snapshot.activeAnalysisReview.reviewer_role,
    reviewerName: snapshot.activeAnalysisReview.reviewer_name,
    summary: snapshot.activeAnalysisReview.summary,
    actionItems: snapshot.activeAnalysisReview.action_items,
    status: snapshot.activeAnalysisReview.status,
    cautionAcknowledged: snapshot.activeAnalysisReview.caution_acknowledged
  };
  state.shareActive = Boolean(snapshot.activeShare);
  state.videos = snapshot.videos;
  state.uploadSessions = snapshot.uploadSessions;
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
      romAdjusted: metric.adjusted_value,
      displayStatus: metric.display_status,
      suppressionReasons: metric.suppression_reasons ?? []
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
  poseModel.value = state.poseModelId;
  shoulderRom.value = state.shoulderRomMax;
  reviewerRole.value = state.analysisReview.reviewerRole;
  reviewerName.value = state.analysisReview.reviewerName;
  reviewSummaryInput.value = state.analysisReview.summary;
  reviewActionsInput.value = state.analysisReview.actionItems;
  reviewCautionAcknowledged.checked = state.analysisReview.cautionAcknowledged;
  revokeShare.disabled = !state.shareActive;
  rotateShareToken.disabled = !state.shareActive;
  loadShareLogs.disabled = !state.shareActive;
}

function renderAll() {
  athleteName.textContent = state.athlete.name;
  shoulderRomValue.textContent = `${state.shoulderRomMax}°`;
  renderStaticText();
  setText("teamLabel", state.team.name);
  setText("analysisContext", trackingContextLabel());
  setText("modelVersion", `Model ${state.tracking.modelVersion}`);
  setText("phaseFootContact", t("phases.footContact"));
  setText("phaseRelease", t("phases.release"));
  const footContact = state.tracking.phaseEvents.find((event) => event.name === "foot_contact");
  const release = state.tracking.phaseEvents.find((event) => event.name === "ball_release");
  if (footContact) {
    setText("phaseFootContact", `${t("phases.footContact")} ${confidenceLabel(footContact.confidence)}`);
  }
  if (release) {
    setText("phaseRelease", `${t("phases.release")} ${confidenceLabel(release.confidence)}`);
  }
  renderMetrics();
  renderReview();
  renderCorrectionState();
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

function saveReviewDraft() {
  syncFromSnapshot(
    api.updateAnalysisReviewDraft({
      reviewer_role: reviewerRole.value,
      reviewer_name: reviewerName.value.trim() || t("reviewerRoles.coach"),
      summary: reviewSummaryInput.value.trim(),
      action_items: reviewActionsInput.value.trim(),
      caution_acknowledged: reviewCautionAcknowledged.checked
    })
  );
  state.lastNotice = "reviewDraftSaved";
  renderAll();
}

function submitReviewPacket() {
  saveReviewDraft();
  const snapshot = api.getSnapshot();
  try {
    syncFromSnapshot(
      api.submitAnalysisReview({
        analysis_review_id: snapshot.activeAnalysisReview.id
      })
    );
    state.lastNotice = "reviewSubmitted";
  } catch {
    state.lastNotice = "reviewNeedsCaution";
  }
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
  state.selectedVideoFile = file;
  if (state.selectedVideoUrl) {
    URL.revokeObjectURL(state.selectedVideoUrl);
  }
  state.selectedVideoUrl = URL.createObjectURL(file);
  videoPlayer.src = state.selectedVideoUrl;
  videoPlayer.load();
  state.lastNotice = "videoSaved";
  renderAll();
}

function applyPhaseCorrection(eventName) {
  if (!state.selectedVideoFile || !state.selectedVideoId || !state.tracking.status.startsWith("completed")) {
    state.lastNotice = "phaseCorrectionNeedsVideo";
    renderAll();
    return;
  }
  const correctedTimeMs = Math.max(0, Math.round((videoPlayer.currentTime || 0) * 1000));
  const correctedFrame = Math.max(0, Math.round((correctedTimeMs / 1000) * Number(frameRate.value)));
  syncFromSnapshot(
    api.applyPhaseCorrection({
      event_name: eventName,
      corrected_frame: correctedFrame,
      corrected_time_ms: correctedTimeMs,
      reason: correctionReason.value.trim() || "Manual video review",
      corrected_by_role: reviewerRole.value,
      corrected_by_name: reviewerName.value.trim() || t("reviewerRoles.coach")
    })
  );
  state.lastNotice = "phaseCorrectionApplied";
  renderAll();
}

function submitVideoThroughPrototypeUpload(videoId, lowConfidence, failureReason = null) {
  const video = state.videos.find((candidate) => candidate.id === videoId);
  let snapshot = api.getSnapshot();
  if (video?.status !== "uploaded" && video?.status !== "analyzed") {
    snapshot = api.createUploadSession({
      video_id: videoId,
      expected_bytes: video?.file_size_bytes ?? null,
      file_name: video?.file_name ?? null,
      content_type: "video/mp4"
    });
    snapshot = api.completeUploadSession({
      upload_session_id: snapshot.activeUploadSession.id,
      uploaded_bytes: video?.file_size_bytes ?? null,
      checksum: null
    });
  }
  return api.submitVideo({
    video_id: videoId,
    camera_view: cameraView.value,
    frame_rate_fps: Number(frameRate.value),
    lowConfidence,
    failureReason
  });
}

function completePrototypeUpload(videoId) {
  const video = state.videos.find((candidate) => candidate.id === videoId);
  if (!video || video.status === "uploaded" || video.status === "analyzed") {
    return api.getSnapshot();
  }
  const latestSession = latestUploadSession(videoId);
  const sessionSnapshot =
    latestSession?.status === "active" || latestSession?.status === "interrupted_retryable"
      ? api.getSnapshot()
      : api.createUploadSession({
          video_id: videoId,
          expected_bytes: video.file_size_bytes ?? null,
          file_name: video.file_name ?? null,
          content_type: "video/mp4"
        });
  const uploadSession = latestSession?.status === "active" || latestSession?.status === "interrupted_retryable"
    ? latestSession
    : sessionSnapshot.activeUploadSession;
  return api.completeUploadSession({
    upload_session_id: uploadSession.id,
    uploaded_bytes: video.file_size_bytes ?? null,
    checksum: null
  });
}

function startPrototypeUpload(videoId) {
  const video = state.videos.find((candidate) => candidate.id === videoId);
  if (
    !video ||
    video.status === "uploaded" ||
    video.status === "processing" ||
    video.status === "analyzed"
  ) {
    return api.getSnapshot();
  }
  return api.createUploadSession({
    video_id: videoId,
    expected_bytes: video.file_size_bytes ?? null,
    file_name: video.file_name ?? null,
    content_type: "video/mp4"
  });
}

function interruptPrototypeUpload(videoId) {
  const uploadSession = latestUploadSession(videoId);
  if (!uploadSession || uploadSession.status !== "active") {
    return api.getSnapshot();
  }
  return api.interruptUploadSession({
    upload_session_id: uploadSession.id,
    uploaded_bytes: Math.min(uploadSession.expected_bytes ?? 0, 24000)
  });
}

document.querySelector("#submitVideo").addEventListener("click", () => {
  updateAthlete();
  api.updateAthleteProfile({
    display_name: athleteInput.value.trim() || t("unnamedAthlete"),
    camera_view: cameraView.value,
    frame_rate_fps: Number(frameRate.value)
  });
  syncFromSnapshot(submitVideoThroughPrototypeUpload(state.selectedVideoId, false));
  state.lastNotice = "trackingComplete";
  renderAll();
});

document.querySelector("#runAiBaseline").addEventListener("click", async () => {
  if (!state.selectedVideoFile || !state.selectedVideoId) {
    state.lastNotice = "aiBaselineUnavailable";
    renderAll();
    return;
  }
  state.lastNotice = "aiBaselineStarted";
  renderAll();
  try {
    const uploaded = completePrototypeUpload(state.selectedVideoId);
    syncFromSnapshot(uploaded);
    const trackingResult = await runMediaPipePoseBaseline({
      file: state.selectedVideoFile,
      tracking_run_id: `local_${Date.now()}`,
      frame_rate_fps: Number(frameRate.value),
      config: {
        ...mediaPipePoseBaselineConfig,
        model_id: poseModel.value
      }
    });
    syncFromSnapshot(
      api.submitVideoWithTrackingResult({
        video_id: state.selectedVideoId,
        camera_view: cameraView.value,
        frame_rate_fps: Number(frameRate.value),
        trackingResult
      })
    );
    state.lastNotice = "aiBaselineComplete";
  } catch (error) {
    console.warn(error);
    state.lastNotice = "aiBaselineUnavailable";
  }
  renderAll();
});

poseModel.addEventListener("change", () => {
  state.poseModelId = poseModel.value;
});

document.querySelector("#mockFailure").addEventListener("click", () => {
  syncFromSnapshot(submitVideoThroughPrototypeUpload(state.selectedVideoId, true));
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
  if (action === "startUpload") {
    syncFromSnapshot(startPrototypeUpload(videoId));
    state.lastNotice = "uploadStarted";
  } else if (action === "interruptUpload") {
    syncFromSnapshot(interruptPrototypeUpload(videoId));
    state.lastNotice = "uploadInterrupted";
  } else if (action === "completeUpload") {
    syncFromSnapshot(completePrototypeUpload(videoId));
    state.lastNotice = "uploadCompleted";
  } else if (action === "submit") {
    syncFromSnapshot(submitVideoThroughPrototypeUpload(videoId, false));
    state.lastNotice = "trackingComplete";
  } else if (action === "queue") {
    syncFromSnapshot(completePrototypeUpload(videoId));
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "processing" }));
    state.lastNotice = "videoQueued";
  } else if (action === "fail") {
    syncFromSnapshot(api.updateVideoStatus({ video_id: videoId, status: "failed" }));
    state.lastNotice = "videoFailed";
  } else if (action === "failRetryable") {
    syncFromSnapshot(
      submitVideoThroughPrototypeUpload(videoId, false, trackingFailureReason.LOW_ATHLETE_VISIBILITY)
    );
    state.lastNotice = "trackingRetryable";
  } else if (action === "failUnusable") {
    syncFromSnapshot(
      submitVideoThroughPrototypeUpload(videoId, false, trackingFailureReason.UNSUPPORTED_CAMERA_VIEW)
    );
    state.lastNotice = "trackingUnusable";
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
document.querySelector("#setFootContact").addEventListener("click", () => applyPhaseCorrection("foot_contact"));
document.querySelector("#setRelease").addEventListener("click", () => applyPhaseCorrection("ball_release"));
document.querySelector("#saveReviewDraft").addEventListener("click", saveReviewDraft);
document.querySelector("#submitReview").addEventListener("click", submitReviewPacket);

document.querySelector("#createShare").addEventListener("click", () => {
  syncFromSnapshot(
    api.createShare({
      includeVideo: document.querySelector("#includeVideo").checked,
      includeEvidence: document.querySelector("#includeEvidence").checked,
      includeOverlays: document.querySelector("#includeOverlays").checked,
      includeComments: document.querySelector("#includeComments").checked
    })
  );
  state.lastNotice = "shareCreated";
  renderShareLogs([]);
  renderAll();
});

revokeShare.addEventListener("click", () => {
  syncFromSnapshot(api.revokeActiveShare());
  state.lastNotice = "shareRevoked";
  renderAll();
  shareState.textContent = t("shareRevoked");
  renderShareLogs([]);
});

rotateShareToken.addEventListener("click", () => {
  const snapshot = api.getSnapshot();
  if (!snapshot.activeShare) {
    return;
  }
  syncFromSnapshot(api.rotateShareToken({ share_link_id: snapshot.activeShare.id }));
  state.lastNotice = "shareTokenRotated";
  renderAll();
});

loadShareLogs.addEventListener("click", () => {
  const snapshot = api.getSnapshot();
  if (!snapshot.activeShare) {
    renderShareLogs([]);
    return;
  }
  try {
    const logs = api.getShareAccessLogs({
      share_link_id: snapshot.activeShare.id,
      requester_scope: "internal_staff"
    });
    renderShareLogs(logs);
  } catch {
    renderShareLogs([], "shareLogsDenied");
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

syncFromSnapshot(api.getSnapshot());
renderShareLogs([]);
renderAll();
