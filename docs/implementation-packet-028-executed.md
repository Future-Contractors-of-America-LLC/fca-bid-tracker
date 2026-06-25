# Implementation Packet 028 â€” Executed

Status: Executed on `main`

## Objective

Replace seeded-only file and audit route bodies with workflow-backed API reads so Contractor Command Project -> File -> Audit continuity moves closer to real backend truth.

## Issue

Even after active project rebinding, `/portal/files` and `/portal/audit` still depended on seeded `systemState` records for the actual file register and audit timeline bodies.

## Fix

Added workflow-backed evidence reads:

- `api/files.js`
- workflow store support for `files`
- project-aware filtering for workflow audit reads
- `src/hooks/useWorkflowEvidence.js`
- `/portal/files` now reads backend-backed file + audit evidence
- `/portal/audit` now reads backend-backed file + audit evidence

Updated:

- `api/workflow-store.js`
- `api/workflow-audit.js`
- `src/api/workflowClient.js`
- `src/pages/portal/PortalFiles.jsx`
- `src/pages/portal/PortalAudit.jsx`

## Validation intent

These routes should now:

- read file and audit bodies from API-backed workflow state
- filter evidence by active project root
- expose workflow backing source and persistence state visibly
- fall back safely if API evidence loading fails

## Product impact

This is a real flagship-spine advancement:

- File spine moved from seeded shell records toward backend workflow truth
- Audit spine moved from seeded shell records toward backend workflow truth
- Project/File/Audit continuity is more durable and less theatrical
- Auricrux-facing continuity surfaces now show backend evidence status instead of only shell narrative

## Next recommended action

Continue with the next bounded product step:

- add real file mutation actions and audit-emitting file events so upload/register/classify/link actions change workflow state rather than only render workflow-backed reads.
