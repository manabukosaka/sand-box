#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/codex-pr.sh --title "PR title" [options]
  .agents/scripts/codex-pr.sh --sports-motion-app --title "PR title" [options]

Pushes the current branch and creates or reports a GitHub PR.

Options:
  --title <title>       PR title. Required when creating a new PR.
  --overview <text>     Template Overview content. Required for new PRs.
  --decision <text>     Template ADR / Decision content. Required for new PRs.
  --security <text>     Template Security Check content. Required for new PRs.
  --vv <text>           Template V&V Status content. Required for new PRs.
  --evidence <text>     Template Screenshots / Logs content. Required for new PRs.
  --quality <text>      Template quality assurance content. Required for new PRs.
  --body <body>         Extra Codex notes appended after the filled template.
  --base <branch>       Base branch. Default: main.
  --sports-motion-app   Use Sports Motion App PR defaults and verification.
  --draft              Create PR as draft.
  --skip-verify        Skip local verification.
  --skip-verify-reason <text>
                       Required when skipping verification for Sports Motion App.
  --help, -h           Show this help.
EOF
}

die() {
  printf 'codex-pr: %s\n' "$*" >&2
  exit 1
}

require_pr_section() {
  local name="$1"
  local value="$2"
  if [[ ! "$value" =~ [^[:space:]] ]]; then
    die "--$name must not be blank"
  fi
  lower_value="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
  if [[ "$value" == *"<!--"* || "$value" == *"ADR-XXXX"* || "$lower_value" == *"todo"* || "$lower_value" == *"tbd"* ]]; then
    die "--$name still contains template placeholder content"
  fi
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
cd "$repo_root"

title=""
body=""
overview=""
decision=""
security=""
vv_status=""
evidence=""
quality=""
base="main"
draft=0
skip_verify=0
sports_motion_app=0
skip_verify_reason=""

while (($#)); do
  case "$1" in
    --title)
      (($# >= 2)) || die "--title requires a value"
      title="$2"
      shift 2
      ;;
    --body)
      (($# >= 2)) || die "--body requires a value"
      body="$2"
      shift 2
      ;;
    --overview)
      (($# >= 2)) || die "--overview requires a value"
      overview="$2"
      shift 2
      ;;
    --decision)
      (($# >= 2)) || die "--decision requires a value"
      decision="$2"
      shift 2
      ;;
    --security)
      (($# >= 2)) || die "--security requires a value"
      security="$2"
      shift 2
      ;;
    --vv)
      (($# >= 2)) || die "--vv requires a value"
      vv_status="$2"
      shift 2
      ;;
    --evidence)
      (($# >= 2)) || die "--evidence requires a value"
      evidence="$2"
      shift 2
      ;;
    --quality)
      (($# >= 2)) || die "--quality requires a value"
      quality="$2"
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
    --draft)
      draft=1
      shift
      ;;
    --skip-verify)
      skip_verify=1
      shift
      ;;
    --skip-verify-reason)
      (($# >= 2)) || die "--skip-verify-reason requires a value"
      skip_verify_reason="$2"
      shift 2
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

if (( sports_motion_app )); then
  overview="${overview:-Sports Motion App slice with process, product, implementation, tests, or V&V artifacts kept in sync.}"
  decision="${decision:-Sports Motion App process follows sports-motion-app/docs/development_process.md; durable architecture or product decisions are recorded in sports-motion-app/docs/ or ADRs when applicable.}"
  security="${security:-No production authentication, authorization, secrets, or external GitHub settings are changed by this preset. Athlete data, upload state, sharing scope, and evidence visibility must remain explicit when affected.}"
  vv_status="${vv_status:-Run npm test in sports-motion-app and .agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness before review. Evaluate review request timing from sports-motion-app/docs/development_process.md. Add mobile or UI evidence in sports-motion-app/docs/vv/ when behavior changes.}"
  evidence="${evidence:-Command output is sufficient for docs/process changes. Attach private screenshots, logs, or mobile V&V records when UI, mobile, upload, tracking, or sharing behavior changes.}"
  quality="${quality:-Sports Motion App docs, project plan, retrospective/planning notes, API/schema, tests, and V&V evidence are synchronized; volatile fixed counts are avoided; AI tracking and clinical-risk language remain appropriately constrained.}"
fi

if (( sports_motion_app && skip_verify )) && [[ ! "$skip_verify_reason" =~ [^[:space:]] ]]; then
  die "--skip-verify-reason is required with --sports-motion-app --skip-verify"
fi

branch="$(git branch --show-current)"
[[ -n "$branch" ]] || die "detached HEAD is not supported"
[[ "$branch" != "$base" ]] || die "refusing to create a PR from $base; create a '<type>/<issue-or-short-desc>' branch"
[[ "$branch" =~ ^(feature|feat|fix|docs|poc|chore|refactor|test|ci|build|perf|style)/[A-Za-z0-9._-]+$ ]] || die "branch must follow '<type>/<issue-or-short-desc>'"

if [[ -n "$(git status --porcelain=v1)" ]]; then
  die "working tree is not clean; commit or stash changes before creating a PR"
fi

git fetch origin "$base"
merge_base="$(git merge-base HEAD "origin/$base")"
base_oid="$(git rev-parse "origin/$base")"
[[ "$merge_base" == "$base_oid" ]] || die "branch is not based on origin/$base; rebase or merge origin/$base first"

existing_url="$(gh pr view --json url --jq .url 2>/dev/null || true)"
if [[ -n "$existing_url" ]]; then
  printf 'Existing PR: %s\n' "$existing_url"
  exit 0
fi

[[ -n "$title" ]] || die "--title is required when creating a new PR"
require_pr_section overview "$overview"
require_pr_section decision "$decision"
require_pr_section security "$security"
require_pr_section vv "$vv_status"
require_pr_section evidence "$evidence"
require_pr_section quality "$quality"

if (( ! skip_verify )); then
  if (( sports_motion_app )); then
    git diff --check
    .agents/scripts/verify.sh --sports-motion-app --hooks --skills --subagent-harness
  else
    .agents/scripts/verify.sh --all
  fi
fi

git push -u origin HEAD

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT
cat > "$body_file" <<EOF
## Overview
$overview

## ADR / Decision
$decision

## Security Check
$security

## V&V Status
$vv_status

## Screenshots / Logs
$evidence

---
**World-Class Quality Assurance:**
$quality
EOF

if [[ -n "$body" ]]; then
  {
    printf '\n## Codex Notes\n'
    printf '%s\n' "$body"
  } >> "$body_file"
fi

if (( sports_motion_app )); then
  {
    printf '\n## Sports Motion App Gates\n'
    printf 'Review request gates: Evaluate MVP scope, clinical/injury/performance wording, sharing/privacy/access control, metric promotion, mobile/cloud ADR decisions, process/helper changes, and merge approval before merge.\n'
    printf 'User merge approval: Pending before merge.\n'
    printf 'Planning/retrospective status: Updated or not applicable with reason.\n'
    if (( skip_verify )); then
      printf 'Skipped verification reason: %s\n' "$skip_verify_reason"
    fi
  } >> "$body_file"
fi

args=(--base "$base" --head "$branch" --title "$title" --body-file "$body_file")
if ((draft)); then
  args+=(--draft)
fi

gh pr create "${args[@]}"
