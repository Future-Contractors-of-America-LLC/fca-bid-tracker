# Copilot Rate Limit Fallback

## Trigger

If GitHub Copilot or a connected agent returns `ErrorToo Many Requests`, do not treat that as a blocker for FCA continuity work.

## Required fallback posture

1. Continue repository-native execution through GitHub MCP where available
2. Continue bounded continuity investigation through public verification routes
3. Continue documenting Azure-side remediation steps in canonical docs and issues
4. Continue shipping repo-side fixes directly to `main`

## Operational interpretation

A Copilot rate-limit event is a tool-capacity issue, not evidence that the repository or deployment path is healthy. It should not pause continuity work.

## Escalation rule

Only escalate for user action when the remaining blocker is outside repo mutation scope, such as:

- Azure custom-domain binding
- Azure resource-to-repo linkage
- Azure deployment token refresh
- DNS ownership/verification
- tenant-level permission constraints

Even when escalation is required, repo-native work should continue in parallel.
