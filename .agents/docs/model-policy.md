# モデルと reasoning の方針

明確な override 理由がない限り、parent session default を使う。

## default

- 通常作業では inherited model を使う。
- 複雑な architecture、debugging、multi-file refactor、security、data safety では higher reasoning を使う。
- 狭く well-scoped な edit や機械的な documentation update では lower reasoning を使う。

## サブエージェント方針

- sub-agent は、ユーザーが delegation または parallel agent work を明示した時だけ使う。
- role 別 sub-agent の起動判断と handoff は `sub-agent-harness.md` に従う。
- sub-agent の既定は軽量モデルを優先し、bounded exploration、worker task、mechanical docs update、test triage、low-risk parallel check では `gpt-5.4-mini` を使う。
- review、作業計画、曖昧な要件整理、architecture / ADR、security、data safety、cross-cutting design、deep reasoning が必要な作業では inherited model または `gpt-5.5` など frontier model を優先する。
- 親 Codex は sub-agent の結果を統合し、final integration、品質判断、user-facing report の責任を持つ。
- model choice を skill に hard-code しない。Codex skill は runtime model を強制するのではなく、workflow を使う場面を記述する。

## Token 節約

- explorer は bounded read-only 調査に使い、原則として軽量モデルと低または中 reasoning を優先する。
- worker は disjoint write scope の実装に使い、原則として軽量モデルを優先する。
- frontier model や high reasoning は review、planning、ADR、security、data safety、cross-cutting design に限定する。
- 親と sub-agent が同じ探索を重複しないよう、質問と read scope を先に分ける。

## 実用ルール

まず品質を優先する。cost と latency の最適化は、workflow が信頼できるようになってから行う。
