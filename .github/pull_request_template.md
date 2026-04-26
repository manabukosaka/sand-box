## Overview
<!-- 変更の目的と概要を簡潔に記載してください -->

## ADR / Decision
<!-- 関連する ADR へのリンクや、主要な意思決定事項を記載してください -->
- [ADR-XXXX](path/to/adr)
- 

## Security Check
<!-- セキュリティ上の考慮事項についてチェックしてください -->
- [ ] 認証・認可の仕組みに問題はないか (X-API-Key 等)
- [ ] CORS 設定は適切か (ALLOWED_ORIGIN 等)
- [ ] 入力値のバリデーションは行われているか
- [ ] 脆弱性のあるライブラリを使用していないか
- [ ] 機密情報がログに出力されていないか

## V&V Status
<!-- 各専門エージェントによる検証結果を確認してください -->
| Role | Status | Name / Link |
| :--- | :---: | :--- |
| **Agile Coach / EM** | [ ] | |
| **Product Manager** | [ ] | |
| **Software Architect** | [ ] | |
| **Senior Engineer** | [ ] | |
| **QA Engineer** | [ ] | |
| **V&V Specialist** | [ ] | |
| **SRE Specialist** | [ ] | |
| **Security Researcher** | [ ] | |
| **DB Tuner / DBA** | [ ] | |

## Screenshots / Logs
<!-- 必要に応じてエビデンス（スクリーンショット、ログ、テスト結果など）を添付してください -->

---
**World-Class Quality Assurance:**
- [ ] `cargo fmt` / `prettier` 実行済み
- [ ] `cargo clippy` / `eslint` 警告なし
- [ ] 単体テスト・結合テストのパス確認済み
- [ ] ADR に基づく設計の整合性確認済み
- [ ] Conventional Commits に従ったコミットメッセージ
