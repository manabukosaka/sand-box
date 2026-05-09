# Next Autonomous Slices

Status: Active planning queue

Use this queue for Sports Motion App work that can be carried under maximum
autonomy mode. Each slice must still respect review request gates in
`../development_process.md`.

| Slice | Goal | Expected artifacts | Roles | User review request gate | Verification |
| --- | --- | --- | --- | --- | --- |
| Tracking feasibility sample readiness | Turn the draft tracking feasibility gate into a sample-set readiness review and keep the run blocked until private sample coverage and usage rights exist. | Dated V&V readiness result, sample manifest status update, project plan update if status changes. | Sports Biomechanics Analyst, Sports Motion Product, QA/Release | Required before metric promotion or tracking provider/model commitment. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |
| Backend upload boundary | Replace prototype upload-session behavior with a production API/worker contract draft. | API schema update, architecture update, requirements update, ADR for backend upload-session boundary. | Sports Mobile Architect, Software Architect, Security/Release | Required because upload state, athlete media, and sharing/privacy behavior are affected. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |
| Share access hardening | Specify scoped external share access, expiry, revocation, and audit evidence. | Requirements/API/schema update, architecture update, ADR for share scope, V&V scenario and results template update. | Sports Motion Product, Security Researcher, QA/Release | Required because external sharing and athlete-identifying data are affected. | `npm test`; `.agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness` |

Recent completed slices:

- Share access hardening: merged via PR #28.
- Native runtime blocker evidence: merged via PR #29.

Current sprint focus: Tracking feasibility sample readiness. The run remains
blocked until private sample coverage and usage-right evidence satisfy the gate.

## Maintenance Rules

- Keep each row as a coherent slice rather than a broad theme.
- Do not include exact test counts or pass totals.
- Move completed rows into the relevant retrospective, V&V evidence, or project
  plan status update.
- Add a user review request gate whenever product scope, clinical/injury wording,
  sharing/privacy, metric promotion, mobile stack, cloud boundary, or merge
  approval is involved.
