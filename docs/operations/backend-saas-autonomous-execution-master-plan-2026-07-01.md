# FCA Backend SaaS Autonomous Execution Master Plan (Non-LMS Priority)

Date: 2026-07-01
Scope: Backend, connectors, workspace orchestration, cross-slice continuity, customization and personalization, Auricrux embedding depth controls, tier-aware upsell seeds.
Out of primary scope: Deep LMS feature expansion (only maintain route/data continuity with Academy links).

## Design and product direction lock (operator-provided)

Reference products and standards to benchmark against:
1. Procore
2. Autodesk ecosystem (BuildingConnected, AutoCAD, Revit)
3. PlanHub
4. Intuit ecosystem (QuickBooks, TurboTax)
5. Microsoft ecosystem

UX and product directives:
1. Retain and evolve the current frontend/SWA color palette as the base visual system.
2. Prioritize enterprise-dense information architecture while remaining organized and easy to read, navigate, and understand without mandatory Auricrux assistance.
3. Deliver FCA as the pinnacle construction platform experience with a premium, execution-focused, innovation-forward quality bar across every non-LMS slice.

Execution implication:
1. Every slice definition of done includes parity-or-better usability outcomes versus the reference stack while preserving FCA-specific differentiation, continuity spine requirements, and Auricrux embedded intelligence.

## 0. Explicit non-LMS scope coverage matrix

Included in this plan and required for completion:
1. Bids, estimates, proposals, projects, and opportunity conversion.
2. Leads and pipeline intake-to-conversion orchestration.
3. Finance, billing, invoices, pay apps, job cost, collections, and reconciliation.
4. File governance including field photos, field notes, and as-built continuity.
5. BIM/CAD ingestion metadata, design references, and governed handoff to takeoff/RFI/change-order workflows.
6. Redlines and markup lifecycle with traceability to drawings, RFIs, and change orders.
7. Scheduling with Gantt-capable data model, dependency edges, and variance tracking.
8. VR/immersive workspace continuity for model/design review and field-context handoff events.
9. Field execution: tasks, supervision signals, punch-like closeout readiness, and mobile-friendly sync behavior.
10. Warranty lifecycle and post-closeout support continuity.
11. Support, messages, notifications, admin controls, and user profile personalization.
12. Auricrux embedded intelligence and controllable engagement depth in every non-LMS slice.

Excluded from deep expansion in this execution track:
1. LMS curriculum/content feature growth (Academy remains integration-linked only).

## 1. Baseline truth observed

1. Route/shell breadth is high across portal slices.
2. Many API handlers currently proxy to Auricrux Central.
3. Local direct implementation seams exist for workflow store/read models and selected domain stores.
4. Existing SaaS QC route checks are green, but this does not prove domain behavior depth for every slice.

## 2. Non-negotiable implementation rules (execution contract)

1. Autonomous execution: no dependency on manual human implementation steps.
2. Every slice closes with complete UX quality, functional behavior, and cross-slice continuity.
3. Microsoft-only runtime dependency posture (Azure and Microsoft ecosystem only).
4. Tenant-level and user-level customization/personalization is first-class and configurable.
5. Upsell seeds are subtle capability signals, not ads.
6. Continuous operation until full completion: execute lane-by-lane with no approval waits.
7. Visible work at all times: commit cadence + run logs + QC artifacts + live status notes.

## 3. Target architecture state

1. API-first domain services behind unified contracts per slice.
2. Persistence hardening using Azure data services with tenant partitioning and policy governance.
3. Orchestration layer for cross-slice workflows (bid to estimate to proposal to project to files to finance to warranty and support).
4. Auricrux control plane embedded in all slices with adjustable engagement profile by tenant/user.
5. Entitlement and packaging engine with feature gating and upgrade-seed surfaces.
6. Telemetry, audit, and operational quality gates as release blockers.

## 4. Delivery waves and completion criteria

## Wave 0: Foundation hardening (must complete before feature waves)

Objectives:
1. Normalize backend contracts and error envelopes for all non-LMS APIs.
2. Introduce capability registry: implemented, proxied, partial, planned.
3. Add tenant context and user context propagation across all clients and handlers.
4. Standardize auth/session boundary behavior and policy checks.
5. Establish release quality gates for API, integration, UX, accessibility, and continuity.

