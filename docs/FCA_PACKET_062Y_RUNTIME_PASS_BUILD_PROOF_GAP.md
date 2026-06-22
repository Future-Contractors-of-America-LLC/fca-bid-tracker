# FCA Packet 062Y Runtime Pass Build Proof Gap

## Issue
Subdomain continuity (`app.*`, `api.*`) and SWA auth route restoration landed on `main`, but CI still failed on finance validation, runtime smoke method guards, SWA deployment marker drift, staticwebapp config parity, and missing packet `062Y` proof documents.

## Risk
- false-negative validation on `build-validation.yml` and `auricrux-frontend-build-loop.yml`
- runtime smoke failures after central API GET proxying for `/api/auricrux/actions`
- GitHub Pages Jekyll failures on the React monorepo root while production hosts on Azure SWA
- deployment proof workflows blocked by missing `062Y` packet letter lock artifacts

## Fix
- restore SWA customer auth routes and managed-auth validator markers
- add `prebuild` deployment manifest generation and `validate:swa-deployment` script wiring
- sync root/public `staticwebapp.config.json` with cache-control and navigation fallback parity
- update runtime smoke method guard to reject unsupported verbs after GET proxy enablement
- add GitHub Pages redirect workflow, `.nojekyll`, and `_config.yml` Jekyll exclusions
- commit this `062Y` runtime pass build proof gap document for packet letter lock continuity

## Validation target
- `npm run build:system`
- `npm run validate:managed-auth-commercial-runtime`
- `npm run validate:runtime-smoke`
- `npm run validate:swa-deployment`
- `npm run validate:packet-letter-lock`
- `node scripts/frontend_build_loop.mjs`

## Truth boundary
This packet repairs 062Y CI and proof-lane gaps for the frontend repo. It does not by itself claim every scheduled automation loop or legacy GitHub Pages source configuration has already been retired.
