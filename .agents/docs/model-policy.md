# モデルと reasoning の方針

明確な override 理由がない限り、parent session default を使う。

## default

- 通常作業では inherited model を使う。
- 複雑な architecture、debugging、multi-file refactor、security、data safety では higher reasoning を使う。
- 狭く well-scoped な edit や機械的な documentation update では lower reasoning を使う。

## サブエージェント方針

- sub-agent は、ユーザーが delegation または parallel agent work を明示した時だけ使う。
- role 別 sub-agent の起動判断と handoff は `sub-agent-harness.md` に従う。
- bounded exploration、test triage、low-risk parallel check では `gpt-5.4-mini` を優先する。
- complex design、high-risk implementation、security review、deep reasoning が必要な作業では `gpt-5.5` など frontier model を優先する。
- model choice を skill に hard-code しない。Codex skill は runtime model を強制するのではなく、workflow を使う場面を記述する。

## Token 節約

- explorer は bounded read-only 調査に使い、低または中 reasoning を優先する。
- worker は disjoint write scope の実装に使い、通常は inherited model を使う。
- frontier model や high reasoning は ADR、security、data safety、cross-cutting design に限定する。
- 親と sub-agent が同じ探索を重複しないよう、質問と read scope を先に分ける。

## 実用ルール

まず品質を優先する。cost と latency の最適化は、workflow が信頼できるようになってから行う。
