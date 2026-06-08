# FCA Flagship Product Qualification Packet

Generated: 2026-06-08

## Product Decision

**Flagship product:** FCA Contractor Command

**Primary spine:**
- lead / opportunity intake
- qualification
- file and evidence handling
- bid / estimate workflow
- client portal access
- audit trail
- guided Auricrux assistance

## Why this packet exists

The current repository already contains strong route, state, governance, and deployment validation layers, but the public product story still risked reading as a broad ecosystem instead of a sellable first product. This packet tightens the public product narrative around the highest-priority commercial spine while preserving the broader FCA architecture for later expansion.

## Commercial target

**Primary buyer:** small-to-mid-size residential and light-commercial contractors who need a better way to:
- qualify inbound demand
- organize files and evidence
- coordinate bid and estimate work
- present a professional customer portal
- maintain an auditable decision trail

## Immediate product commitments

1. Public shell must sell Contractor Command as a real first product.
2. Workspace must continue validating authenticated continuity, file handling, bids, customer visibility, and audit posture.
3. Academy remains an acceleration layer, not the primary first-sale story.
4. Deployment workflows must remain governed by validation and live-state verification.

## Repo actions in this packet

- Fixed build-system validator wiring so the governed build can pass the live workspace route persistence check.
- Added missing admin governance script wiring already referenced by CI.
- Tightened public Home and Platform surfaces around the Contractor Command product spine.

## Next bounded build step

Advance the product from narrative clarity into a more explicit **qualification command surface** inside the authenticated workspace:
- qualification score / readiness state
- missing evidence prompts
- intake-to-bid conversion status
- customer-facing trust and next-action summary
