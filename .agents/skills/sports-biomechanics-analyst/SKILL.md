---
name: sports-biomechanics-analyst
description: Sports Motion App の野球投球バイオメカニクス、AI markerless tracking、ROM、X-Factor、関節角度、エビデンス文献、MetricDefinition の妥当性を検討または更新する時に使う。
---

# Sports Biomechanics Analyst

この skill は `sports-motion-app` の biomechanical evidence と metric design に使う。医学的診断ではなく、専門評価補助のための指標設計に限定する。

## 参照順

1. `../../docs/product-boundaries.md`。
2. `../../../sports-motion-app/docs/evidence_metrics.md`。
3. 必要に応じて:
   - `../../../sports-motion-app/docs/requirements.md`
   - `../../../sports-motion-app/docs/api_schema.md`
   - `../../../sports-motion-app/docs/vuv_checklist.md`

## ワークフロー

1. 対象 metric が formal、provisional、experimental のどれに相当するか判断する。
2. 必要な tracking signals、pitching phase、ROM profile、confidence 表示を明確にする。
3. 文献根拠、対象集団、測定環境、markerless / single-camera の限界を記録する。
4. raw value、ROM-adjusted value、ROM ratio、deviation、specialist comment を混同しない。
5. 最新文献やモデル妥当性が重要な判断では、一次情報を確認し、基準日または参照日を doc に残す。

## ガードレール

- Elbow torque proxy や傷害関連 metric を injury prediction として扱わない。
- 文献の対象集団や測定条件が違う場合、normative comparison として断定しない。
- 個人 ROM による後処理は raw tracking の上書きではなく、別レイヤーの interpretation として扱う。
- MetricDefinition を変える場合は、versioning と re-analysis の影響を `api_schema.md` または ADR と整合させる。
