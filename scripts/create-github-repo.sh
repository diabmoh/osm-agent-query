#!/usr/bin/env bash
# Create https://github.com/diabmoh/osm-agent-query and push main.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Log in to GitHub as diabmoh:"
  gh auth login -h github.com -p https -w
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote remove origin
fi

gh repo create diabmoh/osm-agent-query \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "Structured OpenStreetMap MCP server for AI coding agents"

echo "Done: https://github.com/diabmoh/osm-agent-query"
