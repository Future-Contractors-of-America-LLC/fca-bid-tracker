# FCA Public Shell — June 11, 2026 Validation Report

_Last updated: 2026-06-11_

## Validation Objective

Validate the current FCA public shell against the locked June 11 checkpoint and identify the highest-probability next corrective move.

## Validation Method

### Deployment truth inspected
- `https://www.futurecontractorsofamerica.com/`
- `https://www.futurecontractorsofamerica.com/platform`
- `https://www.futurecontractorsofamerica.com/pricing`
- `https://www.futurecontractorsofamerica.com/auricrux`
- `https://www.futurecontractorsofamerica.com/contact`

### Repository truth inspected
- `main` at `f493ab6039a4470802c5b591c62c998a6a4f7d40`
- `src/components/PublicTopNav.jsx`
- `src/pages/website/Pricing.jsx`
- `src/pages/website/Contact.jsx`
- `src/websiteShell.js`

## Result Summary

### PASS — locked repo checkpoint still exists
The June 11 recovery line remains intact on `main` and is still the correct resume point.

### PASS — public shell still exposes the intended route family
The custom domain resolves at the intended public routes for home, platform, pricing, Auricrux, and contact.

### PASS — repo navigation still includes `Home`
`src/components/PublicTopNav.jsx` still explicitly includes `Home` in the public primary nav.

### PASS — pricing posture still preserves low / mid / growth / enterprise spread
The repo still includes:
- Startup Workspace — `$99/mo`
- Pilot Workspace — `$2,500 one-time`
- Team Workspace — `$499/mo`
- Operations Workspace — `$899/mo`
- Growth Platform — `$1,500/mo`
- Enterprise Rollout — `$3,500+/mo`

This preserves the intended lower / mid / growth / enterprise commercial shape.

### PASS — FCA remains the primary public brand and Auricrux remains embedded
The active pricing and contact surfaces still use FCA brand framing and Auricrux as an embedded operating layer rather than replacing the parent FCA brand.

### FAIL — public contact alias policy was not fully aligned in repo truth
The locked public-contact policy requires the public aliases to stay limited to:
- `sales@futurecontractorsofamerica.com`
- `info@futurecontractorsofamerica.com`
- `support@futurecontractorsofamerica.com`

However, repo truth still contained public `mailto:` links pointing to `hello@futurecontractorsofamerica.com` in:
- `src/pages/website/Contact.jsx`
- `src/websiteShell.js`

## Decision

The highest-probability move after validation is:

1. keep the June 11 shell lock in place
2. correct the public contact alias drift immediately
3. avoid broader shell editing
4. return to the flagship product spine after this correction

## Immediate Remediation Applied In This Packet

This packet aligns all customer-facing walkthrough and pricing-contact mail links to the approved public alias set by switching them to `sales@futurecontractorsofamerica.com`.

## Next Step After Merge

Return to the flagship build spine:

1. Project / Job spine
2. File ingestion and versioning
3. Auricrux document briefing
4. Audit continuity

No broader website expansion should outrank that sequence unless deployment truth breaks again.
