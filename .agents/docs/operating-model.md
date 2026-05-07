# Codex 運用モデル

このリポジトリでは、以下を標準の作業方法として使う。

## 標準ループ

1. `prompt-template.md` に沿ってタスクを整理する。
2. `product-boundaries.md` に沿って対象プロダクトを判定し、関連するリポジトリ文脈だけを収集する。
3. タスクが曖昧、複数ステップ、高リスク、または横断的な場合は plan を先に作る。
4. 最小の一貫した単位で実装する。
5. 狭く信頼できるチェックで verification する。広範なチェックが必要な場合は `.agents/scripts/verify.sh` を使う。
6. 自明でない差分は `code-review.md` で review する。
7. 永続的な判断は docs、ADR、tests、scripts、lint rules に残す。
8. Git 運用は対象プロダクトの source of truth を使う。Mini Datadog は `mini-datadog/CONTRIBUTING.md`、Sports Motion App は `sports-motion-app/docs/development_process.md` を優先する。
9. PR 作成は `.agents/scripts/codex-pr.sh`、承認済み PR の merge は `.agents/scripts/codex-merge.sh` を使う。

Sports Motion App でユーザーが最大自律を明示した場合は、
`sports-motion-app/docs/development_process.md` に従い、計画、実装、検証、
PR 準備、承認済み merge の準備、post-merge 確認を同じ自律 loop として
扱う。push、PR、merge は現在のユーザー依頼が明示的に許可している場合に
限り、merge は承認済み PR と明示的な merge approval がある場合に限る。
user review request gate と higher-priority safety constraints は迂回しない。

## エスカレーションルール

- 曖昧さが scope、architecture、data safety、security、user-visible behavior に影響する場合は確認する。
- repository context だけでは不十分で、外部文脈が繰り返し有用な場合だけ MCP を使う。
- 繰り返し発生する手動 workflow は、automation にする前に skill に昇格する。
- 1 つの一貫したタスクにつき 1 thread を使う。作業が本当に分岐する場合だけ fork する。
- branch、push、PR、merge はユーザーの明示指示がある場合だけ行う。ただし実行時も対象プロダクトの Git / PR ルールを優先する。

## 推奨プロンプト契約

- 目的: 望ましい変更。
- 文脈: 関連するファイル、ドキュメント、ログ、スクリーンショット、エラー。
- 制約: アーキテクチャ、安全性、UX、データ、性能、禁止事項。
- 完了条件: 期待されるテスト、挙動、ドキュメント、レビュー、証跡。

## ふりかえりルール

Codex が同じ誤りを繰り返した場合、現在の差分を直すだけで終わらせない。次回の再発を防ぐ最小の永続的ガードレールを追加する。
