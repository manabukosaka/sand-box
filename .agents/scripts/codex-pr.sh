#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/codex-pr.sh --title "PR title" [options]

Pushes the current branch and creates or reports a GitHub PR.

Options:
  --title <title>       PR title. Required when creating a new PR.
  --body <body>         Extra PR body text appended after the template.
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

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
cd "$repo_root"

title=""
body=""
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

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT
if [[ -f .github/pull_request_template.md ]]; then
  cat .github/pull_request_template.md > "$body_file"
else
  : > "$body_file"
fi
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
