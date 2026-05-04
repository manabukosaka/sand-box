# Repository Map

Use this map before loading broader context.

## Entry Points

- `AGENTS.md`: Codex workspace instructions and precedence.
- `GEMINI.md`: Gemini CLI configuration. Read only for historical context; do not edit unless requested.
- `.gemini/`: Gemini-specific agents and skills. Do not change during Codex-only work.
- `.agents/skills/`: Codex skills migrated from Gemini role perspectives.
- `.agents/docs/`: Codex harness and role reference material.
- `.agents/scripts/verify.sh`: repeatable local verification entry point.
- `.agents/scripts/codex-checkpoint.sh`: explicit checkpoint commit helper.
- `.githooks/`: local Git hooks enabled by `.agents/scripts/install-git-hooks.sh`.

## Product Documents

- `mini-datadog/docs/requirements.md`: product requirements.
- `mini-datadog/docs/architecture.md`: architecture overview.
- `mini-datadog/docs/detailed_design.md`: detailed design.
- `mini-datadog/docs/api_schema.md`: API schema.
- `mini-datadog/docs/adr/`: architecture decision records.
- `mini-datadog/docs/vuv_checklist.md`: visual and UX verification checklist.
- `mini-datadog/docs/vv_report_phase3.md`: V&V evidence.

## Implementation Areas

- Backend: Rust, Axum, Tokio, DuckDB under `mini-datadog`.
- Frontend: TypeScript, React, Next.js, Tailwind CSS under `mini-datadog`.

## Search Strategy

- Use `rg` and `rg --files` first.
- Prefer nearby code and existing tests over assumptions.
- Prefer structured docs and ADRs over stale conversational context.
