# FCA Contractor Command — Route Implementation Checklist v1

Status: Active Draft
Scope: Packet 023 implementation checklist

## Purpose

This checklist translates the Packet 023 contracts into route-by-route implementation work for the first project/file spine surfaces.

## 1. `/portal/projects`

### Required outcomes
- show project list tied to active tenant
- show lifecycle state per project
- allow selection of active project
- write canonical shared project context
- show continuity alerts / project health summary

### Implementation checks
- [ ] route resolves current tenant context
- [ ] route reads/writes canonical active project context
- [ ] route avoids duplicate local active-project state
- [ ] selected project can drive downstream files/audit routes
- [ ] project card language is construction-real

## 2. `/portal/projects/:projectId`

### Required outcomes
- hydrate project header context
- show upstream linkage to opportunity/client
- show file summary
- show audit summary
- show Auricrux next action

### Implementation checks
- [ ] route param binds canonical active project context
- [ ] missing project state fails safely
- [ ] project summary includes project number/name/state
- [ ] file summary block exists
- [ ] audit summary block exists
- [ ] Auricrux action rail or summary exists

## 3. `/portal/files`

### Required outcomes
- show files in active project or selected owner context
- expose upload / classify / linkage state
- support document briefing visibility later
- preserve ownerObject linkage

### Implementation checks
- [ ] route reads active project context when available
- [ ] route can fall back to tenant-wide file view safely
- [ ] file cards show status/classification/version
- [ ] file cards show ownerObject linkage
- [ ] file route does not pretend full native document intelligence exists yet

## 4. `/portal/audit`

### Required outcomes
- show real continuity history
- filter by active project or broader tenant scope
- show actor, reason, event type, time
- preserve Auricrux action visibility

### Implementation checks
- [ ] audit route reads active project context
- [ ] audit route distinguishes user/system/auricrux actors
- [ ] audit items expose reason and summary
- [ ] route supports recent corrections / action history
- [ ] route remains useful even with placeholder data sources

## Shared Component Checks

Components likely needed or updated:
- Project spine bar / context bar
- Files summary panel
- Audit timeline panel
- Auricrux next-action panel
- continuity alert badge group

## Non-Negotiables
- [ ] no route-local contradictory project state
- [ ] no fake completion language
- [ ] no isolated file UI with no owner linkage
- [ ] no Auricrux copy without governed target context
- [ ] no route claiming execution without future audit hook path

## Completion Standard

Packet 023 is implementation-ready when these routes can be built against:
- canonical project context model
- canonical file payloads
- canonical audit payloads
- canonical Auricrux action payloads
