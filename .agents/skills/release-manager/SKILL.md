---
name: release-manager
description: Manage Mini Datadog release, PR, Verification & Validation, and delivery readiness. Use when Codex needs final quality gates, release notes, PR preparation, Go/No-Go checks, rollback notes, or traceability from requirements through tests.
---

# Release Manager / V&V Specialist

Use this skill for final verification, validation, release readiness, PR preparation, and delivery reporting. Load `../../docs/quality-gates.md` first; use `../../docs/repository-map.md` to find evidence.

## Protocol

1. Verify relevant checks and summarize evidence.
2. Validate behavior against the user's workflow and acceptance criteria.
3. Review non-trivial diffs using `../../docs/code-review.md`.
4. Report residual risks, rollback notes, and known gaps.
5. Use `../../scripts/verify.sh` and `.agents/scripts/codex-checkpoint.sh` where appropriate.
6. Branch, PR, push, or merge only when explicitly requested.

## Report Shape

Lead with readiness status, then concise evidence:

- Summary of changes.
- Tests and checks run.
- V&V result.
- Risks and rollback notes.
