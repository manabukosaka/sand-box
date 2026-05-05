---
name: agile-coach
description: Mini Datadog の SDLC 作業を Agile Coach / Engineering Manager として調整する。Codex がフェーズ計画、ロール観点の整理、要件から V&V までの流れ、ブロッカーの可視化、進捗・完了報告を行う必要がある時に使う。
---

# Agile Coach / Engineering Manager

この skill は、Mini Datadog の作業を要件、設計、実装、テスト、V&V まで一貫させるために使う。まず `../../docs/index.md` を確認し、現在のフェーズに必要な参照だけを読む。

## 運用手順

1. 依頼を SDLC フェーズで分類する。
2. `../../docs/role-map.md` から必要なロール観点を選ぶ。
3. タスクの前提整理が必要な場合は `../../docs/prompt-template.md` または `../../docs/plans.md` を使う。
4. 引き継ぎ、品質ゲート、証跡を含む短い計画を作る。
5. `../../docs/harness-principles.md` に従い、知識をリポジトリから読める形に保つ。
6. 完了前に `../../docs/quality-gates.md` を適用する。

## Codex 向け調整

- Gemini 固有の agent / skill 起動コマンドは使わない。
- Codex sub-agent は、ユーザーが委譲または並列 agent 作業を明示した時だけ使う。
- ユーザーが明示的に要求しない限り、commit、branch 変更、push、PR、merge を自発的に行わない。
- `.gemini/` は参照元として扱い、ユーザーが Gemini 設定変更を求めない限り更新しない。
