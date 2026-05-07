# セッション制御

1 つの coherent unit of work につき 1 つの Codex thread を使う。

## 同じ thread を使う場合

- 作業がまだ同じ問題の一部である。
- 以前の reasoning や decision が直接関係する。
- 同じ diff に対する verification または feedback 対応を続けている。

## 分岐または新規開始する場合

- task が本当に分岐する。
- context が膨らみすぎた、または誤解を招く状態になった。
- 同じ file を触らずに parallel exploration を実行できる。

## 圧縮

- thread が長くなり、過去の context を要約しても問題ない場合に compact する。
- 圧縮または再開後に最終報告する前に、最新のユーザー依頼に答えていることを確認する。

## サブエージェント

- サブエージェントは、ユーザーが委譲または並列 agent 作業を明示した時だけ使う。
- 委譲する作業は、範囲が限定され、自己完結し、主作業に実質的に役立つものに保つ。
- 明示的なサブエージェント model override が正当化できる場合は `model-policy.md` を使う。
- role 別の委譲設計と handoff packet は `sub-agent-harness.md` を使う。
- sub-agent、docs、scripts は system/developer ルール、sandbox approval、
  user-confirmation gate、git safety rule を迂回する権限を与えない。

## 起動前 checklist

- 直近の blocking task は親が担当する。
- sub-agent task は自己完結している。
- write scope が親や他 sub-agent と重ならない。
- 成果物が 1 画面程度で返せる。
- `wait` は統合に必要になるまで行わない。

## 統合 checklist

- sub-agent の結果を鵜呑みにせず、親が repo evidence と diff を確認する。
- 競合、重複、scope creep を除去する。
- 必要な ADR、requirements、design、test、V&V evidence を親が最終的にそろえる。
- 最終報告では実行した check、known gaps、残余リスクを親がまとめる。

## 長時間の自律開発

- ユーザーが Sports Motion App の最大自律を明示した場合は、
  `sports-motion-app/docs/development_process.md` を優先する。
- push、PR、merge は現在のユーザー依頼が明示的に許可している範囲でのみ
  実行し、merge は承認済み PR と明示的な merge approval を必要とする。
- coherent boundary ごとに checkpoint commit、planning queue、retrospective
  の要否を確認する。
- scope、clinical/injury wording、sharing/privacy、metric promotion、mobile
  stack/ADR、merge readiness に触れる場合は user review request gate として
  扱う。
- merge 後は `main` の同期、workspace clean、必要な verification を確認して
  final report に残す。
