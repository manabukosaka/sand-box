# Tracking Feasibility Result: Sample Readiness

Date: 2026-05-09
Tester: Codex
Gate: Tracking feasibility sample run
Result: Blocked before candidate execution

## Scope

- Reviewed the sample-video manifest coverage needed for the Milestone 2
  tracking feasibility gate.
- Added a sample acquisition protocol for privacy-safe collection before
  candidate execution.
- Confirmed that no original athlete videos, consent forms, identifying media,
  or private artifact links are committed to git.
- Did not run a tracking provider/model candidate.
- Did not promote metric maturity or change the mobile stack ADR.

## Readiness Summary

| Case | Required count | Approved count | Result |
| --- | ---: | ---: | --- |
| Good open-side capture | 5 | 0 | Blocked |
| Good catcher-view capture | 3 | 0 | Blocked |
| Closed-side or partially occluded capture | 3 | 0 | Blocked |
| Low light or background clutter | 3 | 0 | Blocked |
| Youth/high-school form variation | 3 | 0 | Blocked |
| College/adult high-intent bullpen | 5 | 0 | Blocked |
| Known bad framing | 3 | 0 | Blocked |

## Gate Decision

| Check | Result | Notes |
| --- | --- | --- |
| Required sample coverage exists | Fail | Manifest has placeholder rows only. |
| Usage rights approved | Fail | No approved private sample set is recorded. |
| Candidate/provider version frozen | Not run | Candidate execution must wait for sample readiness. |
| Metric support matrix updated from observed runs | Not run | No candidate output exists yet. |
| Metric promotion decision | Blocked | No metric can be promoted from this readiness check. |

## Required Inputs Before Next Run

- Private sample storage location approved for evaluator access.
- Consent and usage-right evidence outside git.
- Opaque sample IDs with complete capture metadata.
- Sample intake follows `docs/sample_acquisition_protocol.md`.
- At least one approved sample per required case type before any Conditional Go
  review.
- Full minimum sample count before a stronger Go recommendation.

## Review Gate

User review is required before selecting a provider/model, promoting metrics, or
changing ADR 0002. This readiness check only records the blocker.
