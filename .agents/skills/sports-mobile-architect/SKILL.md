---
name: sports-mobile-architect
description: Sports Motion App の iOS/Android インストール型アプリ、クラウド解析、動画アップロード、AI tracking worker、API 契約、データ境界、外部共有、ADR を設計または更新する時に使う。
---

# Sports Mobile Architect

この skill は `sports-motion-app` の mobile / backend / analysis architecture に使う。Mini Datadog の Rust/Next.js 実装制約とは分けて扱う。

## 参照順

1. `../../docs/product-boundaries.md`。
2. `../../../sports-motion-app/docs/architecture.md`。
3. 契約や検証に影響する場合:
   - `../../../sports-motion-app/docs/api_schema.md`
   - `../../../sports-motion-app/docs/adr/`
   - `../../../sports-motion-app/docs/vuv_checklist.md`
   - `../../../sports-motion-app/docs/project_plan.md`

## ワークフロー

1. 変更が mobile app、API backend、analysis worker、object storage、evidence registry のどこに属するか分ける。
2. raw tracking、analysis metrics、ROM-adjusted metrics、annotations、share links の data boundary を守る。
3. 非同期解析、失敗状態、再解析、version provenance、share revocation を設計に含める。
4. 重要な技術選定や境界変更は ADR として `sports-motion-app/docs/adr/` に残す。
5. 実装前に `api_schema.md` と `vuv_checklist.md` へ検証可能な contract を反映する。

## ガードレール

- mobile stack、tracking model、storage technology を根拠なしに固定しない。
- device-only analysis と cloud formal analysis の責務を混ぜない。
- share link は analysis-result scoped、expiring、revocable を既定にする。
- Mini Datadog の backend/frontend 変更を sports-motion architecture の前提にしない。
