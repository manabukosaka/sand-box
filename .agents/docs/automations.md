# 自動化

skill は方法を定義し、automation は実行スケジュールを定義する。

## 自動化へ昇格する条件

- 手動 workflow がすでに信頼できる。
- input と output が安定している。
- task の verification が明確である。
- failure が安全で、確認しやすい。

## 良い候補

- 最近の commit を要約する。
- bug の可能性や古い docs を scan する。
- release note を draft する。
- CI failure を確認する。
- standup summary や V&V summary を作る。
- 繰り返し行う maintenance check を実行する。

## まだ自動化しないもの

- まだ強い steering が必要な workflow。
- destructive または production-impacting な操作。
- 明示的な人間の承認がない branch、push、PR、merge 操作。
- worktree isolation なしに同じ file 群へ live edit する作業。
