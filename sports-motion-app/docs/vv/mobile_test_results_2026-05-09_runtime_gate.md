# Mobile Test Result: Runtime Gate Recheck

Date: 2026-05-09
Tester: Codex
Build ID: `sports-motion-app/mobile` Expo SDK 54 scaffold on latest `origin/main`
App version: 1.0.0
Result: Blocked before emulator/simulator smoke

## Scope

- Rechecked the native runtime readiness gate without changing Node, npm, Expo,
  Android, iOS, or operating-system configuration.
- Confirmed the mobile package still requires Node `>=20.19.4`.
- Confirmed the local runtime still does not satisfy the native scaffold engine
  gate.
- Did not run Android emulator, iOS simulator, or Expo launch commands because
  the runtime gate is not ready.

## Environment

| Field | Value |
| --- | --- |
| Local Node | `18.19.1` |
| Local npm | `9.2.0` |
| Required Node | `>=20.19.4` |
| Runtime gate | Blocked |

## Gate Decision

| Check | Result | Notes |
| --- | --- | --- |
| `node --version` satisfies `>=20.19.4` | Fail | Local Node is `18.19.1`. |
| Expo dev-client help check | Not run | Skipped because Node engine gate is not satisfied. |
| Android emulator smoke | Blocked | Do not run until Node is upgraded or an equivalent isolated runtime path is documented. |
| iOS simulator smoke | Blocked | Do not run until Node is upgraded and a macOS/Xcode or EAS simulator path is available. |
| ADR 0002 mobile stack acceptance | Blocked | Runtime and device evidence remain incomplete. |

## Commands Executed

```bash
node --version
npm --version
```

## Follow-Up

- Upgrade or provide an isolated Node runtime satisfying `>=20.19.4`.
- Run `cd sports-motion-app/mobile && npm run start:dev-client -- --help` after
  the runtime gate is ready.
- Record Android emulator and iOS simulator smoke results using
  `docs/vv/mobile_test_results_template.md`.
- Keep ADR 0002 in Proposed status until emulator/simulator and physical-device
  evidence exist.
