#!/usr/bin/env bash
set -euo pipefail

# Verify a token can reach required cross-repo surfaces.
# Usage: verify-auricrux-token.sh [repo1 repo2 ...]
#
# Delegates to resolve-cross-repo-token.sh so CI tries AURICRUX_GITHUB_TOKEN,
# COPILOT_GITHUB_TOKEN, and GITHUB_TOKEN (github.token) in order.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -gt 0 ]; then
  exec bash "${SCRIPT_DIR}/resolve-cross-repo-token.sh" "$@"
fi

exec bash "${SCRIPT_DIR}/resolve-cross-repo-token.sh"
