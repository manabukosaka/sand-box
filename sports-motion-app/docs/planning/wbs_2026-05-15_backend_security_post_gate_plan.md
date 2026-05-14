# WBS 9.0: Post-Gate Production Backend And Security Plan

Date: 2026-05-15
Status: Draft

## Purpose

This document defines the design-level backend and security slice for the
production Sports Motion App. It is intentionally a post-gate artifact: the
production backend is not the next implementation step, and it should not be
treated as ready-to-build until the mobile and tracking feasibility gates are
closed.

The slice covers the minimum production backend boundaries needed for API
contracts, authentication, object storage, scoped sharing, audit logging, and
privacy controls. It is meant to be read alongside:

- `../architecture.md`
- `../project_plan.md`
- `../adr/0003-backend-upload-session-boundary.md`
- `../adr/0004-scoped-share-access-and-audit.md`

## Post-Gate Boundary

Production backend work begins only after the following gates are satisfied:

1. Native mobile smoke and physical-device evidence exist for capture,
   import, review, and retry flows.
2. Tracking feasibility results exist for the planned model/provider path.
3. Share-scope behavior is still consistent with the current prototype and
   reviewed ADRs.
4. Privacy and disclosure rules are stable enough to freeze the first
   production API contract.

Until then, this plan remains a specification artifact. It can guide ADRs,
API schema updates, and review checklists, but it does not authorize
implementation work.

## Design Scope

### API Boundary

- Production API owns tenant-scoped motion data, users, teams, athletes,
  videos, analysis runs, review packets, sharing state, and audit records.
- Client local draft state remains non-authoritative and must not be treated as
  proof of upload completion or tracking readiness.
- API contracts should distinguish draft, uploaded, queued, processing,
  analyzed, failed, revoked, and expired states explicitly.
- Endpoints should be designed around idempotent session creation, explicit
  completion checks, and scoped access to shared results.

### Authentication And Authorization

- Authentication should identify the caller before any motion-data access is
  granted.
- Authorization should be tenant-scoped first, then role-scoped, then object
  scoped.
- Coaches and internal staff should see only the organization and team data
  they are permitted to access.
- External specialists should receive share-scoped access only, with no
  default discovery path to athletes, teams, or unrelated analyses.
- Access revocation must fail closed and should not depend on client behavior.

### Object Storage

- Object storage is the system of record for original uploaded videos and
  derived analysis artifacts that are too large or sensitive to keep inline.
- Storage credentials should be short-lived and scoped to a single upload or
  download action.
- Uploaded media, preview assets, and raw tracking artifacts should remain
  separable so retention and deletion can be reasoned about independently.
- The backend must own the mapping between API records and storage objects.

### Share Access Control

- Shares remain result-scoped and should continue to expose only one
  `AnalysisRun` by default.
- Share include flags should stay explicit and minimum-disclosure by default.
- Share tokens should be time-bounded, revocable, and rotatable.
- Share responses must not leak roster data, unrelated analysis history, or
  broader tenant metadata.
- Scope changes should be auditable and should not silently widen disclosure.

### Audit Logs

- Audit logs should capture access, sharing, revocation, retry, completion, and
  privacy-relevant configuration changes.
- Audit events should be append-only and tied to the tenant and object being
  changed or read.
- Access logging should support QA, incident review, and privacy review without
  becoming a second source of truth for product state.
- Audit records should avoid storing raw secrets or content that is not needed
  for traceability.

### Privacy Gates

- Privacy gates should stop accidental disclosure before production launch.
- Any flow that exposes athlete-identifying data, share links, or analysis
  payloads should require an explicit disclosure review.
- Exports, downloads, and specialist-sharing views should be constrained by the
  same include/exclude rules used at share creation time.
- A production launch should require review of default visibility, token
  expiry, revocation behavior, and audit coverage.

## Proposed Slice Order

1. Freeze the first production API contract for motion videos, upload
   sessions, tracking jobs, analysis runs, sharing, and audit events.
2. Define authentication and authorization boundaries for internal and external
   callers.
3. Define object storage ownership, object naming, and credential scope.
4. Specify share enforcement and audit expectations in backend-facing docs and
   schema comments.
5. Add privacy gates to the release and review process before implementation.

## Open Design Questions

- Which deployment environment is the initial production target?
- Which identity provider or auth mechanism should own primary user login?
- What retention policy applies to uploaded videos, preview media, and raw
  tracking artifacts?
- Which audit events are mandatory at launch versus deferred?
- Should export/download endpoints use the same share-token model as read-only
  review pages, or a separate authenticated path?

## Risks

- If the production API is implemented before the post-gate slice is frozen,
  share scope and privacy boundaries may drift from the documented minimum.
- If object storage ownership is not defined before implementation, upload and
  deletion semantics may become inconsistent across API and worker code.
- If audit logs are treated as optional, privacy review and incident response
  will be weaker than the product needs.
- If authentication is deferred too long, later API work may accidentally
  encode prototype assumptions about trust.

## Follow-Up Artifacts

- Update `../api_schema.md` with the eventual production endpoint shapes.
- Update `../architecture.md` once the post-gate slice is approved for
  implementation.
- Add backend implementation tasks only after the gate evidence is available.
