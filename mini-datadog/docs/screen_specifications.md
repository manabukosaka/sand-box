# Mini Datadog 画面仕様書 (Screen Specifications)

本ドキュメントは、Mini Datadog における各画面の情報設計、コンポーネントのスタイリング仕様、およびアクセシビリティ基準を定義するものです。

## 1. 画面構成と情報設計 (Information Architecture)

現在の Mini Datadog は、リアルタイム監視、ログ分析、メトリクス確認、運用準備 UI を含む高密度なオブザーバビリティコンソールで構成されています。

### 1.0. 共通 Dashboard Shell
- **目的**: Live Tail、Explorer、Metrics、Alerts、Settings を横断する運用コンソールとして、現在位置と運用状態を即座に把握できるようにすること。
- **構成**:
  1. **Sidebar navigation**: Live、Explorer、Metrics、Alerts、Settings を常時表示し、画面間移動を高速化する。
  2. **Status bar**: `Live ready`、`DuckDB local`、version などの状態を上部に表示する。
  3. **Operational badges**: API、Store、Mode などの runtime context を sidebar に固定表示する。

### 1.1. Live Tail 画面 (`/`)
- **目的**: システムで発生しているログをリアルタイムで監視し、異常を即座に検知すること。
- **最優先で伝える情報**:
  1. **リアルタイムなログストリーム**: 新規ログが末尾に流れる様子を視覚的に強調し、ログのレベル（Error, Warn 等）が一目で判別できるようにする。
  2. **システム接続ステータス**: サーバーとの WebSocket (SSE) 接続状態を明示する（Connected / Connecting / Disconnected）。
  3. **素早いフィルタリング**: 膨大なログの中から、特定のキーワードやサービスを即座に絞り込める検索体験。

### 1.2. Explorer (検索) 画面 (`/search`)
- **目的**: 過去のログから特定の時間帯、ログレベル、キーワードを用いてトラブルシューティングや分析を行うこと。
- **最優先で伝える情報**:
  1. **直感的な検索条件入力**: 時間範囲（Start/End）、ログレベル、キーワードの各条件を迷いなく入力できるフォーム。
  2. **検索結果の視認性**: 検索結果が何件見つかったか、それぞれのログの発生時刻と内容をノイズなく一覧できるリスト表示。
  3. **Facet / Correlation Assist**: 検索結果に含まれる service、level、tags、attributes の主要値を横断的に表示し、`trace_id`、`span_id`、`request_id`、`correlation_id` などの相関 ID があれば即座に絞り込みへ使えるようにする。

### 1.3. Metrics 画面 (`/metrics`)
- **目的**: 既存の Metrics Query API を使い、メトリクスの時系列変化を即座に確認すること。
- **最優先で伝える情報**:
  1. **最新値・平均・最大・最小**: 選択した metric の状態を stat card で表示する。
  2. **Signal trajectory**: 外部 chart library を使わず SVG line chart で時系列を表示する。
  3. **Query controls**: metric name、service、time range、interval を指定できる。

### 1.4. Alerts 画面 (`/alerts`)
- **目的**: 将来の alerting 機能に向け、ルール作成・有効化・通知先の情報設計を検証すること。
- **制約**: 現時点では frontend-only の preview UI とし、backend 永続化は行わない。
- **最優先で伝える情報**:
  1. **Rule inventory**: rule 数、有効 rule 数、channel、persistence 状態を表示する。
  2. **Rule builder**: signal、threshold、window を選択して preview rule を作成できる。
  3. **Persistence note**: backend 未実装であることを明示し、ユーザーに誤解を与えない。

### 1.5. Settings 画面 (`/settings`)
- **目的**: self-hosted 運用で必要になる API key、retention、sampling、density の情報設計を検証すること。
- **制約**: 現時点では frontend-only の preview UI とし、backend 永続化は行わない。

---

## 2. コンポーネント仕様 (Component Specifications)

一貫したダークテーマ（Slate系）を基調とし、主要なアクションには Emerald（エメラルドグリーン）のアクセントカラーを用いています。

### 2.1. 共通コンポーネント
- **背景**: メイン背景には `bg-slate-950` を使用し、カードや入力フォームには `bg-slate-900` に透過を持たせたものを重ねることで奥行きを表現。
- **ボーダー**: 境界線には `border-slate-800` を使用し、コントラストを抑えた自然な区切りを実現。

