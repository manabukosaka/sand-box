# Sample Acquisition Protocol

Status: Draft for review
Owner: Sports Motion product / biomechanics / QA
Created: 2026-05-09

This protocol defines how to collect non-identifying pitching-video samples for
the tracking feasibility gate. It does not authorize committing original videos,
athlete names, consent forms, faces, jersey identifiers, school names, or public
media links to git.

The product remains specialist evaluation support. Sample collection and review
must not create diagnosis, treatment, injury prediction, readiness, or
guaranteed performance claims.

## 1. Collection Goal

Collect the minimum private sample set required by
`docs/sample_video_manifest.md` so a tracking provider/model can be evaluated
against representative baseball pitching capture conditions.

The sample set must cover:

- good open-side capture;
- good catcher-view capture;
- closed-side or partially occluded capture;
- low light or background clutter;
- youth/high-school form variation;
- college/adult high-intent bullpen;
- known bad framing.

## 2. Privacy And Consent Rules

- Store original videos outside git in an approved private review location.
- Store consent and usage-right evidence outside git with access limited to
  approved reviewers.
- Use opaque sample IDs in repository documents.
- Do not commit screenshots, thumbnails, faces, jersey numbers, names, school or
  club identifiers, location identifiers, or public links.
- Private artifact URIs must be opaque references such as
  `private://tracking-feasibility/<sample_id>`.
- If a sample cannot be de-identified enough for repository metadata, keep it out
  of the sample manifest and record only a private review note.

## 3. Capture Guidance

Each sample should record the pitcher from a stable phone position with the full
body visible whenever the intended case type requires it.

Minimum capture metadata:

- camera view: open-side, catcher-view, closed-side, or other;
- frame rate;
- resolution;
- duration;
- approximate camera distance;
- whole-body visibility at foot contact and release;
- lighting quality;
- background clutter;
- throwing arm;
- coarse age group;
- role: pitcher or two-way.

For good-quality samples, prefer:

- whole body visible from setup through release;
- throwing arm visible around arm cocking and release;
- lower body visible around stride and foot contact;
- stable camera with minimal zoom changes;
- enough frame rate for phase-event review.

For expected-failure samples, intentionally keep the capture reason explicit,
for example bad framing, occlusion, low light, or clutter.

## 4. Intake Checklist

Before a sample can be marked `approved` in `docs/sample_video_manifest.md`:

- private storage location is recorded;
- usage rights are approved;
- sample ID is opaque and stable;
- required metadata fields are complete;
- no identifying details are present in repository-visible fields;
- expected outcome is set to `complete`, `warning`, `failed_retryable`, or
  `failed_unusable`;
- reviewer confirms the sample fits one required case type.

## 5. Readiness Decision

The sample set remains `blocked` until every required case type has at least one
approved sample. A stronger gate recommendation requires the full minimum count
from `docs/sample_video_manifest.md`.

Do not run a provider/model candidate until:

- sample coverage is ready;
- candidate/provider version is frozen;
- adapter and confidence-policy versions are recorded;
- private artifact output location is approved;
- product, biomechanics, and QA reviewers agree to start the run.

## 6. Review Gate

User review is required before:

- using real athlete video for provider/model evaluation;
- changing sample retention or privacy rules;
- selecting a tracking provider/model;
- promoting any metric maturity;
- changing ADR 0002 mobile stack status.
