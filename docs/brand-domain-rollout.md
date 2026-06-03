# FCA Brand and Domain Rollout

## Current intent
The FCA public shell should present as **Future Contractors of America** under the canonical domain:

- `https://futurecontractorsofamerica.com`

The Azure-generated Static Web Apps hostname should be treated as a temporary infrastructure address, not the public brand surface.

## Repo changes now in place
- Browser title and default metadata use Future Contractors of America branding.
- Route-level metadata now sets FCA-branded titles and descriptions.
- Canonical tags now point to `https://futurecontractorsofamerica.com`.
- The favicon and web manifest now present FCA branding instead of the default Vite placeholder.

## Azure Static Web Apps cutover checklist
1. Open the FCA Static Web App in Azure.
2. Add the custom domain `futurecontractorsofamerica.com`.
3. If Azure requires a validation record, create the requested DNS record at the domain host.
4. Add a `www` host only if desired for marketing use, then choose one hostname as canonical.
5. Enable HTTPS for the bound custom domain.
6. Verify the site resolves on the FCA hostname.
7. If both Azure and FCA hostnames remain live, redirect all public sharing and documentation to the FCA hostname.

## Validation targets after domain bind
- Home page resolves on the FCA domain.
- Deep links such as `/platform`, `/auricrux`, `/pricing`, `/contact`, and `/portal` still load correctly.
- Browser tab shows FCA branding rather than `fca_bid_tracker`.
- Shared links and screenshots use the FCA domain.

## Follow-on branding pass
When final logo assets are committed into the repo, replace the interim favicon with finalized FCA and Auricrux icon assets for:
- favicon
- social/share image set
- login/public-shell header branding
- app icon surfaces