### 2.2. アクション要素（ボタン・入力欄）
- **プライマリボタン (Run Query 等)**:
  - `bg-emerald-600` / Hover: `bg-emerald-500` / Text: `text-white`
  - フォント: `font-bold`
  - シャドウ: `shadow-lg shadow-emerald-900/20` を付与して立体感を持たせる。
- **セカンダリボタン (Pause/Clear 等)**:
  - `variant="outline"` / `bg-slate-900/50` / `border-slate-800`
  - Text: `text-slate-300` / Hover: `text-slate-100`
- **入力欄 (Input / Select)**:
  - 背景: `bg-slate-950/80` (または `bg-slate-900/50`)
  - フォーカス時: `focus:ring-emerald-500/30` のリングを表示し、入力状態を明示。
  - テキスト: `text-slate-100`。

### 2.3. ログ表示 (Log Lines & Badges)
- **ログ行ベース**:
  - フォント: `font-mono text-[13px] leading-relaxed`
  - 余白: `px-4 py-1` または `py-2.5`
  - インタラクション: `hover:bg-slate-900/80` とし、ホバー時に左側に `border-slate-700` または `border-l-emerald-500` のラインを表示。
- **ログレベルバッジ**:
  - サイズ・フォント: `text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border`
  - **INFO**: `text-blue-400 border-blue-400/30 bg-blue-400/10`
  - **WARN**: `text-yellow-400 border-yellow-400/30 bg-yellow-400/10`
  - **ERROR**: `text-red-400 border-red-400/30 bg-red-400/10`
  - **DEBUG**: `text-slate-400 border-slate-400/30 bg-slate-400/10`

### 2.4. 高密度分析コンポーネント
- **StatCard**:
  - 重要 KPI を `label / value / detail / icon` の構造で表示する。
  - Live Tail、Explorer、Metrics、Alerts、Settings で共通利用する。
- **SparkBars**:
  - ログ件数や検索結果の時系列分布を棒状に表現する。
  - 大量データの傾向を省スペースで把握するために使用する。
- **MetricLineChart**:
  - Metrics 画面の主要 chart。外部依存を増やさず、SVG で line chart を描画する。
- **DistributionBar**:
  - service 別、level 別、threshold のような比較情報を横棒で表示する。

---

## 3. アクセシビリティ基準 (Accessibility Standards)

開発者やSREが長時間のモニタリング業務を行っても目が疲れにくく、かつ重要な情報を見落とさないよう、コントラストとセマンティックカラーに配慮しています。

### カラーコードと選定理由
- **メイン背景色**: `#020617` (Slate 950)
  - 理由: 純粋な黒 (`#000000`) よりも目に優しく、コントラストが強すぎない深いブルーグレーを採用。
- **メインテキスト色**: `#F1F5F9` (Slate 100) & `#E2E8F0` (Slate 200)
  - 理由: 背景に対して十分なコントラスト比（WCAG AA以上）を確保しつつ、眩しさを抑えた白。
- **メタデータ・補助テキスト色**: `#94A3B8` (Slate 400)
  - 理由: タイムスタンプや補助説明など、読めるが必要以上に自己主張しない要素に適用。
- **エラー色 (ERROR)**: `#F87171` (Red 400)
  - 理由: トラブルシューティング時に最も早く視認されるべき情報であるため、明度の高い赤を使用。透過背景(`bg-red-400/10`)と組み合わせることで、ダークテーマ上での視認性と美しさを両立。
- **アクセント色 (Emerald 500)**: `#10B981`
  - 理由: 「接続成功」「検索実行」といったポジティブなアクション・状態を示すために使用。補色に近い色相で目立たせる。

---

## プロダクトマネージャーからのフィードバック要求

ユーザーの皆様へ：
上記に定義された「情報設計」「コンポーネント仕様」「アクセシビリティ基準」は、SREや開発者が真に使いやすいと感じる**「世界最高水準のモニタリング体験」**を満たしているでしょうか？

特に以下の点について、率直なご意見（改善案や不足している要件）をお聞かせください。
1. **情報設計の優先度**: 画面を開いた瞬間に、あなたが最も知りたい情報がスムーズに入ってきそうでしょうか？
2. **色使いと視認性**: 長時間のログ監視において、目に優しいと感じますか？また、ERRORなどの重要なログは見逃さない設計になっていると感じますか？
3. **インタラクション**: ログのコピーや、Live TailのPause/Resumeといった操作感は、直感的で過不足がないでしょうか？

ごフィードバックをもとに、さらに洗練されたUI/UXへとブラッシュアップしてまいります。
