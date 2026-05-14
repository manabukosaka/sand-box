# Local Pose Models

Place MediaPipe Pose Landmarker `.task` files here for browser baseline runs.
Model binaries are intentionally not committed until licensing, size, and update
policy are approved.

Expected prototype file names:

- `pose_landmarker_lite.task`
- `pose_landmarker_full.task`
- `pose_landmarker_heavy.task`

The model selector in the PWA reads the registry in
`sports-motion-app/src/browserPoseAdapter.mjs`. To add or replace a model,
update that registry with a new `id`, `model_version`, and `model_asset_url`,
then keep the older entry until existing V&V evidence has been reviewed.

