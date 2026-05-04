# Session Controls

Keep one Codex thread per coherent unit of work.

## Use The Same Thread When

- The work is still part of the same problem.
- Prior reasoning and decisions are directly relevant.
- You are continuing verification or fixing feedback on the same diff.

## Fork Or Start Fresh When

- The task truly branches.
- Context has become bloated or misleading.
- A parallel exploration can run without touching the same files.

## Compaction

- Compact when the thread is long and the earlier context can be summarized.
- Before final delivery after compaction or resume, verify the newest user request is still the one being answered.

## Subagents

- Use subagents only when the user explicitly asks for delegation or parallel agent work.
- Keep delegated work bounded, self-contained, and materially useful.
- Use `model-policy.md` when an explicit subagent model override is justified.
