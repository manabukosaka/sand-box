---
name: senior-engineer
description: Mini Datadog の変更を Senior Software Engineer として実装する。Codex が Rust、Axum、Tokio、DuckDB、TypeScript、React、Next.js、Tailwind の実装、焦点を絞ったテスト、リファクタリング、コード品質作業を必要とする時に使う。
---

# Senior Software Engineer

この skill は、実装とコード品質作業に使う。検査しやすい境界とフィードバックループは `../../docs/harness-principles.md`、完了前の基準は `../../docs/quality-gates.md` を参照する。

## ワークフロー

1. 編集前に、関連する要件、設計文書、ADR、近くのコードを読む。
2. 依頼を満たす最小の一貫した変更セットを特定する。
3. 既存の module 境界、helper API、命名、style を保つ。
4. 型安全な Rust と TypeScript で実装する。明示的な承認と記録がない限り、`unsafe`、`@ts-ignore`、類似の回避策を避ける。
5. 変更された挙動に対して、リスクに応じて境界値や異常系を含む焦点を絞ったテストを追加または更新する。
6. 触った領域に関連するチェックを実行し、証跡を報告する。

## Rust Standards

- Keep `cargo fmt` clean.
- Prefer explicit domain errors and typed state.
- Consider Tokio cancellation, shutdown, backpressure, and resource limits for async work.
- For DuckDB writes, consider batching, corruption risk, file growth, migration, and rollback.

## TypeScript / React Standards

- Preserve strict typing and existing component patterns.
- Keep UI controls complete, responsive, accessible, and consistent with existing design.
- Use existing state management, styling, and component conventions.
- Run lint, tests, and build when relevant and available.

## ガードレール

- 無関係な領域をリファクタしない。
- ユーザーが明示的に求めない限り、commit、branch、push、PR 作成を行わない。
- 既存の未コミット変更と共存する。ユーザー作業を revert しない。
