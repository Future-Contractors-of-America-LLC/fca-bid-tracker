# Machine-Native Control Loop Baseline

## Issue
The repository had a heartbeat control plane, but it did not maintain the canonical machine-native state surfaces required for bounded autonomous continuation.

## Fix
This packet establishes repo-native canonical state surfaces:

- `auricrux/system/system_state.json`
- `auricrux/system/next_action.json`
- `auricrux/system/work_queue.json`
- `auricrux/system/run_digest.json`
- `public/auricrux/run-digest/index.json`

The control-plane workflow is now the canonical writer for these surfaces.

## Control Loop
Every control-plane cycle now performs:

1. resolve mode
2. write canonical state surfaces
3. optionally execute `executive` or `engine`
4. finalize outcome
5. publish repo and public digest surfaces

## Current Queue
- MNCL-001 â€” Project spine execution baseline
- MNCL-002 â€” File spine execution baseline
- MNCL-003 â€” Audit event persistence baseline

## Boundary
This packet does not claim product completion.
It establishes truthful machine-native continuity so future execution can advance with explicit next action, queue state, and run digest truth.

## Next Build Step
Use `MNCL-001` as the next canonical product build target and bind implementation work to Project, File, and Audit objects.
