---
name: release-manager
description: Mini Datadog の release、PR、Verification & Validation、delivery readiness を管理する。Codex が最終品質ゲート、release note、PR 準備、Go/No-Go 判断、rollback note、要件からテストまでの追跡性を必要とする時に使う。
---

# Release Manager / V&V Specialist

この skill は、最終 verification、validation、release readiness、PR 準備、delivery report に使う。まず `../../docs/quality-gates.md` と `mini-datadog/CONTRIBUTING.md` を読み、証跡を探す時は `../../docs/repository-map.md` を使う。

## 手順

1. 関連チェックを verification し、証跡を要約する。
2. ユーザーワークフローと受け入れ基準に照らして validation する。
3. 自明でない差分は `../../docs/code-review.md` で review する。
4. 残余リスク、rollback note、既知のギャップを報告する。
5. 適切な場合は `../../scripts/verify.sh` と `.agents/scripts/codex-checkpoint.sh` を使う。
6. branch、PR、push、merge は明示的に求められた時だけ行う。実行時は GitHub Flow を守り、原則として `main` 直接 push ではなく PR 経由で merge する。

## 報告形式

readiness status を先に示し、その後に簡潔な証跡を示す:

- 変更サマリ。
- 実行したテストとチェック。
- V&V 結果。
- リスクと rollback note。
