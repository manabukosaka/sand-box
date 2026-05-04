# Model And Reasoning Policy

Use parent-session defaults unless a task has a clear reason to override.

## Defaults

- Use the inherited model for normal work.
- Use higher reasoning for complex architecture, debugging, multi-file refactors, security, and data safety work.
- Use lower reasoning for narrow, well-scoped edits and mechanical documentation updates.

## Subagent Guidance

- Use subagents only when the user explicitly asks for delegation or parallel agent work.
- Prefer `gpt-5.4-mini` for bounded exploration, test triage, and low-risk parallel checks.
- Prefer frontier models such as `gpt-5.5` for complex design, high-risk implementation, security review, or work that is likely to require deep reasoning.
- Do not hard-code model choices into skills; Codex skills should describe when to use the workflow, not force a runtime model.

## Practical Rule

Start with quality. Optimize for cost and latency only after the workflow is reliable.
