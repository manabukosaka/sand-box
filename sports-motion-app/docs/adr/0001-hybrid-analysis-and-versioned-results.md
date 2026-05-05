# ADR 0001: Hybrid Analysis And Versioned Results

## Status

Accepted

## Date

2026-05-05

## Context

The sports motion analysis MVP must run on installable iOS and Android apps while
supporting AI markerless tracking, evidence-backed baseball pitching metrics, ROM
post-processing, re-analysis, and external specialist sharing.

Formal analysis may be compute-heavy, model-dependent, and sensitive to metric
definition changes. The product must also preserve auditability: raw AI tracking,
ROM-adjusted outputs, and human comments cannot overwrite each other.

## Decision

Use a hybrid architecture:

- mobile app for capture, upload preparation, lightweight preview, ROM editing,
  result review, and sharing controls;
- cloud backend for identity, athletes, permissions, metric definitions, ROM
  profiles, analysis orchestration, and sharing;
- cloud analysis workers for formal AI tracking, phase detection, metric
  calculation, ROM post-processing, and re-analysis;
- object storage for videos and tracking artifacts.

Every `AnalysisRun` records the versions of its input `TrackingRun`, AI model,
`MetricDefinition`, and `RomProfile`. Re-analysis creates a new analysis run
instead of mutating historical results.

## Alternatives Considered

### Fully On-Device Analysis

Rejected for MVP. It may improve privacy and offline use, but formal tracking and
re-analysis would depend heavily on device performance and model packaging. It
also makes centralized evidence-definition updates harder.

### Fully Cloud-Only Product

Rejected for MVP. A web-only or cloud-only experience would reduce mobile
implementation work, but it would not satisfy the local installable app
requirement or the field capture workflow.

### Mutating Existing Results On Recalculation

Rejected. It would simplify storage but would break auditability when ROM
profiles, metric definitions, or model versions change.

## Consequences

- The mobile app can stay lightweight while formal analysis remains consistent.
- Users must wait for asynchronous formal analysis.
- The backend must manage processing states, retries, and failure reasons.
- Storage volume will grow because historical analysis versions are preserved.
- Product and QA can audit which model, evidence definition, and ROM profile
  produced each displayed result.

## Follow-Up Work

- Decide the mobile stack after a video-capture and overlay-rendering prototype.
- Decide the AI tracking provider/model after pitching-video feasibility tests.
- Define retention and archival policy for original videos and tracking artifacts.
- Define operator tools for metric-definition and evidence-reference updates.
