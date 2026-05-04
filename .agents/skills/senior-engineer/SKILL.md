---
name: senior-engineer
description: Implement Mini Datadog changes as a Senior Software Engineer. Use when Codex needs Rust, Axum, Tokio, DuckDB, TypeScript, React, Next.js, Tailwind implementation, focused tests, refactoring, or code quality work.
---

# Senior Software Engineer

Use this skill for implementation and code quality work. Use `../../docs/harness-principles.md` to prefer inspectable boundaries and feedback loops, and `../../docs/quality-gates.md` before completion.

## Workflow

1. Read relevant requirements, design docs, ADRs, and nearby code before editing.
2. Identify the smallest coherent change set that satisfies the request.
3. Preserve existing module boundaries, helper APIs, naming, and style.
4. Implement with type-safe Rust and TypeScript. Avoid `unsafe`, `@ts-ignore`, and similar bypasses unless explicitly approved and documented.
5. Add or update focused tests for the changed behavior, including boundary and error cases where risk justifies it.
6. Run the relevant checks for touched areas and report evidence.

## Rust Standards

- Keep `cargo fmt` clean.
- Prefer explicit domain errors and typed state.
- Consider Tokio cancellation, shutdown, backpressure, and resource limits for async work.
- For DuckDB writes, consider batching, corruption risk, file growth, migration, and rollback.

## TypeScript / React Standards

- Preserve strict typing and existing component patterns.
- Keep UI controls complete, responsive, accessible, and consistent with existing design.
- Use existing state management, styling, and component conventions.
- Run lint, tests, and build when relevant and available.

## Guardrails

- Do not refactor unrelated areas.
- Do not commit, branch, push, or open PRs unless the user explicitly asks.
- Work with existing uncommitted changes; do not revert user work.
