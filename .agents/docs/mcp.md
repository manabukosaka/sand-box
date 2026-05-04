# MCP ガイダンス

MCP は、実際の手動 loop を取り除ける場合だけ使う。

## 良い候補

- 外部文脈が頻繁に変わる。
- source of truth が repository 外にある。
- Codex が pasted instructions に頼るより、tool を繰り返し使うべきである。
- 複数 user または project が同じ integration を必要とする。

## 現在の方針

- まず repository-visible docs、scripts、tests、logs を優先する。
- 繰り返し workflow として必要性が確認できてから、MCP server を 1 つか 2 つだけ追加する。
- OpenAI documentation では、利用可能なら公式 OpenAI docs MCP を優先する。fallback で browse する場合も official OpenAI domain に限定する。
- 存在するという理由だけで広い tool access を配線しない。

## 候補 integration

- GitHub PR と CI context。
- issue tracker または planning system context。
- Mini Datadog runtime workflow で必要になる local observability logs と metrics。
