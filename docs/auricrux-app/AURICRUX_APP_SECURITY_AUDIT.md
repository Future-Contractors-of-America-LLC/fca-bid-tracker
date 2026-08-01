# Auricrux App — enterprise hardening and capability parity audit

**Target:** [`Auricrux/auricrux-app`](https://github.com/Auricrux/auricrux-app) @ `987c2a0`
(.NET 10 — Blazor Server web, MAUI mobile, shared client, eval harness)
**Date:** 2026-08-01
**Scope:** Security hardening and capability parity against ChatGPT, Claude, Gemini, Copilot, and Grok
**Outcome:** 5 critical and 6 high findings fixed; 6 commits; 143 tests passing, up from 57

> **Delivery note.** The work is complete, built, and tested, but it could not be pushed to
> `Auricrux/auricrux-app` — this agent's credential has no write access to the `Auricrux` account
> (`push: false`). The full change set is therefore delivered here as an appliable patch series in
> [`patches/`](patches/). See [APPLY.md](APPLY.md).

---

## Summary

`auricrux-app` was in better shape than its size suggests. The architecture is sound, the corpus
grounding is real rather than mocked, the freemium store is genuinely durable, and the
`CapabilitiesService` already tracked parity against the five named competitors honestly —
including marking the fine-tuned weights as blocked rather than claiming them.

What it did not have was an enforced trust boundary. Authorization existed as a concept
(`Auth:Enabled`, an OIDC pipeline, a `SecureController` that checks authentication) but was applied
to exactly one probe endpoint. Every other route — chat, agent, browse, vision, media, workspace,
memory, and account — was anonymous whether or not authentication was switched on. Because the
production configuration ships with `Auth:Enabled: false`, the live deployment was open.

Two consequences were directly exploitable by an unauthenticated caller:

- **Anyone could upgrade any account to the top paid tier.** `POST /api/account/{email}/upgrade`
  took no credential. One curl call moved any account to `pro-plus` — 5,000 daily queries and every
  premium model, for free.
- **Anyone could read the cloud instance metadata service.** The SSRF filter on `/api/browse`
  compared hostname *strings*, so any DNS name resolving into private space walked straight
  through. Verified against the running app: `http://127.0.0.1.nip.io:11434/` was fetched before
  the fix and is refused after it.

On capability parity, the matrix was accurate on features but omitted the most visible behavioural
gap: **nothing streamed.** Every model this app is benchmarked against streams its answer. Auricrux
called Ollama with `stream: false` everywhere, so a Deep-mode answer was indistinguishable from a
hang for its entire duration.

All of the above is fixed. Full detail: [`docs/SECURITY_HARDENING.md`](https://github.com/Auricrux/auricrux-app/blob/main/docs/SECURITY_HARDENING.md) in patch 0006.

---

## Findings

Severity reflects exploitability against the deployment as configured in
`appsettings.Production.json` (`Auth:Enabled: false`).

### Critical

| # | Finding | Detail | Fixed in |
|---|---|---|---|
| C1 | Unauthenticated plan upgrade | `POST /api/account/{email}/upgrade` accepted any caller. Direct revenue bypass to `pro-plus`. | 0001 |
| C2 | Entitlement bypass by omitting a header | `ResolveModel` returned early when `X-Auricrux-Email` was absent, so an unidentified caller got unlimited queries and every model. Present, the header was self-asserted and could name any account. | 0001 |
| C3 | Authorization not applied to the API | Only `/api/secure` checked authentication. With `Auth:Enabled: true`, chat, agent, browse, vision, media, workspace, memory, and account all stayed anonymous. | 0001 |
| C4 | Shared, unauthenticated file workspace | Every caller read and wrote one storage root. Any caller could list, download, or delete any other's uploads. | 0001 |
| C5 | Cross-session transcript disclosure | `GET /api/memory/{sessionId}` returned any session to anyone holding the id, with no ownership binding. | 0001 |

### High

| # | Finding | Detail | Fixed in |
|---|---|---|---|
| H1 | SSRF filter bypassable | Hostname string matching only. Any DNS name resolving to `169.254.169.254` or loopback passed; no IPv6 or IPv4-mapped coverage; redirects unvalidated, so a public URL could bounce into link-local space. | 0001 |
| H2 | Prompt injection into a tool-calling agent | Fetched page text was concatenated into the model prompt verbatim. A page could instruct the agent, which can call further tools. | 0001 |
| H3 | Rate limiting ineffective behind a proxy | Partitioned on `RemoteIpAddress` with no forwarded-header processing, so every caller behind the load balancer shared one bucket. No global backstop. | 0001 |
| H4 | Vulnerable dependency: SQLitePCLRaw | GHSA-2m69-gcr7-jv3q, via `Microsoft.Data.Sqlite` 8.0.11 — a .NET 8 package on a .NET 10 target. | 0005 |
| H5 | Vulnerable dependency: Microsoft.OpenApi | GHSA-v5pm-xwqc-g5wc. | 0005 |
| H6 | Account enumeration | `GET /api/account/{email}` disclosed plan and usage for any address. | 0001 |

### Medium

| # | Finding | Detail | Fixed in |
|---|---|---|---|
| M1 | Unbounded request bodies | Only workspace upload had a size limit; JSON endpoints accepted unbounded input. | 0001 |
| M2 | Log injection via correlation ID | `X-Correlation-Id` was reflected into logs and a response header unvalidated. | 0001 |
| M3 | Unbounded interaction map | A dictionary on a singleton grew with traffic for the process lifetime. | 0001 |
| M4 | Liveness probing upstreams | `/health` checks the model backend. Used as a liveness probe, a backend outage restarts every replica instead of degrading answers. | 0004 |
| M5 | Missing file returned 500 | `WorkspaceStorageService` threw on a missing path, so downloading an absent file was a 500 rather than a 404. | 0002 |
| M6 | No security scanning in CI | No dependency audit, CodeQL, or secret scanning. | 0005 |
| M7 | Insecure posture invisible | Nothing surfaced that a deployment was running open. | 0004 |

### Accepted as-is

- `AllowedHosts: "*"` and a CSP allowing `'unsafe-inline'`/`'unsafe-eval'` — both now warned about
  at startup, but tightening them requires deployment-specific values and Blazor Server testing
  beyond this scope.
- FCA account links held in memory and lost on restart, unlike accounts which are durable.
- A 33 MB APK and two ~10 MB zips committed to the repository.
- The MAUI head is untouched: it cannot be built or tested from this environment.

---

## What changed

| Patch | Change |
|---|---|
| 0001 | Caller identity and authorization: resolved principal, default-deny global filter, fail-closed plan changes, per-account isolation, resolved-address SSRF guard, prompt-injection isolation, rate-limit partitioning, correlation sanitization, bounded interaction map |
| 0002 | Regression coverage for every boundary above; fixes M5 |
| 0003 | Streaming chat over server-sent events |
| 0004 | OpenAPI contract, `/livez` and `/readyz`, security posture reporting |
| 0005 | Dependency advisories cleared; Security Scan workflow |
| 0006 | Security model, configuration reference, and streaming contract documented |

### The controlling design decision

`X-Auricrux-Email` is honoured **only** while `Auth:Enabled` is off. Once authentication is on, it
is ignored outright and identity comes from a validated token alone. This is what makes the other
fixes hold: without it, a caller could keep naming someone else's account to inherit their plan,
quota, and stored data regardless of how the individual endpoints were gated.

Authorization is a global MVC filter with an explicit `[AuricruxPublic]` opt-out, so a newly added
endpoint is protected by omission rather than exposed by it. It is a filter rather than
per-action `[Authorize]` so endpoints stay reachable in hosts that register no authentication
scheme, and so the decision reads live configuration.

### One deliberately breaking change

Plan changes are now fail-closed. An upgrade requires `Billing:ProvisioningKey` or an
authenticated administrator in `Auth:AdminEmails`; a deployment configuring neither returns `503`.
`Billing:AllowUnauthenticatedPlanChanges: true` restores the old behaviour for single-tenant
installs, and is reported as a warning at startup and in `/api/capabilities`.

**This will break any existing client that calls the upgrade endpoint without a credential.** That
is the point — but it needs a provisioning key configured before or with the deploy. The upgrade
integration test asserted the vulnerable behaviour, so it was replaced by coverage of the
provisioned path plus regressions for each refusal.

---

## Capability parity

The seven rows added to the matrix in patch 0004:

| Capability | Before | After |
|---|---|---|
| Streaming responses | Absent — `stream: false` everywhere | `POST /api/chat/stream`, SSE: sources, deltas, terminal metadata |
| Default-deny authorization | One endpoint | Every non-public route |
| Per-account data isolation | Shared storage | Workspace and memory partitioned per account |
| SSRF-safe retrieval | Hostname strings | Resolved addresses, per redirect hop |
| Prompt-injection isolation | None | Delimited and defanged before the model |
| Published API contract | None | `/openapi/v1.json`, 35 routes |
| Security posture reporting | None | `/api/capabilities` plus startup warnings |

Streaming was the substantive gap. The stream emits grounding sources first so a UI can show
provenance before the first token, then content deltas, then one terminal event carrying timings
and the interaction id feedback is posted against. When no model is reachable the corpus fallback
is chunked into the same event shape, so a client never branches on which path served the answer.

### Still behind the majors

Honest remaining gaps, roughly in order of how much they cost:

1. **Fine-tuned construction weights are not live.** Already tracked as blocked (AUX-017);
   `auricrux-fca` is a system-prompt alias over a general base model. This is the difference
   between a genuine domain moat and prompt engineering, and it is the highest-value remaining item.
2. **No structured tool-calling.** The agent planner asks the model for a JSON array and parses it
   out of prose. Native function-calling would be more reliable and would allow more tools.
3. **No sandboxed code execution.** `/api/calc` is a fixed set of construction formulas, correctly
   described in the matrix as "not a sandboxed Python notebook."
4. **No content safety classification** on model output.
5. **No distributed tracing or metrics.** Structured logging with correlation IDs only.
6. **Rate limits and quotas are per-process.** They will not hold correctly across replicas without
   a shared cache.

None of these are security defects; they are the remaining distance to full parity.

---

## Verification

Every change was built and tested against .NET 10.0.302, and the security-relevant behaviour was
also exercised against a running instance in Production mode rather than only under the test host.

```
Build:  succeeded, 0 errors
Tests:  143 passing, 0 failing  (baseline before this work: 57)
Audit:  dotnet list package --vulnerable → clean across all four projects
```

Live checks against the running app:

| Check | Result |
|---|---|
| `POST /api/account/{email}/upgrade`, no credential | `503` — refused |
| `POST /api/browse` → `169.254.169.254` | Refused: resolves to a non-public address |
| `POST /api/browse` → `127.0.0.1.nip.io` (the pre-fix bypass) | Refused: resolves to a non-public address |
| `POST /api/chat/stream` | Incremental SSE delivery confirmed |
| `GET /openapi/v1.json` | 35 routes, including the streaming endpoint |
| `GET /livez`, `GET /readyz` | `200` |
| Production startup | Warns on open auth, missing billing credential, and `AllowedHosts: "*"` |

Test coverage by area:

| Suite | Covers |
|---|---|
| `OutboundUrlGuardTests` | Private, loopback, link-local, CGNAT, multicast, IPv6 unique-local, IPv4-mapped; allow/deny lists |
| `UntrustedContentTests` | Instruction-override and role-impersonation defanging, forged delimiters, benign text unchanged |
| `TenantIsolationTests` | Workspace and memory isolation across all three backends; traversal rejection |
| `AuthEnabledTests` | Eleven routes deny anonymous callers; identity header carries no weight; discovery stays public |
| `BillingProvisioningTests` | Provisioned upgrade succeeds; missing and wrong keys refused |
| `ChatStreamingTests` | Event ordering, deltas reconstruct the answer, one interaction id, feedback resolves |
| `PlatformSurfaceTests` | OpenAPI contract, probes, posture warnings, correlation sanitization, SSRF via HTTP, security headers |

---

## Recommended next steps

1. **Apply the patch series** — see [APPLY.md](APPLY.md).
2. **Configure `Billing:ProvisioningKey` before or with the deploy**, or upgrades will return
   `503`. This is the one breaking change.
3. **Turn on `Auth:Enabled` with a real authority.** Until then the deployment is single-tenant by
   definition, because every caller shares the `anonymous` partition. The code is ready; this is
   configuration plus an identity provider.
4. **Set `Network:KnownProxies`** to the load balancer address, or per-caller rate limiting
   degrades to one shared bucket.
5. **Rotate any credential** that may have been exposed while the upgrade endpoint and SSRF hole
   were reachable. The SSRF issue in particular could reach the cloud instance metadata service,
   which on Azure and GCP can return managed-identity tokens.
6. **Grant write access** to the automation account on `Auricrux/auricrux-app` if this work should
   be delivered as pull requests directly in future, rather than as patches routed through this
   repository.
