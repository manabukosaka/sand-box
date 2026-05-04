# Codex Operating Model

Use this as the default way of working in this repository.

## Default Loop

1. Frame the task with `prompt-template.md`.
2. Gather only relevant repository context.
3. Plan first when the task is ambiguous, multi-step, high-risk, or cross-cutting.
4. Implement the smallest coherent slice.
5. Verify with the narrowest credible checks, or `.agents/scripts/verify.sh` for broad checks.
6. Review non-trivial diffs with `code-review.md`.
7. Capture durable decisions in docs, ADRs, tests, scripts, or lint rules.
8. Create a checkpoint commit with `codex-checkpoint.sh` when ongoing commits are requested.

## Escalation Rules

- Ask clarification when ambiguity affects scope, architecture, data safety, security, or user-visible behavior.
- Use MCP only when repository context is not enough and the external context is repeatably useful.
- Promote repeated manual workflows to skills before scheduling them as automations.
- Use one thread per coherent task; fork only when work truly branches.

## Recommended Prompt Contract

- Goal: desired change.
- Context: relevant files, docs, logs, screenshots, or errors.
- Constraints: architecture, safety, UX, data, performance, and do-not rules.
- Done when: tests, behavior, docs, review, and evidence expected.

## Retrospective Rule

When Codex repeats a mistake, do not just fix the current diff. Add the smallest durable guardrail that prevents the next recurrence.
