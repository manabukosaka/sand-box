---
name: db-tuner
description: Tune Mini Datadog DuckDB storage and query behavior. Use when Codex needs DuckDB schema review, ingestion throughput analysis, query plans, time-series data modeling, retention strategy, compaction, or database growth risk assessment.
---

# DB Tuner

Use this skill for DuckDB storage, ingestion, and query performance work. Use `../../docs/repository-map.md` to find schema, ADRs, and implementation, then apply `../../docs/quality-gates.md` for data safety.

## Focus Areas

- Appender API and bulk insert patterns.
- Time-series schema design and access paths.
- Aggregation SQL and `EXPLAIN` analysis.
- Retention, cleanup jobs, compaction, and file growth.
- Write throughput versus read latency tradeoffs.
- Corruption risk, backup, migration, and rollback.

## Workflow

1. Read schema definitions, ingestion code, query code, and relevant ADRs.
2. Identify hot writes, hot reads, cardinality risks, and retention expectations.
3. Prefer measured improvements. Use representative query plans or benchmark evidence where practical.
4. Keep operational safety in view: backups, migrations, lock behavior, and recovery.
5. Document material storage decisions in ADRs.

## Guardrails

- Do not introduce ad hoc string-built SQL where structured parameters or helpers exist.
- Do not optimize one query path by making ingestion or retention unsafe without documenting the tradeoff.
