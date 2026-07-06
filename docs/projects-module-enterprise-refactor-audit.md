# Projects Module Enterprise Refactor Audit (Upgrade Path)

## Scope Audited
- UI surface: Portal Projects.
- Orchestration hook: project workspace state and mutations.
- Workflow spine adapters: project/file/audit APIs.

## Monolithic Pain Points Identified
- UI-business coupling:
  - Health computation, risk interpretation, stage gate checks, and schedule-to-finance cascade are embedded in the portal page component.
- Mutation-side-effect coupling:
  - Project mutations currently combine state mutation, session log writes, and user-facing behavior in one hook path.
- Implicit event flow:
  - Lifecycle changes were primarily direct-call and state-local; no dedicated project event contract for downstream consumers.

## Refactor Actions Completed (Non-Breaking)
- Added dedicated project event bus module:
  - `src/projectEventBus.js`
  - Unified publish contract (`publishProjectEvent`) and subscription channel (`subscribeProjectEvents`).
- Routed core project mutations to event publication:
  - active project selection
  - stage advancement
  - permit blocker clearance
  - command notes update
- Routed key Projects UI operational actions to event publication:
  - delay notice draft
  - schedule-to-billing forecast cascade
  - stage-gate blocked transition
- Event fan-out now writes to:
  - Triad blackbox (`triad.audit.blackbox_logged`)
  - Workflow audit API (`/api/workflow-audit`) on best effort
  - local event log for module-level replay/debug

## Modular Monolith Upgrade Map
- `src/modules/projects/domain` (target)
  - stage model, gate evaluator, health scorer, continuity policy
- `src/modules/projects/application` (target)
  - use-cases: select-active, advance-stage, clear-permit, save-notes, cascade-forecast
- `src/modules/projects/infrastructure` (target)
  - workflow store adapters, audit adapter, triad adapter
- `src/modules/projects/events` (started)
  - project event bus and event contracts

## Auricrux Manifest Mapping (Current to Autonomous Trigger)
- Manual: set active project
  - Trigger: `project.context.selected`
  - Agent intent: synchronize execution context across command surfaces.
- Manual: advance stage
  - Trigger: `project.stage.advanced`
  - Agent intent: enforce policy and auto-propagate readiness state.
- Manual: clear permit blocker
  - Trigger: `project.permit.blocker_cleared`
  - Agent intent: unblock mobilization and notify dependent lanes.
- Manual: send delay notice
  - Trigger: `project.delay.notice_drafted`
  - Agent intent: proactive customer continuity communication.
- Manual: schedule-to-billing cascade
  - Trigger: `project.schedule.forecast_cascaded`
  - Agent intent: pre-emptive cashflow forecasting.
- Manual blocked gate path
  - Trigger: `project.stage.gate_blocked`
  - Agent intent: enforce constitutional stage guardrails and escalate with context.

## Next Safe Refactor Increments
1. Extract health/risk/stage-gate logic from `PortalProjects.jsx` into a `projectsDomain` service module.
2. Create typed event contract constants for all `project.*` events to eliminate string drift.
3. Introduce a dedicated listener in Finance module for `project.schedule.forecast_cascaded` to remove remaining direct action coupling.
4. Mirror event contract on .NET engine side (`IEventBus`) for cross-runtime parity.

## Note on C# Backend Alignment
- This pass applies to the current web repo only.
- The .NET/MAUI engine parity step is identified above and should be implemented in the engine repository in a follow-up upgrade.
