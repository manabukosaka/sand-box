# Tracking Provider And Model Shortlist

Review date: 2026-05-06
Status: Draft shortlist, no provider selected

This shortlist supports the Milestone 2 tracking feasibility gate. It does not
approve any provider/model for production use. Each candidate must be tested on
the sample pitching-video set before implementation begins.

The app remains specialist evaluation support. Tracking outputs must not be
presented as medical diagnosis, definitive injury prediction, or guaranteed
performance improvement.

## Evaluation Criteria

Each candidate must be scored against:

- pitching-specific keypoint quality;
- support for pelvis, trunk, shoulder, elbow, wrist, knee, and ankle signals;
- foot-contact and ball-release phase support or adapter feasibility;
- single-camera versus multi-camera requirements;
- iOS/Android field workflow fit;
- model/provider versioning;
- artifact retention and reproducibility;
- latency and cost;
- commercial-use license;
- privacy and data residency;
- failure reasons understandable by coaches;
- evidence or validation source reviewed.

## Draft Candidates

| Candidate | Deployment fit | Why shortlist | Main concern | Current disposition |
| --- | --- | --- | --- | --- |
| MediaPipe Pose Landmarker / BlazePose family | Device, edge, or worker adapter | Accessible baseline for skeleton extraction and fast local experiments | General fitness validation is not pitching-specific; 33 landmarks may be insufficient for formal biomechanics | Keep as baseline/prototype candidate |
| OpenCap | Cloud/research workflow using two or more smartphones | Smartphone-based 3D motion analysis with OpenSim outputs and published validation | Two-camera workflow and research/cloud constraints may not match single-phone MVP capture | Keep as research comparator |
| Theia3D | Commercial multi-camera biomechanics workflow | Strong sports biomechanics positioning and baseball-related validation references | Multi-camera setup, commercial workflow, and integration constraints may exceed MVP mobile scope | Keep as premium comparator |
| PitchAI / baseball-specific markerless system | Commercial or partner integration | Baseball pitching-specific validation exists in the literature | API access, licensing, and product integration path must be confirmed | Investigate if partner/API access is possible |
| Hawk-Eye or in-stadium markerless systems | Stadium/commercial infrastructure | Relevant to high-speed baseball validation literature | Not a smartphone MVP provider; likely unsuitable for team/school mobile capture | Use as validation benchmark, not MVP provider |

## Candidate Notes

### MediaPipe Pose Landmarker / BlazePose

Potential role:

- local baseline for prototype skeleton extraction;
- deterministic fixture generation for UI and confidence-policy tests;
- possible fallback for low-stakes overlay previews.

Must verify:

- current model/task version;
- mobile runtime packaging path;
- license obligations;
- per-landmark confidence availability;
- stability during high-speed pitching, occlusion, and partial framing;
- whether shoulder/pelvis/trunk orientation is good enough for any metric beyond
  visual overlay.

Initial stance:

- Do not use for formal pitching metrics until sample-set results prove the
  required signals are reliable.

### OpenCap

Potential role:

- research comparator for 3D kinematics and OpenSim-style outputs;
- reference for multi-smartphone capture workflow and calibration requirements.

Must verify:

- whether baseball pitching is within supported or validated motion types;
- data export/API integration path;
- commercial-use and data-processing constraints;
- setup time for coaches in field environments;
- ability to handle high-intent pitching and release-phase speed.

Initial stance:

- Useful as a feasibility comparator, but not assumed to fit the single-phone MVP
  workflow.

### Theia3D

Potential role:

- premium commercial comparator for biomechanics validity;
- possible partner path for advanced facilities or later enterprise offering.

Must verify:

- exact camera count and setup needed for pitching;
- integration/API options;
- commercial terms;
- data ownership and retention;
- latency and batch-processing workflow;
- whether results can be mapped into the app's `TrackingRun` and `AnalysisRun`
  provenance model.

Initial stance:

- Keep on the shortlist for validation and partnership review; do not assume MVP
  integration because the initial product targets smartphone capture.

### PitchAI / Baseball-Specific Markerless System

Potential role:

- most domain-specific commercial candidate if integration is available.

Must verify:

- current product/API availability;
- licensing and commercial-use terms;
- model versioning and artifact access;
- required camera view and frame rate;
- whether outputs include the app's required joints, phases, and confidence
  metadata.

Initial stance:

- Investigate partnership/API path before committing engineering time.

### Hawk-Eye Or In-Stadium Systems

Potential role:

- benchmark from baseball markerless validation literature;
- possible future elite/stadium integration.

Must verify:

- whether any practical API/partner path exists for team/school MVP usage.

Initial stance:

- Not an MVP provider. Use as context for validation expectations and limitations.

## Sample-Set Decision Needs

The first sample-video test must include enough variety to answer:

- Can one open-side smartphone view support the overlay and provisional metrics?
- Which camera views should be accepted, cautioned, or rejected?
- Which metrics must be suppressed when the throwing arm is occluded?
- Does high frame rate materially improve phase-event confidence?
- Can the selected candidate provide actionable failure reasons?

## Shortlist Exit Criteria

The shortlist is ready for gate review when:

- at least two candidates have current version/licensing notes;
- at least one candidate has been run against the sample video set;
- failed and low-confidence cases are documented;
- metric-by-metric support is classified as formal candidate, provisional,
  experimental, or unsupported;
- privacy and artifact-retention implications are understood.

## References Reviewed

- MediaPipe Pose documentation:
  <https://developers.google.com/mediapipe/solutions/vision/pose_landmarker>
- MediaPipe legacy Pose documentation and BlazePose model notes:
  <https://mediapipe.readthedocs.io/en/latest/solutions/pose.html>
- OpenCap overview from Stanford Mobilize Center:
  <https://mobilize.stanford.edu/software/opencap/>
- OpenCap validation in Journal of Biomechanics:
  <https://pubmed.ncbi.nlm.nih.gov/38905926/>
- Theia3D basics documentation:
  <https://docs.theiamarkerless.com/theia3d-documentation/getting-started/theia3d-basics>
- Theia markerless product site:
  <https://www.theiamarkerless.com/>
- Baseball pitching markerless accuracy study:
  <https://www.tandfonline.com/doi/abs/10.1080/02640414.2025.2595411>
- PitchAI markerless pitching validation reference:
  <https://www.researchgate.net/publication/365644625_Validation_of_pitchAI_TM_markerless_motion_capture_using_marker-based_3D_motion_capture>
