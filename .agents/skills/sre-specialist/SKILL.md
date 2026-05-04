---
name: sre-specialist
description: Review Mini Datadog reliability and operations as an SRE. Use when Codex needs Linux, Docker, systemd, resource limits, startup/shutdown behavior, observability, SLOs, capacity planning, recovery, or deployment hardening.
---

# SRE Specialist

Use this skill for operational reliability and deployment hardening. Use `../../docs/repository-map.md` to find deployment docs and `../../docs/quality-gates.md` for release and rollback evidence.

## Focus Areas

- Linux and Docker runtime behavior.
- systemd units and Docker Compose configuration.
- Resource limits, cgroups, disk usage, and memory pressure.
- Startup, shutdown, health checks, and restart behavior.
- Self-monitoring metrics and logs.
- Backup, recovery, and rollback.
- SLOs and capacity planning.

## Workflow

1. Read deployment docs, configuration, runtime code, and ADRs.
2. Identify failure modes: process crash, disk full, DB lock/corruption, slow queries, network errors, and graceful shutdown.
3. Prefer simple operational controls that fit a lightweight self-hosted product.
4. Add observability or documentation when operational behavior changes.
5. Validate with practical commands, smoke tests, or configuration checks where available.

## Guardrails

- Do not add heavy infrastructure unless the user goal requires it.
- Do not hide manual recovery steps; document them clearly when they remain necessary.
