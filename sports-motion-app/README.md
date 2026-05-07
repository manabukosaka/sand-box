# Sports Motion App

日本語版は下にあります。

Sports Motion App is an installable mobile-app product in progress. The current
implementation is a dependency-free PWA prototype plus domain-model tests for
the baseball pitching MVP.

## Current Prototype

- `app/`: mobile-first PWA prototype for capture, team/athlete profile editing,
  video library management, upload retry controls, metrics, ROM recalculation,
  and external sharing flows.
- `src/domain.mjs`: MVP domain model and analysis/ROM mock logic.
- `src/mockApi.mjs`: local mock API that follows the MVP contract and persists
  prototype state in browser storage, including prototype upload sessions that
  gate tracking and processing submission.
- `src/trackingAdapter.mjs`: replaceable prototype tracking adapter contract and
  deterministic sample artifact.
- The PWA summary shows tracking status, model version, confidence policy, and
  phase-event confidence from the active tracking run.
- `tests/`: Node test coverage for profile editing, video lifecycle states,
  upload-session gating and retry attempts, ROM versioning, tracking adapter
  failure policy behavior, sharing, and raw-versus-adjusted analysis separation.
- `docs/`: requirements, architecture, API contract, evidence metrics, project
  plan, V&V checklist, and ADR.
- `docs/prototype_acceptance_review.md`: current Milestone 1 prototype
  acceptance notes and known limits.
- `docs/tracking_feasibility_gate.md`: Milestone 2 entry gate for mobile stack,
  tracking model/provider, sample videos, confidence policy, and metric
  promotion.
- `docs/adr/0002-mobile-stack-for-field-prototype.md`: proposed mobile stack
  decision for the first installable field prototype.
- `docs/tracking_shortlist.md`: draft tracking provider/model shortlist for
  feasibility review.
- `docs/sample_video_manifest.md`: sample pitching-video manifest template for
  the tracking feasibility gate.
- `docs/metric_tracking_support_matrix.md`: metric-to-tracking-signal support
  matrix for promotion and suppression decisions.
- `docs/mobile_test_plan.md`: timing and scope for PWA smoke, Android emulator,
  iOS simulator, and physical-device verification.
- `docs/native_field_prototype_spike.md`: execution plan for the React Native +
  Expo field prototype spike.
- `docs/vv/`: V&V evidence templates and safe mobile test result summaries.
- `mobile/`: isolated React Native + Expo field prototype scaffold. It mirrors
  the PWA skeleton with capture/import, bilingual navigation, local draft
  persistence, permission status, selected-video metadata, phase-overlay
  placeholder, local-only upload retry simulation, metrics, ROM, and sharing
  surfaces; real AI tracking and production sharing are still outside this
  spike.

## Commands

```bash
npm test
npm run serve
```

`npm run serve` starts a local static server on port 4173. Open
`http://127.0.0.1:4173/app/`.

The prototype supports English and Japanese. Use the language switch in the app
header to change display language. Domain IDs and API-facing values stay in
English so they remain stable across locales.

The local prototype uses browser `localStorage`. Reset site data in the browser
when you want to return to the seed dataset.

Native field prototype commands:

```bash
cd mobile
npm run start:dev-client
npm run android
npm run ios
```

The native scaffold currently uses Expo SDK 54, `expo-dev-client`,
`expo-image-picker`, and `@react-native-async-storage/async-storage`. It
requires Node `>=20.19.4`. Local verification on Node `18.19.1` is blocked
before emulator/simulator smoke. Use `docs/native_field_prototype_spike.md` for
EAS development build commands and V&V evidence requirements.

## Boundary

This product is separate from Mini Datadog. Shared Codex harness rules live in
`.agents/docs/product-boundaries.md`.

## 日本語

Sports Motion App は、インストール型モバイルアプリとして開発中のプロダクトです。現在は、野球投球MVP向けの依存ゼロPWAプロトタイプと、ドメインモデルのテストを実装しています。

