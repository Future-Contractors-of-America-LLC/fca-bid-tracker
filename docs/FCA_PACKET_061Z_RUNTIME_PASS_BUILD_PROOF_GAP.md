# FCA Packet 061Z Runtime Pass Build Proof Gap

## Issue
The core deploy lane now succeeds, but the auxiliary proof and persistence workflows still fail because workflow markers, artifact persistence references, and CI rewrite commit handling fell behind current 061Z repo truth.

## Risk
- false-negative validation on `build-validation.yml`
- proof-stamp workflows failing on non-fast-forward push races
- deployment-closeout blocked by proof-lane plumbing instead of real product delivery

## Fix
- restore missing marker strings and artifact paths required by proof validators
- add explicit build-validation artifact upload coverage for generated and docs/runtime-proof outputs
- rebase before CI proof-stamp pushes so concurrent main updates do not reject persistence commits
- keep live deploy verification best-effort inside proof workflows while preserving generated evidence

## Validation target
- `npm run validate:runtime-proof-integrity`
- `npm run validate:build-proof-lane`
- `npm run validate:packet-letter-lock`
- `npm run validate:build-validation-live-proof-coverage`
- `npm run validate:build-validation-live-proof-persistence-wiring`
- `npm run validate:live-proof-stamp-persistence-wiring`

## Truth boundary
This packet repairs 061Z proof-lane workflow gaps. It does not by itself claim that every persisted proof artifact has already landed on `main`; it restores the path for those workflows to complete truthfully.
