# Implementation Packet 022 — Project / Job Spine + File Evidence Spine

## Issue
The repo had route-level project and file shells, but the project/job spine and file/evidence spine were still mostly static narrative instead of shared mutable workspace state.

## Risk
Without a shared project spine and file/evidence workspace layer, FCA Contractor Command can drift into disconnected shell routes where project records, files, and Auricrux actions do not reinforce the same customer-visible continuity path.

## Fix
Implemented a bounded project/file continuity pass on branch `auricrux/fca-coverage-matrix`:

- strengthened `src/projectWorkspaceStore.js`
  - canonical project IDs
  - lifecycle state
  - linked bid IDs
  - linked file counts
  - evidence and audit posture
  - document briefing posture
- added `src/fileWorkspaceStore.js`
  - persisted file/evidence workspace records keyed to projects
  - seeded evidence spine across estimating, execution, and closeout examples
- added `src/hooks/useFileWorkspace.js`
  - project-linked file filtering
  - attach evidence action
  - refresh Auricrux briefing action
  - automation/commercial log writes
- updated `src/hooks/useProjectWorkspace.js`
  - evidence sync mutation path
  - stronger lifecycle and audit updates
- updated `src/components/ProjectActionCenter.jsx`
  - attach evidence and refresh briefing controls
  - canonical project spine visibility
- updated `src/pages/portal/PortalProjects.jsx`
  - project/job spine cards now show canonical project, linked bid, file count, evidence status, audit posture
  - project actions now mutate both project and file continuity layers
- updated `src/pages/portal/PortalFiles.jsx`
  - selectable project spine
  - project-linked file register view
  - evidence attach / briefing refresh controls
  - file route now reads from persisted project/file state instead of only static exports

## Validation status
Not runtime-verified in-session. Repo artifact and route-level code changes were applied on the active branch, but build/test execution remains unverified from this environment.

## Next build step
1. Bind the authenticated customer session directly to project/file ownership selection.
2. Add route-level validation coverage for the new project and file continuity controls.
3. Continue into estimate/takeoff continuity so project, evidence, and pricing all share one operational spine.
