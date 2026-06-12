# FCA Unified Single Release Gate

## Purpose
This gate controls the **single coordinated release** of the expanded FCA flagship product.

FCA does **not** release as separate SaaS, Academy, Website, Portal, or Auricrux products.
FCA releases as **one unified operating system** with one shared spine.

## Release identity
**Release name:** FCA Contractor Command Unified Release

**Release scope:**
- FCA Website
- FCA Login / Identity boundary
- FCA Customer Portal
- FCA SaaS operational flagship path
- FCA Academy / LMS operational core
- Auricrux guided action layer
- Shared tenant, project, file, audit, and entitlement spine

## Required canonical shared objects
The release is blocked unless these objects exist in governed form and are consumed by live product surfaces:
- Tenant
- User
- Role
- Subscription
- Entitlement
- Lead
- Opportunity
- Client
- Site
- Project / Job
- File
- Audit Event
- Proposal
- Academy Program
- Enrollment
- Assignment
- Progress Record
- Credential / Certificate
- Auricrux Action Record

## Unified release gates

### Gate 1 — identity and tenant truth
Must pass:
- customer login works
- customer session sync works
- logout works
- route protection works
- entitlements affect SaaS, LMS, and Auricrux consistently
- tenant boundary is respected across workspace surfaces

Failure condition:
- any route uses a different auth truth or bypasses entitlement logic

### Gate 2 — flagship commercial continuity truth
Must pass:
- lead intake creates governed lead record
- qualification creates governed opportunity record
- proposal path resolves from governed opportunity state
- opportunity can convert into canonical project/job
- converted project appears in project listing and project detail

Failure condition:
- opportunity conversion succeeds in one store but not in canonical workspace truth

### Gate 3 — project and file spine truth
Must pass:
- project exists as the home for downstream work
- files can be uploaded or registered against project
- file metadata is persisted
- evidence ties back to project and source records
- Auricrux document briefing is available for uploaded packages

Failure condition:
- files are accepted without canonical project/evidence linkage

### Gate 4 — Academy/LMS truth
Must pass:
- academy loads under authenticated customer context
- user can be enrolled or assigned to governed program/course path
- assignment can link to project/job context
- progress persists in governed form
- credential or completion state exists in governed form
- readiness or feature-gate effect is exposed to real workspace surfaces

Failure condition:
- Academy is only a visual shell and not part of runtime operational truth

### Gate 5 — Auricrux truth
Must pass:
- Auricrux appears across workspace and Academy
- explain / recommend / execute modes are consistent
- actions generate audit/event output
- action reason and before/after state are reviewable where applicable

Failure condition:
- Auricrux is present visually but not tied to governed state changes or auditability

### Gate 6 — financial continuity truth
Must pass:
- proposal amount and project commercial state are linked
- billing or revenue readiness state exists
- entitlement and subscription truth are reflected in customer billing/admin surfaces
- commercial continuity is not isolated from project and Academy state

Failure condition:
- finance, billing, or entitlements live as disconnected UI-only state

### Gate 7 — deployment truth
Must pass:
- preview deployment validates changed routes and APIs
- staging validates integrated login, workspace, Academy, files, and Auricrux flows
- production validates same flows on the live domain
- public shell matches current repo truth

Failure condition:
- repo claims completion but live surface does not reflect it

## Minimum release walkthrough
A release candidate is valid only if this end-to-end walkthrough succeeds:
1. user lands on website
2. user authenticates
3. user enters workspace
4. user sees governed project/opportunity context
5. user opens files and receives document intelligence
6. user reaches proposal/project continuity path
7. user opens Academy under same customer context
8. user receives assignment or enrollment tied to role/project/workflow
9. readiness state affects what the user can do next
10. Auricrux can explain and route next action across both SaaS and LMS

## Stop-ship conditions
Do not release if any of the following are true:
- SaaS and LMS rely on different runtime truth for identity
- project conversion does not reconcile into canonical workspace state
- Academy cannot attach to live project or workflow context
- live shell does not reflect current deployment truth
- Auricrux action trail is missing
- founder must manually bridge basic customer continuity

## Required validation artifacts
Before release approval, the repo must contain or generate:
- route acceptance checklist
- API truth checklist
- project conversion verification
- file spine verification
- Academy assignment/progress verification
- live deployment verification
- unified release signoff memo

## Release decision rule
Release only when the shared spine is complete enough that:
- customer utility is real
- continuity is real
- auditability is real
- SaaS and LMS behave as one product
- founder routing burden is reduced rather than increased

## Current status
Current status should remain:
**Not yet release-ready**

Reason:
The repo has substantial partial spine progress, but canonical reconciliation across project truth, file truth, Academy runtime truth, and unified release verification is still in progress.

## Next execution step
Execute Packet 047A:
1. canonical object reconciliation
2. project conversion to canonical workspace truth
3. Academy assignment/progress/readiness governance
4. auth and entitlement alignment across SaaS, LMS, and Auricrux