Definition of done:
1. Every non-LMS endpoint has a documented contract and source-of-truth owner.
2. Every endpoint returns standardized success/error schema.
3. Tenant/user context appears in all workflow mutations and read models.
4. CI fails on contract drift, route drift, and continuity drift.

## Wave 1: Revenue core completion (Leads, Bids, Estimates, Proposals, Projects)

Objectives:
1. Complete lead capture, qualification, and pipeline staging with configurable routing.
1. Move bids, estimates, proposals, projects from proxy-reliant behavior toward complete domain implementation boundaries.
2. Implement bid qualification scoring pipeline with configurable business rules by tenant.
3. Build estimate package model with versioning, assumptions, alternates, and markups.
4. Build proposal generation and approval states with audit timeline.
5. Build opportunity-to-project conversion integrity with full lineage.

Definition of done:
1. End-to-end flow works without behavioral gaps across all four slices.
2. Each step writes auditable events and supports rollback-safe updates.
3. Tenant can customize statuses, labels, thresholds, and document templates.
4. Auricrux can run in advisory/co-pilot/auto-draft modes per tenant and per user.
5. Lead-to-project continuity is fully traceable through pipeline, bids, and project conversion lineage.

## Wave 2: Delivery core completion (Files, BIM/CAD, Redlines, VR/Immersive, RFIs, Change Orders, Scheduling/Gantt, Field, Closeout)

Objectives:
1. Harden file governance model with required evidence states and role-aware actions.
2. Implement BIM/CAD artifact metadata contracts and design-to-execution handoff controls.
3. Implement redline lifecycle and linkage from design artifacts into RFIs and change orders.
4. Implement project RFI and change-order lifecycle linking cost/schedule impact.
5. Build scheduling and Gantt-capable orchestration with dependency, critical-path, and variance status syncing to project and finance.
6. Build VR/immersive session-state and decision-capture linkage into design, RFI, and change-order trails.
7. Build field-task orchestration, field photos/notes capture, and as-built continuity to closeout packages.
8. Build closeout package readiness with checklist and compliance traces.

Definition of done:
1. Delivery slices share a single project continuity graph.
2. Actions in one slice propagate expected updates laterally and forward.
3. All artifacts can be traced back to project and originating opportunity context.
4. User-level workspace personalization (views, defaults, sort/filter presets) persists.
5. BIM/CAD, redlines, VR/immersive decisions, scheduling/Gantt, field evidence, and as-built records are all linked to the same continuity spine.

## Wave 3: Finance and commercial completion (Billing, Finance, Job Cost, Pay Apps, Invoices)

Objectives:
1. Expand finance from current near-ready state into full operational accounting workflow.
2. Implement invoice lifecycle, pay app lifecycle, collection status, and reconciliation hooks.
3. Implement job cost rollups linked to estimate and change-order realities.
4. Enable package/plan-aware finance limits and feature entitlements.

Definition of done:
1. Revenue, cost, invoicing, and payment events reconcile across project and customer ledgers.
2. Finance views are tenant-customizable and role-specific.
3. Subtle upsell seeds appear as capability previews with value context and no ad language.
4. Auricux delivers finance insights at configurable depth by tier.

## Wave 4: Customer operating system completion (Support, Messages, Notifications, Warranty, Admin, Profile)

Objectives:
1. Complete ticketing/support flows linked to project and billing contexts.
2. Build notification orchestration by role, urgency, and workflow state.
3. Complete warranty case lifecycle from handoff through resolution and feedback loops.
4. Finalize admin controls for tenant branding, workflow policy, custom fields, and automations.
5. Finalize user profile personalization and preference synchronization.

Definition of done:
1. Customer organizations can fully brand and personalize platform behavior.
2. Individual users have controllable assistant depth, defaults, and workspace presets.
3. Communication and support events remain in shared continuity spine.
4. Tier-aware enhancement seeds are present in contextually relevant surfaces.

## Wave 5: Auricrux embedded intelligence completion (cross-cutting)

Objectives:
1. Implement Auricrux engagement profile model: off, suggest, guided, autonomous draft.
2. Build policy rails for action boundaries by role and tier.
3. Add explainability records for every Auricrux-generated action.
4. Add lesson-linking connectors to Academy touchpoints without LMS expansion.

