# FCA COVERAGE MATRIX

Status: Active working control artifact  
Flagship Product: FCA Contractor Command  
Purpose: Enforce a single no-gap product spine across website, portal, API, storage, audit, and Auricrux action layers.

---

## 1. Enforcement Rules

1. No module stands alone.
2. Every module must attach to the flagship product spine.
3. Every action must produce output.
4. Every record must be auditable.
5. Every applicable module must accept file or evidence input.
6. Every applicable module must expose Auricrux assistance.
7. If a surface does not map to object + lifecycle state + artifact + audit + next action, it is a gap.

### Gap Condition

A system gap exists if any of the following is missing:

- structured object
- lifecycle state
- artifact output
- audit event
- customer-visible utility
- operator next action
- file or evidence linkage
- Auricrux action path

---

## 2. Flagship Product Spine

Primary flagship product:

- FCA Contractor Command

Required spine:

1. Lead / opportunity intake
2. Qualification
3. File and evidence handling
4. Bid / estimate workflow
5. Proposal / client submission package
6. Award / decline decision
7. Job setup
8. Client portal access
9. Audit trail
10. Guided Auricrux assistance

No new major lane unless it strengthens this spine.

---

## 3. Core Object Model

| Object | Required Now | Purpose | Minimum Required Fields |
|---|---|---|---|
| Tenant | Yes | Customer account boundary | tenantId, tenantName, status, subscriptionStatus |
| User | Yes | Authenticated actor | userId, tenantId, role, email, status |
| Lead | Yes | Initial inbound opportunity | leadId, tenantId, source, contactName, companyName, projectType, createdAt |
| Opportunity | Yes | Qualified sales object | opportunityId, tenantId, leadId, status, ownerUserId, dueDate |
| Client | Yes | Customer organization/contact structure | clientId, tenantId, companyName, primaryContact, email, phone |
| Project | Yes | Job/home object after award | projectId, tenantId, clientId, sourceOpportunityId, status, address |
| Bid | Yes | Bid tracking object | bidId, tenantId, opportunityId, projectId, status, dueDate, estimator, amount |
| Estimate | Yes | Structured pricing object | estimateId, tenantId, bidId, version, totals, assumptions, exclusions |
| File | Yes | Evidence/document spine | fileId, tenantId, relatedObjectType, relatedObjectId, fileName, fileType, version, uploadedAt |
| Proposal | Yes | Customer-facing output package | proposalId, tenantId, bidId, estimateId, version, status, generatedAt |
| Audit Event | Yes | Traceability layer | eventId, tenantId, objectType, objectId, actorType, actorId, action, reason, beforeJson, afterJson, createdAt |
| Task / Next Action | Yes | Guided continuity | taskId, tenantId, objectType, objectId, ownerUserId, status, dueDate |
| Training Link | Soon | Academy continuity hook | trainingLinkId, tenantId, objectType, objectId, lessonId, triggerReason |
| Credential | Later | Workforce and academy credential spine | credentialId, tenantId, userId, type, issuer, status, expirationDate |

---

## 4. Lifecycle State Model

### Sales-to-Operations Vertical Slice

Lead -> Qualified -> Bid -> Estimated -> Proposed -> Submitted -> Awarded / Declined -> Job Setup

### Extended FCA Lifecycle

Lead -> Qualified -> Pre-Design -> Design -> CD -> Bid -> Permit -> Build -> QA -> Closeout -> Warranty -> Growth -> Feedback

Rules:

- no record may skip state without a recorded reason
- every state transition must generate an audit event
- every completed state must preserve its required artifacts

---

## 5. Module Coverage Matrix

