# Next Autonomous Slices

Status: Active planning queue

Use this queue for Sports Motion App work that can be carried under maximum
autonomy mode. Each slice must still respect review request gates in
`../development_process.md`.

| Slice | Goal | Expected artifacts | Roles | User review request gate | Verification |
| --- | --- | --- | --- | --- | --- |
| Native runtime unblock | Document the Node/runtime path needed for Expo emulator/simulator smoke and keep the local blocker explicit until Node is upgraded. | Native spike notes, mobile test plan runtime gate, V&V blocker note, project plan update if status changes. | Sports Mobile Architect, QA/Release | Required before accepting or changing mobile stack ADR. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |
| Tracking feasibility sample run | Turn the draft tracking feasibility gate into an executable sample-video evaluation slice. | Feasibility gate update, run plan, sample manifest run-batch header, metric support matrix update, results template. | Sports Biomechanics Analyst, Sports Motion Product, QA/Release | Required before metric promotion or tracking provider/model commitment. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |
| Backend upload boundary | Replace prototype upload-session behavior with a production API/worker contract draft. | API schema update, architecture update, ADR if boundary changes. | Sports Mobile Architect, Software Architect, Security/Release | Required because upload state, athlete media, and sharing/privacy behavior are affected. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |
| Share access hardening | Specify scoped external share access, expiry, revocation, and audit evidence. | Requirements/API/schema update, V&V scenario update, security notes. | Sports Motion Product, Security Researcher, QA/Release | Required because external sharing and athlete-identifying data are affected. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |

## Maintenance Rules

- Keep each row as a coherent slice rather than a broad theme.
- Do not include exact test counts or pass totals.
- Move completed rows into the relevant retrospective, V&V evidence, or project
  plan status update.
- Add a user review request gate whenever product scope, clinical/injury wording,
  sharing/privacy, metric promotion, mobile stack, cloud boundary, or merge
  approval is involved.
