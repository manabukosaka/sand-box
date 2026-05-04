# リポジトリマップ

広い文脈を読む前に、この map を使う。

## 入口

- `AGENTS.md`: Codex workspace instructions と precedence。
- `GEMINI.md`: Gemini CLI configuration。historical context として読むだけにし、明示的な依頼がない限り編集しない。
- `mini-datadog/CONTRIBUTING.md`: GitHub Flow、Conventional Commits、PR review、quality check の source of truth。
- `.gemini/`: Gemini-specific agents と skills。Codex-only work では変更しない。
- `.agents/skills/`: Gemini role perspective から移植した Codex skills。
- `.agents/docs/`: Codex harness と role reference material。
- `.agents/scripts/verify.sh`: repeatable local verification entry point。
- `.agents/scripts/codex-checkpoint.sh`: explicit checkpoint commit helper。
- `.githooks/`: `.agents/scripts/install-git-hooks.sh` で有効化される local Git hooks。

## 製品ドキュメント

- `mini-datadog/docs/requirements.md`: product requirements。
- `mini-datadog/docs/architecture.md`: architecture overview。
- `mini-datadog/docs/detailed_design.md`: detailed design。
- `mini-datadog/docs/api_schema.md`: API schema。
- `mini-datadog/docs/adr/`: architecture decision records。
- `mini-datadog/docs/vuv_checklist.md`: visual and UX verification checklist。
- `mini-datadog/docs/vv_report_phase3.md`: V&V evidence。

## 実装領域

- Backend: `mini-datadog` 配下の Rust、Axum、Tokio、DuckDB。
- Frontend: `mini-datadog` 配下の TypeScript、React、Next.js、Tailwind CSS。

## 検索方針

- まず `rg` と `rg --files` を使う。
- 仮定より、近くの code と既存 tests を優先する。
- 古い conversation context より、structured docs と ADR を優先する。
