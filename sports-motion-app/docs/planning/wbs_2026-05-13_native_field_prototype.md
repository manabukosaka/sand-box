# WBS: Native Field Prototype Toward Tracking Feasibility

Date: 2026-05-13
Status: In progress

## Summary

This WBS moves Sports Motion App from the current PWA acceptance baseline toward
a TypeScript-first React Native + Expo native field prototype. The PWA remains
the product-flow reference until native smoke and physical-device evidence exist.

Priority order:

1. P0: runtime and tooling unblock.
2. P1: native smoke and mobile UX parity.
3. P2: physical-device capture/import evidence.
4. P3: AI tracking feasibility.
5. P4: production backend, sharing, and security planning.

## Work Breakdown

| ID | Work Package | Deliverable | Current Status | Completion Criteria |
| --- | --- | --- | --- | --- |
| 1.0 | Runtime / Tooling Unblock | local mobile dev readiness | Partial | Node satisfies `>=20.19.4`; mobile typecheck and dev-client help run |
| 1.1 | TypeScript Scaffold Stabilization | strict native shell | Complete for code-level check | `npm run typecheck` exits successfully |
| 1.2 | Verification Scripts | repeatable mobile checks | Complete | Sports Motion verification runs mobile typecheck and dev-client help when dependencies exist |
| 2.0 | PWA Mobile UX Acceptance | PWA smoke evidence | Partial | mobile-width Capture to Share flow is manually reviewed |
| 2.1 | PWA UX Polish Fixes | mobile-first PWA polish | Partial | PWA smoke issues are fixed and verification succeeds |
| 3.0 | Native Mobile UX Parity | TypeScript native prototype | Partial | capture/import, draft, upload retry, phase correction, review packet, and share-comment scope work natively |
| 3.1 | Native Video Preview Slice | native video preview | Partial | emulator/simulator preview displays selected video and phase overlay |
| 3.2 | Native Phase Correction Slice | native correction evidence | Partial | local correction evidence is stored and shown in Review |
| 4.0 | Emulator / Simulator Smoke | dated smoke evidence | Blocked | Android and iOS smoke results exist under `docs/vv/` |
| 4.1 | Android Emulator Smoke | Android smoke result | Blocked | Android emulator or equivalent path is available |
| 4.2 | iOS Simulator Smoke | iOS smoke result | Blocked | macOS/Xcode or EAS simulator path is available |
| 5.0 | Physical Device Verification | physical-device V&V evidence | Blocked | physical Android and iPhone runs are recorded |
| 5.1 | Physical Android | Android physical result | Blocked | capture/import, metadata, persistence, and overlay review are recorded |
| 5.2 | Physical iPhone | iPhone physical result | Blocked | capture/import, metadata, persistence, and overlay review are recorded |
| 6.0 | Mobile Stack ADR Decision | ADR 0002 decision | Pending | evidence supports Accepted, Conditional, or No-Go |
| 7.0 | AI Tracking Feasibility Prep | sample readiness evidence | Blocked; actionable blocker note dated 2026-05-15 | approved sample set, consent/usage metadata, and local model inventory exist |
| 7.1 | Local Model Asset Readiness | local model readiness note | Partial | local MediaPipe bundle, wasm, and model files are verified |
| 7.2 | Baseline Run Matrix | dated AI baseline results | Pending; blocked on 7.0 sample approval | good, low-quality, and expected-failure sample runs are recorded with versioned candidate/model metadata |
| 8.0 | Metric / Review Gate | Milestone 2 gate packet | Partial; code-level native review/share scope aligned | raw tracking, ROM metrics, comments, corrections, review packet, and share-comment scope remain separated |
| 9.0 | Backend / Security Planning | post-gate backend/security plan or ADR | Draft; post-gate, not implementation-ready | Plan/ADR is reviewed after mobile and tracking gates; see `wbs_2026-05-15_backend_security_post_gate_plan.md` |

## Next Execution Order

1. Finish runtime unblock by upgrading the local Node runtime to `>=20.19.4`.
2. Re-run mobile `typecheck` and dev-client help after the runtime upgrade.
3. Run Android emulator smoke or record an updated blocker, including the native
   video preview, phase overlay, review packet, and share-comment scope paths
   already verified at code level.
4. Run iOS simulator smoke through macOS/Xcode or EAS simulator path, or record
   an updated blocker.
5. Run physical Android and iPhone verification with non-identifying sample media.
6. Decide ADR 0002 only after emulator/simulator and physical-device evidence exists.

## Verification Commands

```bash
cd sports-motion-app
npm test

cd mobile
node --version
npm run typecheck
npm run check:dev-client
```

Repository-level verification:

```bash
.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
```

## Constraints

- Do not commit private athlete videos, identifying screenshots, signing
  credentials, generated native build artifacts, or EAS build artifacts.
- Do not accept ADR 0002 while physical-device evidence is missing.
- Do not present outputs as diagnosis, treatment, injury prediction, or
  guaranteed performance improvement.
