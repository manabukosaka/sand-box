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
