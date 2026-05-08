# Tracking Feasibility Results Template

Status: Template
Related gate: `../tracking_feasibility_gate.md`
Related run plan: `../tracking_sample_run_plan.md`

Create a dated copy for each run, for example:

```text
docs/vv/tracking_feasibility_results_2026-05-20_candidate-a.md
```

Do not include athlete-identifying media or public links.

## Run Metadata

| Field | Value |
| --- | --- |
| Run date | TBD |
| Evaluators | TBD |
| Candidate ID | TBD |
| Candidate version | TBD |
| Adapter version | TBD |
| Confidence policy version | TBD |
| Sample manifest version | TBD |
| Result state | ready / blocked / partial |

## Sample Coverage

| Case type | Required count | Approved count | Run count | Status |
| --- | ---: | ---: | ---: | --- |
| Good open-side capture | 5 | TBD | TBD | TBD |
| Good catcher-view capture | 3 | TBD | TBD | TBD |
| Closed-side or partially occluded capture | 3 | TBD | TBD | TBD |
| Low light or background clutter | 3 | TBD | TBD | TBD |
| Youth/high-school form variation | 3 | TBD | TBD | TBD |
| College/adult high-intent bullpen | 5 | TBD | TBD | TBD |
| Known bad framing | 3 | TBD | TBD | TBD |

## Run Outcomes

| Status | Count | Notes |
| --- | ---: | --- |
| completed | TBD |  |
| completed_with_warnings | TBD |  |
| failed_retryable | TBD |  |
| failed_unusable | TBD |  |

## Signal Support Summary

| Signal group | Pass | Warn | Fail | Notes |
| --- | ---: | ---: | ---: | --- |
| shoulder/elbow/wrist | TBD | TBD | TBD |  |
| hip/pelvis/trunk orientation | TBD | TBD | TBD |  |
| knee/ankle/lower body | TBD | TBD | TBD |  |
| foot contact event | TBD | TBD | TBD |  |
| release event | TBD | TBD | TBD |  |

## Metric Classification Proposal

| Metric | Proposed level | Rationale | Suppression behavior confirmed |
| --- | --- | --- | --- |
| TBD | formal_candidate / provisional / experimental / unsupported | TBD | yes / no |

## Failure And Warning Patterns

List capture/measurement-focused reasons only.

| Type | Pattern | Impact | Suggested action |
| --- | --- | --- | --- |
| warning | TBD | TBD | TBD |
| failed_retryable | TBD | TBD | TBD |
| failed_unusable | TBD | TBD | TBD |

## Gate Recommendation

| Field | Value |
| --- | --- |
| Recommendation | go / conditional_go / no_go |
| Constraints for next slice | TBD |
| Reviewer sign-off needed | product / biomechanics / QA / mobile architect |

## Evidence Links

| Artifact | Private URI or reference | Notes |
| --- | --- | --- |
| Candidate run summary | TBD |  |
| Tracking artifact bundle | TBD |  |
| Sample manifest snapshot | TBD |  |
| Metric matrix snapshot | TBD |  |
