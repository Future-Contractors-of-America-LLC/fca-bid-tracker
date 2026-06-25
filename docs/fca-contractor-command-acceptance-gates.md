# FCA Contractor Command â€” Acceptance Gates v1

Status: Active Draft
Scope: Repo, build, route, and product acceptance gates for flagship spine

## Purpose

This document defines the minimum acceptance gates for Contractor Command work so implementation cannot be claimed complete without product, continuity, and deployment evidence.

## Acceptance Law

A feature is not complete because code exists.
A feature is complete only when:
- repo truth exists
- route truth exists
- object/state truth exists
- output artifact exists where required
- audit behavior exists where required
- user-facing continuity remains intact

## Gate Group 1 â€” Product Gates

### G1.1 Flagship alignment
Pass only if the change strengthens:
- lead / opportunity intake
- qualification
- file / evidence handling
- estimate / proposal workflow
- project handoff
- client portal continuity
- Auricrux embedment

### G1.2 No isolated feature behavior
Pass only if the change attaches to the continuity spine where applicable.

### G1.3 Construction-native credibility
Pass only if product language and behavior remain construction-real rather than generic SaaS filler.

## Gate Group 2 â€” Object / State Gates

### G2.1 Governed object alignment
Pass only if route/API/storage behavior maps to canonical objects.

### G2.2 Lifecycle state enforcement
Pass only if state transitions follow canonical state rules.

### G2.3 No silent completion
Pass only if completed workflow steps produce required artifacts.

## Gate Group 3 â€” Route and UX Gates

### G3.1 Public-to-product continuity
Pass only if public CTA routes lead toward real product surfaces.

### G3.2 Authenticated continuity
Pass only if `/login` and `/portal` remain coherent and product-facing.

### G3.3 Project/file continuity
Pass only if project and file routes preserve shared context and do not strand the user in disconnected views.

### G3.4 No dead CTA behavior
Pass only if buttons and links either navigate, act, or are intentionally absent.

## Gate Group 4 â€” API Gates

### G4.1 Tenant scoping
Pass only if API behavior is tenant-safe.

### G4.2 Audit emission
Pass only if execute-capable operations produce or link AuditEvent records.

### G4.3 File evidence discipline
Pass only if file workflows preserve owner linkage and evidence linkage.

## Gate Group 5 â€” Storage Gates

### G5.1 Canonical persistence mapping
Pass only if new data uses existing canonical store classes.

### G5.2 No parallel truth
Fail if a new store path duplicates governed object truth without migration reason.

### G5.3 File metadata separation
Pass only if file bytes and file metadata remain cleanly separated.

## Gate Group 6 â€” Build / Deployment Gates

### G6.1 Repo artifact present
Pass only if the change produces durable repo artifacts.

### G6.2 Build compatibility
Pass only if the change does not knowingly break current build assumptions.

### G6.3 Route survivability
Pass only if existing high-value public and portal routes continue to resolve.

### G6.4 Truthful capability posture
Pass only if customer-facing claims do not exceed verified capability.

## Gate Group 7 â€” Auricrux Gates

### G7.1 Explain / Recommend / Execute compatibility
Pass only if the change leaves space for Auricrux to remain present in the workflow.

### G7.2 Action traceability
Pass only if Auricrux actions can be recorded against governed objects.

### G7.3 Correction readiness
Pass only if the workflow can support later correction rather than one-way opaque mutation.

## Minimum Acceptance Checklist

Before marking a packet complete, confirm:
- [ ] route map updated or still valid
- [ ] API mapping updated or still valid
- [ ] storage mapping updated or still valid
- [ ] object/state continuity preserved
- [ ] file and audit expectations preserved
- [ ] public-to-product flow preserved
- [ ] Auricrux embedment preserved
- [ ] customer-facing claims remain truthful

## Immediate Packet Use

Use these gates for:
- project/job spine work
- file/document ingestion work
- document briefing work
- later RFI / change / QC / finance continuity work

These gates are mandatory anti-drift controls for Contractor Command execution.
