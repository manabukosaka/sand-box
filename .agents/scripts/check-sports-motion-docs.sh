#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$repo_root"

fail=0

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "missing: $path" >&2
    fail=1
  fi
}

require_ref() {
  local path="$1"
  local pattern="$2"
  if [[ ! -f "$path" ]]; then
    return
  fi
  if ! grep -q "$pattern" "$path"; then
    echo "missing reference in $path: $pattern" >&2
    fail=1
  fi
}

require_no_ref() {
  local path="$1"
  local pattern="$2"
  if [[ ! -f "$path" ]]; then
    return
  fi
  if grep -n -E "$pattern" "$path"; then
    echo "forbidden wording in $path: $pattern" >&2
    fail=1
  fi
}

docs=(
  sports-motion-app/docs/requirements.md
  sports-motion-app/docs/architecture.md
  sports-motion-app/docs/api_schema.md
  sports-motion-app/docs/evidence_metrics.md
  sports-motion-app/docs/project_plan.md
  sports-motion-app/docs/development_process.md
  sports-motion-app/docs/planning/next_autonomous_slices.md
  sports-motion-app/docs/retrospectives/README.md
  sports-motion-app/docs/retrospectives/2026-05-07-development-process.md
  sports-motion-app/docs/vuv_checklist.md
  sports-motion-app/docs/tracking_feasibility_gate.md
  sports-motion-app/docs/tracking_shortlist.md
  sports-motion-app/docs/sample_video_manifest.md
  sports-motion-app/docs/metric_tracking_support_matrix.md
  sports-motion-app/docs/mobile_test_plan.md
  sports-motion-app/docs/native_field_prototype_spike.md
  sports-motion-app/docs/vv/README.md
  sports-motion-app/docs/vv/mobile_test_results_template.md
  sports-motion-app/docs/adr/README.md
  sports-motion-app/docs/adr/0001-hybrid-analysis-and-versioned-results.md
  sports-motion-app/docs/adr/0002-mobile-stack-for-field-prototype.md
)

for doc in "${docs[@]}"; do
  require_file "$doc"
done

require_file .agents/docs/product-boundaries.md
require_ref .agents/docs/repository-map.md "sports-motion-app/docs/requirements.md"
require_ref .agents/docs/repository-map.md "sports-motion-app/docs/api_schema.md"
require_ref .agents/docs/repository-map.md "sports-motion-app/docs/adr/"
require_ref .agents/docs/index.md "product-boundaries.md"
require_ref AGENTS.md "sports-motion-app/docs/"

require_ref sports-motion-app/docs/requirements.md "AI automatic tracking"
require_ref sports-motion-app/docs/requirements.md "ROM"
require_ref sports-motion-app/docs/requirements.md "Evidence"
require_ref sports-motion-app/docs/architecture.md "raw tracking"
require_ref sports-motion-app/docs/api_schema.md "AnalysisRun"
require_ref sports-motion-app/docs/evidence_metrics.md "Experimental"
require_ref sports-motion-app/docs/vuv_checklist.md "diagnosis"
require_ref sports-motion-app/docs/adr/README.md "0001"
require_ref sports-motion-app/docs/adr/README.md "0002"
require_ref sports-motion-app/README.md "docs/tracking_feasibility_gate.md"
require_ref sports-motion-app/README.md "docs/native_field_prototype_spike.md"
require_ref sports-motion-app/docs/tracking_feasibility_gate.md "docs/sample_video_manifest.md"
require_ref sports-motion-app/docs/tracking_feasibility_gate.md "docs/metric_tracking_support_matrix.md"
require_ref sports-motion-app/docs/mobile_test_plan.md "docs/vv/mobile_test_results_template.md"
require_ref sports-motion-app/docs/mobile_test_plan.md "PWA Smoke Scope"
require_ref sports-motion-app/docs/mobile_test_plan.md "retryable and unusable tracking failure"
require_ref sports-motion-app/docs/project_plan.md "prototype tracking adapter"
require_ref sports-motion-app/docs/project_plan.md "upload session"
require_ref sports-motion-app/docs/project_plan.md "share scope"
require_ref sports-motion-app/docs/project_plan.md "metric suppression"
require_ref sports-motion-app/docs/project_plan.md "development process"
require_ref sports-motion-app/docs/development_process.md "Maximum Autonomy Mode"
require_ref sports-motion-app/docs/development_process.md "User Review Request Gates"
require_ref sports-motion-app/docs/development_process.md "explicitly approved merge"
require_ref sports-motion-app/docs/development_process.md "PR/merge helpers"
require_ref sports-motion-app/docs/development_process.md "Review request gates are listed in the PR body"
require_ref sports-motion-app/docs/development_process.md "sub-agent"
require_ref sports-motion-app/docs/development_process.md "retrospective"
require_ref sports-motion-app/docs/development_process.md "planning"
require_ref sports-motion-app/docs/development_process.md "autonomous"
require_ref sports-motion-app/docs/planning/next_autonomous_slices.md "User review request gate"
require_ref sports-motion-app/docs/retrospectives/README.md "root causes"
require_ref sports-motion-app/docs/retrospectives/2026-05-07-development-process.md "Root Causes"
require_ref .agents/docs/sub-agent-harness.md "Sports Motion App Patterns"
require_ref .agents/docs/sub-agent-harness.md "Git/PR permission"
require_ref .agents/docs/session-controls.md "長時間の自律開発"
require_ref .agents/docs/session-controls.md "merge approval"
require_ref .agents/docs/harness-principles.md "最大自律"
require_ref sports-motion-app/docs/vv/mobile_test_results_template.md "Upload Session Checks"
require_ref sports-motion-app/docs/vv/mobile_test_results_template.md "Duplicate active upload sessions"
require_ref sports-motion-app/docs/vv/mobile_test_results_template.md "Failed tracking does not create analysis"
require_ref sports-motion-app/docs/vv/mobile_test_results_template.md "Suppressed metric reason renders"
require_ref sports-motion-app/docs/vv/mobile_test_results_template.md "Shared result omits excluded video/evidence"
require_ref sports-motion-app/docs/native_field_prototype_spike.md "Expo development builds"

if [[ -f sports-motion-app/package.json ]]; then
  (cd sports-motion-app && npm test)
fi

while IFS= read -r doc; do
  require_no_ref "$doc" "will[[:space:]]+(prevent|predict|guarantee|increase|reduce)|diagnos(e|es|ing)[[:space:]]|treat(s|ing)?[[:space:]]|rehab(ilitation)? plan|injury risk score|predict(s|ing)? injury|prevent(s|ing)? injury"
done < <(find sports-motion-app/docs -name '*.md' -type f | sort)

while IFS= read -r doc; do
  require_no_ref "$doc" "([0-9]+[[:space:]]+Node tests|[0-9]+/[0-9]+[[:space:]]+pass)"
done < <(
  {
    [[ -f sports-motion-app/README.md ]] && printf '%s\n' sports-motion-app/README.md
    [[ -f sports-motion-app/docs/project_plan.md ]] && printf '%s\n' sports-motion-app/docs/project_plan.md
    find sports-motion-app/docs -name '*.md' -type f | sort
  } | sort -u
)

exit "$fail"
