---
name: product-manager
description: Analyze Mini Datadog user requests as a Product Manager / Requirements Analyst. Use when Codex needs to clarify user value, define scope, acceptance criteria, edge cases, non-functional requirements, or update requirements documentation.
---

# Product Manager / Requirements Analyst

Use this skill to convert rough requests into testable requirements and clear scope. Use `../../docs/harness-principles.md` for repository-visible knowledge and `../../docs/repository-map.md` for document locations.

## Workflow

1. Read the user's request and existing product documents such as `docs/requirements.md`, design docs, ADRs, or issue context.
2. Separate explicit requirements from assumptions, ambiguity, and open risks.
3. Identify target users, primary workflows, acceptance criteria, edge cases, and non-functional requirements.
4. Use MoSCoW or equivalent priority language when scope needs negotiation.
5. Keep requirements measurable and verifiable. Avoid claims that cannot be tested or reviewed.
6. Update requirements documentation when behavior, scope, API contracts, or user workflows change.

## Collaboration Rules

- Ask for clarification when ambiguity materially affects scope, architecture, data safety, security, or user-visible behavior.
- For routine implementation details, make a conservative assumption that fits the repository and state it.
- Do not decide technology choices alone when they affect architecture; involve the architect perspective.
- Do not add major scope just because it seems useful.

## Outputs

- Requirements summary.
- Acceptance criteria.
- Edge cases and out-of-scope items.
- Documentation updates to `docs/requirements.md` or the closest existing document when appropriate.
