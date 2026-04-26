# 設計構想書: Mini Datadog アーキテクチャ

## 1. システム概要と設計思想 (System Overview & Design Philosophy)

「Mini Datadog」は、中小規模のシステム向けに特化した、軽量かつ高速な監視・ログ分析プラットフォームです。高価なSaaSに依存せず、ユーザーが自社環境（セルフホスト）で手軽に運用できるよう、単一バイナリまたは最小限のコンテナ構成で動作することを前提としています。

### 設計思想
*   **運用容易性 (Simplicity in Operations):** 複雑な分散システム（Kafka, Elasticsearch, Prometheusクラスタ等）を排除し、極限までシンプルなアーキテクチャを目指す。
*   **高パフォーマンス (High Performance):** バックエンドにRustを採用し、限られたリソース（CPU/メモリ）で毎秒数万件のログ・メトリクス受信を処理する。
*   **リアルタイム性 (Real-time Capabilities):** ログのLive Tail機能など、データが発生してからユーザーの画面に届くまでのレイテンシを最小化する。

---

## 2. コンポーネント構成 (Component Architecture)

システムは大きく分けて「エージェント (Agent)」「サーバー (Server)」「データストア (Data Store)」「ウェブUI (Web)」の4つの主要コンポーネントで構成されます。

### 2.1 Agent (データ収集エージェント)
*   **役割:** 監視対象のサーバーやコンテナ上で動作し、システムのメトリクス（CPU, メモリ, ディスクI/O等）やアプリケーションのログを収集する。
*   **通信:** HTTP/HTTPS経由でJSON形式のペイロードをServerへ送信する。

### 2.2 Server (Rustバックエンド)
*   システムのコアとなるデータ処理エンジン。以下のサブコンポーネントを持つ。
    *   **Ingestion API (受信部):** Agentからの大量のHTTPリクエストを高速に捌き、APIキー等による認証を行う。
    *   **In-Memory Buffer (バッファ層):** 受信したデータをRustのチャネル等を用いてメモリ上に一時的に蓄積する。これにより、後続のデータストアへの書き込み負荷（細かいI/O）を劇的に低減する。
    *   **Stream & Alert Engine (ストリーム処理・アラート):** バッファを通過するデータをリアルタイムに評価し、閾値超過時のアラート発報や、WebクライアントへのLive Tail用データストリーミング（SSE/WebSocket）を行う。
    *   **Query API (検索部):** Web UIからの検索要求や集計クエリを受け付け、データストアに対してSQLを発行し、結果を返す。

### 2.3 Data Store (データ保存層 - DuckDB / SQLite予定)
*   **役割:** ログと時系列メトリクスデータの永続化と高速検索。
*   **特徴:** 外部のDBサーバーを立てず、Serverプロセスと同じファイルシステム上の単一ファイル（または少数のファイル）として動作する組み込み型DBを採用。In-Memory Bufferから一定時間・一定量ごとに「バルクインサート（一括書き込み）」される。

### 2.4 Web (フロントエンドUI - React/Next.js)
*   **役割:** ユーザーがブラウザでアクセスするダッシュボードとログエクスプローラー。
*   **機能:** メトリクスの時系列グラフ表示、ログのキーワード/タグ検索、およびStream Engineと接続したリアルタイムログ表示（Live Tail）。

---

## 3. システムアーキテクチャ図 (System Architecture Diagram)

