# Requirements: Sports Motion Analysis Mobile App

## 1. Product Overview

This product is an installable iOS and Android mobile app for sports motion analysis.
The MVP focuses on baseball pitching for team and academy use. It uses AI-based
automatic tracking from single-camera smartphone video to quantify and visualize
biomechanical indicators, then applies range-of-motion (ROM) post-processing so
coaches, trainers, and external specialists can interpret results in the context
of age-based reference ROM and each athlete's individual ROM.

The app provides specialist evaluation support. It must not present outputs as a
medical diagnosis, a definitive injury prediction, or a guarantee of performance
improvement.

## 2. Target Users

- College and adult baseball teams.
- Baseball academies and training facilities serving college/adult athletes.
- Coaches and trainers who review pitching mechanics across multiple athletes.
- Athletes who need to view their own history, comparisons, and shared feedback.
- External specialists invited to review selected analysis results.

## 3. MVP Scope

### 3.1 In Scope

- Baseball pitching motion only.
- Installable iOS and Android mobile app.
- Single-camera smartphone video capture and upload.
- Hybrid processing:
  - on-device capture, upload preparation, simple preview, and result viewing;
  - cloud-based formal AI tracking, metric calculation, ROM post-processing,
    history storage, and re-analysis.
- AI automatic tracking of skeleton, joint positions, pitching phases, joint
  angles, trunk motion, and pelvis motion.
- Evidence-based baseball pitching metric definitions using recent US sports
  medicine and biomechanics literature.
- Athlete-level history for videos, tracking runs, analysis runs, ROM profiles,
  notes, and shared results.
- External sharing by invitation or limited-access link.

### 3.2 Out of MVP Scope

- Batting, running, fielding, or non-baseball sports.
- Automatic ROM estimation from dedicated measurement videos.
- Medical diagnosis, injury-risk diagnosis, or treatment recommendation.
- Fully automated coaching prescriptions or drill recommendations.
- Multi-camera capture, synchronized camera rigs, force plates, marker-based
  motion capture, or wearable sensor integration.
- Minor-athlete guardian consent management.

## 4. Functional Requirements

### 4.1 Athlete And Team Management

- Coaches and trainers can create athletes under a team or academy organization.
- Coaches and team administrators can manage team attributes, including team
  name, organization, sport, level, primary staff, and optional notes.
- Each athlete has a profile with name, throwing arm, height, body mass, age or
  age group, role or position, roster status, team membership, and optional notes.
- Athlete and team attributes can be created, viewed, edited, and used as filters
  for video and analysis history.
- Each athlete has a chronological history of videos, tracking runs, analysis
  runs, ROM profiles, and shared reports.
- The system preserves enough athlete and team context on each analysis result to
  make historical review understandable even if profile attributes are later
  edited.

### 4.2 Video Capture And Upload

- A user can record a pitching video using the smartphone camera from inside the
  app.
- A user can import an existing pitching video from the smartphone media library
  when in-app capture is not available.
- During capture, the app lets the user assign the athlete, team, camera view,
  throwing side, session label, and optional notes before submission.
- The app records capture metadata where available, including frame rate,
  resolution, device, capture date, capture source, duration, throwing side, and
  camera-view notes.
- Captured videos can be saved as managed `MotionVideo` records before formal AI
  tracking is submitted.
- Users can view, search, filter, and update video metadata by athlete, team,
  capture date, processing status, camera view, and analysis availability.
- Users can keep videos in draft, uploaded, processing, analyzed, failed, archived,
  or deleted states according to the storage and retention policy.
- The app displays upload, processing, failed, completed, archived, deleted, and
  re-analysis states.
- Deleting or archiving a video must not silently delete historical analysis
  evidence without an explicit product decision and audit trail.

### 4.3 AI Automatic Tracking

- The system estimates skeleton keypoints, joint positions, joint angles, trunk
  orientation, pelvis orientation, and baseball pitching phases from a single
  smartphone camera video.
- The system stores the raw tracking output separately from derived analysis
  metrics.
- Each tracking run records model version, processing configuration, confidence
  values, failure reason when applicable, and generated timestamp.
