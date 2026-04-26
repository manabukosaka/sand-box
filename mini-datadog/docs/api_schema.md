# API 仕様書 (Draft): Mini Datadog API Schema

## 1. 概要 (Overview)
本ドキュメントは、Mini Datadog Server が提供する API のインターフェース定義を記述します。
主な対象は以下の通りです。
- **Ingestion API:** データ収集エージェントからサーバーへデータを送信するためのインターフェース。
- **Query API:** Web UI がサーバーから検索・集計結果を取得するためのインターフェース。
- **Stream API:** Live Tail（リアルタイムログ表示）のためのストリーミングインターフェース。

---

## 2. 共通仕様 (Common Specifications)
- **Base URL:** `http://<server-host>:3000` (デフォルト)
- **認証:** `X-API-Key` ヘッダーによる簡易認証を予定。
- **データフォーマット:** 全て JSON (UTF-8)。

---

## 3. Ingestion API (データ受信)

### 3.1 ログ受信 (Log Ingestion)
エージェントが収集したログを送信します。

- **Endpoint:** `POST /api/v1/ingest/logs`
- **Request Body:** 配列形式でのバルク送信を推奨。
  ```json
  [
    {
      "timestamp": "2023-10-27T10:00:00.123Z",
      "level": "info",
      "service": "payment-api",
      "message": "Processed transaction successfully",
      "tags": {
        "env": "production",
        "region": "ap-northeast-1",
        "request_id": "req-12345"
      },
      "attributes": {
        "amount": 1500,
        "currency": "JPY"
      }
    }
  ]
  ```
- **Response:**
  - `202 Accepted`: サーバーのインメモリバッファへの受け入れ完了。
  - `401 Unauthorized`: APIキーが不正。

### 3.2 メトリクス受信 (Metric Ingestion)
システム指標（CPU, メモリ等）やアプリケーション固有の指標を送信します。

- **Endpoint:** `POST /api/v1/ingest/metrics`
- **Request Body:**
  ```json
  [
    {
      "timestamp": "2023-10-27T10:00:00.000Z",
      "name": "system.cpu.usage",
      "value": 45.2,
      "type": "gauge",
      "service": "payment-api",
      "tags": {
        "env": "production",
        "host": "ip-10-0-1-5"
      }
    },
    {
      "timestamp": "2023-10-27T10:00:00.000Z",
      "name": "http.request.count",
      "value": 1,
      "type": "counter",
      "service": "payment-api",
      "tags": {
        "env": "production",
        "status": "200"
      }
    }
  ]
  ```

---

## 4. Query API (検索・集計)

### 4.1 ログ検索 (Log Query)
保存されたログを検索・フィルタリングします。

- **Endpoint:** `POST /api/v1/query/logs` (複雑なフィルタリング条件を考慮し POST を採用)
- **Request Body:**
  ```json
  {
    "start": "2023-10-27T09:00:00Z",
    "end": "2023-10-27T10:00:00Z",
    "query": "level:error AND service:payment-api",
    "limit": 100,
    "offset": 0
  }
  ```
- **Response:**
  ```json
  {
    "total": 1250,
    "hits": [
      {
        "timestamp": "2023-10-27T09:55:00.000Z",
        "level": "error",
        "message": "Database connection timeout",
        "tags": { ... }
      }
    ]
  }
  ```

### 4.2 メトリクス集計 (Metric Query)
時系列データの集計結果（グラフ表示用）を取得します。

- **Endpoint:** `POST /api/v1/query/metrics`
- **Request Body:**
  ```json
  {
    "start": "2023-10-27T09:00:00Z",
    "end": "2023-10-27T10:00:00Z",
    "metrics": [
      {
        "name": "system.cpu.usage",
        "aggregator": "avg",
        "group_by": ["host"]
      }
    ],
    "interval": "1m"
  }
  ```
- **Response:**
  ```json
  {
    "results": [
      {
        "metric_name": "system.cpu.usage",
        "group": { "host": "ip-10-0-1-5" },
        "values": [
          ["2023-10-27T09:00:00Z", 42.1],
          ["2023-10-27T09:01:00Z", 45.3]
        ]
      }
    ]
  }
  ```

---

## 5. Stream API (Live Tail)

### 5.1 ログストリーミング (Log Stream)
リアルタイムでログを受信し続けます。

- **Endpoint:** `GET /api/v1/stream/logs`
- **Protocol:** Server-Sent Events (SSE) 推奨
- **Query Parameters:**
  - `query`: フィルタリング条件（例: `service:payment-api`）
- **Data Format (Event Data):**
  ```json
  {
    "timestamp": "2023-10-27T10:05:00.000Z",
    "level": "info",
    "message": "New log message arrived",
    ...
  }
  ```
