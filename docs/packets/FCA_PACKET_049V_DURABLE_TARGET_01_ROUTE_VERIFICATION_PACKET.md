# FCA_PACKET_049V_DURABLE_TARGET_01_ROUTE_VERIFICATION_PACKET

Status: Active Draft for repo placement  
Classification: Route Verification Packet  
Priority: Critical  
Sequence: 049V  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
- FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md
- FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md
- FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE.md
- FCA_PACKET_049U_DURABLE_TARGET_01_SERVICE_REWIRE_PACKET.md

Scope: Exact route verification matrix, validation expectations, and Definition of Done for the first repository-backed route surface in Durable Target 01

---

## 1. Issue

Durable Target 01 now has repository interfaces, memory adapters, factory rules, and service rewiring guidance, but the first repository-backed route surface still needs an exact verification packet so completion is based on route truth rather than assumption.

---

## 2. Decision

Verify only the first durable route surface now.

In scope:
- project routes
- file detail / project file routes
- audit routes
- Auricrux execute route

Out of scope:
- Academy persistence routes
- readiness routes
- cross-link routes
- feature-gate routes
- remediation routes

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049V_DURABLE_TARGET_01_ROUTE_VERIFICATION_PACKET.md
```

---

## 4. Verification Matrix

### 4.1 Project routes

#### `GET /api/projects`
Must verify:
- authenticated request required
- tenant context required
- returns array from repository-backed service
- no hardcoded standalone demo array remains in route layer

#### `POST /api/projects`
Must verify:
- authenticated request required
- tenant context required
- request reaches repository-backed create flow
- returned object includes durable record shape

#### `GET /api/projects/:projectId`
Must verify:
- tenant-safe lookup
- not-found path is explicit
- response shape matches project contract

#### `PATCH /api/projects/:projectId`
Must verify:
- tenant-safe update
- repository-backed update path used
- updatedAt changes on successful update

### 4.2 File routes

#### `GET /api/files/:fileId`
Must verify:
- tenant-safe lookup
- response is repository-backed
- route no longer invents detached file detail object

#### `GET /api/projects/:projectId/files`
If implemented in this slice, verify:
- tenant-safe project file list
- repository-backed read path

### 4.3 Audit routes

#### `GET /api/audit/events`
Must verify:
- tenant-scoped list
- repository-backed read path

#### `GET /api/audit/events/:eventId`
Must verify:
- tenant-scoped lookup
- not-found path explicit

### 4.4 Auricrux route

#### `POST /api/auricrux/execute`
Must verify:
- authenticated request required
- tenant context required
- service writes Auricrux action record through repository
- service writes audit event through repository
- response includes both record identifiers

---

## 5. Required Validation Types

### 5.1 Structural validation
- imports resolve
- route files compile
- services compile
- repository factory compiles

### 5.2 Behavioral validation
- route returns expected JSON contract shape
- repository-backed reads/writes occur for in-scope families
- no route-level persistence shortcuts remain

### 5.3 Boundary validation
- no unrelated persistence families are pulled into completion claims
- memory-backed implementation is not misrepresented as provider-backed production durability

---

## 6. Manual Verification Checklist

- [ ] call `GET /api/projects`
- [ ] call `POST /api/projects`
- [ ] call `GET /api/projects/:projectId`
- [ ] call `PATCH /api/projects/:projectId`
- [ ] call `GET /api/files/:fileId`
- [ ] call `POST /api/auricrux/execute`
- [ ] call `GET /api/audit/events`
- [ ] call `GET /api/audit/events/:eventId`

For each successful check, capture:
- route
- request context assumptions
- response status
- response shape
- whether repository-backed behavior is confirmed

---

## 7. Required Command Validation

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

If test coverage exists, also run:

```bash
npm run test
```

---

## 8. Definition of Done

Durable Target 01 route verification is complete only when:

- [ ] all in-scope routes compile
- [ ] all in-scope routes return structured JSON
- [ ] all in-scope services are repository-backed
- [ ] `/api/auricrux/execute` writes both action and audit records
- [ ] tenant-safe behavior is preserved
- [ ] lint/typecheck/build pass
- [ ] resulting artifact paths and validation results are reported explicitly

---

## 9. Failure Conditions

049V fails if:
- route output remains hardcoded where repository-backed output is expected
- service rewiring is incomplete
- audit creation is missing from Auricrux execute path
- tenant scoping is bypassed
- completion is claimed without validation results
- memory-backed verification is represented as full live provider-backed durability

---

## 10. Reporting Requirement

Any execution applying this packet must report:
- branch name
- changed files
- validation command results
- exact routes verified
- exact remaining blockers

No vague “done” claim is acceptable.

---

## 11. Next Action

Produce:

**`FCA_PACKET_049W_DURABLE_TARGET_01_DEFINITION_OF_DONE_AND_BLOCKER_PACKET.md`**

That packet should define the exact blocker classes, release gate, and closeout standard for Durable Target 01.