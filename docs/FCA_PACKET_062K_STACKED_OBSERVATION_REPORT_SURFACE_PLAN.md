# FCA Packet 062K — Stacked Observation Report Surface Plan

## Purpose
Convert the first stacked observation binding into a durable report surface so future packets cannot drift back into ambiguous run claims.

## Required surface
- `docs/runtime-proof/stacked-observation/stacked_observation_report.md`
- `docs/runtime-proof/stacked-observation/stacked_observation_report.json`

## Required content
- packet sequence observed
- exact PR numbers
- exact checks observed
- exact lanes still only repo-wired
- explicit no-main/no-live truth boundary

## Promotion rule
No future packet may state that the stack has progressed in observation truth unless the report surface is updated from actual observed results.

## Next build step
Create the report surface and lock the same matrix into both markdown and JSON forms.