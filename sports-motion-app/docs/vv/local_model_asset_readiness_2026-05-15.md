# Local Model Asset Readiness Note

Date: 2026-05-15
Tester: Codex
Gate: WBS 7.1 local MediaPipe bundle/model readiness
Result: Blocked

This note defines the local asset inventory expected for the browser AI
baseline. It does not download model files and it does not change the runtime
bundle. The purpose is to make the inventory and replacement rules explicit
before any asset audit or promotion work.

## Expected Local Inventory

The browser baseline should have a text inventory that covers at least:

- MediaPipe runtime bundle path;
- MediaPipe wasm root path;
- Lite, Full, and Heavy task-file paths;
- model registry key;
- MediaPipe package or bundle version;
- task-file version or release label;
- checksum, preferably `sha256`;
- source or acquisition note;
- license or usage note;
- retirement status for any superseded file.

## Required Fields Per Asset

| Field | Purpose |
| --- | --- |
| `asset_id` or model key | Stable reference in docs and code |
| local path | Confirms the file expected on disk |
| version | Distinguishes task or bundle revision |
| checksum | Detects accidental replacement or drift |
| source note | Records where the asset came from |
| license note | Preserves usage constraints |
| status | Tracks active, superseded, or retired state |

## Replacement Procedure

Lite, Full, and Heavy are versioned replacement slots.

1. Add a new registry entry for the new model ID.
2. Keep the previous file and registry entry in place until V&V evidence is
   updated.
3. Record version, checksum, and license note in the inventory before the new
   model becomes the default baseline.
4. Update the shortlist and any model-readiness notes that name the preferred
   local asset.
5. Retire the old file only after the replacement is fully accepted.

## Current Blocker

- No local MediaPipe bundle/model inventory has been verified in this task.
- No assets were downloaded, copied, or added.
- WBS 7.1 remains blocked until the local files can be inventoried and matched
  to version, checksum, source, and license notes.

## Follow-On Evidence Needed

- local file presence check against the expected paths;
- checksum capture for each active asset;
- version/source/license note capture for each active asset;
- confirmation that Lite, Full, and Heavy registry entries still match the
  checked local files.
