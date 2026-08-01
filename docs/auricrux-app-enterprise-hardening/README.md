# Auricrux-app enterprise peer-parity hardening package

**Target repo:** https://github.com/Auricrux/auricrux-app  
**Personal account:** `Auricrux` (user)  
**Produced:** 2026-08-01 by Cursor cloud agent on `fca-bid-tracker` (no push rights to `Auricrux/auricrux-app`)

## Why this package lives here

The cloud agent for this run is authenticated to `Future-Contractors-of-America-LLC/fca-bid-tracker` only. Push/fork to `Auricrux/auricrux-app` returned **403**. The full hardening was implemented, tested (**65/65 PASS**), and packaged here for founder apply or a follow-up agent run with write access.

## Contents

| File | Purpose |
|------|---------|
| `ENTERPRISE_PEER_PARITY_MATRIX.md` | Honest capability matrix vs ChatGPT / Claude / Gemini / Copilot / Grok |
| `enterprise-peer-parity.patch` | `git format-patch` against `auricrux-app` `main` (apply with `git am`) |
| `APPLY.md` | Exact apply / verify / deploy steps |

## What shipped in the patch

- `POST /api/chat/stream` — SSE progressive tokens
- `/api/projects` — Claude Projects / Custom GPT-class custom instructions
- `/api/share` — TTL shareable conversation links
- Content safety gate on chat/agent/thinking
- Append-only audit trail + `/api/admin/audit`
- `/api/enterprise/policy` — no-train-by-default procurement posture
- `/api/starters` + Chat UI starters / regenerate / stop / sources / share
- Capabilities matrix **v1.3.0** + claims AUX-037–042

## Still FAIL (founder-gated — not soft-washed)

- AUX-017 / AUX-018 — fine-tune `checkpoint-70000` export
- AUX-027 — blind peer quality run (needs peer API keys + SME)
- AUX-025 — live k8s (needs kubeconfig)
- AUX-011 — store-signed iOS IPA (needs Apple certs)

## Unlock for direct PRs next time

Add the Cursor cloud GitHub App (or a write-capable collaborator) to `Auricrux/auricrux-app`, then re-run the agent with that repo as the workspace.
