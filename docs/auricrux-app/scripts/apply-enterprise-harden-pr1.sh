#!/usr/bin/env bash
# Apply Enterprise Harden PR-1 onto a local clone of Auricrux/auricrux-app.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATCH="$ROOT/patches/enterprise-harden-pr1.patch"
BUNDLE="$ROOT/patches/enterprise-harden-pr1.bundle"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 /path/to/auricrux-app"
  exit 1
fi

if [[ ! -d "$TARGET/.git" ]]; then
  echo "Not a git repo: $TARGET"
  exit 1
fi

cd "$TARGET"
git fetch origin main 2>/dev/null || true
git checkout -B cursor/enterprise-harden-pr1-ad93 origin/main 2>/dev/null \
  || git checkout -B cursor/enterprise-harden-pr1-ad93 main

if [[ -f "$BUNDLE" ]]; then
  echo "Importing bundle commit…"
  git fetch "$BUNDLE" cursor/enterprise-harden-pr1-ad93:cursor/enterprise-harden-pr1-ad93
  git checkout cursor/enterprise-harden-pr1-ad93
else
  echo "Applying patch…"
  git apply "$PATCH"
fi

echo "Done. Next: dotnet test Auricrux.Tests -c Release && git push -u origin cursor/enterprise-harden-pr1-ad93"
