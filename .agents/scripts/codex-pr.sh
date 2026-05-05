#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/codex-pr.sh --title "PR title" [options]

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
  --draft              Create PR as draft.
  --skip-verify        Skip local .agents/scripts/verify.sh --all.
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
  if [[ "$value" == *"<!--"* || "$value" == *"ADR-XXXX"* || "$value" == "TODO"* || "$value" == "TBD" ]]; then
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
    --draft)
      draft=1
      shift
      ;;
    --skip-verify)
      skip_verify=1
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

if (( ! skip_verify )); then
  .agents/scripts/verify.sh --all
fi

git push -u origin HEAD

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

args=(--base "$base" --head "$branch" --title "$title" --body-file "$body_file")
if ((draft)); then
  args+=(--draft)
fi

gh pr create "${args[@]}"
