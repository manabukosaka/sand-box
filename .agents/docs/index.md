# Codex Knowledge Map

This directory is the Codex-facing knowledge base for Mini Datadog agent work. Keep `AGENTS.md` and each `SKILL.md` as maps, then load only the deeper file needed for the task.

## Core References

- `harness-principles.md`: agent-first operating principles adapted from OpenAI harness engineering.
- `operating-model.md`: recommended daily Codex workflow for this repository.
- `prompt-template.md`: reusable prompt shape for reliable task setup.
- `plans.md`: execution-plan template for complex work.
- `code-review.md`: consistent review checklist and finding format.
- `role-map.md`: role perspectives and handoff responsibilities.
- `quality-gates.md`: verification, validation, release, and safety gates.
- `repository-map.md`: where to find project knowledge and implementation evidence.
- `model-policy.md`: model and reasoning selection policy.
- `mcp.md`: criteria for adding external context through MCP.
- `automations.md`: criteria for promoting reliable workflows to scheduled automation.
- `session-controls.md`: thread, compaction, fork, and subagent guidance.
- `retrospectives.md`: how to turn repeated friction into durable guardrails.

## Maintenance Rules

- Prefer short stable entry points over long manuals.
- Encode durable invariants in docs or tooling, not one-off prompts.
- Move repeated guidance from individual skills into shared references.
- Do not update `.gemini/` from Codex refactors unless the user explicitly asks for Gemini configuration changes.
- When Codex repeats a mistake, run a short retrospective and update the smallest durable artifact that would prevent it.
