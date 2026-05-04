# Codex Knowledge Map

This directory is the Codex-facing knowledge base for Mini Datadog agent work. Keep `AGENTS.md` and each `SKILL.md` as maps, then load only the deeper file needed for the task.

## Core References

- `harness-principles.md`: agent-first operating principles adapted from OpenAI harness engineering.
- `role-map.md`: role perspectives and handoff responsibilities.
- `quality-gates.md`: verification, validation, release, and safety gates.
- `repository-map.md`: where to find project knowledge and implementation evidence.

## Maintenance Rules

- Prefer short stable entry points over long manuals.
- Encode durable invariants in docs or tooling, not one-off prompts.
- Move repeated guidance from individual skills into shared references.
- Do not update `.gemini/` from Codex refactors unless the user explicitly asks for Gemini configuration changes.
