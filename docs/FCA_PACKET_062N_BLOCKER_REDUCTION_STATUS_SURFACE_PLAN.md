# FCA Packet 062N — Blocker Reduction Status Surface Plan

## Purpose
Add a durable status surface that states, from the observation record itself, whether any meaningful blocker reduction has occurred.

## Required surface updates
- add `blockerReductionOccurred` to `docs/runtime-proof/stacked-observation/stacked_observation_report.json`
- add a `Blocker reduction status` section to `docs/runtime-proof/stacked-observation/stacked_observation_report.md`

## Required logic
- `false` if all critical lanes remain only `repo-wired`
- `true` only if at least one critical lane has exact observed promotion bound in the report

## Rule
No future packet may say blocker reduction occurred unless the observation report surface itself says so and names the promoted lanes.

## Next build step
Write the status surface and initialize it truthfully from the current observation record.