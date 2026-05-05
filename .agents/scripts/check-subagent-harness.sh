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
  if ! grep -q "$pattern" "$path"; then
    echo "missing reference in $path: $pattern" >&2
    fail=1
  fi
}

require_file .agents/docs/sub-agent-harness.md
require_file .agents/docs/role-map.md
require_file .agents/docs/session-controls.md
require_file .agents/docs/model-policy.md
require_file .agents/docs/plans.md

if [[ -f .agents/docs/sub-agent-harness.md ]]; then
  require_ref .agents/docs/sub-agent-harness.md "Handoff Packet"
  require_ref .agents/docs/sub-agent-harness.md "Parent Integration Checklist"
fi

require_ref .agents/docs/role-map.md "sub-agent-harness.md"
require_ref .agents/docs/session-controls.md "sub-agent-harness.md"
require_ref .agents/docs/model-policy.md "sub-agent-harness.md"
require_ref .agents/docs/plans.md "Delegation"

gemini_command_matches="$(mktemp)"
trap 'rm -f "$gemini_command_matches"' EXIT

if grep -R -n -E 'invoke_agent|activate_skill' .agents/docs .agents/skills >"$gemini_command_matches"; then
  cat "$gemini_command_matches" >&2
  echo "error: Gemini-specific delegation commands found in Codex harness docs or skills" >&2
  fail=1
fi

exit "$fail"
