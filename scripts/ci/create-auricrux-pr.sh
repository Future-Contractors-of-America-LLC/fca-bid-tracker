#!/usr/bin/env bash
set -euo pipefail

# Create an Auricrux autonomous PR via REST (avoids gh GraphQL PAT limitations).
# Usage: create-auricrux-pr.sh <base> <head> <title> <body> [label]

REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
BASE="${1:?base branch required}"
HEAD="${2:?head branch required}"
TITLE="${3:?title required}"
BODY="${4:?body required}"
LABEL="${5:-auricrux-automerge}"
OWNER="${REPO%%/*}"
HEAD_QUERY="${OWNER}:${HEAD}"

list_open_pr() {
  local token="$1"
  curl -fsS \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${REPO}/pulls?head=${HEAD_QUERY}&base=${BASE}&state=open" \
    | jq -r '.[0].number // empty'
}

create_pr_rest() {
  local token="$1"
  local payload response http_code pr_number

  payload="$(jq -n \
    --arg title "${TITLE}" \
    --arg head "${HEAD}" \
    --arg base "${BASE}" \
    --arg body "${BODY}" \
    '{title: $title, head: $head, base: $base, body: $body}')"

  response="$(curl -sS -w '\n%{http_code}' \
    -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${REPO}/pulls" \
    -d "${payload}")"

  http_code="$(echo "${response}" | tail -n1)"
  response="$(echo "${response}" | sed '$d')"

  if [ "${http_code}" = "201" ]; then
    pr_number="$(echo "${response}" | jq -r '.number')"
    echo "${pr_number}"
    return 0
  fi

  echo "${response}" | jq -r '.message // .errors // .' >&2
  return 1
}

add_label() {
  local token="$1"
  local pr_number="$2"
  curl -fsS -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${REPO}/issues/${pr_number}/labels" \
    -d "{\"labels\":[\"${LABEL}\"]}" >/dev/null
}

try_token() {
  local token="$1"
  local name="$2"
  local existing pr_number

  if [ -z "${token}" ]; then
    echo "${name} is not set; skipping."
    return 1
  fi

  existing="$(list_open_pr "${token}" 2>/dev/null || true)"
  if [ -n "${existing}" ]; then
    echo "Open PR #${existing} already exists for ${HEAD}"
    exit 0
  fi

  echo "Creating PR with ${name}..."
  if pr_number="$(create_pr_rest "${token}")"; then
    add_label "${token}" "${pr_number}" || echo "Warning: could not add label ${LABEL} to PR #${pr_number}"
    echo "Created PR #${pr_number} with ${name}"
    exit 0
  fi

  echo "${name} could not create the pull request."
  return 1
}

if try_token "${GITHUB_TOKEN:-}" "GITHUB_TOKEN"; then
  exit 0
fi

if try_token "${AURICRUX_GITHUB_TOKEN:-}" "AURICRUX_GITHUB_TOKEN"; then
  exit 0
fi

echo "::error::Could not create pull request for ${HEAD}."
echo "::error::Option A — Repo Settings → Actions → General → enable \"Allow GitHub Actions to create and approve pull requests\" (uses GITHUB_TOKEN)."
echo "::error::Option B — Set AURICRUX_GITHUB_TOKEN to a classic PAT with repo scope, or a fine-grained PAT with Pull requests Read and write on ${REPO}. Authorize SSO for the org if required."
exit 1
