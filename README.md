# FCA Bid Tracker

`fca-bid-tracker` is the primary customer-facing shell for the FCA system.
It carries the highest-leverage public website, portal, academy, comms, and bid-workspace continuity paths.

## Canonical Governance Source

This repository should align to the canonical governance artifacts in `Future-Contractors-of-America-LLC/auricrux-central`:

- `FCA_SYSTEM_LAW.md`
- `FCA_BUILD_SEQUENCE.md`
- `FCA_RUNTIME_TRIGGER_CATALOG.md`
- `FCA_COVERAGE_MATRIX.md`
- `FCA_SYSTEM_INVENTORY.md`
- `FCA_REPO_ALIGNMENT.md` in this repo for shell-specific alignment notes

## Repo Role

This repo is the main execution surface for:

- public website conversion routes
- platform and portal continuity
- bid workspace UX
- academy integration
- customer messaging and support continuity
- embedded Auricrux operating surfaces

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

If present in `package.json`, use the repo-standard validation command:

```bash
npm run build:system
```

## Execution Priority

The highest-value implementation direction in this repo is continuity-first work, especially:

1. customer-friendly public messaging
2. route and CTA consistency
3. project / job anchoring
4. file / evidence readiness
5. academy and portal continuity
6. customer-visible state clarity across platform surfaces

## Rule

If a change improves appearance but weakens continuity, routing clarity, traceability, or customer comprehension, it should be re-scoped before merge.
