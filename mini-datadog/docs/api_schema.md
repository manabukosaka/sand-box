# API 仕様書 (V1): Mini Datadog API Schema

## 1. 概要 (Overview)
本ドキュメントは、Mini Datadog Server が提供する API のインターフェース定義を記述します。
主な対象は以下の通りです。
- **Ingestion API:** データ収集エージェントからサーバーへデータを送信するためのインターフェース。
- **Query API:** Web UI がサーバーから検索・集計結果を取得するためのインターフェース。
- **Stream API:** Live Tail（リアルタイムログ表示）のためのストリーミングインターフェース。

---

## 2. 共通仕様 (Common Specifications)

### 2.1 Base URL
- `http://<server-host>:3000` (デフォルト)

### 2.2 認証 (Authentication)
- `X-API-Key` ヘッダーによる簡易認証。
- 不正なキーの場合は `401 Unauthorized` を返却。

### 2.3 データフォーマット
- Content-Type: `application/json` (UTF-8)
- Timestamp Format: ISO 8601 (例: `2023-10-27T10:00:00.123Z`)

### 2.4 共通エラーレスポンス (Common Error Response)
全てのエンドポイントで、エラー時は以下の JSON 構造を返却します。
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## 3. Ingestion API (データ受信)

### 3.1 ログ受信 (Log Ingestion)
エージェントが収集したログを送信します。

- **Endpoint:** `POST /api/v1/ingest/logs`
- **Request Body:** 単一のログオブジェクト、またはログオブジェクトの配列（バルク）。
  ```json
  // 単一レコードまたは配列を受け付け
  [
    {
      "timestamp": "2023-10-27T10:00:00.123Z",
      "level": "info",
      "service": "payment-api",
      "message": "Processed transaction successfully",
      "tags": { "env": "production" }
    }
  ]
  ```
- **Response:**
  - `202 Accepted`: 正常受け入れ。
  - `400 Bad Request`: 不正な形式。

### 3.2 メトリクス受信 (Metric Ingestion)
- **Endpoint:** `POST /api/v1/ingest/metrics`
- **Request Body:** 単一のメトリクスオブジェクト、またはメトリクスオブジェクトの配列。
- **Response:**
  - `202 Accepted`: 正常受け入れ。
  - `400 Bad Request`: 指標データの形式が不正。

---

## 4. Query API (検索・集計)

### 4.1 ログ検索 (Log Query)
保存されたログを検索・フィルタリングします。

- **Endpoint:** `POST /api/v1/query/logs`
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
- **Response Body:**
  ```json
  {
    "total": 1250,
    "hits": [
      {
        "timestamp": "2023-10-27T09:55:00.000Z",
        "level": "error",
        "message": "Database connection timeout",
        "tags": { ... },
        "attributes": { ... }
      }
    ]
  }
  ```

### 4.2 メトリクス集計 (Metric Query)
時系列データの集計結果を取得します。

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
- **Response Body:**
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
リアルタイムでログを配信します。

- **Endpoint:** `GET /api/v1/stream/logs`
- **Protocol:** Server-Sent Events (SSE)
- **Query Parameters:**
  - `query`: フィルタリング条件（例: `service:payment-api`）
- **Data Format (Event Data):** ログ受信データと同一。
  ```json
  {
    "timestamp": "2023-10-27T10:05:00.000Z",
    "level": "info",
    "message": "New log message arrived",
    "service": "...",
    "tags": { ... }
  }
  ```
