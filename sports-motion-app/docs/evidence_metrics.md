# Evidence Metric Catalog: Baseball Pitching MVP

## 1. Catalog Purpose

This catalog defines the initial evidence-backed metric candidates for the
baseball pitching MVP. It is not a final clinical protocol. Each metric must be
validated against the app's markerless single-camera tracking quality before it
is promoted to a formal evaluation metric.

Evidence freshness baseline: 2026-05-05.

## 2. Metric Maturity Levels

- Formal: suitable for MVP evaluation views when tracking confidence is adequate.
- Provisional: useful for specialist review, but needs more validation or clearer
  capture constraints before formal scoring.
- Experimental: visible only with caution labeling; not used for evaluation
  summaries or automated interpretation.

## 3. Initial Metric Candidates

| Metric | MVP maturity | Primary use | Evidence anchor |
| --- | --- | --- | --- |
| Shoulder maximum external rotation | Provisional | Arm cocking mechanics and ROM context | Fleisig 2024, Ide 2024, Lerch 2025 |
| Elbow flexion at key events | Provisional | Arm position and markerless variability review | Fleisig 2024, Lerch 2025 |
| Trunk rotation timing/velocity | Provisional | Pitching efficiency and elbow torque context | McCutcheon 2025, Peters 2025 |
| Pelvis-trunk separation | Provisional | Kinetic-chain timing and rotational sequencing | Giordano 2024, Ramsey 2025 supplemental |
| Stride length | Provisional | Delivery mechanics and comparison across history | Giordano 2024, Ramsey 2025 supplemental |
| Trunk lateral tilt at release | Provisional | Specialist review and caution context | Bullock 2021, McCutcheon 2025 |
| Release posture | Provisional | Repeatability and historical comparison | Giordano 2024 |
| Elbow varus/valgus torque proxy | Experimental | Load-context indicator only, not diagnosis | McCutcheon 2025, Peters 2025, Bullock 2021 |
| Ball velocity | Conditional | Performance context if reliable source exists | Peters 2025 |
| Shoulder total arc ROM relation | Provisional | ROM post-processing context | Ide 2024 |
| Thoracic rotation / trunk contralateral flexion relation | Experimental | ROM and elbow-load context | Okamura 2025 supplemental |

## 4. Evidence References

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

## 5. Display Rules

- Show raw values and ROM-adjusted values separately.
- Show confidence for the source tracking signals behind each metric.
- Show the evidence note and capture-context limitation for each metric.
- Do not convert torque-related proxies into injury predictions.
- Do not compare an athlete to a normative population unless the population and
  capture context are visible.
- Do not hide experimental metrics inside aggregate readiness, health, or risk
  scores.

## 6. Promotion Criteria

A candidate metric can move toward formal MVP status only when:

- the required keypoints and phases are reliably available from the selected
  markerless tracking pipeline;
- the calculation is versioned and reproducible;
- the evidence reference and applicable population are documented;
- the UI includes a plain-language caution for limitations;
- QA has test videos covering normal, low-confidence, failed, and re-analysis
  cases.
