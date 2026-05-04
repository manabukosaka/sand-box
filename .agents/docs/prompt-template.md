# Prompt Template

Use this shape when a task is broad, risky, or likely to span multiple files.

## Goal

What should change or exist when the work is complete?

## Context

Relevant files, folders, docs, examples, logs, screenshots, errors, or prior decisions.

## Constraints

Architecture, safety, compatibility, UX, security, data, performance, and repository conventions Codex must follow.

## Done When

Concrete completion checks:

- Behavior changed or bug no longer reproduces.
- Relevant tests, lint, type checks, or builds pass.
- Documentation, ADRs, or V&V evidence are updated when needed.
- Diff has been reviewed for regressions and unrelated changes.

## Planning Trigger

Use Plan mode or write an execution plan before implementation when the task is ambiguous, multi-step, high-risk, or hard to describe.
