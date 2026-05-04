#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .agents/scripts/codex-checkpoint.sh --message "type(scope): subject" [options]

Creates a safe, explicit checkpoint commit for Codex work.

Default behavior:
  - commits only already staged changes
  - refuses to include GEMINI.md or .gemini/
  - refuses non-Conventional Commit messages

Options:
  --message, -m <msg>   Commit message. Required unless --auto-message is used.
  --auto-message        Use a conservative generated checkpoint message.
  --paths <paths...>    Stage only the listed paths before committing.
  --all                 Stage all changes except GEMINI.md and .gemini/.
  --dry-run             Show what would be committed without committing.
  --no-verify           Pass --no-verify to git commit.
  --help, -h            Show this help.

Examples:
  .agents/scripts/codex-checkpoint.sh -m "chore(codex): add checkpoint automation" --paths .agents AGENTS.md
  .agents/scripts/codex-checkpoint.sh -m "docs(agents): refresh codex skill map"
EOF
}

die() {
  printf 'codex-checkpoint: %s\n' "$*" >&2
  exit 1
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
cd "$repo_root"

message=""
auto_message=0
dry_run=0
no_verify=0
stage_all=0
declare -a paths=()

while (($#)); do
  case "$1" in
    --message|-m)
      (($# >= 2)) || die "--message requires a value"
      message="$2"
      shift 2
      ;;
    --auto-message)
      auto_message=1
      shift
      ;;
    --paths)
      shift
      while (($#)) && [[ "$1" != --* ]]; do
        paths+=("$1")
        shift
      done
      ;;
    --all)
      stage_all=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --no-verify)
      no_verify=1
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

if [[ -z "$message" ]]; then
  if ((auto_message)); then
    message="chore(codex): checkpoint work"
  else
    die "commit message is required; use --message or --auto-message"
  fi
fi

if ! [[ "$message" =~ ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._-]+\))?!?:\ .+ ]]; then
  die "message must follow Conventional Commits, e.g. chore(codex): checkpoint work"
fi

if ((stage_all)) && ((${#paths[@]})); then
  die "use either --all or --paths, not both"
fi

if ((stage_all)); then
  mapfile -t changed_paths < <(git status --porcelain=v1 --untracked-files=all | sed -E 's/^...//' | sed -E 's/^.* -> //')
  declare -a stageable=()
  for path in "${changed_paths[@]}"; do
    [[ -z "$path" ]] && continue
    case "$path" in
      GEMINI.md|.gemini|.gemini/*) ;;
      *) stageable+=("$path") ;;
    esac
  done
  ((${#stageable[@]})) && git add -- "${stageable[@]}"
elif ((${#paths[@]})); then
  for path in "${paths[@]}"; do
    case "$path" in
      GEMINI.md|.gemini|.gemini/*) die "refusing to stage Gemini path: $path" ;;
    esac
  done
  git add -- "${paths[@]}"
fi

if git diff --cached --quiet; then
  die "no staged changes to commit"
fi

if git diff --cached --name-only | grep -Eq '^(GEMINI\.md|\.gemini/)' ; then
  die "staged changes include Gemini files; unstage them or set up a separate explicit Gemini workflow"
fi

printf 'Checkpoint commit candidate:\n'
printf '  message: %s\n' "$message"
git diff --cached --stat

if ((dry_run)); then
  printf 'Dry run only; no commit created.\n'
  exit 0
fi

commit_args=(-m "$message")
if ((no_verify)); then
  commit_args+=(--no-verify)
fi

git commit "${commit_args[@]}"
