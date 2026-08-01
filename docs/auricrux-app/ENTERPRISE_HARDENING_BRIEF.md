# Auricrux App — Enterprise Hardening Brief

**Date:** 2026-08-01  
**Target repo:** [`Auricrux/auricrux-app`](https://github.com/Auricrux/auricrux-app)  
**Source of this packet:** prepared in cloud agent on `fca-bid-tracker` because the agent token cannot push to the personal `Auricrux` account.

## Location confirmed

| Field | Value |
|-------|-------|
| GitHub | https://github.com/Auricrux/auricrux-app |
| Owner | Personal account `Auricrux` (not FCA org) |
| Stack | .NET 10 — Blazor Server (`Auricrux.Web`) + MAUI (`Auricrux.Mobile`) + Shared |
| Live claims | `CLAIMS_REGISTER.md` — 36→42 claims after this patch |

## Parity verdict vs ChatGPT / Claude / Gemini / Copilot / Grok

**Already real in code (pre-patch):** multi-model chat, thinking modes, scoped corpus search, STT/TTS, memory+export, workspace, media, OIDC plumbing, freemium, browse/agent/calc/vision, security headers, rate limits, correlation IDs, construction eval 30/30.

**Still FAIL (founder-gated, not in this patch):**

- **AUX-017 / AUX-018** — promoted fine-tune weights (`checkpoint-70000`) not exported into product Ollama
- **AUX-027** — blind peer quality comparison needs OpenAI/Anthropic/Google keys + SME rating

**Closed or hardened in Enterprise Harden PR-1 (this packet):**

| Gap | Fix |
|-----|-----|
| No SSE streaming | `POST /api/chat/stream` |
| Auth only on `/api/secure/ping` | `ProductAuthMiddleware` gates `/api` + `/media` when `Auth:Enabled` |
| Spoofable `X-Auricrux-Email` under Auth | `PrincipalResolver` prefers JWT claims |
| Free unauthenticated upgrade under Auth | Requires matching principal or `Commerce:UpgradeKey` |
| SSRF residual (redirects / DNS / IPv6 ULA) | No redirects + DNS deny + CGNAT/ULA blocks |
| No moderation / audit | Deny-list + PII redact + JSONL audit |
| Shared workspace tenancy | `_tenants/{principal}` when Auth on |
| Broken feedback InteractionId | Client uses server id |
| History dropped user turns | User+assistant multi-turn |
| Citations/thinking not shown | Chat.razor renders both |

## How to apply to `Auricrux/auricrux-app`

This cloud agent **cannot push** to `Auricrux/auricrux-app` (`cursor[bot]` 403). Apply from a machine/account with write access (your laptop or a Cursor agent launched **on that repo**):

```bash
git clone https://github.com/Auricrux/auricrux-app.git
cd auricrux-app
git checkout -b cursor/enterprise-harden-pr1-ad93

# Option A — patch
git apply path/to/fca-bid-tracker/docs/auricrux-app/patches/enterprise-harden-pr1.patch

# Option B — bundle (preferred; preserves commit)
git fetch ../fca-bid-tracker/docs/auricrux-app/patches/enterprise-harden-pr1.bundle \
  cursor/enterprise-harden-pr1-ad93:cursor/enterprise-harden-pr1-ad93
git checkout cursor/enterprise-harden-pr1-ad93

dotnet test Auricrux.Tests -c Release
git push -u origin cursor/enterprise-harden-pr1-ad93
# open PR into Auricrux/auricrux-app main
```

Or launch a new Cloud Agent with repo set to **`Auricrux/auricrux-app`** and point it at this brief + patch.

## Recommended next PR (PR-2) after apply

1. Wire Blazor/mobile UI to consume SSE stream live  
2. File-grounded chat (read workspace docs into prompt)  
3. Projects entity (ChatGPT/Claude Projects parity)  
4. Deeper agent loop + optional sandbox calc/Python  
5. Real billing webhook (replace free upgrade in production)  
6. Founder: export checkpoint-70000 (AUX-017/018) + run peer rubric (AUX-027)

## Patch artifacts in this repo

- `docs/auricrux-app/patches/enterprise-harden-pr1.patch`
- `docs/auricrux-app/patches/enterprise-harden-pr1.bundle`
- `docs/auricrux-app/scripts/apply-enterprise-harden-pr1.sh`
