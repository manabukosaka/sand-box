import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Language = "en" | "ja";
type TabKey = "capture" | "metrics" | "rom" | "review" | "share";
type PermissionState = "unknown" | "granted" | "denied";
type UploadStatus = "not_ready" | "ready" | "uploading" | "interrupted" | "submitted";
type DraftStatus = "loading" | "saved" | "restored" | "error";
type VideoSource = "camera" | "library";
type CorrectionEvent = "foot_contact" | "ball_release";
type ReviewerRole = "coach" | "trainer" | "athlete" | "external_specialist";
type ReviewStatus = "draft" | "ready_for_user_review" | "reviewed";

type StoredVideoAsset = {
  source: VideoSource;
  uri: string;
  fileName: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  durationLabel: string;
  capturedAt: string;
};

type PhaseCorrection = {
  eventName: CorrectionEvent;
  frame: number;
  timeMs: number;
  note: string;
  createdAt: string;
};

type ShareVideoPayload = {
  source: VideoSource;
  fileName: string;
  uri: string;
  width: number | null;
  height: number | null;
  durationLabel: string;
  capturedAt: string;
};

type ShareOverlaysPayload = {
  phaseSummary: string;
  corrections: Array<{
    eventName: CorrectionEvent;
    frame: number;
    timeMs: number;
    note: string;
  }>;
};

type ShareEvidencePayload = {
  rawTracking: Array<{ name: string; value: string }>;
  romAdjusted: Array<{ name: string; value: string }>;
};

const copy = {
  en: {
    title: "Sports Motion",
    eyebrow: "Pitching analysis",
    context: "Single-camera estimate · specialist support only",
    tabs: {
      capture: "Capture",
      metrics: "Metrics",
      rom: "ROM",
      review: "Review",
      share: "Share"
    },
    team: "Team",
    athlete: "Athlete",
    cameraView: "Camera view",
    session: "Session",
    record: "Record",
    import: "Import",
    draft: "Local draft",
    tracking: "Tracking",
    model: "Model",
    policy: "Policy",
    confidence: "Confidence",
    phaseConfidence: "Phase confidence",
    metrics: "Evidence metrics",
    raw: "Raw",
    adjusted: "ROM adjusted",
    rom: "Shoulder ER max",
    share: "Result-scoped share",
    shareNote: "Prototype share controls only. Real access control is not implemented.",
    notice: "Outputs are specialist evaluation support, not clinical conclusions.",
    noVideo: "No local video selected",
    selectedVideo: "Selected local video",
    saved: "Draft saved on this device",
    saveError: "Draft could not be saved",
    reset: "Reset draft",
    restored: "Restored local draft",
    permission: "Permission",
    cameraPermission: "Camera",
    libraryPermission: "Media library",
    granted: "Granted",
    denied: "Denied",
    unknown: "Not checked",
    metadata: "Video metadata",
    source: "Source",
    resolution: "Resolution",
    duration: "Duration",
    overlay: "Phase overlay preview",
    upload: "Upload simulation",
    uploadStatus: "Upload status",
    notReady: "Waiting for local video",
    ready: "Ready to submit",
    uploading: "Uploading metadata",
    interrupted: "Interrupted",
    submitted: "Submitted to mock flow",
    submit: "Submit",
    interrupt: "Interrupt",
    retry: "Retry",
    correction: "Phase correction",
    setFoot: "Set foot",
    setRelease: "Set release",
    correctionNote: "Manual correction from playback review",
    noCorrections: "No manual phase corrections yet",
    review: "Review packet",
    reviewNote: "Reviewer notes and caution acknowledgement stay separate from metrics.",
    packetStatus: "Packet status",
    reviewerRole: "Reviewer role",
    reviewerName: "Reviewer name",
    summary: "Summary",
    actionItems: "Action items",
    caution: "Acknowledge low-confidence and experimental metric caution",
    userReview: "Request user review",
    reviewRequested: "User review requested",
    requestedAt: "Requested at",
    reviewDraft: "Draft review packet",
    comments: "Review comments",
    includeComments: "Include comments",
    excludeComments: "Exclude comments",
    commentsExcluded: "Comments excluded from shared payload",
    commentsIncluded: "Comments included in shared payload",
    shareScope: "Share scope",
    shareScopeDefault: "Defaults stay off until you switch them on.",
    shareVideo: "Include video",
    shareOverlays: "Include overlays",
    shareEvidence: "Include evidence notes",
    payloadPreview: "Local share payload preview",
    payloadNote: "The preview stays local and shows exactly what would be exported.",
    payloadComments: "Share comments",
    payloadVideo: "Share video",
    payloadOverlays: "Share overlays",
    payloadEvidence: "Share evidence",
    payloadExcluded: "comments: null",
    payloadIncluded: "comments: included",
    payloadOmitted: "omitted by default",
    rawMetricsHeader: "Raw tracking layer",
    romMetricsHeader: "ROM-adjusted layer"
  },
  ja: {
    title: "Sports Motion",
    eyebrow: "投球動作解析",
    context: "単眼カメラ推定 · 専門評価補助",
    tabs: {
      capture: "撮影",
      metrics: "指標",
      rom: "ROM",
      review: "レビュー",
      share: "共有"
    },
    team: "チーム",
    athlete: "選手",
    cameraView: "撮影方向",
    session: "セッション",
    record: "撮影",
    import: "インポート",
    draft: "ローカル下書き",
    tracking: "Tracking",
    model: "モデル",
    policy: "Policy",
    confidence: "信頼度",
    phaseConfidence: "フェーズ信頼度",
    metrics: "エビデンス指標",
    raw: "Raw値",
    adjusted: "ROM補正",
    rom: "肩外旋最大",
    share: "解析結果単位の共有",
    shareNote: "プロトタイプの共有操作のみです。実アクセス制御は未実装です。",
    notice: "出力は専門評価補助であり、臨床的な結論ではありません。",
    noVideo: "ローカル動画は未選択",
    selectedVideo: "ローカル動画を選択済み",
    saved: "この端末に下書きを保存済み",
    saveError: "下書きを保存できませんでした",
    reset: "下書きリセット",
    restored: "ローカル下書きを復元済み",
    permission: "権限",
    cameraPermission: "カメラ",
    libraryPermission: "メディアライブラリ",
    granted: "許可",
    denied: "拒否",
    unknown: "未確認",
    metadata: "動画メタデータ",
    source: "ソース",
    resolution: "解像度",
    duration: "長さ",
    overlay: "フェーズオーバーレイプレビュー",
    upload: "アップロードシミュレーション",
    uploadStatus: "アップロード状態",
    notReady: "ローカル動画待ち",
    ready: "送信準備完了",
    uploading: "メタデータ送信中",
    interrupted: "中断",
    submitted: "モックフロー送信済み",
    submit: "送信",
    interrupt: "中断",
    retry: "再試行",
    correction: "フェーズ補正",
    setFoot: "接地を設定",
    setRelease: "リリースを設定",
    correctionNote: "動画レビューによる手動補正",
    noCorrections: "手動フェーズ補正はまだありません",
    review: "レビュー依頼",
    reviewNote: "レビューメモと注意確認は指標とは分離して保持します。",
    packetStatus: "パケット状態",
    reviewerRole: "レビュー担当",
    reviewerName: "担当者名",
    summary: "サマリー",
    actionItems: "アクション項目",
    caution: "低信頼度と実験的指標の注意を確認",
    userReview: "ユーザーレビュー依頼",
    reviewRequested: "ユーザーレビュー依頼済み",
    requestedAt: "依頼時刻",
    reviewDraft: "レビュー下書き",
    comments: "レビューコメント",
    includeComments: "コメントを含める",
    excludeComments: "コメントを含めない",
    commentsExcluded: "共有ペイロードからコメントを除外",
    commentsIncluded: "共有ペイロードにコメントを含める",
    shareScope: "共有範囲",
    shareScopeDefault: "初期値はオフです。必要な範囲だけ有効にします。",
    shareVideo: "動画を含める",
    shareOverlays: "オーバーレイを含める",
    shareEvidence: "エビデンスメモを含める",
    payloadPreview: "ローカル共有ペイロードのプレビュー",
    payloadNote: "プレビューは端末内にとどまり、出力内容をそのまま確認できます。",
    payloadComments: "共有コメント",
    payloadVideo: "共有動画",
    payloadOverlays: "共有オーバーレイ",
    payloadEvidence: "共有エビデンス",
    payloadExcluded: "comments: null",
    payloadIncluded: "comments: 含める",
    payloadOmitted: "デフォルトでは除外",
    rawMetricsHeader: "Raw計測レイヤー",
    romMetricsHeader: "ROM補正レイヤー"
  }
};