| Module | Spine Role | Primary Objects | Required Inputs | Required Outputs | UI Surface | API Surface | Audit Required | Auricrux Actions |
|---|---|---|---|---|---|---|---|---|
| Lead Intake | Entry | Lead, Client | form data, contact data, files | lead record, intake summary | Website CTA / Portal intake | /api/leads | Yes | explain, qualify, detect missing info |
| Qualification | Triage | Opportunity, Lead | lead data, notes, evidence | qualification result, next action | Portal pipeline | /api/opportunities | Yes | recommend, score, route |
| File Intake | Evidence spine | File, Audit Event | uploads, metadata | stored file, index, briefing | Opportunity / Project files tab | /api/files | Yes | summarize, classify, detect gaps |
| Bid Tracking | Commercial core | Bid, Opportunity | bid fields, dates, owner | bid record, status updates | Bid tracker | /api/bids | Yes | monitor, remind, analyze |
| Estimating | Pricing core | Estimate, Bid | takeoff/manual pricing, assumptions | estimate version, totals | Estimate workspace | /api/estimates | Yes | draft, compare, flag inconsistencies |
| Proposal Generator | Customer trust surface | Proposal, Estimate | estimate, templates, files | proposal package/pdf | Proposal view | /api/proposals | Yes | draft narrative, exclusions, scope summary |
| Award / Decline | Conversion gate | Opportunity, Project | decision, customer response | award event, decline reason, job setup initiation | Pipeline / CRM | /api/opportunities/:id/decision | Yes | route handoff, detect missing setup |
| Job Setup | Ops handoff | Project, Client, Task | awarded opportunity, proposal, files | project record, baseline tasks | Portal projects | /api/projects | Yes | create baseline checklist |
| Client Portal | External trust surface | Project, Proposal, File | authenticated client access | shared records and documents | /portal | portal-backed APIs | Yes | explain status, guide next steps |
| Audit Ledger | System truth | Audit Event | all changes | immutable history | admin/audit | /api/audit | Yes | explain why change happened |
| Auricrux Guidance | Embedded intelligence | Task, Audit Event, all | user context, object context | explanation, recommendation, execution result | global dock | action endpoints | Yes | explain, recommend, execute |
| Academy Linkage | Differentiation hook | Training Link, Credential | workflow trigger, role context | lesson/checklist assignment | academy pane | /api/training-links | Yes | teach, validate readiness |

---

## 6. Customer-Visible Surfaces Required

| Surface | Must Exist | Minimum Utility |
|---|---|---|
| Website | Yes | clear offer, CTA, login, trust narrative |
| Auth / Login | Yes | real user routing by tenant and role |
| Portal Home | Yes | opportunities, bids, projects, next actions |
| Opportunity Workspace | Yes | qualification, notes, evidence, next actions |
| Bid Workspace | Yes | bid details, estimate linkage, files, audit |
| Proposal View | Yes | customer-facing proposal package |
| Client Files View | Yes | shared evidence/documents |
| Support Surface | Yes | guided support + issue capture |
| Admin Surface | Yes | tenant, users, entitlements, audit visibility |

---

## 7. File / Evidence Rules

Every applicable module must:

- accept file input or reference files
- preserve provenance
- attach files to tenant and object
- support versioning
- record uploader / actor
- allow Auricrux document briefing

Minimum file metadata:

- fileId
- tenantId
- relatedObjectType
- relatedObjectId
- originalFileName
- normalizedFileType
- version
- hash
- uploadedBy
- uploadedAt

---

## 8. Audit / Correction Rules

Every Auricrux action must produce:

- action record
- reason
- affected object reference
- before / after snapshot where applicable
- timestamp
- actorType = auricrux

Every human action must produce:

- actor identity
- action summary
- object reference
- timestamp

Correction path required:

1. detect issue
2. record issue
3. propose correction
4. execute correction when allowed
5. preserve reversibility where applicable

---

## 9. Gap Detection Checklist

A module is incomplete if any answer is No:

- Is there a structured object?
- Is there a valid lifecycle state?
- Is there authenticated access where needed?
- Is there customer-visible utility?
- Is there file / evidence support?
- Is there an output artifact?
- Is there an audit event?
- Is there a next-action path?
- Is Auricrux embedded?
- Does it connect back to Tenant, User, and Project / Opportunity context?

---

## 10. Build Order

### Phase 1 — Lock flagship product spine

- Lead intake
- Qualification
- Bid tracker
- Estimate structure
- Proposal generator
- Award / decline
- Job setup
- Client portal visibility
- Audit trail
- Auricrux dock behavior

### Phase 2 — Evidence spine

- universal file attachment
- file indexing
- document briefing
- shared client files
- file-linked proposal packages

### Phase 3 — Operations continuity

- project workspace
- schedule placeholder
- tasks
- RFI / change-event placeholders
- baseline closeout / warranty hooks

### Phase 4 — Academy linkage

- contextual micro-lessons
- role-based checklists
- task-to-training linkage
- credential hooks

### Phase 5 — Advanced construction depth

- takeoff assistance
- redlines
- RFIs
- change orders
- QC / punch
- pay apps / job cost

---

## 11. Done / Not-Done Gates

A phase is DONE only if:

- route exists
- object exists
- API exists or callable storage path exists
- UI can create/read/update needed records
- audit logging works
- validation passes
- user can complete a real workflow

A phase is NOT DONE if:

- only mock UI exists
- data is seeded/demo only
- no tenant boundary exists
- no output artifact exists
- no audit exists
- no real user task can be completed

---

## 12. Immediate Next Implementation Target

Sales-to-Operations vertical slice:

Lead -> Qualification -> Bid -> Estimate -> Proposal -> Award -> Job Setup

Reason:

- highest customer clarity
- strongest revenue path
- fastest flagship-product proof
- strongest continuity-spine foundation
