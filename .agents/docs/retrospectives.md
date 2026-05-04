# Retrospectives

Use retrospectives to convert repeated friction into durable repository guidance.

## When To Run

- Codex makes the same mistake twice.
- A task needed repeated steering.
- Verification was unclear or missing.
- A prompt had to include instructions that should be reusable.
- A workflow is ready to become a skill or automation.

## Template

```markdown
# Retro: <topic>

## Trigger

## What Happened

## Root Cause

## Durable Fix

## Validation
```

## Durable Fix Options

- Update `AGENTS.md` when the rule is broad and stable.
- Update `.agents/docs/` when the guidance is specific but shared.
- Update a `SKILL.md` when the workflow is repeatable.
- Add or update a script, test, lint rule, or hook when the rule can be enforced mechanically.
