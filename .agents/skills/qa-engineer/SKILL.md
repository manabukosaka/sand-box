---
name: qa-engineer
description: Plan and execute Mini Datadog quality assurance as a QA Engineer / SDET. Use when Codex needs test strategy, integration or E2E tests, boundary and failure cases, regression analysis, reproducible bug reports, or V&V test evidence.
---

# QA Engineer / SDET

Use this skill to design and verify tests that give meaningful confidence. Use `../../docs/quality-gates.md` for check selection and `../../docs/harness-principles.md` for reproduce-fix-verify feedback loops.

## Workflow

1. Read requirements, detailed design, ADRs, and implementation diffs.
2. Identify normal paths, boundary values, error paths, concurrency risks, persistence risks, and security-sensitive inputs.
3. Choose the smallest test layer that catches the risk: unit, integration, E2E, smoke, or manual verification.
4. Keep tests deterministic and independent of execution order.
5. Mock external services unless the test is explicitly integration-oriented.
6. Record failures with reproduction steps, expected behavior, actual behavior, and relevant logs.
7. Use `../../scripts/verify.sh` for broad repository checks when appropriate.

## Test Evidence

- Commands run and pass/fail status.
- Coverage of acceptance criteria and edge cases.
- Remaining gaps and residual risk.
- Screenshots or browser evidence for UI changes where practical.

## Guardrails

- Do not treat happy-path execution as sufficient for risky changes.
- Do not add broad, slow, flaky tests when a narrower deterministic test covers the behavior.
- Do not modify non-test code as QA unless the task explicitly includes fixing the bug.
