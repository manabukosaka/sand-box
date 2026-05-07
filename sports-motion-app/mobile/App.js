import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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

const copy = {
  en: {
    title: "Sports Motion",
    eyebrow: "Pitching analysis",
    context: "Single-camera estimate · specialist support only",
    tabs: {
      capture: "Capture",
      metrics: "Metrics",
      rom: "ROM",
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
    overlay: "Phase overlay placeholder",
    upload: "Upload simulation",
    uploadStatus: "Upload status",
    notReady: "Waiting for local video",
    ready: "Ready to submit",
    uploading: "Uploading metadata",
    interrupted: "Interrupted",
    submitted: "Submitted to mock flow",
    submit: "Submit",
    interrupt: "Interrupt",
    retry: "Retry"
  },
  ja: {
    title: "Sports Motion",
    eyebrow: "投球動作解析",
    context: "単眼カメラ推定 · 専門評価補助",
    tabs: {
      capture: "撮影",
      metrics: "指標",
      rom: "ROM",
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
    overlay: "フェーズオーバーレイ仮表示",
    upload: "アップロードシミュレーション",
    uploadStatus: "アップロード状態",
    notReady: "ローカル動画待ち",
    ready: "送信準備完了",
    uploading: "メタデータ送信中",
    interrupted: "中断",
    submitted: "モックフロー送信済み",
    submit: "送信",
    interrupt: "中断",
    retry: "再試行"
  }
};

const draftStorageKey = "sports-motion.mobile.active-draft.v1";

const seed = {
  team: "College Pitching Group",
  athlete: "Pitcher A",
  cameraView: "open_side",
  session: "Bullpen session",
  trackingStatus: "completed_with_warnings",
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
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("capture");
  const [team, setTeam] = useState(seed.team);
  const [athlete, setAthlete] = useState(seed.athlete);
  const [session, setSession] = useState(seed.session);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("not_ready");
  const [draftStatus, setDraftStatus] = useState("loading");
  const [cameraPermission, setCameraPermission] = useState("unknown");
  const [libraryPermission, setLibraryPermission] = useState("unknown");
  const [hydrated, setHydrated] = useState(false);
  const text = copy[language];

  const phaseSummary = useMemo(
    () => seed.phaseEvents.map((event) => `${event.name} ${event.confidence}%`).join(" · "),
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
      uploadStatus
    });
    AsyncStorage.setItem(draftStorageKey, draft)
      .then(() => setDraftStatus("saved"))
      .catch(() => setDraftStatus("error"));
  }, [athlete, hydrated, selectedVideo, session, team, uploadStatus]);

  async function selectVideo(source) {
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
    const options = {
      mediaTypes: ["videos"],
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
    setUploadStatus("not_ready");
    try {
      await AsyncStorage.removeItem(draftStorageKey);
      setDraftStatus("saved");
    } catch {
      setDraftStatus("error");
    }
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
            {["en", "ja"].map((locale) => (
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

        <View style={styles.tabs}>
          {Object.entries(text.tabs).map(([key, label]) => (
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
              {selectedVideo && (
                <View style={styles.overlayPreview}>
                  <Text style={styles.overlayLabel}>{text.overlay}</Text>
                  <View style={styles.phaseMarkerPrimary} />
                  <View style={styles.phaseMarkerSecondary} />
                  <View style={styles.skeletonLine} />
                </View>
              )}
            </View>
            {selectedVideo && <VideoMetadata text={text} video={selectedVideo} />}
            <UploadSimulation
              text={text}
              uploadStatus={uploadStatus}
              hasVideo={Boolean(selectedVideo)}
              onSubmit={submitDraft}
              onInterrupt={interruptUpload}
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
            {seed.metrics.map((metric) => (
              <View key={metric.name} style={styles.metricRow}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricValue}>{text.raw}: {metric.raw}</Text>
                <Text style={styles.metricValue}>{text.adjusted}: {metric.adjusted}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "rom" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.tabs.rom}</Text>
            <InfoRow label={text.rom} value="115°" />
            <Text style={styles.muted}>Raw tracking and ROM-adjusted layers stay separate.</Text>
          </View>
        )}

        {activeTab === "share" && (
          <View style={styles.panel}>
            <Text style={styles.heading}>{text.share}</Text>
            <Text style={styles.muted}>{text.shareNote}</Text>
          </View>
        )}

        <Text style={styles.notice}>{text.notice}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function UploadSimulation({ text, uploadStatus, hasVideo, onSubmit, onInterrupt }) {
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

function uploadStatusLabel(text, status) {
  const labels = {
    not_ready: text.notReady,
    ready: text.ready,
    uploading: text.uploading,
    interrupted: text.interrupted,
    submitted: text.submitted
  };
  return labels[status] || text.unknown;
}

function toStoredVideoAsset(asset, source) {
  const durationMs = Number.isFinite(asset.duration) ? Math.round(asset.duration) : null;
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

function PermissionSummary({ text, cameraPermission, libraryPermission }) {
  return (
    <View style={styles.permissionGrid}>
      <InfoRow label={`${text.permission}: ${text.cameraPermission}`} value={permissionLabel(text, cameraPermission)} />
      <InfoRow label={`${text.permission}: ${text.libraryPermission}`} value={permissionLabel(text, libraryPermission)} />
    </View>
  );
}

function permissionLabel(text, status) {
  if (status === "granted") {
    return text.granted;
  }
  if (status === "denied") {
    return text.denied;
  }
  return text.unknown;
}

function VideoMetadata({ text, video }) {
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

function Field({ label, value, onChangeText }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} />
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress, disabled = false }) {
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

function TrackingSummary({ text, phaseSummary }) {
  return (
    <View style={styles.trackingBox}>
      <InfoRow label={text.model} value={seed.modelVersion} />
      <InfoRow label={text.policy} value={seed.confidencePolicy} />
      <InfoRow label={text.confidence} value={`${seed.confidence}%`} />
      <InfoRow label={text.phaseConfidence} value={phaseSummary} />
    </View>
  );
}

const colors = {
  ink: "#16211d",
  muted: "#65726c",
  line: "#d9e1dc",
  surface: "#f7f8f6",
  white: "#ffffff",
  accent: "#0f6f5c",
  accentStrong: "#0b4e41",
  warning: "#9b5a05",
  warningBg: "#fff4df"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf0ec"
  },
  shell: {
    padding: 16,
    gap: 14
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  eyebrow: {
    color: colors.accentStrong,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 26,
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
    minHeight: 40,
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
    backgroundColor: colors.white
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tab: {
    flexGrow: 1,
    minWidth: "45%",
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white
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
    backgroundColor: colors.white
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
    minHeight: 42,
    paddingHorizontal: 10,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.ink,
    backgroundColor: colors.white
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
    minHeight: 42,
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
    minHeight: 124,
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
    minHeight: 96,
    marginTop: 6,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  overlayLabel: {
    position: "absolute",
    top: 8,
    left: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  phaseMarkerPrimary: {
    position: "absolute",
    left: "36%",
    top: 18,
    bottom: 14,
    width: 3,
    backgroundColor: colors.accent
  },
  phaseMarkerSecondary: {
    position: "absolute",
    left: "68%",
    top: 18,
    bottom: 14,
    width: 3,
    backgroundColor: colors.warning
  },
  skeletonLine: {
    position: "absolute",
    left: "18%",
    right: "18%",
    top: 58,
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
    minHeight: 38,
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
    backgroundColor: colors.white
  }
});
