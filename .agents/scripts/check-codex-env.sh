#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$repo_root"

fail=0

check_path() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    echo "missing: $path" >&2
    fail=1
  fi
}

check_path AGENTS.md
check_path .agents/docs/index.md
check_path .agents/docs/operating-model.md
check_path .agents/docs/prompt-template.md
check_path .agents/docs/plans.md
check_path .agents/docs/code-review.md
check_path .agents/docs/quality-gates.md
check_path .agents/docs/model-policy.md
check_path .agents/scripts/verify.sh
check_path .agents/scripts/codex-checkpoint.sh
check_path .githooks/pre-commit

if [[ "$(git config --get core.hooksPath || true)" != ".githooks" ]]; then
  echo "warning: core.hooksPath is not .githooks; run .agents/scripts/install-git-hooks.sh" >&2
fi

if git diff --name-only -- .gemini GEMINI.md | grep -q .; then
  echo "error: Gemini files have uncommitted Codex-workflow changes" >&2
  fail=1
fi

exit "$fail"
