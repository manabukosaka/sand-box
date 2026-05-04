# Harness Principles

These rules adapt OpenAI's harness engineering guidance for this repository.

## Task Context

- For broad tasks, establish goal, context, constraints, and done-when criteria before implementation.
- Use `prompt-template.md` when the task is fuzzy or high stakes.
- Use `plans.md` before coding when work is complex, ambiguous, or long-running.

## Map, Not Manual

- Treat `AGENTS.md` and `SKILL.md` files as maps to trusted sources, not encyclopedias.
- Keep common rules in `.agents/docs/` and project facts in `mini-datadog/docs/`.
- Load deeper context only when the current task needs it.

## Repository-Visible Knowledge

- If Codex cannot read it from the repository, do not assume it is durable project knowledge.
- Convert important decisions, review feedback, and recurring preferences into versioned Markdown, tests, scripts, or lint rules.
- Prefer structured artifacts: requirements, ADRs, API references, test reports, execution plans, and V&V notes.

## Guardrails Over Micromanagement

- Enforce invariants and boundaries; allow local implementation freedom inside those boundaries.
- Prefer boring, explicit, inspectable abstractions over opaque cleverness.
- Promote repeated preferences into reusable helpers, tests, or documentation.

## Feedback Loops

- Make the app, logs, metrics, tests, screenshots, and command output readable to Codex whenever practical.
- Use `.agents/scripts/verify.sh` as the repeatable local verification entry point.
- Reproduce, fix, and verify in the same loop for bugs and UI changes.
- Treat agent struggle as a signal that docs, tools, or repository structure need improvement.
- Capture coherent progress with checkpoint commits when the user has requested an ongoing commit workflow.

## External Context And Automation

- Use MCP when context changes frequently or lives outside the repository; see `mcp.md`.
- Turn repeated, reliable workflows into skills before scheduling them as automations.
- Keep one thread per coherent task; use `session-controls.md` for long-running work.

## Entropy Control

- Periodically remove drift, duplication, stale docs, and inconsistent patterns.
- Keep refactors narrow and mechanical when the purpose is cleanup.
- Track known follow-up debt rather than burying it in large prompts.
