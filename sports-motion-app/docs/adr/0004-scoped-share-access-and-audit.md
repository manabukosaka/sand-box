# ADR 0004: Scoped Share Access And Audit

## Status

Proposed

## Date

2026-05-08

## Context

Sports Motion App must support external specialist review while limiting
exposure of athlete-identifying data and internal history.

Current prototype sharing validates create/revoke behavior, but production
contracts need stricter guarantees:

- a share should expose only one analysis scope by default;
- video, overlays, comments, and evidence details should be explicitly
  includable/excludable;
- revoked or expired links must fail closed;
- access attempts should be auditable;
- external viewers must not enumerate athletes, teams, or unrelated analyses.

## Decision

Use a scoped `ShareLink` contract with explicit include flags, token lifecycle,
and access audit.

1. Every share is tied to one `AnalysisRun`.
2. Include flags default to minimum disclosure:
   `include_video = false`, `include_comments = false`,
   `include_evidence = false`, `include_overlays = false`.
3. Share tokens are time-bounded and revocable.
4. Token rotation is allowed and must invalidate the previous token.
5. Access to revoked or expired share tokens returns closed-state error only.
6. Access logs are append-only and scoped per share link.
7. Shared responses never include team roster, athlete list, or full history.

## Alternatives Considered

### Wide Share Scope By Default

Rejected. It increases accidental disclosure risk and makes revocation impact
harder to reason about.

### Roleless Public Links Without Expiry

Rejected. It does not meet controlled specialist review expectations.

### Invite-Only Access Without Link Tokens

Deferred. Invite-only may be added later, but link tokens are needed for MVP
external collaboration flow.

## Consequences

- Product behavior is clearer for coaches and specialists.
- API/backend implementation must enforce include flags and token lifecycle.
- Audit records can support QA/security review and incident follow-up.
- UI must communicate scope clearly before share creation.

## Follow-Up Work

- Extend API schema with explicit share include flags and access-log shape.
- Extend requirements and architecture docs for share-scope and audit rules.
- Add V&V evidence template for share access and revocation cases.
- Add tests for access denial, scope filtering, and audit-log append behavior.
