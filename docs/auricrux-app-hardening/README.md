# Auricrux App enterprise hardening — handoff package (2026-08-01)

Target repo: [`Auricrux/auricrux-app`](https://github.com/Auricrux/auricrux-app) (personal
Auricrux account). This cloud agent's GitHub credentials are scoped to the
`Future-Contractors-of-America-LLC` org, so the work could not be pushed to that repo
directly (push denied for `cursor[bot]`). The full implementation is delivered here as
apply-ready git patches, verified against a clean clone of `auricrux-app@main`
(commit as of 2026-08-01): **build clean, 77/77 tests passing, vulnerable-package sweep clean**.

## What the patches do

1. `0001-…SSE-streaming…` — **peer-parity capabilities**
   - `CloudModelGateway`: optional cloud frontier-model connectors for OpenAI,
     Anthropic (Claude), Google Gemini, xAI (Grok), and Azure OpenAI. Provider-prefixed
     model names (`openai:gpt-4o-mini`, `anthropic:claude-sonnet-4-5`, `gemini:…`,
     `xai:grok-3`, `azure:<deployment>`); dark until API keys are configured via
     `Auricrux:Providers:*:ApiKey` or conventional env vars. Ollama stays default.
   - `POST /api/chat/stream`: SSE token streaming (deltas + terminal metadata event),
     Ollama `stream:true`, streaming Blazor chat UI, streaming API client for MAUI/web.
   - Fixes the conversation-history bug (assistant-only turns → chronological
     user/assistant pairs).
2. `0002-…security-hardening…` — **enterprise security posture**
   - Deny-by-default authorization for all `/api` endpoints when `Auth:Enabled`
     (fail-closed middleware + endpoint conventions; health/models/capabilities/plans
     stay public).
   - Billing-key-gated plan upgrades (closes anonymous self-upgrade to paid plans).
   - FCA account links + star-rating feedback persisted to SQLite (survive restarts).
   - CSP tightened (drops `unsafe-eval`), 16 MB request body cap,
     `Microsoft.Data.Sqlite` 8.0.11 → 10.0.10, SQLitePCLRaw bundle 3.0.5
     (clears GHSA-2m69-gcr7-jv3q high-severity advisory).
3. `0003-…Document…` — hardening changelog (`docs/ENTERPRISE_HARDENING_2026-08-01.md`)
   and README feature-list update.

Twenty new tests accompany the changes (streaming contract, auth gating, cloud gateway
routing, durability, billing key).

## How to apply (from the Primary machine, or any machine with push access)

```bash
git clone https://github.com/Auricrux/auricrux-app
cd auricrux-app
git checkout -b enterprise-hardening
git am path/to/docs/auricrux-app-hardening/*.patch
dotnet test AuricruxApp.sln   # expect 77/77 passing
git push -u origin enterprise-hardening
```

Then open a PR on `auricrux-app` (or push straight to `main` per that repo's workflow).

## To let cloud agents work on auricrux-app directly next time

Grant the Cursor GitHub App access to the `Auricrux` account/repositories
(GitHub → Settings → Applications → Cursor → repository access, or from the Cursor
dashboard), then launch the agent with `auricrux-app` as the workspace repo.
