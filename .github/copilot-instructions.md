# FCA Bid Tracker — Copilot CLI instructions

## Scope

Customer-facing FCA shell (Vite + React). Backend spine and governance live in `auricrux-central` — align surfaces to that repo's law and coverage matrix.

## Build and verify

```powershell
npm install
npm run build
npm run smoke:central-spine
node scripts/validate-academy-catalog.mjs
node scripts/validate-academy-live-api.mjs
npm run qc:product
```

Dev server: `npm run dev`

## Canonical docs (backend source of truth)

Read from sibling `auricrux-central` when needed:

- `FCA_SYSTEM_LAW.md`
- `FCA_COVERAGE_MATRIX.md`
- `auricrux/system/do_teach_registry.json`

## Conventions

- **Academy sync**: after backend catalog regeneration, sync `src/academyCatalogTaxonomy.js` and `src/academyOfferings.js`.
- **Do→Teach CTAs**: shell surfaces must expose Auricrux Do/Teach actions where registry entries exist.
- **Portal routes**: How-To programs must map to `systemState.js` `portalModules` routes.
- **Canonical clone only**: use this GitHub repo, not OneDrive `-work` duplicates.
- **Minimal diffs**: match existing React/Vite patterns; no unrelated refactors.

## Cross-repo work

Backend API and Academy catalogs live in `auricrux-central`. For coordinated changes, use `/add-dir` with the full path to that repo.

## Workflow

- Use `/plan` for multi-surface UI or catalog changes.
- Run academy validators before proposing commits.
- Conventional commit messages; feature branches from `main`.
