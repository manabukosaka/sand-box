# プロダクト境界

この workspace は複数プロダクトを扱う。Codex は依頼文、対象 path、開いている file、既存差分から対象プロダクトを判定し、判定できない場合は変更前に確認する。

## Mini Datadog

- Product: 軽量な self-hosted monitoring / log analysis platform。
- Product docs: `mini-datadog/docs/`。
- Implementation root: `mini-datadog/`。
- Primary stack: Rust、Axum、Tokio、DuckDB、TypeScript、React、Next.js、Tailwind CSS。
- Verification: `.agents/scripts/verify.sh --mini-datadog` または対象に応じて `--backend` / `--frontend`。
- Existing role skills: `product-manager`、`software-architect`、`senior-engineer`、`qa-engineer`、`release-manager`、`security-researcher`、`db-tuner`、`sre-specialist`、`agile-coach`。

## Sports Motion App

- Product: 野球投球 MVP から始める sports motion analysis mobile app。
- Product docs: `sports-motion-app/docs/`。
- Implementation root: `sports-motion-app/`。
- Current state: requirements、architecture、API contract、evidence metrics、project plan、V&V、ADR の documentation-first phase。
- Primary constraints: installable iOS/Android app、hybrid cloud analysis、AI markerless tracking、ROM post-processing、evidence-backed baseball metrics、external specialist sharing。
- Verification: `.agents/scripts/verify.sh --sports-motion-app`。
- Sports-specific skills: `sports-motion-product`、`sports-biomechanics-analyst`、`sports-mobile-architect`。

## 境界ルール

- Mini Datadog の実装変更で `sports-motion-app/` を更新しない。
- Sports Motion App の変更で `mini-datadog/` の製品文書や実装を更新しない。ただし `.agents/` の共通 harness を更新する場合は、両プロダクトへの影響を明示する。
- `GEMINI.md` と `.gemini/` は、ユーザーが Gemini 変更を明示しない限り変更しない。
- Git / PR の運用ルールは現時点では `mini-datadog/CONTRIBUTING.md` を workspace 共通の既定として扱う。Sports Motion App 固有の contributing doc が追加されたら、対象プロダクトの doc を優先する。
- 外部文献やモデル情報など時間で変わる情報を使う場合は、最新性が重要な変更では一次情報を確認し、参照日または基準日を文書に残す。
