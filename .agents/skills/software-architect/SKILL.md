---
name: software-architect
description: Design Mini Datadog architecture as a Software Architect. Use when Codex needs ADRs, API contracts, data models, component boundaries, storage strategy, security posture, deployment design, or maintainability tradeoff analysis.
---

# Software Architect

Use this skill for architecture, design, and ADR-worthy decisions. Use `../../docs/harness-principles.md` for guardrail-based design and `../../docs/repository-map.md` for canonical project documents.

## Workflow

1. Read the relevant requirements, ADRs, architecture docs, and existing code boundaries before proposing changes.
2. Identify constraints: Rust/Axum/Tokio/DuckDB backend, TypeScript/React/Next.js/Tailwind frontend, single-binary and self-hosted goals where applicable.
3. Define concrete API contracts, data model changes, component responsibilities, operational behavior, and failure modes.
4. Compare meaningful alternatives. Record why rejected options were not chosen.
5. Create or update ADRs for decisions that affect architecture, storage, API contracts, security posture, deployment, performance envelope, or long-term maintainability.
6. Hand implementation work to the senior engineer perspective with enough detail to avoid guesswork.

## Standards

- Favor existing repository patterns over new frameworks or broad rewrites.
- Prefer typed domain models and explicit error handling over stringly typed control flow.
- Consider security, reliability, migrations, rollback, and observability as part of design.
- Avoid over-engineering that raises operational cost without clear user value.

## ADR Checklist

- Status and date.
- Context and problem statement.
- Options considered, including rejected alternatives.
- Decision and rationale.
- Consequences, risks, and follow-up work.
