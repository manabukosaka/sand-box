# Codex ワークスペース指示

## 目的と優先順位

このファイルは `/home/manabukosaka/work/my-sandbox` における Codex の入口です。これは詳細マニュアルではなく地図として扱い、必要な時だけ `.agents/docs/` または `mini-datadog/docs/` の詳細ガイドを読むこと。

より優先度の高い system / developer 指示は、このファイルより優先されます。このファイルは Codex の安全、承認、サンドボックス、git、協調作業ルールを迂回する許可ではありません。

## プロジェクト文脈

- Product: Mini Datadog。軽量な self-hosted monitoring / log analysis platform。
- Backend: Rust, Axum, Tokio, DuckDB。
- Frontend: TypeScript, React, Next.js, Tailwind CSS。
- Goal: 粗いユーザー依頼を、要件、設計、実装、テスト、V&V 証跡へ変換する。

## ナレッジマップ

- `.agents/docs/index.md`: Codex 用ナレッジマップと保守ルール。
- `.agents/docs/harness-principles.md`: このワークスペース向け agent-first harness 原則。
- `.agents/docs/operating-model.md`: このリポジトリで推奨する Codex 作業ループ。
- `.agents/docs/prompt-template.md`: 目的、文脈、制約、完了条件で依頼を整理するテンプレート。
- `.agents/docs/plans.md`: 複雑または長時間の作業向け実行計画テンプレート。
- `.agents/docs/code-review.md`: 一貫したレビュー checklist と finding 形式。
- `.agents/docs/role-map.md`: ロール観点と引き継ぎ。
- `.agents/docs/quality-gates.md`: verification、validation、release、安全性の gate。
- `.agents/docs/model-policy.md`: model と reasoning の選択方針。
- `.agents/docs/repository-map.md`: project document と implementation の場所。
- `.agents/docs/mcp.md`: MCP で外部文脈を追加する基準。
- `.agents/docs/automations.md`: 安定した workflow を automation に昇格する基準。
- `.agents/docs/session-controls.md`: thread、compaction、fork、sub-agent の扱い。
- `.agents/docs/retrospectives.md`: 繰り返し起きる摩擦への対処。
- `.agents/skills/`: Gemini のロール観点から移植した Codex skills。
- `mini-datadog/docs/`: product requirements、design、ADR、API docs、V&V、setup docs。
- `GEMINI.md` と `.gemini/`: Gemini 設定。ユーザーが明示的に Gemini 変更を求めない限り変更しない。

## 運用原則

- 既存の repository structure、helper API、local convention を優先する。
- 作業は requirement、design、implementation、test、validation まで追跡可能にする。
- 曖昧さが scope、architecture、data safety、security、user-visible behavior に実質的影響を与える場合は確認する。
- 通常の詳細は、リポジトリに合う保守的な判断を置いて進める。
- 永続的な判断は docs、ADR、tests、scripts、lint rules などリポジトリから読める artifact に残す。
- 入口は短く保ち、繰り返し使う詳細な guidance は `.agents/docs/` に移す。
- 広いタスクでは、目的、文脈、制約、完了条件でプロンプトを整理する。
- 曖昧、複数ステップ、高リスク、説明しにくい作業では、実装前に plan を作る。
- 通常は継承された model を使う。override が正当化できる場合だけ `.agents/docs/model-policy.md` に従う。

## 品質ゲート

詳細は `.agents/docs/quality-gates.md` を使う。要約:

- 広範な Codex 環境 verification には `.agents/scripts/verify.sh` を実行する。
- Backend: 関連する `cargo fmt --check`、`cargo clippy`、`cargo test` を実行する。
- Frontend: 関連する `npm run lint`、存在する場合は `npm test`、必要に応じて `npm run build` を実行する。
- UI: 実用的な範囲で layout、responsive、accessibility basics、screenshot / browser evidence を確認する。
- data、auth、deployment、destructive behavior では、残余リスクと rollback / recovery consideration を明示する。
- ユーザーが継続的な commit を求めている場合は、作業の区切りで `.agents/scripts/codex-checkpoint.sh` を使う。

## Codex 制約

- `invoke_agent` や `activate_skill` など Gemini 固有コマンドを実行計画にコピーしない。
- ユーザーが明示的に求めない限り、`.gemini/` や `GEMINI.md` を変更しない。
- ユーザーが明示的に求めない限り、push、PR、merge、branch switch を自発的に行わない。
- 既存の未コミットユーザー変更を尊重する。関連する変更とは共存し、無関係な変更は触らない。
