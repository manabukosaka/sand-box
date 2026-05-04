# Role Map

Use role perspectives as focused review lenses. They are not Gemini agents and do not imply Codex subagent delegation.

## Roles

- Product Manager: clarify user value, scope, requirements, acceptance criteria, and non-functional needs.
- Software Architect: define boundaries, contracts, ADRs, storage choices, security posture, and maintainability tradeoffs.
- Senior Engineer: implement Rust and TypeScript changes using existing patterns, type safety, and focused tests.
- QA Engineer: design deterministic tests for normal, boundary, failure, integration, E2E, and regression risks.
- Release Manager: verify specification compliance, validate user intent, summarize evidence, and manage release readiness.
- Agile Coach: coordinate phase flow, risk, blockers, handoffs, and delivery reporting.
- Security Researcher: review auth, input validation, secrets, dependency risk, and OWASP-style issues without intrusive testing.
- DB Tuner: review DuckDB ingestion, query plans, retention, file growth, and migration or recovery risk.
- SRE Specialist: review Linux, Docker, resource limits, startup, shutdown, observability, SLOs, and recovery.

## Handoffs

- Requirements before design when scope is ambiguous.
- ADR before implementation for material architecture, storage, API, security, deployment, or performance decisions.
- Tests before release readiness.
- V&V before final delivery or PR reporting.

## Delegation

- Use Codex subagents only when the user explicitly asks for subagents, delegation, or parallel agent work.
- Otherwise apply role perspectives locally and keep the work moving.
