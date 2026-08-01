# Auricrux App — Enterprise Peer Parity Matrix

**Repo:** [Auricrux/auricrux-app](https://github.com/Auricrux/auricrux-app)  
**Date:** 2026-08-01  
**Peers:** ChatGPT / Claude / Gemini / Microsoft Copilot / Grok  
**Source of truth in-app:** `GET /api/capabilities` (v1.3.0)

## Verdict

Auricrux already ships most major-player **capability surfaces**. This wave closes the remaining **enterprise UX / procurement** gaps that were still missing versus peers: streaming, projects, share links, content safety, audit trail, and an explicit no-train-by-default data-use policy.

Honest remaining gaps (do not soft-wash):

| Gap | Claim | Why blocked here |
|-----|-------|------------------|
| Promoted fine-tune weights | AUX-017 / AUX-018 FAIL | Founder-gated safe export of `checkpoint-70000` |
| Blind flagship quality bar | AUX-027 FAIL | Needs peer API keys + SME blind scoring (`eval/PEER_COMPARISON_RUBRIC.md`) |
| Live Kubernetes cutover | AUX-025 PARTIAL | Needs kubeconfig / cluster credentials |
| Store-signed iOS IPA | AUX-011 PARTIAL | Needs Apple Developer certs |

## Capability comparison (post Wave — 2026-08-01)

| Capability | Auricrux | ChatGPT | Claude | Gemini | Copilot | Grok |
|---|---|---|---|---|---|---|
| Multi-model chat | shipped | yes | yes | yes | yes | yes |
| Streaming SSE | **shipped** | yes | yes | yes | yes | yes |
| Construction specialist corpus | **shipped (moat)** | no | no | no | no | no |
| Thinking / reasoning modes | shipped | yes | yes | yes | partial | yes |
| Scoped knowledge search | shipped | partial | partial | partial | partial | partial |
| STT / TTS | shipped | yes | yes | yes | partial/yes | yes/partial |
| Memory + export | shipped | yes | yes | yes | yes | partial |
| Shareable conversation links | **shipped** | yes | yes | yes | partial | partial |
| Projects / custom instructions | **shipped** | yes | yes | partial | partial | no |
| Document workspace | shipped | partial | partial | partial | yes | no |
| Image / video generation | shipped | yes/partial | partial/no | yes/partial | yes/partial | partial/no |
| Enterprise OAuth/OIDC | shipped | yes | yes | yes | yes | partial |
| Freemium / entitlements | shipped | yes | yes | yes | partial | partial |
| Agentic tool-use | shipped | yes | yes | yes | yes | partial |
| Code interpreter (construction calc) | shipped | yes | partial | partial | partial | no |
| Live web browsing | shipped | yes | partial | yes | partial | yes |
| Vision / field photo → RFI | shipped | yes | yes | yes | partial | partial |
| Content safety moderation | **shipped** | yes | yes | yes | yes | partial |
| Audit + no-train enterprise policy | **shipped** | yes | yes | yes | yes | partial |
| Fine-tuned construction weights | **blocked** | no | no | no | no | no |

## New endpoints (this wave)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat/stream` | SSE progressive tokens |
| GET | `/api/starters` | Construction prompt starters |
| GET/POST/DELETE | `/api/projects` | Named workspaces + custom instructions |
| POST/GET | `/api/share` | TTL share tokens |
| GET | `/api/admin/audit` | Recent audit events |
| GET | `/api/enterprise/policy` | Procurement-facing data-use policy |

## Apply instructions

This cloud agent authenticated to `Future-Contractors-of-America-LLC/fca-bid-tracker` and **cannot push** to `Auricrux/auricrux-app` (403 for `cursor[bot]`).

To land the hardening:

1. Grant the Cursor cloud agent (or a PAT) **write** access to `Auricrux/auricrux-app`, **or** re-run this agent with that repo as the primary workspace.
2. Apply the patch from `docs/auricrux-app-enterprise-hardening/enterprise-peer-parity.patch` (also committed under this folder).
3. Run: `dotnet test Auricrux.Tests -c Release --filter Enterprise`
4. Deploy via existing GCP/Azure workflows; smoke `GET /api/capabilities` and confirm `version=1.3.0`.

## Founder-only next moves (cannot be closed by code alone)

1. Safe-export `checkpoint-70000` → promote AUX-017/018.
2. Provision OpenAI/Anthropic/Google keys in a permitted env → run blind peer suite → promote AUX-027.
3. Provide kubeconfig → promote AUX-025.
4. Apple signing → finish AUX-011 iOS store path.
