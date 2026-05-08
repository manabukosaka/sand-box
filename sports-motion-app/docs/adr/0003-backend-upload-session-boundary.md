# ADR 0003: Backend Upload Session Boundary

## Status

Proposed

## Date

2026-05-08

## Context

The MVP currently uses prototype upload states in local UI and mock API logic.
To move toward production API and worker orchestration, upload ownership must be
explicit:

- local draft state is useful for user continuity but not authoritative for
  tracking readiness;
- backend and workers need deterministic upload completion signals;
- retry and interruption handling must preserve athlete/team/video metadata
  without duplicate tracking submissions;
- sharing/privacy constraints require clear separation between transfer state and
  analysis state.

Without a strict boundary, the system can enqueue tracking before upload
completion, create duplicate submissions, or produce ambiguous failure behavior.

## Decision

Treat `UploadSession` as a backend-owned state machine that gates formal
tracking submission.

1. A `MotionVideo` draft may exist before bytes are uploaded.
2. `POST /videos/{motion_video_id}/upload-session` creates or reuses an active
   session for that video.
3. Only `UploadSession.status = completed` can transition `MotionVideo.status`
   to `uploaded`.
4. `POST /videos/{motion_video_id}/submit-tracking` must reject requests until
   the backend confirms upload completion.
5. Local app draft/upload simulation remains non-authoritative and must not
   bypass backend completion checks.
6. Upload interruption creates retryable session states and a new attempt only
   when the prior session is interrupted/expired/aborted.
7. Tracking queue creation is idempotent per uploaded video unless a re-analysis
   or explicit rerun path is requested.

## Alternatives Considered

### Client-Side Upload Authority

Rejected. It cannot provide reliable server-side readiness for worker queues and
is vulnerable to race conditions and duplicate submits.

### Storage Callback-Only Completion

Rejected for MVP. Direct callback-only completion can be part of implementation,
but a backend API session state is still needed for deterministic app behavior,
auditability, and retry controls.

### Immediate Tracking Submission With Implicit Upload Check

Rejected. Implicit checks hide transfer failures and make error handling less
actionable for users and QA.

## Consequences

- API, worker, and UI contracts become clearer:
  local state for continuity, backend state for readiness.
- Duplicate active sessions and duplicate tracking submissions can be prevented
  with explicit idempotency rules.
- Upload failure handling can remain capture/measurement/transfer focused and
  avoid misleading athlete interpretation.
- Backend implementation will require state-transition validation and audit
  events for session lifecycle changes.

## Follow-Up Work

- Update `api_schema.md` with explicit upload-session transitions, idempotency,
  and submission preconditions.
- Update `architecture.md` and `requirements.md` with backend-owned upload gate
  behavior.
- Add backend implementation tasks for transition validation, queue idempotency,
  and upload-session lifecycle tests.
