# Auricrux App — enterprise hardening audit

Audit of [`Auricrux/auricrux-app`](https://github.com/Auricrux/auricrux-app) at commit `987c2a0`
(`main`, 2026-08-01), assessing how close it is to the enterprise assistants it is positioned
against — Copilot, Gemini, Grok, Claude, and ChatGPT.

The fixes described here are supplied as an applicable patch series in [`patches/`](./patches),
because this repository is the only one the agent can push to. See
[Applying the patches](#applying-the-patches).

## Summary

`auricrux-app` is a real, working application, not scaffolding. It ships a Blazor Server web app, a
MAUI client for four platforms, an 80-entry grounded construction corpus, a bounded agent tool
loop, a deterministic construction calculator, vision intake, media generation, three conversation
memory backends, and a SQLite-backed freemium store — with 57 passing integration tests and green
CI. The construction specialisation is genuine and is the part peers do not have.

The gap to enterprise readiness was not missing features. It was that **the entire API served data
to anyone who asked**. There were no `[Authorize]` attributes anywhere in the codebase, and the only
identity signal was a `X-Auricrux-Email` request header that any caller could set, omit, or forge.

Every finding below was confirmed by running the application and issuing the request, not by reading
code alone. Every fix is covered by a regression test.

## What was exploitable

All verified live against the app running with `ASPNETCORE_ENVIRONMENT=Production`, exactly as the
shipped container runs it.

### 1. Anyone could grant themselves the top paid plan

`POST /api/account/{email}/upgrade` had no authentication and no payment verification.

```
$ curl -X POST .../api/account/victim@example.com/upgrade -d '{"plan":"pro-plus"}'
{"email":"victim@example.com","plan":"pro-plus","dailyQueryLimit":5000,...}
```

Pro Plus is listed at $79/month. Every paid tier was free to whoever asked for it, for any account.

### 2. Entitlements were opt-in for the caller

Model gating and quota metering only ran when the client chose to send `X-Auricrux-Email`. Omitting
it bypassed both.

```
with header, free plan, Pro-only model  -> 403 Forbidden      (gate works)
header omitted, same Pro-only model     -> 200 OK             (gate skipped)
account quota after those calls          -> queriesUsedToday: 0
```

A client that simply never identified itself got unlimited access to every model.

### 3. Any conversation was readable and exportable by session id

`GET /api/memory/{sessionId}` and `/export` were unauthenticated, and the session id was a global
key. Anything a session id was leaked to — a log, a referrer, a shared link — was a full transcript
disclosure.

### 4. The document workspace was fully public

`/api/workspace/*` allowed upload, listing, download, and recursive delete with no identity and no
tenancy. Uploaded bid documents were readable by anyone, and `DELETE` returned `204` for another
caller's folder.

### 5. The SSRF guard was bypassable with a DNS name

The guard string-matched hostnames, so any name resolving to a private address walked straight
through.

```
http://127.0.0.1:5099/...           -> BLOCKED
http://127.0.0.1.nip.io:5099/...    -> ALLOWED, returned the internal response body
```

`169.254.169.254.nip.io` resolved to the cloud metadata address and passed the filter too. Because
redirects were followed by the HTTP handler, a public URL could also bounce the fetch inward.

### 6. The documented API contract did not work

The server accepted enums only as integers. Both the string form documented in `README.md`
(`"thinkingMode": "Auto"`) and the camelCase form `AuricruxApiClient` actually serializes
(`"auto"`) returned `400`. Any MAUI chat request that set a thinking mode or search scope failed;
the web UI was unaffected because it calls services in-process.

## Capability parity: where Auricrux stood

The repo's own `/api/capabilities` matrix rates 17 feature rows against five peers. It is unusually
honest — it marks the fine-tuned weights `blocked` rather than claiming them. But it omitted the one
gap a user notices first.

**Response streaming was absent.** Every model call set `stream = false`. Copilot, Gemini, Grok,
Claude, and ChatGPT all render tokens as they are produced; Auricrux showed nothing until the answer
completed, which in Deep thinking mode is the whole latency budget. This was the single most visible
behavioural difference against the named peers, and it was not on the matrix.

## What the patches change

Three commits, 21 files, +2,022/−109. Verified to apply cleanly to a fresh clone of `main` with all
**124 tests passing** (57 pre-existing, unmodified, plus 67 new).

### Security posture resolved once at startup

`AuricruxSecurityOptions` collapses the question "may this caller touch data" into one decision,
logged on the first lines of the log:

| Posture | When | Behaviour |
|---|---|---|
| Open mode | Not Production, no auth configured | All callers share the `public` tenant; admin operations unguarded. Development and tests. |
| Authenticated | `Auth:Enabled` with an `Auth:Authority` | Caller identified from a validated token; isolated tenant partition each. |
| Production lockdown | Production, no auth configured | Account, memory, and workspace return `403` with remediation text. Health and inference keep working. |

This is why the 57 existing tests still pass unmodified: the test host is open mode, which is the
historical behaviour exactly.

**Availability was deliberately preserved.** Locking tenant data is a security fix. Locking
inference would change who the product is for, so `/api/chat` and friends stay open by default and
`Security:RequireAuthForInference` closes them when the operator decides to.

### Identity and tenancy

`CallerContext` derives the caller from a validated token when authentication is configured, and
honours the email header only in open mode. Storage is partitioned by a hashed tenant key, so a
session id or file path from another tenant resolves to a different partition and is simply absent
rather than forbidden. The `public` tenant keeps the existing on-disk layout, so single-tenant
deployments need no data migration.

Plan changes require an administrator: a constant-time `X-Auricrux-Admin-Key` comparison, an
`auricrux-admin` role claim, or a listed admin email.

### SSRF

`SsrfGuard` resolves the host and requires **every** returned address to be publicly routable —
rejecting loopback, RFC1918, carrier-grade NAT, link-local metadata, IPv6 unique-local, IPv4-mapped
IPv6, and the NAT64 prefix. Redirects are followed manually so each hop is revalidated, capped at
five. All eight bypass vectors above are now blocked; `https://example.com/` still fetches.

### Streaming

`POST /api/chat/stream` emits Server-Sent Events: a leading `sources` event so citations render
before any text, then `token` events, then `done` carrying the `interactionId` that
`POST /api/feedback/{id}` accepts. The corpus fallback path emits through the same contract, so the
stream shape holds when no local model is reachable.

### Other hardening

- Uploads validated against an extension allow-list and a size limit enforced **while copying**
  rather than trusted from the declared length, with partial files removed on rejection.
- Workspace root check compares against root plus a separator, so a sibling directory whose name
  merely starts with the root cannot pass.
- CSP drops `'unsafe-eval'` (Blazor Server does not need it) and adds `object-src`, `base-uri`,
  `form-action`. API responses marked `no-store`.
- Prompt length and conversation-history depth capped, so one request cannot drive unbounded
  upstream cost.
- Account reads return `404` rather than `403` for other people's accounts, so the endpoint cannot
  be used to enumerate which emails are registered.

## Applying the patches

```bash
git clone https://github.com/Auricrux/auricrux-app.git
cd auricrux-app
git checkout -b enterprise-hardening
git am /path/to/patches/*.patch
dotnet test Auricrux.Tests/Auricrux.Tests.csproj -c Release   # expect 124 passing
```

### Deploy checklist

1. Set `Security:AdminApiKey` from a secret store before deploying — without it, no one can change
   plans in a locked-down Production host.
2. Configure `Auth:Enabled`, `Auth:Authority`, `Auth:ClientId` to move from lockdown to real
   per-user tenancy.
3. Confirm the startup log does not report open mode or insecure production.
4. Note that enabling authentication moves each user to their own tenant partition; conversations
   and files created earlier live in the `public` partition and will need migrating if they must
   follow their owners.

## What is still open

These were found but not fixed, and are what still separates Auricrux from the named peers.

### Correctness and reliability

- **Unbounded interaction cache.** `ConstructionIntelligenceService._interactions` is a
  `Dictionary` that is never evicted — it grows for the process lifetime and is lost on restart, so
  feedback submitted after a restart returns `404`. Needs a bounded cache or persistence.
- **Feedback is not persisted.** `RecordFeedback` only writes a log line, so the star ratings the
  UI collects are not retrievable as data.
- **Rate limiting is per-IP only.** Behind a proxy or NAT every user shares one partition key. It
  should key on tenant and plan.

### Capability parity

- **Retrieval is substring matching, not semantic search.** `Score()` counts how many query terms
  appear as substrings in the entry text. There are no embeddings, no chunking, no reranking, and
  the 80-entry corpus is scanned linearly in memory. Peers use vector retrieval, and this is the
  weakest point in what is otherwise the product's strongest differentiator.
- **Uploaded documents are not readable by the assistant.** The workspace stores files; chat cannot
  retrieve from them. Document Q&A is table stakes for every peer.
- **Agent tool-calling is prompt-scraped, not native.** The planner asks for a JSON array and parses
  it out of prose, capped at four steps. Ollama supports native tool calling, which would be
  materially more reliable.
- **No token or cost accounting.** Quotas count queries per day, not tokens, so cost per tenant is
  not measurable.
- **No conversation branching, editing, or regeneration.**
- **Prompt-injection exposure.** Fetched page text in `/api/browse` and vision input are
  concatenated into model context without delimiting or instruction-stripping.

### Enterprise operations

- **No OpenAPI document**, so no generated clients and no contract testing.
- **No data-retention or deletion endpoints**, which GDPR and enterprise DSR obligations require.
- **No SCIM, group-to-role mapping, or tenant admin console.**
- **No structured JSON logging or OpenTelemetry traces** — logs are console text only.
- **Repository hygiene:** roughly 53 MB of build artifacts are committed
  (`artifacts/auricrux-release.apk` at 33 MB, `auricrux-web-deploy.zip` and
  `Auricrux.Web/auricrux-web-updated.zip` at ~10 MB each). These belong in releases or a registry.
  No credentials were found in tracked files.
- **Fine-tuned weights are still not live** — `auricrux-fca` is a system-prompt alias over a
  llama3.2-class base. The repo's own `CLAIMS_REGISTER.md` records this as AUX-017.

## Verification method

The application was built and run locally on .NET 10.0.302. Each finding was reproduced against a
live instance before the fix and re-tested after. The patch series was then applied to a clean clone
of `main` and the full suite run from scratch.

| Check | Result |
|---|---|
| Build (`Auricrux.Web`, `Auricrux.Shared`, `Auricrux.Eval`, `Auricrux.Tests`) | 0 errors |
| Pre-existing tests, unmodified | 57 passing |
| New regression tests | 67 passing |
| Patch series applied to clean `main` | applies cleanly, 124 passing |
| SSRF bypass vectors re-tested | 8 of 8 blocked, public fetch still works |
| Production lockdown re-tested | 6 of 6 previously exploitable requests refused |
| Availability under lockdown | health, chat, capabilities all `200` |

`Auricrux.Mobile` was not rebuilt locally because the MAUI workloads are not installed in this
environment; it is unaffected, as the changes touch only `Auricrux.Web` and `Auricrux.Tests`, and
the MAUI project depends on `Auricrux.Shared`, which is unchanged.
