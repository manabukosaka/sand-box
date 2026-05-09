# Sports Motion App Development Process

Status: Active

This document is the source of truth for Sports Motion App development process
inside this shared workspace. Mini Datadog continues to use
`mini-datadog/CONTRIBUTING.md`; Sports Motion App work uses this document plus
the shared Codex scripts in `.agents/scripts/`.

## Standard Loop

1. Plan the slice.
   - Confirm the milestone and acceptance scenario in `docs/project_plan.md`.
   - Identify whether the change is product, mobile architecture, biomechanics
     evidence, implementation, V&V, or release process work.
   - Record durable decisions in docs or ADRs before implementation when the
     choice affects data contracts, AI tracking, sharing, privacy, or metric
     interpretation.

2. Build one coherent slice.
   - Keep each slice small enough to review as a single product outcome.
   - Do not mix unrelated Mini Datadog and Sports Motion App changes.
   - Preserve the separation between prototype behavior and production-ready
     behavior in docs and UI text.

3. Keep docs, schema, tests, and V&V synchronized.
   - Update requirements, architecture, API schema, project plan, prototype
     acceptance notes, metric support docs, or V&V templates when behavior or
     decisions change.
   - Keep raw tracking values, ROM-adjusted outputs, specialist notes, share
     scopes, and metric suppression reasons as distinct concepts.
   - Avoid fixed changing values in durable docs, such as exact test counts or
     exact pass-count totals. Use phrases like "Node test suite" instead.

4. Verify locally.
   - Run `npm test` from `sports-motion-app/` for Sports Motion App code
     changes.
   - Run `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness`
     before PR.
   - For mobile or UI behavior, record emulator, simulator, physical-device, or
     PWA evidence in `docs/vv/` using the current template.

5. Open the PR through the helper.
   - Use `.agents/scripts/codex-pr.sh --sports-motion-app`.
   - Do not rely on manual `gh pr create --fill` because it can leave required
     PR template sections vague or stale.
   - Fill or override the generated sections when the change includes security,
     privacy, AI tracking, evidence, mobile-device, or sharing implications.

6. Merge through the helper after approval.
   - Use `.agents/scripts/codex-merge.sh` for approved PRs.
   - Manual merge is an exception for tool outage or repository emergency and
     must be followed by the same post-merge state check.

7. Confirm post-merge state.
   - Return to `main`, pull the merge result, and confirm the workspace is clean.
   - Re-run the narrow verification command if the merge included conflict
     resolution, generated files, or changed process scripts.
   - Update project status when a milestone exit criterion changed.

## Maximum Autonomy Mode

When the user explicitly grants maximum autonomy for Sports Motion App work,
Codex may carry one coherent slice through planning, implementation,
verification, commit, push, and PR creation without waiting for step-by-step
user prompts. This mode does not bypass higher-priority safety, approval,
sandbox, or review constraints. It does not authorize merge unless the PR has
passed CI/checks, required review gates are recorded, and the user has
explicitly approved merge for that PR.

Autonomous work must follow this sequence:

1. Create or use a non-`main` branch named `<type>/<short-desc>`.
2. Run a short planning pass and identify whether product, mobile architecture,
   biomechanics, QA/release, or harness review is needed.
3. Use sub-agent sidecar review when the work is broad enough to benefit from
   Product, Mobile Architect, Biomechanics, QA/Release, or harness perspectives.
4. Implement one coherent slice and keep docs, tests, schema, planning, and V&V
   evidence aligned.
5. Use checkpoint commits at coherent boundaries when the work spans multiple
   substantial edits.
6. Run local verification and create the PR with
   `.agents/scripts/codex-pr.sh --sports-motion-app`.
7. Request user review at the review gates below.
8. Merge only when the PR is approved, not draft, checks pass, the review gates
   have been satisfied, and the user has explicitly approved merge for that PR.
9. Use `.agents/scripts/codex-merge.sh --sports-motion-app` and confirm
   post-merge `main` state.

Manual merge, merge without review request, or repeated work without a
retrospective is an exception. Record the exception and permanent correction in
`docs/retrospectives/`.

## 3-Lane Standard For Sub-Agent Work

When sub-agent parallel work is explicitly requested, Sports Motion App uses
the 3-lane standard by default:

1. Product lane: requirements, acceptance wording, and review-gate implications.
2. Architecture lane: app, mock API, and docs contract alignment.
3. QA lane: tests, V&V evidence, and verification/check-script coverage.

Security lane is added only when sharing/privacy, identity scope, or external
access-control behavior changes.

Parent Codex keeps the critical path:

1. scope freeze for the current coherent slice;
2. review-request gate judgment;
3. acceptance/rejection of sub-agent findings with repo evidence;
4. final verification and residual-risk summary.

Sub-agent prompt contract for token efficiency:

- one question per read-only task;
- 3-6 files maximum per task;
- output format fixed to `Finding / Evidence(file:line) / Impact / Decision needed`;
- state explicit non-target scope in the prompt;
- avoid intermediate wait loops; dispatch in parallel and collect once.

## User Review Request Gates

Request user review before proceeding when a slice:

- changes MVP scope, milestone sequencing, or product acceptance criteria;
- introduces or changes medical, injury-risk, rehabilitation, or performance
  guarantee wording;
- changes external sharing, athlete-identifying data, privacy, or access-control
  behavior;
- promotes AI tracking or biomechanics metrics from experimental/provisional to
  formal;
- accepts or changes a mobile stack, cloud analysis boundary, or ADR-level
  architecture decision;
- changes this development process, maximum autonomy boundaries, review gate
  definitions, PR/merge helpers, verification scripts, planning queue rules, or
  retrospective requirements;
- is ready to merge under maximum autonomy mode.

If a gate is not relevant, record that in the PR body or final report. If a gate
is relevant and review is unavailable, stop before merge and report the blocker.

## PR Readiness Checklist

- The PR is one coherent Sports Motion App slice.
- `docs/project_plan.md` reflects current milestone status without fixed test
  counts.
- Requirements, architecture, API schema, evidence metrics, acceptance review,
  mobile test plan, and V&V evidence are updated when affected.
- AI tracking status is not overstated; prototype adapters remain labeled as
  prototype until real provider/model validation exists.
- Metric suppression, confidence policy, share scope, upload session state, and
  ROM post-processing are covered by tests or documented V&V evidence when
  changed.
- Medical diagnosis, definitive injury prediction, and guaranteed performance
  claims are absent from product-facing wording.
- Local verification has passed or any skipped check is explicitly reported with
  the reason and residual risk.
- Review request gates were evaluated, and required user review was requested
  before merge.
- Review request gates are listed in the PR body with one of: Not applicable,
  User review requested, User approved, or Blocked pending review.
- Relevant retrospective and planning notes were updated for autonomous or
  repeated process work.

## Default Commands

```bash
cd sports-motion-app
npm test
cd ..
.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
```

For PR creation:

```bash
.agents/scripts/codex-pr.sh --sports-motion-app --title "docs: update sports motion process"
```

For approved PR merge:

```bash
.agents/scripts/codex-merge.sh --sports-motion-app --pr <number>
```