- The app displays skeleton overlays and phase markers on the video timeline.
- Low-confidence joints or phases are visible to the user and must not be hidden
  inside aggregate scores.

### 4.4 Evidence-Based Metric Definitions

- The system defines pitching metrics through versioned metric definitions.
- Each metric definition includes:
  - metric name;
  - unit;
  - calculation summary;
  - pitching phase or event;
  - required tracking signals;
  - evidence references;
  - target population and measurement context;
  - confidence or maturity classification;
  - recommended display text;
  - interpretation caution.
- Candidate MVP metrics include ball velocity when available, elbow torque-related
  proxy metrics, shoulder maximum external rotation, trunk rotation, pelvis-trunk
  separation, stride length, trunk lateral tilt, elbow flexion, release posture,
  and timing between key pitching phases.
- Metrics with incomplete evidence, weak measurement reliability, or uncertain
  single-camera validity are marked as experimental rather than formal evaluation
  metrics.

### 4.5 ROM Profiles And Post-Processing

- The system provides age-based standard ROM defaults derived from public
  literature.
- Coaches or trainers can edit an athlete's individual ROM values manually.
- A ROM profile includes joint, movement direction, side, minimum value, maximum
  value, source type, source reference, measurement date, entered-by user, and
  effective date.
- ROM post-processing uses the selected ROM profile to calculate adjusted metrics,
  ROM-relative ratios, and deviations from standard and individual ROM.
- Raw AI-derived values are never overwritten by ROM-adjusted values.
- Existing analysis runs can be recalculated when a metric definition or ROM
  profile changes, while preserving the versions used for every prior result.

### 4.6 Visualization And Review

- The analysis result screen shows:
  - video with skeleton overlay;
  - pitching phase timeline;
  - raw values;
  - ROM-adjusted values;
  - ROM ratio and deviation from standard/individual ROM;
  - confidence indicators;
  - historical comparison for the same athlete;
  - evidence-based explanation for each metric.
- The UI clearly distinguishes raw tracking output, ROM-adjusted interpretation,
  and specialist comments.
- Caution text appears for low-confidence outputs, experimental metrics, and
  metrics with population or capture-condition limitations.

### 4.7 Sharing

- A coach or trainer can share selected videos and analysis results with an
  external specialist by invite or limited-access link.
- Shared results can include or exclude raw video, overlays, metric tables,
  comments, and evidence notes.
- A share link has an expiration date, revocation state, access scope, and access
  log.
- Revoked or expired shares are inaccessible to external viewers.

## 5. Evidence Baseline

The evidence freshness baseline is 2026-05-05. Initial baseball metric selection
prioritizes recent US sports medicine and biomechanics literature from 2024-2025,
with systematic reviews and established ASMI-related work used to frame limits
and interpretation.

Primary evidence sources for MVP requirements:

- Fleisig et al., "Comparison of marker-less and marker-based motion capture for
  baseball pitching kinematics," Sports Biomechanics, 2024.
  <https://pubmed.ncbi.nlm.nih.gov/35591756/>
- Lerch et al., "Variability of in-game markerless and laboratory marker-based
  baseball pitching biomechanics," Journal of Biomechanics, 2025.
  <https://pubmed.ncbi.nlm.nih.gov/40418881/>
- McCutcheon et al., "Kinematic Parameters Associated With Elbow Varus Torque in
  Elite Adult Baseball Pitchers," Orthopaedic Journal of Sports Medicine, 2025.
  <https://pubmed.ncbi.nlm.nih.gov/39906602/>
- Peters et al., "Association between pitching velocity and elbow varus torque,"
  Brazilian Journal of Physical Therapy, 2025.
  <https://pubmed.ncbi.nlm.nih.gov/40414041/>
- Giordano et al., "Normative In-Game Data for Collegiate Baseball Pitchers Using
  Markerless Tracking Technology," Orthopaedic Journal of Sports Medicine, 2024.
  <https://pubmed.ncbi.nlm.nih.gov/39524323/>
- Bullock et al., "Baseball pitching biomechanics in relation to pain, injury,
  and surgery: A systematic review," Journal of Science and Medicine in Sport,
  2021. <https://pubmed.ncbi.nlm.nih.gov/32636133/>
