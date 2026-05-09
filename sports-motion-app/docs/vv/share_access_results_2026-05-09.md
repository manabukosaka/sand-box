# Share Access Results: 2026-05-09

Status: Draft evidence record
Related requirements: `../requirements.md`
Related API contract: `../api_schema.md`
Source template: `share_access_results_template.md`

## Run Metadata

| Field | Value |
| --- | --- |
| Test date | 2026-05-09 |
| Tester | Codex (local prototype verification) |
| Environment | local/mock |
| Build ID | working tree (uncommitted share hardening slice) |
| Share issued_at | test fixture timestamp |
| Share expires_at | test fixture timestamp + TTL path |
| TTL policy | 30 days fixed (MVP) |
| Result | Conditional pass |

## Scope Matrix

| Scope flag | Default | Enabled case verified | Disabled case verified |
| --- | --- | --- | --- |
| include_video | false | Yes (unit test) | Yes (unit test) |
| include_overlays | false | Yes (unit test: explicit empty scoped payload) | Yes (unit test: omitted/null) |
| include_comments | false | Yes (unit test: explicit empty scoped payload) | Yes (unit test: omitted/null) |
| include_evidence | false | Yes (unit test) | Yes (unit test) |

## Access Lifecycle

| Case | Result | Notes |
| --- | --- | --- |
| Share link created for one analysis run | Pass | Unit test covers scoped creation. |
| Shared view cannot enumerate other analysis runs | Pass | Unit test asserts no `analysisRuns` collection and shared response is scoped to one `analysisRun`. |
| Shared view cannot enumerate athlete/team records | Pass | Unit test asserts no `team`, `athlete`, or `athletes` payload in shared response. |
| Expired share fails closed | Pass | Unit test validates denied access on expired path. |
| Revoked share fails closed | Pass | Unit test validates denied access after revoke. |
| Scope-forbidden field request denied | Conditional pass | Scope omission path verified for video, evidence, overlays, and comments; explicit field-request denial API scenario pending integration test. |
| Access log appended on allowed access | Pass | Unit test validates allowed access log append. |
| Access log appended on denied access | Pass | Unit test validates denied access log append for expired/revoked path. |
| Revoked-share denied attempt logged | Pass | Unit test validates denied log after revoke. |

## Security Notes

| Check | Result | Notes |
| --- | --- | --- |
| No diagnosis/treatment/definitive injury prediction/guaranteed performance text in shared view | Conditional pass | Current app text and docs checks include prohibited wording guard; browser/manual shared-view EN/JA screenshot evidence is still pending. |
| Token leakage risk reviewed | Conditional pass | Token rotation + old-token invalidation covered in unit test; external transport/log redaction review remains pending backend implementation. |
| Scope flags enforced server-side | Conditional pass | Mock/API contract and unit tests cover scope omission behavior; production backend enforcement not implemented yet. |

## Evidence Links

| Artifact | Private URI or reference | Notes |
| --- | --- | --- |
| Share response sample | `sports-motion-app/tests/mockApi.test.mjs` | Unit assertions for shared payload fields. |
| Revoked response sample | `sports-motion-app/tests/mockApi.test.mjs` | Denied access assertion after revoke. |
| Access log sample | `sports-motion-app/tests/mockApi.test.mjs` | Allowed/denied append assertions. |
| Shared view text capture (EN/JA) | Not yet evidenced | Bilingual text keys are present in `sports-motion-app/app/app.js`; manual screenshot evidence pending. |

## Verification Commands Executed

```bash
cd sports-motion-app
npm test
cd ..
.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
```

## Known Gaps / Follow-Up

1. Add integration-level evidence for explicit field-request denial (`shared_scope_forbidden`) once backend endpoint exists.
2. Add manual shared-view screenshot evidence for EN/JA text and scope behavior in `docs/vv/`.
3. Re-run this sheet against production backend share endpoints when implemented.