Definition of done:
1. Auricrux behavior is fully tunable by tenant and user.
2. Every recommendation/action has traceable rationale and audit evidence.
3. Academy links appear where skill-building naturally supports current work.

## 5. Customization and personalization blueprint

Tenant-level:
1. Branding, terminology packs, workflow stages, required fields, SLAs, policy rules.
2. Automation recipes and notification policies.
3. Auricrux default engagement profile and command permissions.

User-level:
1. Workspace layouts, saved filters, default actions, notification preferences.
2. Assistive depth and content style preferences.
3. Role-scoped quick actions and context panels.

Data model requirements:
1. Tenant policy entities and user preference entities must be versioned.
2. Runtime read models must merge global defaults, tenant overrides, and user overrides deterministically.

## 6. Microsoft-only dependency enforcement

1. Backend runtime: Azure Functions/App Services as selected deployment target.
2. Data: Azure-native persistence (Table/SQL/Cosmos based on domain fit) and Key Vault for secrets.
3. Identity/session: Microsoft-native auth boundary stack currently in use.
4. Messaging/workflow hooks: Microsoft services only.
5. Any non-Microsoft external dependency in runtime path is treated as blocker.

## 7. Upsell seed pattern catalog (subtle only)

Patterns:
1. Disabled advanced controls with value tooltip and comparison language.
2. Outcome previews showing potential time/risk reduction with higher tier feature.
3. Contextual "available in your upgrade path" indicators in workflow moments.
4. Auricrux depth nudges: "deeper optimization available" style cues.

Constraints:
1. No popups, no interruptive modals, no ad-like copy.
2. Seed placement only where user is already performing related work.

## 8. Autonomous execution operating model

Execution lane order:
1. Foundation hardening
2. Revenue core
3. Delivery core
4. Finance core
5. Customer operating system
6. Auricrux cross-cutting completion
7. Final continuity and release hardening

Per-lane cycle:
1. Contract and schema implementation
2. Handler implementation and persistence wiring
3. Client connector updates
4. UX and personalization completion
5. Auricrux embedding and tier behavior
6. Integration and continuity tests
7. Quality gate closeout and release artifact publication

No-stop policy handling:
1. If a blocker appears, execute fallback path in same lane and continue.
2. If external service is unavailable, enable deterministic local/central-compatible mode and keep executing.
3. Never wait for approval to continue to next task inside the lane.

## 9. Continuous visible progress protocol

1. Every execution segment emits a progress artifact in docs/operations and docs/qc.
2. Every backend lane emits:
   - capability matrix delta
   - implemented endpoints list
   - passing test matrix
   - known limitation list (must trend to zero)
3. Every CI run is linked in lane report with status.
4. Every slice completion includes before/after evidence and continuity proof.

## 10. Completion gates (global)

A lane is complete only if all are true:
1. Functional completeness: full intended behavior works in live flow.
2. Aesthetic and usability completeness: customer-facing polish and clarity are production-grade.
3. Connectivity completeness: backward, forward, and lateral workflow links are verified.
4. Customization completeness: tenant and user personalization both operational.
5. Auricrux completeness: configurable depth and explainable actions in slice.
6. Reliability completeness: CI, smoke, integration, and continuity gates green.
7. Sovereignty completeness: no non-Microsoft runtime reliance in active paths.

## 11. Immediate execution queue (start now)

1. Build endpoint capability registry for all non-LMS handlers (implemented/proxied/partial).
2. Replace highest-traffic proxy slices first with local-orchestrated implementations: bids, estimates, proposals, projects.
3. Harden finance slice contract parity and reconciliation model.
4. Implement tenant/user customization entities and merge engine in read models.
5. Add Auricrux engagement profile controls to admin and profile surfaces.
6. Add subtle upsell seed components behind entitlement checks.
7. Enforce all new global quality gates and publish lane-by-lane closure artifacts.

## 12. Expected result state

1. FCA backend becomes a complete multi-tenant SaaS operating platform, not only a shell.
2. Customer companies and individual users can deeply personalize behavior and experience.
3. End-to-end workflows are continuous across bids, delivery, finance, support, and Auricrux intelligence.
4. Platform remains Microsoft-native for runtime dependencies.
5. Lower-tier users receive subtle upgrade motivation through contextual capability signals.
