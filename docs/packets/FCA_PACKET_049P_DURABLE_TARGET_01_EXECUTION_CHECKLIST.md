# FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST

Status: Active Draft for repo placement  
Classification: Execution Checklist Packet  
Priority: Critical  
Sequence: 049P  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md

Scope: Exact execution checklist for applying Durable Target 01 in the repository without drift

---

## 1. Issue

Durable Target 01 now has an apply packet, but execution can still drift if the team lacks a short, exact checklist for what must be created, wired, validated, and reported.

---

## 2. Decision

Use this checklist as the bounded apply gate for Durable Target 01.

Durable Target 01 remains limited to:
- Project persistence
- File metadata persistence
- Audit event persistence
- Auricrux action persistence

No broader Academy/readiness persistence work is included in this checklist.

---

## 3. Create / Verify Files

### Repository interfaces
- [ ] `src/repositories/projectRepository.ts`
- [ ] `src/repositories/fileRepository.ts`
- [ ] `src/repositories/auditRepository.ts`
- [ ] `src/repositories/auricruxActionRepository.ts`

### Memory adapters
- [ ] `src/persistence/adapters/memory/memoryProjectAdapter.ts`
- [ ] `src/persistence/adapters/memory/memoryFileAdapter.ts`
- [ ] `src/persistence/adapters/memory/memoryAuditAdapter.ts`
- [ ] `src/persistence/adapters/memory/memoryAuricruxActionAdapter.ts`

### Factory
- [ ] `src/persistence/factories/repositoryFactory.ts`

---

## 4. Service Wiring Checklist

- [ ] `projectService.ts` reads/writes through `ProjectRepository`
- [ ] `fileService.ts` reads/writes through `FileRepository`
- [ ] `auditService.ts` reads/writes through `AuditRepository`
- [ ] `auricruxService.ts` writes through `AuricruxActionRepository`
- [ ] no route file performs direct persistence for these object families

---

## 5. Route Verification Checklist

- [ ] `GET /api/projects` returns durable repository-backed data
- [ ] `POST /api/projects` writes through repository
- [ ] `GET /api/projects/:projectId` reads through repository
- [ ] `PATCH /api/projects/:projectId` updates through repository
- [ ] `GET /api/files/:fileId` reads through repository
- [ ] `POST /api/auricrux/execute` writes Auricrux action + audit event
- [ ] `GET /api/audit/events` reads through repository
- [ ] `GET /api/audit/events/:eventId` reads through repository

---

## 6. Environment Checklist

- [ ] `PERSISTENCE_MODE=memory` documented or added to local environment
- [ ] no secrets committed to repo docs or packet files

---

## 7. Validation Checklist

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] manual route verification completed for durable target routes

---

## 8. Completion Rule

Durable Target 01 is not complete until:
- all required files exist
- services are rewired
- route families above are repository-backed
- Auricrux execute writes both action and audit
- validation commands pass
- resulting artifact paths are reported exactly

---

## 9. Canonical Path

This artifact is canonically stored at:

```text
docs/packets/FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
```

---

## 10. Next Action

Apply Durable Target 01 using Packet 049N + this checklist, then produce the first code-facing persistence patch artifact.