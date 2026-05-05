# API Schema Draft: Sports Motion Analysis MVP

## 1. Purpose

This draft defines the minimum API surface needed for the MVP. It is an
implementation contract for mobile, backend, and analysis worker teams. Field
names are intentionally stable and explicit so raw AI tracking, ROM-adjusted
analysis, evidence definitions, and specialist comments remain separate.

## 2. Conventions

- IDs are opaque strings.
- Timestamps use ISO 8601 UTC.
- Versioned resources expose `version`.
- Mutable configuration resources expose `effective_from`.
- Historical analysis outputs are append-only; updates create a new versioned
  result rather than overwriting prior outputs.
- Medical diagnosis, injury prediction, and treatment language must not appear in
  API-generated user-facing summaries.

## 3. Core Types

### Organization

```json
{
  "id": "org_123",
  "name": "Example Baseball Academy",
  "created_at": "2026-05-05T00:00:00Z"
}
```

### Team

```json
{
  "id": "team_123",
  "organization_id": "org_123",
  "name": "College Pitching Group",
  "sport": "baseball",
  "level": "college_adult",
  "primary_staff_user_ids": ["usr_123"],
  "notes": "Pitching development group",
  "created_at": "2026-05-05T00:00:00Z"
}
```

### Athlete

```json
{
  "id": "ath_123",
  "team_id": "team_123",
  "display_name": "Pitcher A",
  "throwing_arm": "right",
  "age_group": "college_adult",
  "role": "pitcher",
  "roster_status": "active",
  "height_cm": 185.0,
  "body_mass_kg": 88.0,
  "created_at": "2026-05-05T00:00:00Z"
}
```

### MotionVideo

```json
{
  "id": "vid_123",
  "athlete_id": "ath_123",
  "status": "uploaded",
  "capture_type": "recorded_in_app",
  "capture_source": "smartphone_camera",
  "motion_type": "baseball_pitching",
  "camera_view": "open_side",
  "frame_rate_fps": 240,
  "resolution": "1920x1080",
  "duration_ms": 4200,
  "session_label": "Bullpen session 1",
  "notes": "Open-side view from first-base side.",
  "archived_at": null,
  "deleted_at": null,
  "captured_at": "2026-05-05T00:00:00Z",
  "created_at": "2026-05-05T00:00:00Z"
}
```

### RomProfile

```json
{
  "id": "rom_123",
  "athlete_id": "ath_123",
  "version": 3,
  "source_type": "standard_with_manual_override",
  "effective_from": "2026-05-05T00:00:00Z",
  "entries": [
    {
      "joint": "shoulder",
      "movement": "external_rotation",
      "side": "throwing_arm",
      "standard_min_deg": 0.0,
      "standard_max_deg": 120.0,
      "individual_min_deg": 0.0,
      "individual_max_deg": 115.0,
      "reference_ids": ["ref_ide_2024"]
    }
  ],
  "entered_by_user_id": "usr_123",
  "measured_at": "2026-05-05T00:00:00Z"
}
```

### EvidenceReference

```json
{
  "id": "ref_mccutcheon_2025",
  "title": "Kinematic Parameters Associated With Elbow Varus Torque in Elite Adult Baseball Pitchers",
  "authors": ["McCutcheon", "Slowik", "Fleisig"],
  "year": 2025,
  "doi": "10.1177/23259671241300560",
  "pmid": "39906602",
  "population": "professional and collegiate adult pitchers",
  "measurement_context": "laboratory biomechanics database",
  "evidence_classification": "primary_us_biomechanics",
  "url": "https://pubmed.ncbi.nlm.nih.gov/39906602/"
}
```

### MetricDefinition

```json
{
  "id": "metric_trunk_rotation_velocity",
  "version": 1,
  "name": "Trunk rotation velocity",
  "unit": "deg_per_sec",
  "motion_type": "baseball_pitching",
  "phase": "arm_cocking_to_acceleration",
  "maturity": "provisional",
  "required_tracking_signals": ["trunk_orientation", "phase_events"],
  "calculation_summary": "Maximum angular velocity of trunk rotation during the selected pitching phase.",
  "reference_ids": ["ref_mccutcheon_2025", "ref_peters_2025"],
  "display_caution": "Use as specialist context. Do not interpret as an injury prediction."
}
```

### TrackingRun

```json
{
  "id": "trk_123",
  "motion_video_id": "vid_123",
  "status": "completed",
  "model_name": "markerless_pitching_tracker",
  "model_version": "2026.05.0",
  "started_at": "2026-05-05T00:01:00Z",
  "completed_at": "2026-05-05T00:03:00Z",
  "artifact_uri": "object://tracking/trk_123.json",
  "phase_events": [
    {
      "name": "foot_contact",
      "frame": 112,
      "confidence": 0.91
    },
    {
      "name": "ball_release",
      "frame": 184,
      "confidence": 0.86
    }
  ],
  "overall_confidence": 0.88
}
```

