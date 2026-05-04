# Codex ナレッジマップ

この directory は、Mini Datadog の agent 作業向け Codex-facing knowledge base です。`AGENTS.md` と各 `SKILL.md` は地図として保ち、タスクに必要な詳細 file だけを読む。

## 主要参照

- `harness-principles.md`: OpenAI harness engineering をこの workspace 向けに適用した agent-first 原則。
- `operating-model.md`: この repository における日常的な Codex workflow。
- `prompt-template.md`: reliable task setup のための再利用可能な prompt 形式。
- `plans.md`: 複雑な作業向け execution plan template。
- `code-review.md`: 一貫した review checklist と finding 形式。
- `role-map.md`: role perspective と handoff responsibility。
- `quality-gates.md`: verification、validation、release、安全性 gate。
- `repository-map.md`: project knowledge と implementation evidence の場所。
- `model-policy.md`: model と reasoning の選択方針。
- `mcp.md`: MCP で外部文脈を追加する基準。
- `automations.md`: 信頼できる workflow を scheduled automation に昇格する基準。
- `session-controls.md`: thread、compaction、fork、sub-agent の扱い。
- `retrospectives.md`: 繰り返し発生する friction を durable guardrail に変える方法。

## 保守ルール

- 長い manual より、短く安定した entry point を優先する。
- durable invariant は、一回限りの prompt ではなく docs や tooling に encode する。
- 個別 skill に重複する guidance は shared reference に移す。
- ユーザーが Gemini 設定変更を明示しない限り、Codex refactor で `.gemini/` を更新しない。
- Codex が同じ誤りを繰り返した場合は、短い retrospective を行い、それを防ぐ最小の durable artifact を更新する。
