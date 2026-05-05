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
    athleteLabel: "Athlete",
    unnamedAthlete: "Unnamed athlete",
    cameraViewLabel: "Camera view",
    cameraViews: {
      open_side: "Open side",
      catcher_view: "Catcher view",
      closed_side: "Closed side"
    },
    frameRateLabel: "Frame rate",
    submitVideo: "Submit video",
    flagLowConfidence: "Flag low confidence",
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
    athleteLabel: "選手",
    unnamedAthlete: "未設定の選手",
    cameraViewLabel: "撮影方向",
    cameraViews: {
      open_side: "オープン側",
      catcher_view: "捕手方向",
      closed_side: "クローズ側"
    },
    frameRateLabel: "フレームレート",
    submitVideo: "動画を送信",
    flagLowConfidence: "低信頼度を表示",
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
      trackingComplete: "骨格、フェーズ、信頼度、モデルバージョンを含むプロトタイプ解析が完了しました。",
      lowConfidence: "専門レビュー前に、低信頼度の関節と実験的指標を明示しています。",
      shareCreated: "解析結果に限定した外部共有を作成しました。",
      shareRevoked: "共有を無効化しました。外部アクセスは失敗クローズになります。"
    },
    shareActive: "有効な共有: 解析結果のみ · 30日後に期限切れ。",
    shareRevoked: "共有を無効化しました。外部閲覧者はこの結果にアクセスできません。"
  }
};

const state = {
  language: localStorage.getItem("sports-motion-language") ?? "en",
  athlete: {
    name: "Pitcher A"
  },
  cameraView: "open_side",
  frameRate: 240,
  romVersion: 1,
  shoulderRomMax: 115,
  lowConfidence: false,
  shareActive: false,
  lastNotice: "default",
  metrics: [
    {
      key: "shoulder",
      raw: 108,
      unit: "deg",
      confidence: 0.84,
      maturity: "provisional",
      evidence: "Ide 2024",
      romAdjusted: 0.939
    },
    {
      key: "trunk",
      raw: 620,
      unit: "deg/s",
      confidence: 0.82,
      maturity: "provisional",
      evidence: "McCutcheon 2025",
      romAdjusted: null
    },
    {
      key: "elbowProxy",
      raw: 0.73,
      unit: "index",
      confidence: 0.64,
      maturity: "experimental",
      evidence: "McCutcheon 2025",
      romAdjusted: null
    }
  ]
};

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const languageOptions = document.querySelectorAll(".language-option");
const metricTable = document.querySelector("#metricTable");
const athleteName = document.querySelector("#athleteName");
const athleteInput = document.querySelector("#athleteInput");
const cameraView = document.querySelector("#cameraView");
const frameRate = document.querySelector("#frameRate");
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
  athleteLabel: "athleteLabel",
  cameraViewLabel: "cameraViewLabel",
  cameraOpenSide: "cameraViews.open_side",
  cameraCatcherView: "cameraViews.catcher_view",
  cameraClosedSide: "cameraViews.closed_side",
  frameRateLabel: "frameRateLabel",
  submitVideo: "submitVideo",
  mockFailure: "flagLowConfidence",
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
  return `${metric.raw}${metric.unit === "deg" ? "°" : ` ${metric.unit}`}`;
}

function confidenceLabel(value) {
  return `${Math.round(value * 100)}%`;
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
  setText("romStatus", t("romStatus")(state.romVersion));
  setText("shareState", state.shareActive ? t("shareActive") : t("noShare"));
  setText("notice", localizedNotice());

  languageOptions.forEach((option) => {
    const active = option.dataset.lang === state.language;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
}

function renderAll() {
  athleteName.textContent = state.athlete.name;
  shoulderRomValue.textContent = `${state.shoulderRomMax}°`;
  renderStaticText();
  renderMetrics();
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem("sports-motion-language", language);
  renderAll();
}

function recalculateRom() {
  const ratio = state.metrics[0].raw / state.shoulderRomMax;
  state.metrics[0].romAdjusted = Number(ratio.toFixed(3));
  state.romVersion += 1;
  state.lastNotice = "recalculated";
  renderAll();
}

function updateAthlete() {
  state.athlete.name = athleteInput.value.trim() || t("unnamedAthlete");
  state.cameraView = cameraView.value;
  state.frameRate = Number(frameRate.value);
  state.lastNotice = "videoStaged";
  renderAll();
}

document.querySelector("#submitVideo").addEventListener("click", () => {
  updateAthlete();
  state.lowConfidence = false;
  state.lastNotice = "trackingComplete";
  renderAll();
});

document.querySelector("#mockFailure").addEventListener("click", () => {
  state.lowConfidence = true;
  state.lastNotice = "lowConfidence";
  renderAll();
});

shoulderRom.addEventListener("input", () => {
  state.shoulderRomMax = Number(shoulderRom.value);
  shoulderRomValue.textContent = `${state.shoulderRomMax}°`;
});

document.querySelector("#applyRom").addEventListener("click", recalculateRom);

document.querySelector("#createShare").addEventListener("click", () => {
  state.shareActive = true;
  revokeShare.disabled = false;
  state.lastNotice = "shareCreated";
  renderAll();
});

revokeShare.addEventListener("click", () => {
  state.shareActive = false;
  revokeShare.disabled = true;
  state.lastNotice = "shareRevoked";
  renderAll();
  shareState.textContent = t("shareRevoked");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

renderAll();
