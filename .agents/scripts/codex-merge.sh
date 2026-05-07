#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/codex-merge.sh [--pr <number>] [options]
  .agents/scripts/codex-merge.sh --sports-motion-app --pr <number> [options]

Merges an approved PR after checks pass. Requires explicit invocation.

Options:
  --pr <number>         PR number. Defaults to the current branch PR.
  --base <branch>       Base branch to sync after merge. Default: main.
  --sports-motion-app   Use Sports Motion App merge verification preset.
  --skip-local-verify   Skip local verify when the PR has no remote checks.
  --dry-run             Validate merge readiness without merging or switching branches.
  --help, -h            Show this help.
EOF
}

die() {
  printf 'codex-merge: %s\n' "$*" >&2
  exit 1
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
cd "$repo_root"

pr=""
base="main"
skip_local_verify=0
sports_motion_app=0
dry_run=0

while (($#)); do
  case "$1" in
    --pr)
      (($# >= 2)) || die "--pr requires a value"
      pr="$2"
      shift 2
      ;;
    --base)
      (($# >= 2)) || die "--base requires a value"
      base="$2"
      shift 2
      ;;
    --sports-motion-app)
      sports_motion_app=1
      shift
      ;;
    --skip-local-verify)
      skip_local_verify=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

command -v gh >/dev/null 2>&1 || die "GitHub CLI 'gh' is required"

if [[ -n "$(git status --porcelain=v1)" ]]; then
  die "working tree is not clean; commit or stash changes before merging"
fi

if [[ -z "$pr" ]]; then
  pr="$(gh pr view --json number --jq .number 2>/dev/null || true)"
  [[ -n "$pr" ]] || die "no PR found for current branch; pass --pr <number>"
fi

state="$(gh pr view "$pr" --json state --jq .state)"
is_draft="$(gh pr view "$pr" --json isDraft --jq .isDraft)"
review_decision="$(gh pr view "$pr" --json reviewDecision --jq '(.reviewDecision // "")')"
mergeable="$(gh pr view "$pr" --json mergeable --jq '(.mergeable // "")')"
merge_state="$(gh pr view "$pr" --json mergeStateStatus --jq '(.mergeStateStatus // "")')"
url="$(gh pr view "$pr" --json url --jq .url)"

[[ "$state" == "OPEN" ]] || die "PR #$pr is not open"
[[ "$is_draft" == "false" ]] || die "PR #$pr is draft"
[[ "$review_decision" == "APPROVED" ]] || die "PR #$pr must be approved before merge (reviewDecision=$review_decision)"
[[ "$mergeable" != "CONFLICTING" ]] || die "PR #$pr has merge conflicts"
case "$merge_state" in
  BLOCKED|DIRTY|UNKNOWN) die "PR #$pr merge state is not ready (mergeStateStatus=$merge_state)" ;;
esac

check_count="$(gh pr view "$pr" --json statusCheckRollup --jq '.statusCheckRollup | length')"
if [[ "$check_count" != "0" ]]; then
  failing_checks="$(gh pr view "$pr" --json statusCheckRollup --jq '[.statusCheckRollup[] | select((.conclusion != "SUCCESS") or (.status != "COMPLETED" and .status != null)) | .name] | join(", ")')"
  [[ -z "$failing_checks" ]] || die "PR #$pr has non-passing checks: $failing_checks"
fi

if (( sports_motion_app )); then
  body="$(gh pr view "$pr" --json body --jq '(.body // "")')"
  [[ "$body" == *"Review request gates:"* ]] || die "Sports Motion App PR body must include 'Review request gates:'"
  [[ "$body" == *"User merge approval:"* ]] || die "Sports Motion App PR body must include 'User merge approval:'"
  [[ "$body" == *"Planning/retrospective status:"* ]] || die "Sports Motion App PR body must include 'Planning/retrospective status:'"
  [[ "$body" != *"User merge approval: Pending before merge."* ]] || die "Sports Motion App PR requires explicit user merge approval before merge"
fi

if (( ! skip_local_verify )); then
  if (( sports_motion_app )); then
    git diff --check
    .agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
  elif [[ "$check_count" == "0" ]]; then
    .agents/scripts/verify.sh --all
  fi
fi

printf 'Merging approved PR #%s: %s\n' "$pr" "$url"
if (( dry_run )); then
  printf 'Dry run only; no merge or branch sync performed.\n'
  exit 0
fi
gh pr merge "$pr" --merge --delete-branch
git fetch origin "$base"
git switch "$base"
git pull --ff-only origin "$base"
