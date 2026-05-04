# Quality Gates

Use the smallest gate that gives credible evidence for the risk of the change.

## Implementation Gates

- Preserve repository structure, helper APIs, and local conventions.
- Avoid large refactors, new frameworks, or broad folder changes without clear need.
- Avoid `unsafe`, `@ts-ignore`, and equivalent bypasses unless explicitly approved and documented.
- Respect uncommitted user work. Do not revert unrelated changes.

## Testing Gates

- Rust: run `cargo fmt --check`, `cargo clippy`, and `cargo test` when backend changes warrant it.
- Frontend: run `npm run lint`, `npm test` if present, and `npm run build` when frontend changes warrant it.
- UI: check layout, responsiveness, accessibility basics, and screenshot or browser evidence where practical.
- Data/auth/deployment: call out rollback, recovery, migration, and residual risk.

## V&V Gates

- Verification: implementation matches requirements, design, API contracts, and tests.
- Validation: result satisfies the user's actual workflow and acceptance criteria.
- Evidence: report commands, pass/fail status, manual checks, screenshots, and known gaps.

## Release Gates

- Branch, commit, PR, push, and merge only when explicitly requested.
- Use Conventional Commits when committing.
- Use repository PR templates when opening PRs.
- Merge only after explicit user approval.

## Checkpoint Commits

- Use `.agents/scripts/codex-checkpoint.sh` when the user has asked for work to be committed as it progresses.
- Prefer staged-only commits for safest operation. Use `--paths` for a known file set or `--all` only when all non-Gemini changes belong to the current task.
- Commit at coherent boundaries: harness setup, requirements/docs update, implementation slice, test update, or V&V evidence.
- Keep `.gemini/` and `GEMINI.md` out of Codex checkpoint commits unless the user explicitly requests Gemini configuration changes.
- Install local Git hooks with `.agents/scripts/install-git-hooks.sh` to enforce Gemini protection and skill validation before commits.
