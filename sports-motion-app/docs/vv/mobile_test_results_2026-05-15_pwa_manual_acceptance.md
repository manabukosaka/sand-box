# Mobile Test Results - PWA Manual Acceptance

Status: Not Run / Ready To Execute
Related plan: `../mobile_test_plan.md`
Based on template: `mobile_test_results_template.md`

This file is the dated evidence placeholder for the 2026-05-15 manual PWA
acceptance run. Do not record this as executed until the browser session has
actually been completed.

## Run Summary

| Field | Value |
| --- | --- |
| Test date | 2026-05-15 |
| Tester | TBD |
| Build ID | TBD |
| App version | TBD |
| Platform | PWA browser |
| Device or emulator | TBD |
| OS version | TBD |
| Execution mode | Manual browser verification |
| Test stage | PWA smoke |
| Result | Not Run / Ready To Execute |

## Execution Details

| Field | Value |
| --- | --- |
| Local URL | `http://127.0.0.1:4173/app/` |
| Start command | `cd sports-motion-app && npm run serve` |
| Safe sample guidance | Use only non-identifying sample IDs, local drafts, and opaque private references; do not use athlete names, private media, or public links. |

## Scope Checklist

| Check | Result | Notes |
| --- | --- | --- |
| Shell opens and tabs fit in desktop and mobile widths | Not Run | Ready To Execute |
| English and Japanese labels do not overlap | Not Run | Ready To Execute |
| Manifest and standalone shell basics are available | Not Run | Ready To Execute |
| Reload behavior works after startup | Not Run | Ready To Execute |
| Service-worker offline shell is available where supported | Not Run | Ready To Execute |
| Team, athlete, and session edits persist after refresh | Not Run | Ready To Execute |
| Non-identifying sample video imports and preview renders | Not Run | Ready To Execute |
| Draft library row, search, status, camera-view, and analysis filters work | Not Run | Ready To Execute |
| Upload, duplicate start, interrupt, retry, and completion flow works | Not Run | Ready To Execute |
| Queue and submit stay blocked before completion and open after completion | Not Run | Ready To Execute |
| Low-confidence and unusable tracking paths stay capture/measurement focused | Not Run | Ready To Execute |
| Metrics, ROM recalculation, and phase correction preserve raw and derived layers | Not Run | Ready To Execute |
| Review draft requires caution acknowledgement before request status | Not Run | Ready To Execute |
| Share defaults exclude video, evidence, overlays, and comments unless enabled | Not Run | Ready To Execute |
| No clinical, health, or assured-performance claim text appears | Not Run | Ready To Execute |

## Evidence Links

| Artifact | Private URI or reference | Notes |
| --- | --- | --- |
| Screenshot | TBD | Not Run |
| Screen recording | TBD | Not Run |
| Logs | TBD | Not Run |

## Gate Decision

| Field | Value |
| --- | --- |
| Supports mobile stack ADR acceptance? | Not Run / Ready To Execute |
| Blocks tracking feasibility gate? | TBD |
| Required follow-up before next gate | Execute the manual PWA acceptance run and attach evidence |