```mermaid
graph TD
    %% Define components
    subgraph Target Infrastructure ["監視対象環境 (Target Env)"]
        Agent1[Agent / Logger]
        Agent2[Agent / Logger]
    end

    subgraph Mini Datadog Node ["Mini Datadog (Single Node / Container)"]
        subgraph Server ["Rust Backend Server"]
            Ingestion[Ingestion API]
            Buffer[(In-Memory Buffer)]
            StreamEngine[Stream & Alert Engine]
            QueryAPI[Query API]
            
            %% Data flow within Server
            Ingestion --> |Validate & Queue| Buffer
            Buffer -.-> |Evaluate real-time| StreamEngine
        end
        
        DataStore[(Data Store<br/>DuckDB/SQLite)]
        
        %% Write path
        Buffer ==> |Batch Insert (Bulk)| DataStore
    end

    subgraph Users ["ユーザー環境 (Client)"]
        WebUI[Web UI<br/>Dashboard / Explorer]
        AlertDest[Slack / Webhook]
    end

    %% External connections
    Agent1 --> |HTTP POST (JSON)| Ingestion
    Agent2 --> |HTTP POST (JSON)| Ingestion
    
    QueryAPI --> |SQL Query| DataStore
    DataStore --> |Results| QueryAPI
    
    WebUI --> |HTTP GET (Search/Agg)| QueryAPI
    StreamEngine ===> |SSE / WebSocket (Live Tail)| WebUI
    StreamEngine --> |Alert Trigger| AlertDest

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef highlight fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    classDef storage fill:#fff3e0,stroke:#ff9800,stroke-width:2px;
    
    class Server,WebUI highlight;
    class DataStore,Buffer storage;
```

---

## 4. 主要なデータフロー (Data Flows)

### 4.1 書き込みフロー (Write Path) - ログ・メトリクス受信
1.  **Agent** がログやメトリクスをJSON形式で `Server` の `Ingestion API` へ送信（HTTP POST）。
2.  `Ingestion API` はリクエストの認証と軽量なバリデーションを行い、データを `In-Memory Buffer`（MPSCチャネル等）にプッシュする。この時点でAgentへは `202 Accepted` を返し、超低レイテンシを実現する。
3.  バックグラウンドのワーカーが `In-Memory Buffer` からデータを一定サイズ（例: 5000件）または一定時間（例: 1秒）ごとに取り出し、`Data Store` (DuckDB/SQLite) へ **バルクインサート（一括書き込み）** を行う。

### 4.2 読み込みフロー (Read Path) - 検索とダッシュボード表示
1.  ユーザーが `Web UI` から「過去1時間の `service:payment` のログ」を検索。
2.  `Web UI` は `Server` の `Query API` へリクエストを送信。
3.  `Query API` はリクエストをSQLクエリ（またはDB固有のクエリ）に変換し、`Data Store` に対して実行。
4.  `Data Store` からの集計/検索結果をJSON化して `Web UI` へ返却する。

### 4.3 リアルタイムフロー (Live Path) - Live Tailとアラート
1.  ログが `In-Memory Buffer` を通過する際、`Stream & Alert Engine` がそのストリームをサブスクライブ（購読）する。
2.  **Live Tail:** `Web UI` との間で確立されている SSE (Server-Sent Events) または WebSocket コネクションを通じて、DBへの書き込み完了を待たずに、メモリ上から直接ブラウザへログをブロードキャストする。
3.  **Alerting:** 事前に設定された条件（例：「ERRORレベルのログが1分間に10件以上」など）をメモリ上で評価（ローリングウィンドウ等）し、条件を満たした場合は即座にSlackやWebhookへ通知を発火する。

---

## 5. 設計上の重要なポイント・課題 (Key Design Considerations)

*   **In-Memory Buffer の設計:**
    *   大量の書き込みを捌くための要であり、Phase 2 (PoC) で最も検証すべきポイント。バッファサイズの設定、プロセスダウン時のデータロスト許容度（数秒分のインメモリデータは揮発する設計とするか、WALを自前で実装するか）のトレードオフを検討する。
*   **単一バイナリ化 (Single Binary Build):**
    *   運用を極限まで簡単にするため、Rustの `include_bytes!` マクロ等を使用して、ビルド時にNext.js/Reactの静的アセット（HTML/JS/CSS）をRustバイナリ内に埋め込み、1つの実行ファイルだけでWebサーバーとAPIサーバーを兼ねるアーキテクチャを目指す。
