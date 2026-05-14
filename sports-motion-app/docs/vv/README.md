# Verification And Validation Evidence

This directory stores lightweight V&V evidence templates and review notes for
Sports Motion App.

Do not commit original athlete videos, athlete-identifying screenshots, consent
forms, private storage links that grant public access, or health/clinical
claims.

Current templates:

- `mobile_test_results_template.md`: Android emulator, iOS simulator, physical
  Android, and physical iPhone test evidence, including upload-session retry and
  tracking/processing gate checks.

Current evidence notes:

- `local_model_asset_readiness_2026-05-15.md`: current WBS 7.1 local
  MediaPipe bundle/model readiness note, including inventory expectations,
  replacement rules, checksum/version fields, and the blocker that no assets
  were downloaded in this task.
- `tracking_feasibility_results_2026-05-15_sample_readiness.md`: current
  actionable sample-readiness blocker note for WBS 7.0 / 7.2, including the
  required case rows, usage-rights constraints, capture metadata, and local
  model matrix.
- `mobile_test_results_2026-05-07_native_scaffold.md`: initial Expo scaffold
  evidence and Node runtime blocker note.
- `mobile_test_results_2026-05-09_runtime_gate.md`: current Node runtime gate
  recheck confirming emulator/simulator smoke remains blocked.
- `mobile_test_results_2026-05-14_native_review_packet_blocked.md`: native
  review packet, default-excluded share scope, and share-comment scope
  code-level check; runtime smoke remains blocked.
- `tracking_feasibility_results_2026-05-09_sample_readiness.md`: prior sample
  coverage readiness check confirming candidate tracking runs remain blocked.

Use `docs/vuv_checklist.md` as the checklist source of truth and link completed
evidence back to the relevant milestone or gate.
