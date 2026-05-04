# Automations

Skills define the method. Automations define the schedule.

## Promote to Automation When

- The manual workflow is already reliable.
- Inputs and outputs are stable.
- The task has clear verification.
- Failures are safe and easy to inspect.

## Good Candidates

- Summarize recent commits.
- Scan for likely bugs or stale docs.
- Draft release notes.
- Check CI failures.
- Produce standup or V&V summaries.
- Run repeatable maintenance checks.

## Do Not Automate Yet

- Workflows that still need heavy steering.
- Destructive or production-impacting operations.
- Branch, push, PR, or merge operations without explicit human approval.
- Live edits across the same files without worktree isolation.
