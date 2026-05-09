# Tracking Sample Run Plan

Status: Draft execution-ready checklist
Owner: Sports Motion biomechanics / product / QA
Created: 2026-05-08
Last reviewed: 2026-05-09

This plan turns the tracking feasibility gate into an executable review slice.
It does not select a production tracking provider and does not change the mobile
stack ADR by itself.

## Inputs

- Gate definition: `docs/tracking_feasibility_gate.md`
- Sample set manifest: `docs/sample_video_manifest.md`
- Candidate shortlist: `docs/tracking_shortlist.md`
- Metric support decisions: `docs/metric_tracking_support_matrix.md`

## Step 1: Freeze Evaluation Version Set

Before running any candidate, record:

- sample manifest version ID;
- candidate/provider ID and exact version;
- adapter version and confidence-policy version;
- evaluator names and run date;
- storage location for private tracking artifacts.

Use a dated copy of `docs/vv/tracking_feasibility_results_template.md` for this
record.

## Step 2: Sample Coverage Check

Confirm all required sample case types exist and have approved usage rights.

Required output:

- missing or blocked case list;
- approved sample count by case type;
- explicit decision: `ready_for_run` or `blocked`.

If blocked, stop and record the blocker in the dated results file.

Current readiness: `blocked`. The 2026-05-09 readiness check found that the
manifest still contains only placeholder sample IDs and no approved private
sample set. Candidate execution must not start until sample coverage and usage
rights are complete.

## Step 3: Candidate Run Execution

For each candidate run:

- execute tracking on approved sample IDs only;
- capture run status, overall confidence, phase-event confidence, and required
  signal support;
- attach private artifact URIs;
- capture failure reasons focused on capture/measurement conditions only.

Do not claim diagnosis, treatment, injury prediction, or guaranteed performance.

## Step 4: Metric Support Classification

Map observed signal support to metric decisions:

- `formal_candidate`, `provisional`, `experimental`, or `unsupported`.

Update the matrix with:

- pass/warn/fail counts by required signal group;
- suppression behavior observed for low-confidence samples;
- unresolved metrics that need more samples or provider capabilities.

## Step 5: Gate Decision Packet

Build the review packet with:

- dated tracking feasibility results file;
- updated sample manifest summary;
- updated metric support matrix;
- gate recommendation: `go`, `conditional_go`, or `no_go`;
- constraints list for next implementation slice.

## Step 6: Review Gate Request

Request user review before:

- promoting any metric maturity;
- selecting a provider/model for implementation;
- changing mobile stack ADR status.

If review is not available, mark the run complete but gate decision pending.
