# Implementation Packet 027 â€” Executed

Status: Executed on `main`

## Objective

Bind the Contractor Command file and audit routes to the same active project workspace used by the project route so Project -> File -> Audit continuity reads from one governed project root instead of route-local shell assumptions.

## Issue

`/portal/files` and `/portal/audit` were still reading primarily from seeded shell state, which risked stale project identity and weakened the Project/File/Audit continuity spine.

## Fix

Updated:

- `src/pages/portal/PortalFiles.jsx`
- `src/pages/portal/PortalAudit.jsx`

Changes made:

- wired both routes to `useProjectWorkspace()`
- resolved a shared `visibleProject` from the active workflow project
- synchronized workspace state from active project context where available
- scoped file cards and audit events to the active project root
- surfaced workflow source and persistence status in route-visible cards
- passed the active project root into `SystemStateSummary` and `ProjectFileAuditPanel`

## Validation intent

These routes should now:

- display the same active project identity as `/portal/projects`
- keep file and audit surfaces aligned to project-context selection
- reduce route-local drift between seeded shell state and workflow-backed state
- make continuity truth more visible to the user

## Product impact

This is a real flagship-spine advancement:

- Project spine is more authoritative
- File spine is more project-aware
- Audit spine is more project-aware
- Auricrux continuity surfaces are less shell-only and more workflow-bound

## Next recommended action

Continue with the next bounded product step:

- add workflow-backed file and audit API reads so `/portal/files` and `/portal/audit` stop depending on seeded `systemState` datasets for their record bodies and instead resolve from the same backend workflow store as project mutations.
