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

# Prefer detached/main base, then import branch from bundle (or apply patch).
if git show-ref --verify --quiet refs/remotes/origin/main; then
  git checkout -f origin/main
elif git show-ref --verify --quiet refs/heads/main; then
  git checkout -f main
fi

if [[ -f "$BUNDLE" ]]; then
  echo "Importing bundle commit…"
  git fetch "$BUNDLE" "cursor/enterprise-harden-pr1-ad93:cursor/enterprise-harden-pr1-ad93"
  git checkout -f "cursor/enterprise-harden-pr1-ad93"
elif [[ -f "$PATCH" ]]; then
  echo "Applying patch…"
  git checkout -B "cursor/enterprise-harden-pr1-ad93"
  git apply "$PATCH"
  git add -A
  git -c user.email="${GIT_AUTHOR_EMAIL:-auricrux@futurecontractorsofamerica.com}" \
      -c user.name="${GIT_AUTHOR_NAME:-Auricrux}" \
      commit -m "Enterprise Harden PR-1: streaming, auth gate, SSRF, audit/moderation"
else
  echo "No patch or bundle found under $ROOT/patches"
  exit 1
fi

echo "Done. Next: dotnet test Auricrux.Tests -c Release && git push -u origin cursor/enterprise-harden-pr1-ad93"
