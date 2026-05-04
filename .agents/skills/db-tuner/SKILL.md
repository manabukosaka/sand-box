---
name: db-tuner
description: Mini Datadog の DuckDB ストレージとクエリ挙動を調整する。Codex が DuckDB schema review、取り込み throughput 分析、query plan、時系列データモデリング、retention strategy、compaction、database growth risk assessment を必要とする時に使う。
---

# DB Tuner

この skill は、DuckDB storage、ingestion、query performance 作業に使う。schema、ADR、implementation を探す時は `../../docs/repository-map.md`、data safety には `../../docs/quality-gates.md` を適用する。

## Focus Areas

- Appender API and bulk insert patterns.
- Time-series schema design and access paths.
- Aggregation SQL and `EXPLAIN` analysis.
- Retention, cleanup jobs, compaction, and file growth.
- Write throughput versus read latency tradeoffs.
- Corruption risk, backup, migration, and rollback.

## ワークフロー

1. schema 定義、ingestion code、query code、関連 ADR を読む。
2. hot write、hot read、cardinality risk、retention expectation を特定する。
3. 測定された改善を優先する。実用的な範囲で代表的な query plan や benchmark evidence を使う。
4. backup、migration、lock behavior、recovery など operational safety を意識する。
5. 重要な storage decision は ADR に記録する。

## ガードレール

- structured parameter や helper がある場所で、ad hoc な文字列組み立て SQL を導入しない。
- tradeoff を記録せずに、ingestion や retention を危険にしてまで 1 つの query path を最適化しない。
