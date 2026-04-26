# ユーザーガイド (User Guide)

## Overview
本ドキュメントは、Mini Datadog のセットアップから基本操作（ログ検索、フィルタリング、Live Tail）までの詳細手順をユーザー向けに解説します。

## Prerequisites
- 実行可能な `mini-datadog-server` バイナリ。
- Web UI にアクセスするためのモダンブラウザ（Chrome, Firefox, Safari 等）。

## 1. セットアップと起動 (Setup & Start)

Mini Datadog は単一バイナリとして提供されるため、複雑な依存関係や外部 DB のインストールは不要です。

### 1.1 単一バイナリでの起動
ターミナルを開き、バイナリを実行するだけでシステム全体が起動します。

```bash
# デフォルトポート (3000) で起動
./mini-datadog-server
```

起動時、同一ディレクトリ内に `mini_datadog.db`（DuckDB のデータファイル）が自動的に生成されます。

> **TIP (Windows / WSL2 ユーザー向け):**
> WSL2 内で実行しており、Windows 側のブラウザから `http://localhost:3000` でアクセスできない場合は、WSL2 の IP アドレスを直接指定してください。
> WSL2 内で `ip addr show eth0` を実行して IP を確認し、`http://<WSL_IP>:3000` でアクセスを試みてください。

## 2. 基本操作 (Basic Operations)

### 2.1 ログ検索 (Log Search)
ダッシュボード左側の「Logs」メニューからアクセスします。

- **時間範囲の指定:** 「Last 15 minutes」「Last 1 hour」などのプリセット、または任意の日時範囲を指定できます。
- **キーワード検索:** テキストボックスに検索したい文字列（例: `timeout` または `error`）を入力します。
- **タグフィルタリング:** `service:payment` や `env:production` といったタグを用いた絞り込みが可能です。

### 2.2 Live Tail (リアルタイムログ監視)
ログ検索画面右上にある「Live Tail」ボタンを有効にすると、データストアへの書き込みを待たず、インメモリバッファから直接ログがストリーミングされます。
これにより、障害発生時にミリ秒単位の遅延で最新のシステム状態を把握できます。

## 3. データのクリーンアップ (Data Cleanup)
デフォルト設定では、データは 30 日間保持されます。30日を経過した古いデータは、バックグラウンドのクリーンアップジョブによって自動的に削除され、ディスク容量を保護します。

## 4. 環境変数 (Environment Variables)
サーバーの動作をカスタマイズするために、以下の環境変数を利用できます。

| 変数名 | 説明 | デフォルト値 |
| --- | --- | --- |
| `DEFAULT_API_KEY` | エージェント等からのデータ送信時に使用されるデフォルトAPIキー | (未設定時はテスト用のキーが使用されます) |
| `BUFFER_SIZE` | インメモリバッファの最大サイズ（件数） | `10000` |
| `DATA_RETENTION_DAYS` | データ保持期間（日数） | `30` |
| `PORT` | サーバーがリッスンするポート番号 | `3000` |
| `DATABASE_URL` | DuckDBのデータベースファイルパス | `mini_datadog.db` |

## References
- [API Reference](../api/api_reference.md)