# Harness 原則

このリポジトリ向けの agent-first harness 原則。

## タスク文脈

- `operating-model.md` を標準 workflow として使う。
- 広いタスクでは、実装前に目的、文脈、制約、完了条件を明確にする。
- タスクが曖昧または高リスクな場合は `prompt-template.md` を使う。
- 作業が複雑、曖昧、または長時間になりそうな場合は、coding 前に `plans.md` を使う。

## 地図であり、詳細マニュアルではない

- `AGENTS.md` と `SKILL.md` は、百科事典ではなく信頼できる情報源への地図として扱う。
- 共通ルールは `.agents/docs/`、project facts は `mini-datadog/docs/` に置く。
- 現在のタスクに必要な時だけ詳細文脈を読む。

## リポジトリから読める知識

- Codex がリポジトリから読めない情報は、永続的な project knowledge とみなさない。
- 重要な判断、review feedback、繰り返し発生する preference は、versioned Markdown、tests、scripts、lint rules に変換する。
- requirements、ADR、API references、test reports、execution plans、V&V notes などの structured artifact を優先する。

## 細かい指示よりガードレール

- invariant と boundary を強制し、その範囲内の local implementation freedom は許容する。
- 透明で検査可能な boring abstraction を、opaque cleverness より優先する。
- 繰り返し発生する preference は、reusable helper、test、documentation に昇格する。

## フィードバックループ

- 実用的な範囲で、app、logs、metrics、tests、screenshots、command output を Codex が読めるようにする。
- 広範な repository verification が必要な場合は `.agents/scripts/verify.sh` を使う。
- bug と UI 変更では、再現、修正、検証を同じ loop で行う。
- agent が詰まることは、docs、tools、repository structure に不足がある signal として扱う。
- ユーザーが継続的な commit workflow を求めている場合は、coherent progress を checkpoint commit で捕捉する。
- ユーザーが Sports Motion App の最大自律を明示した場合は、planning、
  implementation、verification、PR、approved merge、post-merge confirmation
  を `sports-motion-app/docs/development_process.md` の loop に沿って扱う。
- 長い自律作業では、review request gate、retrospective、planning queue、
  checkpoint commit を repo-readable artifact として残す。

## 外部文脈と自動化

- 文脈が頻繁に変わる、または repository 外にある場合は MCP を使う。詳細は `mcp.md` を参照する。
- 繰り返し可能で信頼できる workflow は、automation の前に skill に昇格する。
- 1 つの coherent task につき 1 thread を使う。長時間作業は `session-controls.md` を参照する。

## エントロピー制御

- drift、duplication、stale docs、不統一な pattern を定期的に取り除く。
- cleanup 目的の refactor は、狭く機械的に保つ。
- 既知の follow-up debt は、大きな prompt に埋めず tracking する。