const draftStorageKey = "sports-motion.mobile.active-draft.v1";

const seed = {
  team: "College Pitching Group",
  athlete: "Pitcher A",
  cameraView: "open_side",
  session: "Bullpen session",
  trackingStatus: "completed_with_warnings",
  analysisRunId: "ana_prototype_active",
  modelVersion: "prototype.1",
  confidencePolicy: "prototype-policy.1",
  confidence: 58,
  phaseEvents: [
    { name: "Foot contact", confidence: 58 },
    { name: "Release", confidence: 56 }
  ],
  metrics: [
    { name: "Shoulder max external rotation", raw: "108°", adjusted: "0.939 ratio" },
    { name: "Trunk rotation velocity", raw: "620 deg/s", adjusted: "N/A" },
    { name: "Elbow torque proxy", raw: "0.73 index", adjusted: "N/A" }
  ]
};

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabKey>("capture");
  const [team, setTeam] = useState(seed.team);
  const [athlete, setAthlete] = useState(seed.athlete);
  const [session, setSession] = useState(seed.session);
  const [selectedVideo, setSelectedVideo] = useState<StoredVideoAsset | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("not_ready");
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("loading");
  const [cameraPermission, setCameraPermission] = useState<PermissionState>("unknown");
  const [libraryPermission, setLibraryPermission] = useState<PermissionState>("unknown");
  const [phaseCorrections, setPhaseCorrections] = useState<PhaseCorrection[]>([]);
  const [reviewerRole, setReviewerRole] = useState<ReviewerRole>("coach");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewSummary, setReviewSummary] = useState("");
  const [reviewActionItems, setReviewActionItems] = useState("");
  const [cautionAcknowledged, setCautionAcknowledged] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("draft");
  const [reviewSubmittedAt, setReviewSubmittedAt] = useState<string | null>(null);
  const [includeReviewComments, setIncludeReviewComments] = useState(false);
  const [shareVideoEnabled, setShareVideoEnabled] = useState(false);
  const [shareOverlaysEnabled, setShareOverlaysEnabled] = useState(false);
  const [shareEvidenceEnabled, setShareEvidenceEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const text = copy[language];

  const phaseSummary = useMemo(
    () => seed.phaseEvents.map((event) => `${event.name} ${event.confidence}%`).join(" · "),
    []
  );
  const rawMetrics = useMemo(
    () => seed.metrics.map((metric) => ({ name: metric.name, value: metric.raw })),
    []
  );
  const romMetrics = useMemo(
    () => seed.metrics.map((metric) => ({ name: metric.name, value: metric.adjusted })),
    []
  );

  useEffect(() => {
    let active = true;
    async function restoreDraft() {
      try {
        const stored = await AsyncStorage.getItem(draftStorageKey);
        if (!active) {
          return;
        }
        if (stored) {
          const draft = JSON.parse(stored);
          setTeam(draft.team || seed.team);
          setAthlete(draft.athlete || seed.athlete);
          setSession(draft.session || seed.session);
          setSelectedVideo(draft.selectedVideo || null);
          setUploadStatus(draft.uploadStatus || (draft.selectedVideo ? "ready" : "not_ready"));
          setPhaseCorrections(draft.phaseCorrections || []);
          setReviewerRole(draft.reviewerRole || "coach");
          setReviewerName(draft.reviewerName || "");
          setReviewSummary(draft.reviewSummary || "");
          setReviewActionItems(draft.reviewActionItems || "");
          setCautionAcknowledged(Boolean(draft.cautionAcknowledged));
          setReviewStatus(draft.reviewStatus || "draft");
          setReviewSubmittedAt(draft.reviewSubmittedAt || null);
          setIncludeReviewComments(Boolean(draft.includeReviewComments));
          setShareVideoEnabled(Boolean(draft.shareVideoEnabled));
          setShareOverlaysEnabled(Boolean(draft.shareOverlaysEnabled));
          setShareEvidenceEnabled(Boolean(draft.shareEvidenceEnabled));
          setDraftStatus("restored");
        } else {
          setDraftStatus("saved");
        }
      } catch {
        if (active) {
          setDraftStatus("error");
        }
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }
    restoreDraft();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const draft = JSON.stringify({
      team,
      athlete,
      session,
      selectedVideo,
      uploadStatus,
      phaseCorrections,
      reviewerRole,
      reviewerName,
      reviewSummary,
      reviewActionItems,
      cautionAcknowledged,
      reviewStatus,
      reviewSubmittedAt,
      includeReviewComments,
      shareVideoEnabled,
      shareOverlaysEnabled,
      shareEvidenceEnabled
    });
    AsyncStorage.setItem(draftStorageKey, draft)
      .then(() => setDraftStatus("saved"))
      .catch(() => setDraftStatus("error"));
  }, [
    athlete,
    cautionAcknowledged,
    hydrated,
    includeReviewComments,
    phaseCorrections,
    reviewerName,
    reviewerRole,
    reviewActionItems,
    reviewStatus,
    reviewSubmittedAt,
    reviewSummary,
    selectedVideo,
    session,
    shareEvidenceEnabled,
    shareOverlaysEnabled,
    shareVideoEnabled,
    team,
    uploadStatus
  ]);

  async function selectVideo(source: VideoSource) {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (source === "camera") {
      setCameraPermission(permission.granted ? "granted" : "denied");
    } else {
      setLibraryPermission(permission.granted ? "granted" : "denied");
    }
    if (!permission.granted) {
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: "videos",
      allowsEditing: false,
      quality: 1
    };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets?.[0]) {
      setSelectedVideo(toStoredVideoAsset(result.assets[0], source));
      setUploadStatus("ready");
    }
  }

  function submitDraft() {
    if (!selectedVideo) {
      setUploadStatus("not_ready");
      return;
    }
    setUploadStatus("uploading");
    setTimeout(() => {
      setUploadStatus((current) => (current === "uploading" ? "submitted" : current));
    }, 500);
  }

  function interruptUpload() {
    if (selectedVideo) {
      setUploadStatus("interrupted");
    }
  }

  async function resetDraft() {
    setTeam(seed.team);
    setAthlete(seed.athlete);
    setSession(seed.session);
    setSelectedVideo(null);
    setPhaseCorrections([]);
    setUploadStatus("not_ready");
    setReviewerRole("coach");
    setReviewerName("");
    setReviewSummary("");
    setReviewActionItems("");
    setCautionAcknowledged(false);
    setReviewStatus("draft");
    setReviewSubmittedAt(null);
    setIncludeReviewComments(false);
    setShareVideoEnabled(false);
    setShareOverlaysEnabled(false);
    setShareEvidenceEnabled(false);
    try {
      await AsyncStorage.removeItem(draftStorageKey);
      setDraftStatus("saved");
    } catch {
      setDraftStatus("error");
    }
  }

  function addPhaseCorrection(eventName: CorrectionEvent) {
    if (!selectedVideo) {
      setUploadStatus("not_ready");
      return;
    }
    const nextIndex = phaseCorrections.length + 1;
    setPhaseCorrections((current) => [
      ...current,
      {
        eventName,
        frame: eventName === "foot_contact" ? 112 + nextIndex : 184 + nextIndex,
        timeMs: eventName === "foot_contact" ? 467 + nextIndex * 4 : 767 + nextIndex * 4,
        note: text.correctionNote,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  function submitReviewPacket() {
    if (!cautionAcknowledged) {
      return;
    }
    setReviewStatus("ready_for_user_review");
    setReviewSubmittedAt(new Date().toISOString());
  }

  function markReviewDraftAfterEdit() {
    setReviewStatus((current) =>
      current === "ready_for_user_review" || current === "reviewed" ? "draft" : current
    );
    setReviewSubmittedAt((current) =>
      reviewStatus === "ready_for_user_review" || reviewStatus === "reviewed" ? null : current
    );
  }

  function updateReviewerRole(value: ReviewerRole) {
    markReviewDraftAfterEdit();
    setReviewerRole(value);
  }

  function updateReviewerName(value: string) {
    markReviewDraftAfterEdit();
    setReviewerName(value);
  }

  function updateReviewSummary(value: string) {
    markReviewDraftAfterEdit();
    setReviewSummary(value);
  }

  function updateReviewActionItems(value: string) {
    markReviewDraftAfterEdit();
    setReviewActionItems(value);
  }

  function toggleCautionAcknowledgement() {
    markReviewDraftAfterEdit();
    setCautionAcknowledged((current) => !current);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.shell}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.eyebrow}>{text.eyebrow}</Text>
            <Text style={styles.title}>{text.title}</Text>
          </View>
          <View style={styles.languageSwitch}>
            {(["en", "ja"] as const).map((locale) => (
              <Pressable
                key={locale}
                accessibilityRole="button"
                style={[styles.languageButton, language === locale && styles.languageButtonActive]}
                onPress={() => setLanguage(locale)}
              >
                <Text style={[styles.languageText, language === locale && styles.languageTextActive]}>
                  {locale === "en" ? "EN" : "日本語"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryCopy}>
            <Text style={styles.eyebrow}>{team}</Text>
            <Text style={styles.athlete}>{athlete}</Text>
            <Text style={styles.muted}>{text.context}</Text>
          </View>
          <View style={styles.statusStack}>
            <Text style={[styles.pill, styles.warningPill]}>{text.tracking}</Text>
            <Text style={styles.pill}>ROM v1</Text>
          </View>
        </View>

        {activeTab === "capture" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.tabs.capture}</Text>
            <Field label={text.team} value={team} onChangeText={setTeam} />
            <Field label={text.athlete} value={athlete} onChangeText={setAthlete} />
            <Field label={text.session} value={session} onChangeText={setSession} />
            <InfoRow label={text.cameraView} value={seed.cameraView} />
            <PermissionSummary
              text={text}
              cameraPermission={cameraPermission}
              libraryPermission={libraryPermission}
            />
            <View style={styles.actions}>
              <ActionButton label={text.record} onPress={() => selectVideo("camera")} />
              <ActionButton label={text.import} onPress={() => selectVideo("library")} />
            </View>
            <View style={styles.videoPreview}>
              <Text style={styles.videoLabel}>
                {selectedVideo ? text.selectedVideo : text.noVideo}
              </Text>
              <Text style={styles.muted}>{selectedVideo?.fileName ?? selectedVideo?.uri ?? text.draft}</Text>
              {selectedVideo && <NativeVideoPreview text={text} video={selectedVideo} />}
            </View>
            {selectedVideo && <VideoMetadata text={text} video={selectedVideo} />}
            <UploadSimulation
              text={text}
              uploadStatus={uploadStatus}
              hasVideo={Boolean(selectedVideo)}
              onSubmit={submitDraft}
              onInterrupt={interruptUpload}
            />
            <PhaseCorrectionPanel
              text={text}
              corrections={phaseCorrections}
              onCorrectFoot={() => addPhaseCorrection("foot_contact")}
              onCorrectRelease={() => addPhaseCorrection("ball_release")}
            />
            <View style={styles.draftBar}>
              <Text style={styles.draftStatus}>
                {draftStatus === "restored" ? text.restored : draftStatus === "error" ? text.saveError : text.saved}
              </Text>
              <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={resetDraft}>
                <Text style={styles.secondaryText}>{text.reset}</Text>
              </Pressable>
            </View>
            <TrackingSummary text={text} phaseSummary={phaseSummary} />
          </View>
        )}

        {activeTab === "metrics" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.metrics}</Text>
            <MetricSection
              title={text.rawMetricsHeader}
              valueLabel={text.raw}
              metrics={rawMetrics}
            />
            <MetricSection
              title={text.romMetricsHeader}
              valueLabel={text.adjusted}
              metrics={romMetrics}
            />
          </View>
        )}

        {activeTab === "rom" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.tabs.rom}</Text>
            <InfoRow label={text.rom} value="115°" />
            <Text style={styles.muted}>Raw tracking and ROM-adjusted layers stay separate.</Text>
          </View>
        )}

        {activeTab === "review" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.review}</Text>
            <Text style={styles.muted}>{text.reviewNote}</Text>
            <TrackingSummary text={text} phaseSummary={phaseSummary} />
            <PhaseCorrectionList text={text} corrections={phaseCorrections} />
            <ReviewPacket
              text={text}
              reviewerRole={reviewerRole}
              reviewerName={reviewerName}
              summary={reviewSummary}
              actionItems={reviewActionItems}
              cautionAcknowledged={cautionAcknowledged}
              reviewStatus={reviewStatus}
              submittedAt={reviewSubmittedAt}
              onReviewerRoleChange={updateReviewerRole}
              onReviewerNameChange={updateReviewerName}
              onSummaryChange={updateReviewSummary}
              onActionItemsChange={updateReviewActionItems}
              onCautionToggle={toggleCautionAcknowledgement}
              onSubmit={submitReviewPacket}
            />
          </View>
        )}

        {activeTab === "share" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.share}</Text>
            <Text style={styles.muted}>{text.shareNote}</Text>
            <ShareScopeControls
              text={text}
              includeReviewComments={includeReviewComments}
              shareVideoEnabled={shareVideoEnabled}
              shareOverlaysEnabled={shareOverlaysEnabled}
              shareEvidenceEnabled={shareEvidenceEnabled}
              selectedVideo={selectedVideo}
              phaseCorrections={phaseCorrections}
              phaseSummary={phaseSummary}
              reviewStatus={reviewStatus}
              reviewerRole={reviewerRole}
              reviewerName={reviewerName}
              reviewSubmittedAt={reviewSubmittedAt}
              summary={reviewSummary}
              actionItems={reviewActionItems}
              onToggle={() => setIncludeReviewComments((current) => !current)}
              onVideoToggle={() => setShareVideoEnabled((current) => !current)}
              onOverlaysToggle={() => setShareOverlaysEnabled((current) => !current)}
              onEvidenceToggle={() => setShareEvidenceEnabled((current) => !current)}
            />
          </View>
        )}

        <Text style={styles.notice}>{text.notice}</Text>
      </ScrollView>
      <View style={styles.tabs}>
        {(Object.entries(text.tabs) as Array<[TabKey, string]>).map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function UploadSimulation({
  text,
  uploadStatus,
  hasVideo,
  onSubmit,
  onInterrupt
}: {
  text: (typeof copy)[Language];
  uploadStatus: UploadStatus;
  hasVideo: boolean;
  onSubmit: () => void;
  onInterrupt: () => void;
}) {
  const canSubmit = hasVideo && uploadStatus !== "uploading";
  const canInterrupt = hasVideo && uploadStatus === "uploading";
  const submitLabel = uploadStatus === "interrupted" ? text.retry : text.submit;
  return (
    <View style={styles.uploadBox}>
      <Text style={styles.headingSmall}>{text.upload}</Text>
      <InfoRow label={text.uploadStatus} value={uploadStatusLabel(text, uploadStatus)} />
      <View style={styles.actions}>
        <ActionButton label={submitLabel} onPress={onSubmit} disabled={!canSubmit} />
        <ActionButton label={text.interrupt} onPress={onInterrupt} disabled={!canInterrupt} />
      </View>
    </View>
  );
}

function PhaseCorrectionPanel({
  text,
  corrections,
  onCorrectFoot,
  onCorrectRelease
}: {
  text: (typeof copy)[Language];
  corrections: PhaseCorrection[];
  onCorrectFoot: () => void;
  onCorrectRelease: () => void;
}) {
  return (
    <View style={styles.correctionBox}>
      <Text style={styles.headingSmall}>{text.correction}</Text>
      <View style={styles.actions}>
        <ActionButton label={text.setFoot} onPress={onCorrectFoot} />
        <ActionButton label={text.setRelease} onPress={onCorrectRelease} />
      </View>
      <PhaseCorrectionList text={text} corrections={corrections} />
    </View>
  );
}

function PhaseCorrectionList({
  text,
  corrections
}: {
  text: (typeof copy)[Language];
  corrections: PhaseCorrection[];
}) {
  if (!corrections.length) {
    return <Text style={styles.muted}>{text.noCorrections}</Text>;
  }
  return (
    <View style={styles.correctionList}>
      {corrections.map((correction) => (
        <View key={`${correction.eventName}-${correction.createdAt}`} style={styles.correctionRow}>
          <Text style={styles.metricName}>
            {correction.eventName === "foot_contact" ? text.setFoot : text.setRelease}
          </Text>
          <Text style={styles.metricValue}>
            frame {correction.frame} · {(correction.timeMs / 1000).toFixed(2)}s
          </Text>
          <Text style={styles.metricValue}>{correction.note}</Text>
        </View>
      ))}
    </View>
  );
}

function uploadStatusLabel(text: (typeof copy)[Language], status: UploadStatus) {
  const labels = {
    not_ready: text.notReady,
    ready: text.ready,
    uploading: text.uploading,
    interrupted: text.interrupted,
    submitted: text.submitted
  };
  return labels[status] || text.unknown;
}

function toStoredVideoAsset(asset: ImagePicker.ImagePickerAsset, source: VideoSource): StoredVideoAsset {
  const durationMs =
    typeof asset.duration === "number" && Number.isFinite(asset.duration)
      ? Math.round(asset.duration)
      : null;
  const durationLabel = durationMs ? `${source} · ${Math.round(durationMs / 1000)}s` : source;
  return {
    source,
    uri: asset.uri,
    fileName: asset.fileName || "local-video",
    width: asset.width || null,
    height: asset.height || null,
    durationMs,
    durationLabel,
    capturedAt: new Date().toISOString()
  };
}

function PermissionSummary({
  text,
  cameraPermission,
  libraryPermission
}: {
  text: (typeof copy)[Language];
  cameraPermission: PermissionState;
  libraryPermission: PermissionState;
}) {
  return (
    <View style={styles.permissionGrid}>
      <InfoRow label={`${text.permission}: ${text.cameraPermission}`} value={permissionLabel(text, cameraPermission)} />
      <InfoRow label={`${text.permission}: ${text.libraryPermission}`} value={permissionLabel(text, libraryPermission)} />
    </View>
  );
}

function permissionLabel(text: (typeof copy)[Language], status: PermissionState) {
  if (status === "granted") {
    return text.granted;
  }
  if (status === "denied") {
    return text.denied;
  }
  return text.unknown;
}

function VideoMetadata({ text, video }: { text: (typeof copy)[Language]; video: StoredVideoAsset }) {
  const resolution =
    video.width && video.height ? `${video.width} x ${video.height}` : "N/A";
  const duration = video.durationMs ? `${Math.round(video.durationMs / 1000)}s` : "N/A";
  return (
    <View style={styles.metadataBox}>
      <Text style={styles.headingSmall}>{text.metadata}</Text>
      <InfoRow label={text.source} value={video.source} />
      <InfoRow label={text.resolution} value={resolution} />
      <InfoRow label={text.duration} value={duration} />
    </View>
  );
}

function NativeVideoPreview({ text, video }: { text: (typeof copy)[Language]; video: StoredVideoAsset }) {
  const player = useVideoPlayer(video.uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  return (
    <View style={styles.overlayPreview}>
      <VideoView
        player={player}
        style={styles.nativeVideo}
        nativeControls
        contentFit="cover"
        allowsFullscreen
      />
      <View pointerEvents="none" style={styles.videoOverlayScrim} />
      <Text style={styles.overlayLabel}>{text.overlay}</Text>
      <View pointerEvents="none" style={styles.phaseMarkerPrimary} />
      <View pointerEvents="none" style={styles.phaseMarkerSecondary} />
      <View pointerEvents="none" style={styles.skeletonLine} />
    </View>
  );
}

function ReviewPacket({
  text,
  reviewerRole,
  reviewerName,
  summary,
  actionItems,
  cautionAcknowledged,
  reviewStatus,
  submittedAt,
  onReviewerRoleChange,
  onReviewerNameChange,
  onSummaryChange,
  onActionItemsChange,
  onCautionToggle,
  onSubmit
}: {
  text: (typeof copy)[Language];
  reviewerRole: ReviewerRole;
  reviewerName: string;
  summary: string;
  actionItems: string;
  cautionAcknowledged: boolean;
  reviewStatus: ReviewStatus;
  submittedAt: string | null;
  onReviewerRoleChange: (value: ReviewerRole) => void;
  onReviewerNameChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onActionItemsChange: (value: string) => void;
  onCautionToggle: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = cautionAcknowledged && reviewStatus === "draft";

  return (
    <View style={styles.reviewBox}>
      <Text style={styles.headingSmall}>
        {reviewStatus === "ready_for_user_review" ? text.reviewRequested : text.reviewDraft}
      </Text>
      <InfoRow label={text.packetStatus} value={reviewStatusLabel(text, reviewStatus, cautionAcknowledged)} />
      <RoleSelector text={text} value={reviewerRole} onChange={onReviewerRoleChange} />
      <Field label={text.reviewerName} value={reviewerName} onChangeText={onReviewerNameChange} />
      <MemoField label={text.summary} value={summary} onChangeText={onSummaryChange} />
      <MemoField label={text.actionItems} value={actionItems} onChangeText={onActionItemsChange} />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: cautionAcknowledged }}
        style={[styles.checkRow, cautionAcknowledged && styles.checkRowActive]}
        onPress={onCautionToggle}
      >
        <View style={[styles.checkbox, cautionAcknowledged && styles.checkboxActive]}>
          <Text style={styles.checkboxMark}>{cautionAcknowledged ? "OK" : ""}</Text>
        </View>
        <Text style={styles.checkText}>{text.caution}</Text>
      </Pressable>
      {submittedAt && <InfoRow label={text.requestedAt} value={formatDateTime(submittedAt)} />}
      <ActionButton label={text.userReview} onPress={onSubmit} disabled={!canSubmit} />
    </View>
  );
}

function RoleSelector({
  text,
  value,
  onChange
}: {
  text: (typeof copy)[Language];
  value: ReviewerRole;
  onChange: (value: ReviewerRole) => void;
}) {
  const roles: ReviewerRole[] = ["coach", "trainer", "athlete", "external_specialist"];
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{text.reviewerRole}</Text>
      <View style={styles.roleGrid}>
        {roles.map((role) => (
          <Pressable
            key={role}
            accessibilityRole="button"
            style={[styles.roleButton, value === role && styles.roleButtonActive]}
            onPress={() => onChange(role)}
          >
            <Text style={[styles.roleText, value === role && styles.roleTextActive]}>
              {role.replace("_", " ")}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ShareScopeControls({
  text,
  includeReviewComments,
  shareVideoEnabled,
  shareOverlaysEnabled,
  shareEvidenceEnabled,
  selectedVideo,
  phaseCorrections,
  phaseSummary,
  reviewStatus,
  reviewerRole,
  reviewerName,
  reviewSubmittedAt,
  summary,
  actionItems,
  onToggle,
  onVideoToggle,
  onOverlaysToggle,
  onEvidenceToggle
}: {
  text: (typeof copy)[Language];
  includeReviewComments: boolean;
  shareVideoEnabled: boolean;
  shareOverlaysEnabled: boolean;
  shareEvidenceEnabled: boolean;
  selectedVideo: StoredVideoAsset | null;
  phaseCorrections: PhaseCorrection[];
  phaseSummary: string;
  reviewStatus: ReviewStatus;
  reviewerRole: ReviewerRole;
  reviewerName: string;
  reviewSubmittedAt: string | null;
  summary: string;
  actionItems: string;
  onToggle: () => void;
  onVideoToggle: () => void;
  onOverlaysToggle: () => void;
  onEvidenceToggle: () => void;
}) {
  const sharePayload = useMemo(
    () =>
      buildSharePayload({
        includeReviewComments,
        shareVideoEnabled,
        shareOverlaysEnabled,
        shareEvidenceEnabled,
        selectedVideo,
        phaseCorrections,
        phaseSummary,
        reviewStatus,
        reviewerRole,
        reviewerName,
        reviewSubmittedAt,
        summary,
        actionItems
      }),
    [
      actionItems,
      includeReviewComments,
      shareEvidenceEnabled,
      shareOverlaysEnabled,
      shareVideoEnabled,
      selectedVideo,
      phaseCorrections,
      phaseSummary,
      reviewStatus,
      reviewSubmittedAt,
      reviewerName,
      reviewerRole,
      summary
    ]
  );
  return (
    <View style={styles.reviewBox}>
      <Text style={styles.headingSmall}>{text.shareScope}</Text>
      <Text style={styles.muted}>{text.shareScopeDefault}</Text>
      <ShareScopeSwitch label={text.shareVideo} enabled={shareVideoEnabled} onToggle={onVideoToggle} />
      <ShareScopeSwitch
        label={text.shareOverlays}
        enabled={shareOverlaysEnabled}
        onToggle={onOverlaysToggle}
      />
      <ShareScopeSwitch
        label={text.shareEvidence}
        enabled={shareEvidenceEnabled}
        onToggle={onEvidenceToggle}
      />
      <Text style={styles.headingSmall}>{text.comments}</Text>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: includeReviewComments }}
        style={[styles.checkRow, includeReviewComments && styles.checkRowActive]}
        onPress={onToggle}
      >
        <View style={[styles.switchKnob, includeReviewComments && styles.switchKnobActive]} />
        <Text style={styles.checkText}>
          {includeReviewComments ? text.includeComments : text.excludeComments}
        </Text>
      </Pressable>
      <Text style={styles.muted}>
        {includeReviewComments ? text.commentsIncluded : text.commentsExcluded}
      </Text>
      <SharePayloadPreview text={text} payload={sharePayload} />
    </View>
  );
}

function ShareScopeSwitch({
  label,
  enabled,
  onToggle
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      style={[styles.checkRow, enabled && styles.checkRowActive]}
      onPress={onToggle}
    >
      <View style={[styles.switchKnob, enabled && styles.switchKnobActive]} />
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

function MetricSection({
  title,
  valueLabel,
  metrics
}: {
  title: string;
  valueLabel: string;
  metrics: Array<{ name: string; value: string }>;
}) {
  return (
    <View style={styles.metricSection}>
      <Text style={styles.headingSmall}>{title}</Text>
      {metrics.map((metric) => (
        <View key={`${title}-${metric.name}`} style={styles.metricRow}>
          <Text style={styles.metricName}>{metric.name}</Text>
          <Text style={styles.metricValue}>
            {valueLabel}: {metric.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SharePayloadPreview({
  text,
  payload
}: {
  text: (typeof copy)[Language];
  payload: SharePayload;
}) {
  const commentStatus =
    payload.comments === null ? text.payloadExcluded : text.payloadIncluded;

  return (
    <View style={styles.payloadPreview}>
      <Text style={styles.headingSmall}>{text.payloadPreview}</Text>
      <Text style={styles.muted}>{text.payloadNote}</Text>
      <InfoRow
        label={text.packetStatus}
        value={payload.reviewStatus === "ready_for_user_review" ? text.reviewRequested : text.reviewDraft}
      />
      <InfoRow label="analysis_run_id" value={payload.analysisRunId} />
      <InfoRow label={text.payloadComments} value={commentStatus} />
      <InfoRow
        label={text.payloadVideo}
        value={payload.video === null ? text.payloadOmitted : text.payloadIncluded}
      />
      <InfoRow
        label={text.payloadOverlays}
        value={payload.overlays === null ? text.payloadOmitted : text.payloadIncluded}
      />
      <InfoRow
        label={text.payloadEvidence}
        value={payload.evidence === null ? text.payloadOmitted : text.payloadIncluded}
      />
      <View style={styles.payloadBlock}>
        <Text style={styles.payloadKey}>analysis_run_id</Text>
        <Text style={styles.payloadValue}>{payload.analysisRunId}</Text>
        <Text style={styles.payloadKey}>video</Text>
        {payload.video ? (
          <>
            <Text style={styles.payloadValue}>source: {payload.video.source}</Text>
            <Text style={styles.payloadValue}>fileName: {payload.video.fileName}</Text>
            <Text style={styles.payloadValue}>uri: {payload.video.uri}</Text>
            <Text style={styles.payloadValue}>
              resolution: {payload.video.width && payload.video.height ? `${payload.video.width} x ${payload.video.height}` : "N/A"}
            </Text>
            <Text style={styles.payloadValue}>durationLabel: {payload.video.durationLabel}</Text>
          </>
        ) : (
          <Text style={styles.payloadValue}>null</Text>
        )}
        <Text style={styles.payloadKey}>overlays</Text>
        {payload.overlays ? (
          <>
            <Text style={styles.payloadValue}>phaseSummary: {payload.overlays.phaseSummary}</Text>
            {payload.overlays.corrections.map((correction) => (
              <Text key={`${correction.eventName}-${correction.frame}`} style={styles.payloadValue}>
                {correction.eventName}: frame {correction.frame} · {(correction.timeMs / 1000).toFixed(2)}s
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.payloadValue}>null</Text>
        )}
        <Text style={styles.payloadKey}>evidence</Text>
        {payload.evidence ? (
          <>
            <Text style={styles.payloadValue}>rawTracking</Text>
            {payload.evidence.rawTracking.map((metric) => (
              <Text key={`evidence-raw-${metric.name}`} style={styles.payloadValue}>
                {metric.name}: {metric.value}
              </Text>
            ))}
            <Text style={styles.payloadValue}>romAdjusted</Text>
            {payload.evidence.romAdjusted.map((metric) => (
              <Text key={`evidence-rom-${metric.name}`} style={styles.payloadValue}>
                {metric.name}: {metric.value}
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.payloadValue}>null</Text>
        )}
        <Text style={styles.payloadKey}>metrics.raw</Text>
        {payload.metrics.raw.map((metric) => (
          <Text key={`raw-${metric.name}`} style={styles.payloadValue}>
            {metric.name}: {metric.value}
          </Text>
        ))}
        <Text style={styles.payloadKey}>metrics.romAdjusted</Text>
        {payload.metrics.romAdjusted.map((metric) => (
          <Text key={`rom-${metric.name}`} style={styles.payloadValue}>
            {metric.name}: {metric.value}
          </Text>
        ))}
        <Text style={styles.payloadKey}>comments</Text>
        {payload.comments ? (
          <>
            <Text style={styles.payloadValue}>summary: {payload.comments.summary || "—"}</Text>
            <Text style={styles.payloadValue}>actionItems: {payload.comments.actionItems || "—"}</Text>
          </>
        ) : (
          <Text style={styles.payloadValue}>null</Text>
        )}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} />
    </View>
  );
}

function MemoField({
  label,
  value,
  onChangeText
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline
        style={[styles.input, styles.memoInput]}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
    >
      <Text style={[styles.actionText, disabled && styles.actionTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function TrackingSummary({ text, phaseSummary }: { text: (typeof copy)[Language]; phaseSummary: string }) {
  return (
    <View style={styles.trackingBox}>
      <InfoRow label={text.model} value={seed.modelVersion} />
      <InfoRow label={text.policy} value={seed.confidencePolicy} />
      <InfoRow label={text.confidence} value={`${seed.confidence}%`} />
      <InfoRow label={text.phaseConfidence} value={phaseSummary} />
    </View>
  );
}

type SharePayload = {
  analysisRunId: string;
  video: ShareVideoPayload | null;
  overlays: ShareOverlaysPayload | null;
  evidence: ShareEvidencePayload | null;
  reviewStatus: ReviewStatus;
  reviewerRole: ReviewerRole;
  reviewerName: string;
  reviewSubmittedAt: string | null;
  metrics: {
    raw: Array<{ name: string; value: string }>;
    romAdjusted: Array<{ name: string; value: string }>;
  };
  comments: {
    summary: string;
    actionItems: string;
  } | null;
};

function buildSharePayload({
  includeReviewComments,
  shareVideoEnabled,
  shareOverlaysEnabled,
  shareEvidenceEnabled,
  selectedVideo,
  phaseCorrections,
  phaseSummary,
  reviewStatus,
  reviewerRole,
  reviewerName,
  reviewSubmittedAt,
  summary,
  actionItems
}: {
  includeReviewComments: boolean;
  shareVideoEnabled: boolean;
  shareOverlaysEnabled: boolean;
  shareEvidenceEnabled: boolean;
  selectedVideo: StoredVideoAsset | null;
  phaseCorrections: PhaseCorrection[];
  phaseSummary: string;
  reviewStatus: ReviewStatus;
  reviewerRole: ReviewerRole;
  reviewerName: string;
  reviewSubmittedAt: string | null;
  summary: string;
  actionItems: string;
}): SharePayload {
  return {
    analysisRunId: seed.analysisRunId,
    video:
      shareVideoEnabled && selectedVideo
        ? {
            source: selectedVideo.source,
            fileName: selectedVideo.fileName,
            uri: selectedVideo.uri,
            width: selectedVideo.width,
            height: selectedVideo.height,
            durationLabel: selectedVideo.durationLabel,
            capturedAt: selectedVideo.capturedAt
          }
        : null,
    overlays: shareOverlaysEnabled
      ? {
          phaseSummary,
          corrections: phaseCorrections.map((correction) => ({
            eventName: correction.eventName,
            frame: correction.frame,
            timeMs: correction.timeMs,
            note: correction.note
          }))
        }
      : null,
    evidence: shareEvidenceEnabled
      ? {
          rawTracking: seed.metrics.map((metric) => ({ name: metric.name, value: metric.raw })),
          romAdjusted: seed.metrics.map((metric) => ({ name: metric.name, value: metric.adjusted }))
        }
      : null,
    reviewStatus,
    reviewerRole,
    reviewerName,
    reviewSubmittedAt,
    metrics: {
      raw: seed.metrics.map((metric) => ({ name: metric.name, value: metric.raw })),
      romAdjusted: seed.metrics.map((metric) => ({ name: metric.name, value: metric.adjusted }))
    },
    comments:
      includeReviewComments && reviewStatus === "ready_for_user_review"
        ? {
            summary,
            actionItems
          }
        : null
  };
}

function reviewStatusLabel(
  text: (typeof copy)[Language],
  reviewStatus: ReviewStatus,
  cautionAcknowledged: boolean
) {
  if (reviewStatus === "ready_for_user_review") {
    return text.reviewRequested;
  }
  if (reviewStatus === "reviewed") {
    return text.submitted;
  }
  return cautionAcknowledged ? text.reviewDraft : `${text.reviewDraft} · ${text.caution}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

const colors = {
  ink: "#16212a",
  muted: "#65727d",
  line: "#d9e2e8",
  surface: "#f4f7f8",
  white: "#ffffff",
  soft: "#edf4f1",
  accent: "#126b67",
  accentStrong: "#0b4f50",
  indigo: "#2f477a",
  coral: "#be5a43",
  warning: "#a66a00",
  warningBg: "#fff4df",
  shadow: "rgba(17, 33, 43, 0.10)"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#dfe8ea"
  },
  shell: {
    padding: 16,
    paddingBottom: 106,
    gap: 14
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4
  },
  eyebrow: {
    color: colors.accentStrong,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "900"
  },
  languageSwitch: {
    flexDirection: "row",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden"
  },
  languageButton: {
    minHeight: 48,
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white
  },
  languageButtonActive: {
    backgroundColor: colors.accent
  },
  languageText: {
    color: colors.muted,
    fontWeight: "800"
  },
  languageTextActive: {
    color: colors.white
  },
  summary: {
    gap: 12,
    padding: 16,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 2
  },
  summaryCopy: {
    gap: 4
  },
  athlete: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontSize: 13
  },
  statusStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: "#f3f6f3",
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  warningPill: {
    color: colors.warning,
    borderColor: "#efcf98",
    backgroundColor: colors.warningBg
  },
  tabs: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    flexDirection: "row",
    gap: 6,
    padding: 8,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8
  },
  tab: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent"
  },
  tabActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  tabText: {
    color: colors.muted,
    fontWeight: "800"
  },
  tabTextActive: {
    color: colors.white
  },
  panel: {
    gap: 12,
    padding: 16,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 2
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  field: {
    gap: 6
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.ink,
    backgroundColor: colors.white
  },
  memoInput: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  infoRow: {
    gap: 3
  },
  infoValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent
  },
  actionButtonDisabled: {
    borderColor: colors.line,
    borderWidth: 1,
    backgroundColor: "#eef2ef"
  },
  actionText: {
    color: colors.white,
    fontWeight: "900"
  },
  actionTextDisabled: {
    color: colors.muted
  },
  videoPreview: {
    minHeight: 150,
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  videoLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  overlayPreview: {
    minHeight: 184,
    marginTop: 6,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  nativeVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.ink
  },
  videoOverlayScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 14, 20, 0.12)"
  },
  overlayLabel: {
    position: "absolute",
    top: 8,
    left: 10,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: "hidden",
    color: colors.white,
    backgroundColor: "rgba(9, 20, 25, 0.62)",
    fontSize: 12,
    fontWeight: "800"
  },
  phaseMarkerPrimary: {
    position: "absolute",
    left: "36%",
    top: 18,
    bottom: 14,
    zIndex: 2,
    width: 3,
    backgroundColor: colors.accent
  },
  phaseMarkerSecondary: {
    position: "absolute",
    left: "68%",
    top: 18,
    bottom: 14,
    zIndex: 2,
    width: 3,
    backgroundColor: colors.warning
  },
  skeletonLine: {
    position: "absolute",
    left: "18%",
    right: "18%",
    top: 58,
    zIndex: 2,
    height: 3,
    transform: [{ rotate: "-8deg" }],
    backgroundColor: "#7a8b83"
  },
  permissionGrid: {
    gap: 10,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  metadataBox: {
    gap: 10,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  uploadBox: {
    gap: 10,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  correctionBox: {
    gap: 10,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.soft
  },
  reviewBox: {
    gap: 10,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  correctionList: {
    gap: 8
  },
  metricSection: {
    gap: 8,
    padding: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  correctionRow: {
    gap: 4,
    padding: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  headingSmall: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  draftBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  draftStatus: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  secondaryText: {
    color: colors.accentStrong,
    fontWeight: "900"
  },
  trackingBox: {
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.warningBg
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  roleButton: {
    minHeight: 44,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  roleButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  roleText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  roleTextActive: {
    color: colors.white
  },
  checkRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  checkRowActive: {
    borderColor: colors.accent,
    backgroundColor: "#f0f8f6"
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.line,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: colors.white
  },
  checkboxActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  checkboxMark: {
    color: colors.white,
    fontWeight: "900"
  },
  switchKnob: {
    width: 42,
    height: 24,
    borderColor: colors.line,
    borderWidth: 2,
    borderRadius: 999,
    backgroundColor: "#edf2ef"
  },
  switchKnobActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  checkText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  commentPreview: {
    gap: 4,
    padding: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  payloadPreview: {
    gap: 8,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  payloadBlock: {
    gap: 4,
    padding: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  payloadKey: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  payloadValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  metricRow: {
    gap: 4,
    paddingVertical: 10,
    borderTopColor: colors.line,
    borderTopWidth: 1
  },
  metricName: {
    color: colors.ink,
    fontWeight: "900"
  },
  metricValue: {
    color: colors.muted,
    fontSize: 13
  },
  notice: {
    color: colors.muted,
    fontSize: 13,
    padding: 12,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 4
  }
});
