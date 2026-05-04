# Code Review Guide

Use this guide for `/review`, manual review, or final self-review before delivery.

## Review Order

1. Bugs, regressions, data loss, security, and user-visible behavior.
2. Missing tests or weak verification.
3. Architecture drift, duplicated patterns, and maintainability risks.
4. Documentation, API contract, and V&V gaps.
5. Style only when it affects readability or consistency.

## Checklist

- Scope matches the user's request.
- No unrelated files, broad refactors, or accidental generated output.
- Existing uncommitted user work was not reverted.
- Error handling is explicit and user-safe.
- Inputs are validated at boundaries.
- Secrets and sensitive data are not logged.
- DuckDB changes consider migration, file growth, backup, and rollback.
- UI changes are responsive and accessible enough for the affected workflow.
- Tests cover the changed normal path and realistic failure or boundary cases.
- Commands and manual checks are reported accurately.

## Finding Format

Lead with findings, ordered by severity:

```text
<severity>: <file>:<line> - <issue>
Impact: <why it matters>
Recommendation: <specific fix or test>
```

If no issues are found, say that clearly and mention residual risk or unrun checks.
