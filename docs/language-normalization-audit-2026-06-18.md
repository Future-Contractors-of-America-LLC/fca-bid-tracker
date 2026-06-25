# FCA Language Normalization Audit â€” 2026-06-18

## Scope

This audit records completion of the requested language cleanup across the customer-facing shell and supporting route-map metadata:

1. Remove investor language from public-facing surfaces.
2. Remove "legacy customer" phrasing.
3. Ensure customer contact emails are active links and use approved aliases.

## Repository

- `Future-Contractors-of-America-LLC/fca-bid-tracker`
- Branch: `main`

## Completed Changes (By Commit)

### 1) Public build shell cleanup
- Commit: `32e6dd1be96b70064f0636dd12d7996a7f8f692a`
- File: `build.sh`
- Result:
  - Removed investor and legacy-customer phrasing from generated public pages.
  - Repositioned homepage narrative around end-to-end contractor lifecycle continuity.
  - Updated public email output to active `mailto:` links.

### 2) React shell messaging cleanup
- Commit: `4b2aba27bc9a899d6ce63c767a7b045309c7eb19`
- Files:
  - `src/websiteShell.js`
  - `src/pages/website/Home.jsx`
  - `src/components/ShellFooter.jsx`
  - `src/pages/website/Contact.jsx`
- Result:
  - Removed remaining customer-facing "legacy customer" language.
  - Standardized compatibility labels for non-canonical routes.
  - Switched public walkthrough and contact CTAs to approved aliases.

### 3) Route-map metadata normalization
- Commit: `c21c4544ced7658f74ca9c026c6c7f2b324679b4`
- File: `docs/fca-contractor-command-route-map.md`
- Result:
  - Replaced "legacy customer entry/status" wording with compatibility-route wording in route inventory documentation.

## Active Public Contact Aliases (Approved)

- `sales@futurecontractorsofamerica.com`
- `info@futurecontractorsofamerica.com`
- `support@futurecontractorsofamerica.com`

## Validation Notes

- Direct file checks on `refs/heads/main` confirm customer-facing React and generated-shell sources no longer carry the removed phrase set.
- GitHub code-search indexing can lag behind latest commits; stale snapshots may still appear in indexed previews temporarily.

## Packet Lock State

- Language normalization packet: **COMPLETE**
- Public alias normalization packet: **COMPLETE**
- Remaining work in this lane: **none required unless new copy introduces regression**
