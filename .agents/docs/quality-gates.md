# 品質ゲート

変更リスクに対して信頼できる証跡を与える、最小の gate を使う。

## 実装ゲート

- repository structure、helper API、local convention を保つ。
- 明確な必要性なしに large refactor、新 framework、広範な folder 変更を行わない。
- 明示的な承認と記録がない限り、`unsafe`、`@ts-ignore`、同等の bypass を避ける。
- 未コミットのユーザー作業を尊重する。無関係な変更を revert しない。

## テストゲート

- 広範な repository check が必要な場合は `.agents/scripts/verify.sh` を使う。
- Rust: backend 変更に見合う場合は `cargo fmt --check`、`cargo clippy`、`cargo test` を実行する。
- Frontend: frontend 変更に見合う場合は `npm run lint`、存在する場合は `npm test`、必要に応じて `npm run build` を実行する。
- UI: 実用的な範囲で layout、responsiveness、accessibility basics、screenshot または browser evidence を確認する。
- Data/auth/deployment: rollback、recovery、migration、residual risk を明示する。

## V&V ゲート

- Verification: 実装が requirements、design、API contracts、tests と一致することを確認する。
- Validation: 結果がユーザーの実際の workflow と acceptance criteria を満たすことを確認する。
- Evidence: command、pass/fail status、manual check、screenshots、known gaps を報告する。
- Review: 自明でない変更は最終報告前に `code-review.md` で diff review する。

## リリースゲート

- Git 運用の source of truth は `mini-datadog/CONTRIBUTING.md`。
- `main` は常に deployable に保つ。原則として直接 commit / push せず、作業 branch から PR 経由で merge する。
- branch、commit、PR、push、merge は明示的に要求された時だけ行う。
- 作業 branch は `<type>/<issue-or-short-desc>` 形式にする。例: `docs/codex-workflow`、`fix/lint-config`。
- commit する場合は Conventional Commits を使う。
- PR を開く場合は repository PR template を使う。
- PR 作成と push は `.agents/scripts/codex-pr.sh` を標準入口にする。
- 承認済み PR の merge は `.agents/scripts/codex-merge.sh` を標準入口にする。
- PR 前に self-review と関連 check を行う。
- merge は CI / check 通過後、明示的なユーザー承認後だけ行う。

## Checkpoint commit

- ユーザーが進行中の commit を求めている場合は `.agents/scripts/codex-checkpoint.sh` を使う。
- checkpoint commit は原則として `main` 以外の作業 branch で作成する。
- 最も安全な運用として staged-only commit を優先する。既知の file set には `--paths` を使い、現在の task に属する non-Gemini 変更だけの場合に限り `--all` を使う。
- coherent boundary で commit する。例: harness setup、requirements/docs update、implementation slice、test update、V&V evidence。
- ユーザーが Gemini 設定変更を明示しない限り、Codex checkpoint commit に `.gemini/` と `GEMINI.md` を含めない。
- local Git hook を有効にするには `.agents/scripts/install-git-hooks.sh` を使う。これにより Gemini protection と skill validation を commit 前に実行する。
