# ふりかえり

ふりかえりは、繰り返し発生する friction を durable repository guidance に変換するために使う。

## 実施タイミング

- Codex が同じ誤りを 2 回繰り返した。
- task に繰り返し steering が必要だった。
- verification が不明確または不足していた。
- prompt に、本来 reusable にすべき指示を含める必要があった。
- workflow を skill または automation に昇格できそうになった。

## テンプレート

```markdown
# ふりかえり: <topic>

## きっかけ

## 起きたこと

## 根本原因

## 永続的な修正

## 妥当性確認
```

## 永続的な修正の選択肢

- rule が広く安定している場合は `AGENTS.md` を更新する。
- guidance が specific だが共有される場合は `.agents/docs/` を更新する。
- workflow が繰り返し可能な場合は `SKILL.md` を更新する。
- 機械的に強制できる rule は script、test、lint rule、hook を追加または更新する。
- Git 運用の逸脱は `mini-datadog/CONTRIBUTING.md` と `.agents/docs/quality-gates.md` の両方に照らして再発防止策を入れる。
