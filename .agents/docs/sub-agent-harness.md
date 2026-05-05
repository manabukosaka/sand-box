# Sub-Agent Harness

この文書は、Mini Datadog で role 別 sub-agent を選択的に使うための harness 設計である。通常は親 Codex が role lens を local に適用し、ユーザーが `sub-agent`、`delegation`、`parallel agent work` を明示した場合だけ bounded task として委譲する。

## 判断ツリー

1. ユーザーが sub-agent、delegation、parallel agent work を明示しているか。
   - いいえ: sub-agent は使わず、`role-map.md` の role perspective を local に適用する。
   - はい: 次へ進む。
2. 親の次の blocking task ではないか。
   - blocking task: 親が担当する。
   - sidecar task: 次へ進む。
3. task が自己完結し、成果物を 1 画面程度で返せるか。
   - いいえ: 親が分解してから再評価する。
   - はい: 次へ進む。
4. write scope が他 agent または親と重ならないか。
   - 重なる: read-only 調査に限定するか、親が担当する。
   - 重ならない: sub-agent に委譲できる。

## Role Matrix

| Role | 向いている委譲 | 期待する出力 |
| --- | --- | --- |
| Product Manager | 要件、受け入れ基準、スコープ外、ユーザー価値の整理 | 要件サマリ、acceptance criteria、未解決リスク |
| Software Architect | ADR 要否、API/DB/security boundary、代替案比較 | 推奨設計、ADR 判断、実装者への制約 |
| Senior Engineer | disjoint write scope の実装、焦点を絞った test 更新 | 変更ファイル、実装要約、実行した check |
| QA Engineer | test plan、regression matrix、manual/E2E evidence | test scenario、実行結果、残余リスク |
| Release Manager | V&V、PR readiness、rollback note | readiness 判定、証跡、known gaps |
| Security Researcher | auth、input validation、secret、dependency risk の非侵襲 review | findings、impact、推奨修正 |
| DB Tuner | DuckDB schema/query/retention/file growth review | query/storage risk、測定または確認手順 |
| SRE Specialist | startup/shutdown、resource、deployment、recovery review | failure mode、operational control、validation |

Agile Coach は phase flow、handoff、blocker、delivery reporting を親側で調整する。複数 role を委譲する場合も、親が統合判断と最終報告を持つ。

## Handoff Packet

sub-agent に渡す prompt は短く、以下の形にそろえる。

```text
Role:
Goal:
Read these files first:
Allowed scope:
Do not touch:
Expected output:
Stop/ask if:
Return changed files: (worker task only)
```

## Parallel Patterns

- 調査並列: backend contract、frontend usage、docs/ADR など、読み取り範囲を分ける。
- 実装並列: backend、frontend、docs/tests など write scope を分ける。
- review 並列: 親が修正中に QA/Security/DB/SRE が sidecar review を行う。
- release 並列: 親が integration review を行い、Release Manager が V&V evidence をまとめる。

## Token 節約ルール

- sub-agent には必要な file path と質問だけを渡す。
- read-only task は質問を 1 つに絞る。
- 長い引用、全体要約、重複調査を避ける。
- findings は file/line evidence と判断だけにする。
- `wait` は統合に必要になるまで行わない。

## Write Scope Isolation

- worker に実装を任せる時は、責任 file または module を明示する。
- 複数 worker が同じ file を編集しそうな場合は並列実装しない。
- sub-agent は他者の変更を revert しない。
- 親は返却後に diff、scope、test evidence、docs alignment を確認する。

## Parent Integration Checklist

- user intent と acceptance criteria に合うか。
- architecture、API、data、security、deployment の判断が必要なら ADR または docs に残っているか。
- sub-agent の結論が repo evidence と一致するか。
- 重複、競合、scope creep がないか。
- V&V evidence、known gaps、rollback note が最終報告に含まれているか。

## Abort Criteria

- task がユーザー確認なしに scope を決められない。
- destructive、production-impacting、secret-handling など承認が必要な操作が含まれる。
- write scope が分離できない。
- sub-agent の結果が親の次アクションを長時間 block する。
- 成果物が大きくなりすぎ、親が統合判断できない。
