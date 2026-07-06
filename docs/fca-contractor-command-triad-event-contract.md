# FCA Contractor Command Triad Event Contract

## Purpose

This document defines the shared Lead -> Project -> Billing contract for the Auricrux Flywheel and the Phase 3 persona handoff layer.

## Canonical Job Envelope

The canonical shape is exported by the runtime as `TRIAD_JOB_SCHEMA` in `src/triadFlywheel.js`.

Core sections:

- `lead`: intake and commercial qualification state
- `project`: workspace, persona assignment, and critical-path posture
- `field`: milestones, proof-of-work signals, and pause status
- `finance`: budget estimate, pay-app lifecycle, billed and collected amounts
- `governance`: threshold settings and governance evidence

## Golden Event Sequence

Minimum events for zero-click triad operation:

1. `triad.lead.won`
2. `triad.finance.budget_initialized`
3. `triad.files.workspace_created`
4. `triad.field.guardian_assigned`
5. `triad.field.milestone_completed`
6. `triad.finance.payapp_drafted`
7. `triad.finance.invoice_ready` or `triad.finance.invoice_blocked`
8. `triad.finance.cash_collected`

## Phase 3 Persona Events

Persona and override learning signals:

- `triad.persona.decision_enqueued`
- `triad.persona.decision_approved`
- `triad.persona.decision_overridden`
- `triad.persona.weight_updated`

Safety incident cross-persona handoff signals:

- `triad.safety.incident_detected`
- `triad.field.task_stopped`
- `triad.communication.alerted`
- `triad.finance.change_order_initiated`
- `triad.audit.blackbox_logged`

## Validation Gate

Run:

- `npm run validate:triad-contract`

This gate verifies:

- shared schema shape
- required event identifiers
- required persona manifests
- persisted state shape for jobs and decision queue

`build:system` runs the triad validation gate before production build.
