# Retrospective: Sports Motion App Development Process

Date: 2026-05-07
Status: Active follow-up

## Trigger

Sports Motion App development moved quickly, but the workflow repeatedly needed
manual steering for commit/push/merge, retrospective and planning discipline,
process/product improvement, Codex harness design, sub-agent usage, and user
review timing.

## What Happened

- Work was delivered in useful slices, but the process did not consistently make
  the next slice, review gate, or merge readiness visible.
- PR and merge steps depended too much on ad hoc user prompts.
- Sports Motion App-specific rules were only partially separated from Mini
  Datadog workflow guidance.
- Sub-agent usage existed as a capability but was not treated as a normal
  sidecar review option for broad autonomous work.

## Root Causes

- The process emphasized PR readiness but not the full autonomous loop from
  planning through post-merge confirmation.
- Review-request timing was implicit, so the system could not distinguish safe
  autonomy from moments that needed user judgment.
- Harness docs described sub-agent mechanics but did not name Sports Motion App
  delegation patterns.
- Verification guarded docs and tests, but not retrospective/planning artifacts
  or autonomous process invariants.

## Permanent Corrections

- `docs/development_process.md` now defines maximum autonomy mode, review request
  gates, PR readiness, merge helper usage, and exception handling.
- `docs/planning/next_autonomous_slices.md` tracks upcoming autonomous work with
  roles, review gates, and verification commands.
- `.agents/docs/` harness docs now describe long-running autonomous work,
  checkpoint commits, sub-agent sidecar review, and review-gate handling.
- `.agents/scripts/check-sports-motion-docs.sh` guards the existence and key
  wording of process, retrospective, planning, review, and sub-agent artifacts.
- `.agents/scripts/codex-pr.sh --sports-motion-app` and
  `.agents/scripts/codex-merge.sh --sports-motion-app` encode Sports Motion App
  PR and merge expectations.

## Validation

- Run `npm test` in `sports-motion-app/`.
- Run `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness`.
- Confirm PR and merge helpers expose `--sports-motion-app`.
- Confirm docs checks fail when required review/autonomy wording is removed or
  fixed test-count wording is introduced.
