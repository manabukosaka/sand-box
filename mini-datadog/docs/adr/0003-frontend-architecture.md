# ADR 0003: フロントエンド・アーキテクチャの選定 (Frontend Architecture Selection)

## 1. ステータス (Status)
Accepted (Updated 2026-04-26)

## 2. コンテキスト (Context)
Mini Datadog の Web UI は、ログの検索、メトリクスの可視化、および Live Tail 機能を提供する必要がある。当初は Vite + React (SPA) を検討していたが、開発の容易性と API サーバーとの統合性を考慮し、再検討を行った。

## 3. 決定事項 (Decision)
フロントエンドフレームワークとして **Next.js (App Router, TypeScript)** を採用する。
また、スタイリングには **Vanilla CSS** を使用し、サードパーティの CSS フレームワーク（Tailwind CSS 等）への依存を避ける。

## 4. 決定の根拠 (Rationale)
1.  **ルーティングとレイアウト:** Next.js の App Router により、ダッシュボードやログエクスプローラーなどの複雑な画面遷移を簡潔に定義できる。
2.  **API との親和性:** バックエンド (Rust) との通信において、型安全な開発（TypeScript）が容易であり、将来的な Server Actions の活用なども視野に入れられる。
3.  **単一バイナリ化:** `output: 'export'` 設定により静的アセットを生成でき、Rust バイナリへの埋め込みやすさは Vite と同等である。
4.  **メンテナンス性:** 独自の Vanilla CSS を用いることで、特定の CSS フレームワークのバージョンアップや学習コストに縛られず、長期的に安定したビジュアルデザインを維持できる。

## 5. 結果 (Consequences)
- `mini-datadog/web` ディレクトリに Next.js プロジェクトを構築する。
- 静的書き出しを行い、バックエンドの `rust-embed` ロジックで配信する。
