# Mobile Test Results Template

Status: Template
Related plan: `../mobile_test_plan.md`

Use this template for Android emulator, iOS simulator, physical Android, and
physical iPhone evidence. Create a dated copy for each real run, for example:

```text
docs/vv/mobile-test-results-2026-05-20-android-emulator.md
```

Do not attach athlete-identifying media or public links to private media.

## Run Summary

| Field | Value |
| --- | --- |
| Test date | TBD |
| Tester | TBD |
| Build ID | TBD |
| App version | TBD |
| Platform | PWA browser / Android emulator / iOS simulator / Physical Android / Physical iPhone |
| Device or emulator | TBD |
| OS version | TBD |
| Execution mode | Manual / browser automation / N/A |
| Test stage | PWA smoke / emulator smoke / simulator smoke / physical verification |
| Result | Pass / Conditional pass / Fail / Blocked |

## Scope Checklist

| Check | Result | Notes |
| --- | --- | --- |
| App launches without crash | TBD |  |
| Capture tab opens | TBD |  |
| Metrics tab opens | TBD |  |
| ROM tab opens | TBD |  |
| Review tab opens | TBD |  |
| Share tab opens | TBD |  |
| Japanese labels fit | TBD |  |
| English labels fit | TBD |  |
| Team/athlete local draft persists | TBD |  |
| Mock API submit flow works | TBD |  |
| Upload session start works | TBD |  |
| Upload interruption is visible | TBD |  |
| Upload retry preserves metadata | TBD |  |
| Upload completion gates tracking/processing | TBD |  |
| Tracking/processing blocked before upload completion | TBD |  |
| Tracking status renders | TBD |  |
| Retryable tracking failure renders | TBD |  |
| Unusable tracking failure renders | TBD |  |
| Failed tracking does not create analysis | TBD |  |
| Shared result omits excluded video/evidence | TBD |  |
| Shared result omits excluded overlays/comments | TBD |  |
| Model version renders | TBD |  |
| Confidence policy renders | TBD |  |
| Phase confidence renders | TBD |  |
| Suppressed metric reason renders | TBD |  |
| Video preview layout fits | TBD |  |
| No clinical/health/performance claim text | TBD |  |

## PWA Install And Offline Checks

Complete this section for PWA browser runs. Mark non-browser-native checks as
`N/A` when the local browser does not expose the relevant install or offline
inspection surface.

| Check | Result | Notes |
| --- | --- | --- |
| Web manifest loads | TBD |  |
| Standalone display mode is declared | TBD |  |
| Service worker registers | TBD |  |
| Shell reload works after service worker registration | TBD |  |
| Offline shell opens without private media | TBD |  |

## Physical Device Checks

Complete this section only for physical Android and physical iPhone runs.

| Check | Result | Notes |
| --- | --- | --- |
| Camera permission prompt works | TBD |  |
| Media-library permission prompt works | TBD |  |
| Video capture works | TBD |  |
| Video import works | TBD |  |
| Frame rate recorded | TBD |  |
| Resolution recorded | TBD |  |
| File size recorded | TBD |  |
| Duration recorded | TBD |  |
| Local draft survives app restart | TBD |  |
| Upload retry simulation preserves metadata | TBD |  |
| Interrupted upload survives app restart | TBD |  |
| Retry attempt count is understandable | TBD |  |
| Duplicate active upload sessions are prevented | TBD |  |
| Overlay review is responsive | TBD |  |
| Low-confidence text is capture/measurement focused | TBD |  |

## Upload Session Checks

Use this section for PWA smoke, emulator/simulator smoke, and physical-device
runs. For native runs before backend integration, mark backend fields as `N/A`
and describe the local-only simulation result.

| Check | Result | Notes |
| --- | --- | --- |
| Local draft exists before upload | TBD |  |
| Upload session created for selected video | TBD |  |
| Second start action reuses active session or is hidden | TBD |  |
| Interrupt changes status to retryable/interrupted | TBD |  |
| Retry creates a new attempt after interruption | TBD |  |
| Completion changes video to uploaded/ready | TBD |  |
| Queue/submit is blocked before completion | TBD |  |
| Queue/submit works after completion | TBD |  |
| Metadata preserved after interruption | TBD |  |
| Metadata preserved after retry | TBD |  |

| Field | Value |
| --- | --- |
| Motion video ID or local draft ID | TBD |
| Upload session ID | TBD |
| Attempt count | TBD |
| Upload status sequence | TBD |
| Metadata fields preserved | TBD |
| Backend upload-session used? | Yes / No / N/A |

## Video Metadata

Use opaque sample IDs. Do not include athlete names.

| Field | Value |
| --- | --- |
| Sample ID | TBD |
| Camera view | TBD |
| Frame rate fps | TBD |
| Resolution | TBD |
| Duration ms | TBD |
| File size bytes | TBD |
| Capture/import source | TBD |
| Upload attempt count | TBD |
| Upload status at submission | TBD |
| Whole body visible at foot contact | TBD |
| Whole body visible at release | TBD |

## Issues Found

| ID | Severity | Description | Owner | Follow-up |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD |

## Evidence Links

Store screenshots, screen recordings, and logs in approved private storage when
they may contain athlete or device-identifying information.

| Artifact | Private URI or reference | Notes |
| --- | --- | --- |
| Screenshot | TBD | Optional |
| Screen recording | TBD | Optional |
| Logs | TBD | Optional |

## Gate Decision

| Field | Value |
| --- | --- |
| Supports mobile stack ADR acceptance? | Yes / Conditional / No |
| Blocks tracking feasibility gate? | Yes / No |
| Required follow-up before next gate | TBD |
