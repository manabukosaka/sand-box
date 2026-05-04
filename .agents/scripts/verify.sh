#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/verify.sh [--backend] [--frontend] [--skills] [--hooks] [--all]

Runs repeatable Codex verification checks for this repository.

Default: --backend --frontend --skills --hooks when corresponding files exist.
EOF
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$repo_root"

run_backend=0
run_frontend=0
run_skills=0
run_hooks=0
explicit=0

while (($#)); do
  case "$1" in
    --backend) run_backend=1; explicit=1; shift ;;
    --frontend) run_frontend=1; explicit=1; shift ;;
    --skills) run_skills=1; explicit=1; shift ;;
    --hooks) run_hooks=1; explicit=1; shift ;;
    --all) run_backend=1; run_frontend=1; run_skills=1; run_hooks=1; explicit=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) echo "verify: unknown argument: $1" >&2; exit 1 ;;
  esac
done

if (( ! explicit )); then
  [[ -f mini-datadog/Cargo.toml ]] && run_backend=1
  [[ -f mini-datadog/web/package.json ]] && run_frontend=1
  [[ -d .agents/skills ]] && run_skills=1
  [[ -d .githooks || -d .agents/scripts ]] && run_hooks=1
fi

if ((run_hooks)); then
  echo "==> Shell syntax"
  while IFS= read -r script; do
    bash -n "$script"
  done < <(find .agents/scripts .githooks -type f 2>/dev/null | sort)
fi

if ((run_skills)); then
  echo "==> Codex skills"
  validator="/home/manabukosaka/.codex/skills/.system/skill-creator/scripts/quick_validate.py"
  if [[ ! -f "$validator" ]]; then
    echo "verify: skill validator not found at $validator" >&2
    exit 1
  fi
  while IFS= read -r skill_dir; do
    python3 "$validator" "$skill_dir"
  done < <(find .agents/skills -mindepth 1 -maxdepth 1 -type d | sort)
fi

if ((run_backend)); then
  echo "==> Backend"
  (cd mini-datadog && cargo fmt --check)
  (cd mini-datadog && cargo clippy)
  (cd mini-datadog && cargo test)
fi

if ((run_frontend)); then
  echo "==> Frontend"
  if [[ ! -d mini-datadog/web/node_modules ]]; then
    echo "verify: skipping frontend checks because mini-datadog/web/node_modules is missing" >&2
  else
    (cd mini-datadog/web && npm run lint)
    (cd mini-datadog/web && npm run build)
  fi
fi