## 現在のプロトタイプ

- `app/`: 撮影、チーム/選手プロフィール編集、動画ライブラリ管理、アップロード再試行操作、指標、ROM再計算、外部共有フローを確認するモバイルファーストPWAプロトタイプ。
- `src/domain.mjs`: MVPのドメインモデルと解析/ROMのモックロジック。
- `src/mockApi.mjs`: MVP契約に沿ったローカルモックAPI。tracking / processing submission を制御するprototype upload sessionを含め、ブラウザストレージへプロトタイプ状態を保存します。
- `src/trackingAdapter.mjs`: 差し替え可能なprototype tracking adapter契約と deterministic sample artifact。
- PWAサマリーは、active tracking run のtracking status、model version、confidence policy、phase-event confidenceを表示します。
- `tests/`: プロフィール編集、動画ライフサイクル、upload-session gating と retry attempt、ROM versioning、tracking adapter failure policy、共有、raw値と補正値の分離を確認するNodeテスト。
- `docs/`: 要求、アーキテクチャ、API契約、エビデンス指標、プロジェクト計画、V&Vチェックリスト、ADR。
- `docs/prototype_acceptance_review.md`: 現在のMilestone 1プロトタイプの受け入れメモと既知の制約。
- `docs/tracking_feasibility_gate.md`: mobile stack、tracking model/provider、sample video、confidence policy、metric promotion を扱うMilestone 2 entry gate。
- `docs/adr/0002-mobile-stack-for-field-prototype.md`: 初回インストール型field prototype向けのmobile stack提案。
- `docs/tracking_shortlist.md`: feasibility review向けのtracking provider/model shortlist草案。
- `docs/sample_video_manifest.md`: tracking feasibility gate向けのsample pitching-video manifest template。
- `docs/metric_tracking_support_matrix.md`: metric promotionとsuppression判断のためのmetric-to-tracking-signal support matrix。
- `docs/mobile_test_plan.md`: PWA smoke、Android emulator、iOS simulator、実機verificationのタイミングと範囲。
- `docs/native_field_prototype_spike.md`: React Native + Expo field prototype spikeの実行計画。
- `docs/vv/`: V&V evidence templateと安全なmobile test result summary。
- `mobile/`: 分離された React Native + Expo field prototype scaffold。PWAの骨格に合わせ、撮影/インポート、日英ナビゲーション、ローカル下書き保存、権限状態、選択動画メタデータ、フェーズオーバーレイ仮表示、ローカルのみのアップロード再試行シミュレーション、指標、ROM、共有画面を持ちます。real AI tracking と production sharing はまだ spike 外です。

## コマンド

```bash
npm test
npm run serve
```

`npm run serve` は port 4173 でローカル静的サーバーを起動します。
`http://127.0.0.1:4173/app/` を開いてください。

プロトタイプは英語と日本語の表示に対応しています。アプリ上部の言語切替で表示言語を変更できます。ドメインIDやAPI向けの値は、localeに依存しないよう英語のまま保持します。

ローカルプロトタイプはブラウザの `localStorage` を使います。初期データに戻したい場合は、ブラウザ側でサイトデータをリセットしてください。

Native field prototype のコマンド:

```bash
cd mobile
npm run start:dev-client
npm run android
npm run ios
```

native scaffold は現在 Expo SDK 54、`expo-dev-client`、
`expo-image-picker`、`@react-native-async-storage/async-storage` を使い、Node
`>=20.19.4` が必要です。ローカル環境の Node `18.19.1` では emulator/simulator
smoke の前でブロックされます。EAS development build のコマンドとV&V evidence条件は `docs/native_field_prototype_spike.md` で確認してください。

## 境界

このプロダクトは Mini Datadog とは別プロダクトです。共有Codex harnessのルールは `.agents/docs/product-boundaries.md` にあります。
