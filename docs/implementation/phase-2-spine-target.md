# Phase 2 Spine Target — FCA Contractor Command

## Status

In progress

## Purpose

Lock the next build sequence to the flagship product spine and prevent sideways feature sprawl.

## Mandatory Sequence

### 2A — Project / Job Spine

Add canonical Project object and linkage from Opportunity/Bid to Project.

Required minimums:

- API surface for Projects
- Frontend list/detail shell
- Bid -> Project relationship
- Audit event on create/update
- Lifecycle state validation

### 2B — Files / Document Ingestion Spine

Add project-scoped file handling.

Required minimums:

- Upload
- List
- Version metadata
- Evidence tagging
- Preview-ready metadata
- Audit events

### 2C — Auricrux Document Intelligence

Add project file package briefing.

Required minimums:

- Package summary
- Missing-file detection
- Key risk extraction
- Recommended next actions
- Recorded Auricrux action output

### 2D — Continuity Objects

Required objects:

- RFI
- Change Event
- Change Order
- QC Inspection / Punch Item

All must link to:

- Project
- Files/Evidence
- Audit trail

### 2E — Academy Linkage

Every actionable workflow should support:

- checklist linkage
- micro-lesson linkage
- course/module linkage

## Done Definition

Phase 2 is only done when:

- Project exists as a first-class object
- Files are project-attached
- Auricrux can brief uploaded packages
- continuity objects exist
- outputs are auditable
- no module stands alone
