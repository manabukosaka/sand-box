#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$repo_root"

git config core.hooksPath .githooks
printf 'Configured git core.hooksPath=.githooks\n'
