# FCA Domain Cutover Readiness

## Objective
Stage the repo so `futurecontractorsofamerica.com` can become the canonical public surface with correct metadata, crawl behavior, and share presentation.

## Implemented in this pass
- Added Open Graph metadata to the root document shell.
- Added Twitter/X metadata to the root document shell.
- Extended route-level metadata sync to update:
  - title
  - description
  - canonical URL
  - Open Graph title/description/url/image
  - Twitter title/description/image
- Added `robots.txt` with FCA sitemap reference.
- Added `sitemap.xml` for public and workspace shell routes.
- Added `social-card.svg` as the default branded share image.

## Result
When the custom domain is bound, the FCA shell is better prepared for:
- correct browser and crawler identity
- share previews
- canonical routing signals
- cleaner domain-first presentation

## Follow-on validation
After Azure custom-domain cutover:
1. Visit `https://futurecontractorsofamerica.com`.
2. Confirm browser tab and metadata reflect FCA branding.
3. Confirm `robots.txt` resolves.
4. Confirm `sitemap.xml` resolves.
5. Confirm shared links use the FCA social card and route-specific titles/descriptions.
6. Confirm all public screenshots and founder demo links use the FCA domain rather than the Azure hostname.
