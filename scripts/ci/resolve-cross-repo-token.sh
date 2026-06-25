#!/usr/bin/env bash
set -euo pipefail

# Resolve a GitHub token that can read the required repository(ies).
# Usage: resolve-cross-repo-token.sh <owner/repo> [owner/repo...]
#
# Tries, in order: AURICRUX_GITHUB_TOKEN, COPILOT_GITHUB_TOKEN, GITHUB_TOKEN
# (GITHUB_TOKEN is github.token in Actions when repo access is granted).
#
# On success writes cross_repo_token + token_source to GITHUB_OUTPUT and
# CROSS_REPO_TOKEN to GITHUB_ENV.

repos=("$@")
if [ "${#repos[@]}" -eq 0 ]; then
  repos=(
    "Future-Contractors-of-America-LLC/auricrux-central"
    "Future-Contractors-of-America-LLC/fca-bid-tracker"
  )
fi

can_read_repo() {
  local tok="$1" repo="$2"
  local response
  response="$(curl -sS -o /tmp/auricrux-token-check.json -w '%{http_code}' \
    -H "Authorization: Bearer ${tok}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${repo}")"
  if [ "${response}" = "200" ]; then
    echo "Token can read ${repo}."
    return 0
  fi
  echo "Token cannot read ${repo} (HTTP ${response})."
  jq -r '.message // .' /tmp/auricrux-token-check.json 2>/dev/null || true
  return 1
}

try_token() {
  local name="$1" tok="$2"
  [ -n "${tok}" ] || return 1
  for repo in "${repos[@]}"; do
    if ! can_read_repo "${tok}" "${repo}"; then
      echo "Skipping ${name} â€” missing access to ${repo}."
      return 1
    fi
  done
  echo "Using token source: ${name}"
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "::add-mask::${tok}"
    {
      echo "cross_repo_token=${tok}"
      echo "token_source=${name}"
    } >> "${GITHUB_OUTPUT}"
  fi
  if [ -n "${GITHUB_ENV:-}" ]; then
    {
      echo "CROSS_REPO_TOKEN=${tok}"
      echo "CROSS_REPO_TOKEN_SOURCE=${name}"
    } >> "${GITHUB_ENV}"
  fi
  return 0
}

for name in AURICRUX_GITHUB_TOKEN COPILOT_GITHUB_TOKEN GITHUB_TOKEN; do
  tok="${!name:-}"
  if try_token "${name}" "${tok}"; then
    exit 0
  fi
done

echo "::error::No configured token can read: ${repos[*]}"
echo "::error::Workflows in fca-bid-tracker use the AURICRUX_GITHUB_TOKEN secret stored on fca-bid-tracker (not auricrux-central)."
echo "::error::Either set the same cross-repo PAT on fca-bid-tracker, or grant this repo workflow access in auricrux-central: Settings -> Actions -> General -> Access."
exit 1
