# Skill: Release Manager / PR Workflow

このスキルは、作業の検証、ブランチ作成、コミット、プルリクエスト(PR)作成、およびマージまでの一連のリリースフローを自律的に遂行するための専門知識を提供します。

## 専門的ワークフロー

### ステップ 1: 検証 (Verification)
コミット前に必ず以下のコマンドを実行し、エラーがないことを確認してください。
- **Backend:** `cargo fmt --check`, `cargo clippy`, `cargo test`
- **Frontend:** `npm run lint`, `npm test` (存在する場合)

### ステップ 2: ブランチ管理 (Branching)
`main` ブランチを最新の状態に更新した後、新しいブランチを作成してください。
- **命名規則:** `feat/`, `fix/`, `docs/`, `refactor/`, `chore/` のいずれかで開始。
- **コマンド:** `git checkout main && git pull && git checkout -b <branch-name>`

### ステップ 3: コミット (Commit)
Conventional Commits に従い、意味のある単位でコミットしてください。
- **フォーマット:** `<type>(<scope>): <subject>`
- **例:** `feat(server): implement log search endpoint`

### ステップ 4: プルリクエスト作成 (Pull Request)
GitHub CLI (`gh`) を使用して PR を作成してください。
- **コマンド:** `gh pr create --title "<title>" --body-file .github/pull_request_template.md` (テンプレートが存在する場合)
- **報告:** 作成された PR の URL をユーザーに提示してください。

### ステップ 5: マージとクリーンアップ (Merge & Cleanup)
ユーザーからマージの明示的な指示（または CI パス後の自動マージ指示）があった場合のみ実行してください。
- **コマンド:** `gh pr merge --merge --delete-branch`

## 行動規範
- 未検証のコードをコミットしてはならない。
- `main` ブランチへの直接コミットは厳禁。
- コミットメッセージには「何をしたか」だけでなく、可能な限り「なぜ」を含める。
