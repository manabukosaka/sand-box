# Share Access Results Template

Status: Template
Related requirements: `../requirements.md`
Related API contract: `../api_schema.md`

Create a dated copy for each real run, for example:

```text
docs/vv/share_access_results_2026-05-20.md
```

## Run Metadata

| Field | Value |
| --- | --- |
| Test date | TBD |
| Tester | TBD |
| Environment | local/mock/staging |
| Build ID | TBD |
| Share issued_at | TBD |
| Share expires_at | TBD |
| TTL policy | 30 days fixed (MVP) |
| Result | Pass / Conditional pass / Fail |

## Scope Matrix

| Scope flag | Default | Enabled case verified | Disabled case verified |
| --- | --- | --- | --- |
| include_video | false | TBD | TBD |
| include_overlays | false | TBD | TBD |
| include_comments | false | TBD | TBD |
| include_evidence | false | TBD | TBD |

## Access Lifecycle

| Case | Result | Notes |
| --- | --- | --- |
| Share link created for one analysis run | TBD |  |
| Shared view cannot enumerate other analysis runs | TBD |  |
| Shared view cannot enumerate athlete/team records | TBD |  |
| Expired share fails closed | TBD |  |
| Revoked share fails closed | TBD |  |
| Scope-forbidden field request denied | TBD |  |
| Access log appended on allowed access | TBD |  |
| Access log appended on denied access | TBD |  |
| Revoked-share denied attempt logged | TBD |  |

## Security Notes

| Check | Result | Notes |
| --- | --- | --- |
| No diagnosis/treatment/definitive injury prediction/guaranteed performance text in shared view | TBD |  |
| Token leakage risk reviewed | TBD |  |
| Scope flags enforced server-side | TBD |  |

## Evidence Links

| Artifact | Private URI or reference | Notes |
| --- | --- | --- |
| Share response sample | TBD |  |
| Revoked response sample | TBD |  |
| Access log sample | TBD |  |
| Shared view text capture (EN/JA) | TBD |  |
