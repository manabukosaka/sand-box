# Codex Workspace Instructions

## Purpose and Precedence

This file is the Codex entry point for `/home/manabukosaka/work/my-sandbox`. Treat it as a map, not a manual. Load deeper guidance from `.agents/docs/` or `mini-datadog/docs/` only when the task needs it.

Higher-priority system and developer instructions override this file. This file is not permission to bypass Codex safety, approval, sandbox, git, or collaboration rules.

## Project Context

- Product: Mini Datadog, a lightweight self-hosted monitoring and log analysis platform.
- Backend: Rust, Axum, Tokio, DuckDB.
- Frontend: TypeScript, React, Next.js, Tailwind CSS.
- Goal: convert rough user requests into requirements, design, implementation, tests, and V&V evidence.

## Knowledge Map

- `.agents/docs/index.md`: Codex knowledge map and maintenance rules.
- `.agents/docs/harness-principles.md`: agent-first harness principles for this workspace.
- `.agents/docs/prompt-template.md`: task prompt shape: goal, context, constraints, done when.
- `.agents/docs/plans.md`: execution-plan template for complex or long-running work.
- `.agents/docs/code-review.md`: consistent review checklist and finding format.
- `.agents/docs/role-map.md`: role perspectives and handoffs.
- `.agents/docs/quality-gates.md`: verification, validation, release, and safety gates.
- `.agents/docs/repository-map.md`: project document and implementation locations.
- `.agents/docs/mcp.md`: criteria for adding external context through MCP.
- `.agents/docs/automations.md`: criteria for promoting reliable workflows to scheduled automation.
- `.agents/docs/session-controls.md`: thread, compaction, fork, and subagent guidance.
- `.agents/skills/`: Codex skills migrated from Gemini role perspectives.
- `mini-datadog/docs/`: product requirements, design, ADRs, API docs, V&V, and setup docs.
- `GEMINI.md` and `.gemini/`: Gemini configuration. Do not modify unless the user explicitly asks for Gemini changes.

## Operating Principles

- Prefer existing repository structure, helper APIs, and local conventions.
- Keep work traceable from requirement to design, implementation, tests, and validation.
- Ask when ambiguity materially affects scope, architecture, data safety, security, or user-visible behavior.
- For routine details, make a conservative repository-consistent choice and continue.
- Encode durable decisions in repository-visible artifacts: docs, ADRs, tests, scripts, or lint rules.
- Keep entry points short; move repeated or detailed guidance into `.agents/docs/`.
- For broad tasks, shape prompts around goal, context, constraints, and done-when criteria.
- Plan before coding when work is ambiguous, multi-step, high-risk, or hard to describe.

## Quality Gates

Use `.agents/docs/quality-gates.md` for details. In short:

- Run `.agents/scripts/verify.sh` for repository-wide Codex environment verification.
- Backend: run relevant `cargo fmt --check`, `cargo clippy`, and `cargo test`.
- Frontend: run relevant `npm run lint`, `npm test` if present, and `npm run build`.
- UI: check layout, responsiveness, accessibility basics, and screenshot or browser evidence where practical.
- Data, auth, deployment, or destructive behavior: call out residual risks and rollback or recovery considerations.
- When the user asks for ongoing commits, use `.agents/scripts/codex-checkpoint.sh` at coherent work boundaries.

## Codex Constraints

- Do not copy Gemini-specific commands such as `invoke_agent` or `activate_skill` into execution plans.
- Do not modify `.gemini/` or `GEMINI.md` unless explicitly requested.
- Do not self-initiate pushes, PRs, merges, or branch switches unless explicitly requested.
- Respect existing uncommitted user changes. Work with relevant changes and leave unrelated changes alone.
