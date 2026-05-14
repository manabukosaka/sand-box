# Local MediaPipe Tasks Vision Runtime

The browser AI baseline loads MediaPipe Tasks Vision from this local folder, not
from a CDN.

Expected prototype files:

- `vision_bundle.mjs`
- `wasm/vision_wasm_internal.js`
- `wasm/vision_wasm_internal.wasm`
- any additional runtime files required by the pinned Tasks Vision version

Do not replace these files silently. Record the runtime version, source,
checksum, and test result in `sports-motion-app/docs/vv/` when updating.