- Ide et al., "Limited Total Arc Glenohumeral Rotation and Shoulder Biomechanics
  During Baseball Pitching," Journal of Athletic Training, 2024.
  <https://pubmed.ncbi.nlm.nih.gov/38446629/>
- Okamura and Iida, "Relationship Between Thoracic Spine Rotation Range, Trunk
  Contralateral Flexion Angle, and Maximum Elbow Valgus Torque During Pitching,"
  Cureus, 2025. <https://pmc.ncbi.nlm.nih.gov/articles/PMC11969626/>

Evidence handling rules:

- US evidence is prioritized for formal MVP pitching metrics.
- Non-US evidence can be used as supplemental evidence when it directly addresses
  ROM or biomechanics not covered by US literature.
- Metric definitions must cite their evidence and state the population and
  measurement context.
- Injury, pain, and surgery-related associations are displayed as cautious
  context, not deterministic predictions.
- Markerless tracking limitations are part of the user-facing interpretation.

## 6. Data Model Requirements

The implementation should support these core entities:

- `Organization`: academy or team-owning account.
- `Team`: group of athletes and staff within an organization.
- `Athlete`: player profile and longitudinal analysis subject.
- `MotionVideo`: uploaded or captured pitching video and capture metadata.
- `VideoLibrary`: athlete/team-scoped collection and query boundary for managed
  videos.
- `TrackingRun`: AI tracking output, confidence, phase detection, and model
  version.
- `AnalysisRun`: derived raw metrics, ROM-adjusted metrics, calculation versions,
  and processing status.
- `RomProfile`: standard and individual ROM values applied to an athlete.
- `MetricDefinition`: versioned evidence-based metric contract.
- `Metric`: raw value, adjusted value, confidence, phase, and display metadata.
- `EvidenceReference`: DOI/PMID, authors, year, study population, method,
  evidence classification, and adoption rationale.
- `Annotation`: coach, trainer, athlete, or specialist notes.
- `ShareLink`: external sharing scope, expiration, revocation, and access log.

## 7. Non-Functional Requirements

- The app should keep capture and review lightweight enough for field use on
  common modern iOS and Android phones.
- Formal analysis is asynchronous and resilient to upload interruption, processing
  failure, and re-analysis.
- Raw AI tracking, ROM-adjusted values, and human comments are separate data
  layers.
- Data access must respect organization, team, athlete, and external share scope.
- Evidence references and metric definitions are versioned so prior results remain
  auditable.
- User-facing language must avoid diagnosis, treatment claims, and definitive
  injury prediction.
- Shared analysis data must be revocable.

## 8. Acceptance Criteria

- A coach can create an athlete and edit an individual ROM profile initialized
  from standard ROM defaults.
- A coach or trainer can create and edit team attributes and athlete attributes,
  then use those attributes to filter the video and analysis history.
- A pitching video can be captured with the smartphone camera from inside the app,
  saved as a managed video record, assigned to an athlete/team, uploaded, and
  submitted for AI tracking.
- A previously captured or imported video can be found later by athlete, team,
  date, status, or camera view.
- The system can produce and store a tracking run containing skeleton data, joint
  confidence, and pitching phase markers.
- The analysis view shows raw metrics, ROM-adjusted metrics, ROM ratios,
  confidence, evidence notes, and prior-analysis comparison.
- A ROM profile or metric definition change can trigger re-analysis without
  overwriting the original raw tracking output or historical analysis version.
- Experimental or low-confidence metrics are visibly labeled before sharing.
- A coach can share an analysis externally, then revoke access and verify that
  the external viewer can no longer open it.

## 9. Open Risks And Follow-Up Decisions

- Confirm whether the first technical implementation should use React Native,
  native iOS/Android, or another cross-platform mobile stack.
- Define the exact standard ROM source set and update cadence before clinical or
  professional rollout.
- Validate which proposed metrics are reliable from single-camera markerless video
  and which require multi-camera, ball-tracking, or force/torque estimation.
- Define privacy, retention, and export requirements before production deployment.
- Decide whether external specialist sharing requires comment write-back,
  read-only review, or signed report generation.