### AnalysisRun

```json
{
  "id": "ana_123",
  "tracking_run_id": "trk_123",
  "athlete_id": "ath_123",
  "status": "completed",
  "analysis_version": 1,
  "metric_definition_versions": [
    {
      "metric_definition_id": "metric_trunk_rotation_velocity",
      "version": 1
    }
  ],
  "rom_profile_id": "rom_123",
  "rom_profile_version": 3,
  "created_at": "2026-05-05T00:04:00Z",
  "metrics": [
    {
      "metric_definition_id": "metric_trunk_rotation_velocity",
      "raw_value": 620.0,
      "adjusted_value": 0.94,
      "adjusted_unit": "rom_ratio",
      "confidence": 0.82,
      "maturity": "provisional",
      "cautions": ["single_camera_estimate"]
    }
  ]
}
```

### ShareLink

```json
{
  "id": "shr_123",
  "analysis_run_id": "ana_123",
  "created_by_user_id": "usr_123",
  "scope": "analysis_result_only",
  "include_video": true,
  "include_comments": true,
  "expires_at": "2026-06-05T00:00:00Z",
  "revoked_at": null,
  "created_at": "2026-05-05T00:05:00Z"
}
```

## 4. MVP Endpoints

### Athletes

- `GET /teams/{team_id}`
- `PATCH /teams/{team_id}`
- `POST /teams/{team_id}/athletes`
- `GET /teams/{team_id}/athletes`
- `GET /athletes/{athlete_id}`
- `PATCH /athletes/{athlete_id}`

### ROM Profiles

- `GET /athletes/{athlete_id}/rom-profiles/current`
- `POST /athletes/{athlete_id}/rom-profiles`
- `GET /athletes/{athlete_id}/rom-profiles`

Creating a new ROM profile creates a new version. Existing analysis runs keep
their original ROM profile reference.

### Videos

- `POST /athletes/{athlete_id}/videos`
- `GET /athletes/{athlete_id}/videos`
- `GET /teams/{team_id}/videos`
- `GET /videos/{motion_video_id}`
- `PATCH /videos/{motion_video_id}`
- `POST /videos/{motion_video_id}/upload-session`
- `POST /videos/{motion_video_id}/submit-tracking`
- `POST /videos/{motion_video_id}/archive`
- `POST /videos/{motion_video_id}/restore`
- `DELETE /videos/{motion_video_id}`

`POST /athletes/{athlete_id}/videos` can create a draft record before upload
when the user captures video with the smartphone camera. Query endpoints support
filters for athlete, team, capture date, status, camera view, and analysis
availability.

### Tracking And Analysis

- `GET /tracking-runs/{tracking_run_id}`
- `POST /tracking-runs/{tracking_run_id}/analysis-runs`
- `GET /analysis-runs/{analysis_run_id}`
- `POST /analysis-runs/{analysis_run_id}/recalculate`
- `GET /athletes/{athlete_id}/analysis-runs`

Recalculation creates a new `AnalysisRun` that points to the same `TrackingRun`
unless the user explicitly requests a new tracking run.

### Metric Definitions And Evidence

- `GET /metric-definitions?motion_type=baseball_pitching`
- `GET /metric-definitions/{metric_definition_id}`
- `GET /evidence-references/{evidence_reference_id}`

Metric definitions are read-only for normal team users in the MVP.

### Sharing

- `POST /analysis-runs/{analysis_run_id}/share-links`
- `GET /share-links/{share_link_id}`
- `POST /share-links/{share_link_id}/revoke`
- `GET /shared/{share_token}`

Shared views must return only the scoped analysis result and allowed assets.

## 5. Required Error Cases

- `400 invalid_capture_metadata`: video metadata cannot support MVP analysis.
- `403 forbidden_scope`: user or share token lacks access.
- `404 not_found`: resource does not exist or is outside caller scope.
- `409 analysis_already_processing`: duplicate tracking or analysis submission.
- `422 tracking_confidence_too_low`: analysis cannot calculate required signals.
- `422 unsupported_metric_definition`: metric is not valid for this motion type.
- `422 video_not_ready_for_tracking`: video is not uploaded or is archived/deleted.
- `410 share_expired_or_revoked`: external share is no longer available.

## 6. Security And Audit Requirements

- All organization/team APIs require authenticated users.
- External share access must be scoped to one analysis result by default.
- Share access attempts are logged with timestamp, share ID, and coarse client
  metadata.
- Users can revoke shares without deleting the underlying analysis.
- Analysis and metric-version provenance must be available to authorized coaches
  and trainers.
