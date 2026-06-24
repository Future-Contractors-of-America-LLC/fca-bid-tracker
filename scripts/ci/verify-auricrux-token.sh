#!/usr/bin/env bash
set -euo pipefail

# Verify AURICRUX_GITHUB_TOKEN can reach required cross-repo surfaces.
# Usage: verify-auricrux-token.sh [repo1 repo2 ...]

TOKEN="${AURICRUX_GITHUB_TOKEN:-${GITHUB_TOKEN:-}}"

if [ "$#" -gt 0 ]; then
  REPOS=("$@")
else
  REPOS=(
    "Future-Contractors-of-America-LLC/auricrux-central"
    "Future-Contractors-of-America-LLC/fca-bid-tracker"
  )
fi

if [ -z "${TOKEN}" ]; then
  echo "::error::AURICRUX_GITHUB_TOKEN is not set."
  echo "::error::Set an org secret with classic repo scope (SSO authorized) or enable workflow PR permissions for GITHUB_TOKEN."
  echo "::error::gh secret set AURICRUX_GITHUB_TOKEN --org Future-Contractors-of-America-LLC --visibility selected --repos auricrux-central,fca-bid-tracker"
  exit 1
fi

failures=0
for repo in "${REPOS[@]}"; do
  response="$(curl -sS -o /tmp/auricrux-token-check.json -w '%{http_code}' \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${repo}")"
  if [ "${response}" != "200" ]; then
    echo "::error::Token cannot read ${repo} (HTTP ${response})."
    jq -r '.message // .' /tmp/auricrux-token-check.json 2>/dev/null || true
    failures=$((failures + 1))
  else
    echo "Token can read ${repo}."
  fi
done

if [ "${failures}" -gt 0 ]; then
  echo "::error::AURICRUX_GITHUB_TOKEN failed ${failures} repository check(s)."
  echo "::error::Use a classic PAT with repo scope or a fine-grained PAT with Contents Read on required repos. Authorize SSO for the org."
  exit 1
fi

echo "AURICRUX token verification passed for ${#REPOS[@]} repository(ies)."