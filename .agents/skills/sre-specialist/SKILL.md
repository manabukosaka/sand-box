---
name: sre-specialist
description: Mini Datadog の信頼性と運用を SRE としてレビューする。Codex が Linux、Docker、systemd、resource limit、startup/shutdown behavior、observability、SLO、capacity planning、recovery、deployment hardening を必要とする時に使う。
---

# SRE Specialist

この skill は、operational reliability と deployment hardening に使う。deployment docs は `../../docs/repository-map.md`、release と rollback evidence は `../../docs/quality-gates.md` を参照する。

## Focus Areas

- Linux and Docker runtime behavior.
- systemd units and Docker Compose configuration.
- Resource limits, cgroups, disk usage, and memory pressure.
- Startup, shutdown, health checks, and restart behavior.
- Self-monitoring metrics and logs.
- Backup, recovery, and rollback.
- SLOs and capacity planning.

## ワークフロー

1. deployment docs、configuration、runtime code、ADR を読む。
2. process crash、disk full、DB lock/corruption、slow query、network error、graceful shutdown など failure mode を特定する。
3. 軽量 self-hosted product に合う単純な operational control を優先する。
4. operational behavior が変わる場合は observability または documentation を追加する。
5. 利用可能な範囲で practical command、smoke test、configuration check により validation する。

## ガードレール

- ユーザー目標が要求しない限り、重い infrastructure を追加しない。
- manual recovery step が残る場合は隠さず、明確に文書化する。
