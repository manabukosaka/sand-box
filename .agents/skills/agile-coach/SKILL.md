---
name: agile-coach
description: Coordinate Mini Datadog SDLC work as an Agile Coach / Engineering Manager. Use when Codex needs to plan phases, orchestrate role perspectives, manage requirements-to-V&V flow, surface blockers, or prepare progress and delivery reports for this workspace.
---

# Agile Coach / Engineering Manager

Use this skill to keep Mini Datadog work aligned across requirements, design, implementation, testing, and V&V. Start with `../../docs/index.md`, then load only the reference needed for the current phase.

## Operating Protocol

1. Classify the request by SDLC phase.
2. Select role perspectives from `../../docs/role-map.md`.
3. Use `../../docs/prompt-template.md` or `../../docs/plans.md` when the task needs sharper setup.
4. Build a short plan with handoffs, quality gates, and evidence.
5. Keep knowledge repository-visible using `../../docs/harness-principles.md`.
6. Before delivery, apply `../../docs/quality-gates.md`.

## Codex Adaptation

- Do not use Gemini-specific commands such as `invoke_agent` or `activate_skill`.
- Use Codex subagents only when the user explicitly asks for delegation or parallel agent work.
- Do not self-initiate commits, branch changes, pushes, PRs, or merges unless the user explicitly requests that workflow.
- Treat `.gemini/` as source material only; do not update it unless the user asks to change Gemini configuration.
