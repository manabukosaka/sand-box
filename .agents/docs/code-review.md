# コードレビューガイド

`/review`、手動 review、または最終 self-review の前にこのガイドを使う。

## レビュー順序

1. bug、regression、data loss、security、user-visible behavior。
2. 不足している test、または弱い verification。
3. architecture drift、重複 pattern、maintainability risk。
4. documentation、API contract、V&V gap。
5. style は readability や consistency に影響する場合だけ扱う。

## チェックリスト

- scope がユーザー依頼と一致している。
- 無関係な file、広すぎる refactor、意図しない generated output がない。
- 既存の未コミットユーザー作業を revert していない。
- error handling が明示的で user-safe。
- input が boundary で validation されている。
- secret や sensitive data が log に出ていない。
- DuckDB 変更では migration、file growth、backup、rollback を考慮している。
- UI 変更は対象 workflow に対して十分に responsive / accessible。
- test が変更された正常系と現実的な異常系または境界値を cover している。
- command と manual check が正確に報告されている。

## 指摘形式

指摘は重要度順に先頭へ置く:

```text
<重要度>: <file>:<line> - <問題>
影響: <なぜ重要か>
推奨: <具体的な修正またはテスト>
```

問題がない場合は、その旨を明確に述べ、残余リスクまたは未実行チェックを示す。
