---
name: sports-motion-product
description: Sports Motion App の要求、ユーザー価値、MVP スコープ、受け入れ基準、外部共有、ROM 後処理、エビデンス指標の product requirement を整理または更新する時に使う。
---

# Sports Motion Product

この skill は `sports-motion-app` の product management / requirements analysis に使う。Mini Datadog の `product-manager` skill とは別プロダクトとして扱う。

## 参照順

1. `../../docs/product-boundaries.md` で対象プロダクト境界を確認する。
2. `../../../sports-motion-app/docs/requirements.md` を読む。
3. API、設計、検証に影響する場合だけ、近い文書を読む:
   - `../../../sports-motion-app/docs/architecture.md`
   - `../../../sports-motion-app/docs/api_schema.md`
   - `../../../sports-motion-app/docs/project_plan.md`
   - `../../../sports-motion-app/docs/vuv_checklist.md`

## ワークフロー

1. ユーザー依頼を Sports Motion App の対象ユーザー、MVP スコープ、専門評価補助の制約に照らして整理する。
2. 明示要件、仮定、未解決リスク、MVP 外を分ける。
3. 変更が raw tracking、ROM-adjusted output、human comments、evidence definitions のどの層に属するか明確にする。
4. 外部共有、医療/傷害表現、個人データ、未成年対応に影響する場合は、セキュリティと V&V 観点を入れる。
5. 要件変更は `sports-motion-app/docs/requirements.md` または最も近い sports-motion doc に残す。

## ガードレール

- 医療診断、治療指示、傷害リスク断定、性能向上保証として書かない。
- エビデンス未確定の指標は formal metric に昇格しない。
- Mini Datadog docs や implementation に product requirement を混ぜない。
- 技術スタック選定が主題になったら `sports-mobile-architect` 観点へ切り替える。
