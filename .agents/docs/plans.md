# Execution Plans

Use an execution plan for long-running, multi-step, or high-risk work. Keep small tasks lightweight.

## Plan Template

```markdown
# Plan: <task>

## Goal

## Context

## Constraints

## Steps

- [ ] Gather context
- [ ] Define requirements or acceptance criteria
- [ ] Design changes and ADRs if needed
- [ ] Implement smallest coherent slice
- [ ] Add or update tests
- [ ] Verify and validate
- [ ] Checkpoint commit if requested

## Decisions

## Verification

## Risks / Follow-up
```

## Rules

- Keep one plan per coherent unit of work.
- Update status as work progresses.
- Record decisions that would otherwise be hidden in chat.
- Promote material architecture decisions to `mini-datadog/docs/adr/`.
