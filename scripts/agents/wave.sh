#!/usr/bin/env bash
#
# Orchestrate a wave of parallel agents, one git worktree and branch each.
#
#   scripts/agents/wave.sh plan       foundations   # what would run, and where
#   scripts/agents/wave.sh setup      foundations   # create the worktrees + branches
#   scripts/agents/wave.sh launch     foundations   # setup, then run every agent in parallel
#   scripts/agents/wave.sh status     foundations   # branch / PR / AGENT_RESULT per agent
#   scripts/agents/wave.sh cleanup    foundations   # remove the worktrees (branches are kept)
#
# Waves are declared in wave_agents() below. Agents inside one wave run at the same time and must
# never share a working copy — that is what the worktrees are for.
#
# Logs land in .agents/logs/<id>.log; the last line of each is the agent's AGENT_RESULT.
# See docs/plan/04-agent-loop-protocol.md.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT_ROOT="$(dirname "$REPO_ROOT")"
LOG_DIR="$REPO_ROOT/.agents/logs"
BASE_BRANCH="${BASE_BRANCH:-next}"
AGENT_CMD="${AGENT_CMD:-claude}"

# wave name : "<agent id> <prompt path relative to docs/plan/>" per line
wave_agents() {
  case "$1" in
    foundations)
      cat <<'EOF'
F1 design-build/prompts/foundations/F1-tokens-and-globals.md
F2 design-build/prompts/foundations/F2-primitives-and-shared.md
F3 design-build/prompts/foundations/F3-motion-system.md
EOF
      ;;
    ui)
      cat <<'EOF'
U1 design-build/prompts/ui/U1-layout-shell.md
U2 design-build/prompts/ui/U2-home.md
U3 design-build/prompts/ui/U3-bio.md
U4 design-build/prompts/ui/U4-experiments.md
U5 design-build/prompts/ui/U5-projects.md
U6 design-build/prompts/ui/U6-contact-and-404.md
EOF
      ;;
    integration)
      echo "V1 design-build/prompts/integration/V1-visual-qa-and-polish.md"
      ;;
    wave-3)
      cat <<'EOF'
3.1 prompts/wave-3/3.1-seo-metadata.md
3.2 prompts/wave-3/3.2-quality-e2e-a11y-perf.md
3.3 prompts/wave-3/3.3-deploy-dry-run.md
EOF
      ;;
    wave-4)
      cat <<'EOF'
4.1 prompts/wave-4/4.1-cutover-production.md
4.2 prompts/wave-4/4.2-post-launch-verification.md
EOF
      ;;
    *)
      echo "unknown wave: $1" >&2
      echo "waves: foundations | ui | integration | wave-3 | wave-4" >&2
      return 1
      ;;
  esac
}

branch_of() { echo "agent/$1"; }
worktree_of() { echo "$WT_ROOT/wt-$1"; }

# Put the .nvmrc Node on PATH. Installing or building under an older Node silently resolves the
# wrong native bindings (rolldown ships per-platform binaries), and the agent then debugs a
# "Cannot find native binding" error that is really a version problem.
use_project_node() {
  local want current
  want="$(cat "$REPO_ROOT/.nvmrc")"
  current="$(node -v 2>/dev/null || echo none)"
  case "$current" in v"$want".*) return 0 ;; esac
  if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    nvm use "$want" >/dev/null 2>&1 || nvm install "$want" >/dev/null
  fi
  current="$(node -v 2>/dev/null || echo none)"
  case "$current" in
    v"$want".*) echo "· node $current" ;;
    *) echo "✗ node $want required (.nvmrc), found $current — install it or fix your PATH" >&2; exit 1 ;;
  esac
}

install_deps() {
  local wt="$1" id="$2"
  [ -d "$wt/node_modules" ] && return 0
  echo "· $id  pnpm install"
  (cd "$wt" && pnpm install --frozen-lockfile >/dev/null)
}

cmd_plan() {
  local wave="$1"
  printf '%-5s %-28s %s\n' AGENT WORKTREE PROMPT
  while read -r id prompt; do
    printf '%-5s %-28s %s\n' "$id" "$(basename "$(worktree_of "$id")")" "docs/plan/$prompt"
  done < <(wave_agents "$wave")
  echo
  echo "base: $BASE_BRANCH  ·  worktrees under: $WT_ROOT"
}

cmd_setup() {
  local wave="$1"
  use_project_node
  git -C "$REPO_ROOT" fetch origin
  while read -r id prompt; do
    local branch wt
    branch="$(branch_of "$id")"
    wt="$(worktree_of "$id")"
    if [ -d "$wt" ]; then
      echo "· $id  worktree exists: $wt"
    elif git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$branch"; then
      git -C "$REPO_ROOT" worktree add "$wt" "$branch"
      echo "✓ $id  $branch → $wt"
    else
      git -C "$REPO_ROOT" worktree add "$wt" -b "$branch" "origin/$BASE_BRANCH"
      echo "✓ $id  $branch → $wt"
    fi
    install_deps "$wt" "$id"
  done < <(wave_agents "$wave")
}

cmd_launch() {
  local wave="$1"
  cmd_setup "$wave"
  mkdir -p "$LOG_DIR"
  local pids=()
  while read -r id prompt; do
    local wt log
    wt="$(worktree_of "$id")"
    log="$LOG_DIR/$id.log"
    echo "▶ $id → $log"
    (
      cd "$wt"
      "$AGENT_CMD" -p "$(cat "docs/plan/$prompt")"
    ) >"$log" 2>&1 &
    pids+=($!)
  done < <(wave_agents "$wave")
  echo "waiting for ${#pids[@]} agents…"
  local failed=0
  for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
  echo
  cmd_status "$wave"
  return "$failed"
}

cmd_status() {
  local wave="$1"
  while read -r id prompt; do
    local branch pr log result state
    branch="$(branch_of "$id")"
    log="$LOG_DIR/$id.log"
    pr="$(gh pr list --head "$branch" --state all --json number,state \
          --jq 'if length == 0 then "" else "#\(.[0].number) \(.[0].state)" end' 2>/dev/null || true)"
    result="$(grep -h '^AGENT_RESULT' "$log" 2>/dev/null | tail -1 || true)"
    if [ -n "$result" ]; then
      state="$result"
    elif [ ! -s "$log" ]; then
      state="not started"
    elif pgrep -f "wt-$id" >/dev/null 2>&1; then
      state="running ($(wc -l <"$log" | tr -d ' ') lines)"
    else
      # Exited without a result line. Headless agents do this when they hit a
      # permission prompt nobody can answer — the last line says which tool.
      state="STALLED: $(tail -1 "$log" | cut -c1-70)"
    fi
    printf '%-5s %-12s %-14s %s\n' "$id" "$branch" "${pr:-no PR}" "$state"
  done < <(wave_agents "$wave")
}

cmd_cleanup() {
  local wave="$1"
  while read -r id prompt; do
    local wt
    wt="$(worktree_of "$id")"
    [ -d "$wt" ] || continue
    git -C "$REPO_ROOT" worktree remove "$wt" && echo "✓ removed $wt"
  done < <(wave_agents "$wave")
  git -C "$REPO_ROOT" worktree prune
}

main() {
  local action="${1:-}" wave="${2:-}"
  case "$action" in
    plan|setup|launch|status|cleanup)
      [ -n "$wave" ] || { echo "usage: $0 $action <wave>" >&2; exit 1; }
      "cmd_$action" "$wave"
      ;;
    *)
      sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 1
      ;;
  esac
}

main "$@"
