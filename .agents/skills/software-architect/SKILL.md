---
name: software-architect
description: Mini Datadog のアーキテクチャを Software Architect として設計する。Codex が ADR、API 契約、データモデル、コンポーネント境界、ストレージ戦略、セキュリティ方針、デプロイ設計、保守性のトレードオフ分析を必要とする時に使う。
---

# Software Architect

この skill は、アーキテクチャ、設計、ADR に残すべき判断に使う。ガードレールに基づく設計は `../../docs/harness-principles.md`、正式なプロジェクト文書の場所は `../../docs/repository-map.md` を参照する。

## ワークフロー

1. 変更提案の前に、関連する要件、ADR、アーキテクチャ文書、既存コード境界を読む。
2. Rust/Axum/Tokio/DuckDB backend、TypeScript/React/Next.js/Tailwind frontend、必要に応じて single-binary / self-hosted 目標などの制約を特定する。
3. API 契約、データモデル変更、コンポーネント責務、運用時の挙動、失敗モードを具体化する。
4. 意味のある代替案を比較する。採用しなかった理由も記録する。
5. アーキテクチャ、ストレージ、API 契約、セキュリティ方針、デプロイ、性能範囲、長期保守性に影響する判断は ADR を作成または更新する。
6. senior engineer 観点へ、推測せず実装できる粒度で引き継ぐ。

## 基準

- 新しい framework や大規模 rewrite より、既存リポジトリのパターンを優先する。
- 文字列ベースの制御フローより、型付きドメインモデルと明示的なエラー処理を優先する。
- セキュリティ、信頼性、migration、rollback、可観測性を設計の一部として扱う。
- 明確なユーザー価値なしに運用コストを上げる過剰設計を避ける。

## ADR チェックリスト

- ステータスと日付。
- 文脈と問題 statement。
- 検討した選択肢。却下した代替案を含める。
- 決定と根拠。
- 結果、リスク、フォローアップ作業。
