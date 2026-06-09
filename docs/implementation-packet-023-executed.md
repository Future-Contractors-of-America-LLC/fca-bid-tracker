# Implementation Packet 023 — Executed

## Packet
Active Project Context Rebinding

## Executed Scope
- added `workspaceStateStore` as the canonical workspace-state mutation layer
- bound workspace state hydration to the persisted project workspace so the shell can resolve an active project instead of a static seed only
- added active-project metadata (`activeProjectId`, `activeSourceBidId`, `activeProjectLastActionAt`) to workspace persistence
- updated bid-to-project conversion so converting a won bid rebinds the active workspace project immediately
- updated project-stage and permit-blocker mutations so they refresh the active workspace context
- updated project file package creation so file-spine mutations refresh the active workspace context
- added explicit active-project selection in `PortalProjects`

## Product Outcome
The shell can now pivot from the static seeded project into a converted or selected project root while preserving:
- project spine bars
- workspace summary state
- Auricrux next-action context
- file-spine continuity
- audit continuity

## Remaining Gap
Some route-local surfaces still read seeded arrays or route overlays that are not yet fully parameterized by the active project. The shell root is now rebound correctly, but some route-local supporting copy still needs deeper normalization.

## Next Packet
Parameterize route-local portal surfaces that still rely on static seeded route data so they fully inherit the active workspace project context instead of mixed seeded/project-selected context.
