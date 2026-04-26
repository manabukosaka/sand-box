# API リファレンス (API Reference V1)

## Overview
本ドキュメントは、Mini Datadog にデータを送信（Ingestion）したり、データを取得（Query/Stream）したりするための開発者向け API 仕様を OpenAPI スタイルで詳述します。

## Prerequisites
- Mini Datadog サーバーが稼働していること（デフォルト: `http://localhost:3000`）。
- 有効な API キーを持っていること。

## 認証 (Authentication)
Ingestion および Query API リクエストには、ヘッダーに `X-API-Key` を含める必要があります。

```http
X-API-Key: your_api_key_here
```
不正なキーの場合は `401 Unauthorized` を返します。

※ **注意:** `Live Tail ストリーム (SSE)` は、ブラウザの `EventSource` の制限により、現在は認証を必要としません。

## Endpoints

### 1. ログ受信 (Log Ingestion)
- **Method:** `POST`
- **Path:** `/api/v1/ingest/logs`
- **Description:** エージェントからログデータを受信します。単一オブジェクトおよび配列でのバルク送信に対応しています。

#### Request Body
```json
[
  {
    "timestamp": "2023-10-27T10:00:00.123Z",
    "level": "error",
    "service": "payment-api",
    "message": "Connection timeout",
    "tags": { "env": "production" }
  }
]
```

#### Responses
- `202 Accepted`: 正常にキューに登録されました。
- `400 Bad Request`: リクエストの形式が不正です。
- `429 Too Many Requests`: サーバーのバッファが一杯です。

### 2. メトリクス受信 (Metrics Ingestion)
- **Method:** `POST`
- **Path:** `/api/v1/ingest/metrics`
- **Description:** 時系列のメトリクスデータを受信します。

#### Request Body
```json
[
  {
    "timestamp": "2023-10-27T10:00:00.123Z",
    "name": "system.cpu.usage",
    "value": 45.2,
    "service": "payment-api",
    "tags": { "host": "web-01" }
  }
]
```

#### Responses
- `202 Accepted`: 正常にキューに登録されました。
- `400 Bad Request`: リクエストの形式が不正です。

### 3. ログ検索 (Log Query)
- **Method:** `POST`
- **Path:** `/api/v1/query/logs`
- **Description:** 保存されたログデータを検索・取得します。

#### Request Body
```json
{
  "start": "2023-10-27T09:00:00Z",
  "end": "2023-10-27T10:00:00Z",
  "query": "level:error AND service:payment-api",
  "limit": 100,
  "offset": 0
}
```

#### Responses
- `200 OK`: 検索結果を返します。
  ```json
  {
    "total": 1,
    "hits": [
      {
        "timestamp": "2023-10-27T09:55:00.000Z",
        "level": "error",
        "message": "Connection timeout",
        "tags": { "env": "production" },
        "attributes": {}
      }
    ]
  }
  ```

### 4. Live Tail ストリーム (Log Stream)
- **Method:** `GET`
- **Path:** `/api/v1/stream/logs`
- **Description:** Server-Sent Events (SSE) を使用して、リアルタイムのログストリームを提供します。

#### Query Parameters
- `query` (optional): ログのフィルタリング条件。

#### Responses
- `200 OK` (Content-Type: `text/event-stream`)

## References
- [Architecture Details](../architecture/internal_design.md)