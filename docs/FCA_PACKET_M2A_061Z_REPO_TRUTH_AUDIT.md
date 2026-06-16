# FCA Packet M2A — 061Z+ Repo Truth Audit

Status: Active
Date: 2026-06-16
Branch: auricrux/m2a-repo-truth-audit
Owner: Auricrux Exec
Purpose: Establish repo-truth reality for preserved 061Z work and post-061Z SaaS/LMS implementation surfaces.

---

## 1. Executive Decision

061Z continuity appears preserved in repo history.
A complete frontend/backend shell exists in repo structure.
The repo contains more than eight SaaS surfaces/modules.
The repo does **not yet prove** eight complete LMS courses.
The repo does **not yet prove** all listed SaaS modules are fully real end-to-end operational workflows.

This packet locks the distinction between:
- preserved work
- repo-present surfaces
- partially real workflow capability
- shell-only or editorial Academy content
- not-yet-proven live/runtime truth

---

## 2. Confirmed 061Z Preservation

The repository history contains explicit 061Z and adjacent continuity commits, including:
- Add 061Z transition assessment and continuity correction
- Add 061Z final deployment package and preview clearance list
- Record 061Z run-boundary correction for stale PR deploy evidence
- Fix live deployment verifier surfaces and unblock 061Z proof workflows
- Wire 061Z blocker-clearance proof lanes and lock transition scope

Conclusion:
- 061Z-era work is preserved in commit history.
- 061Z documentation artifacts are present under docs/.
- Post-061Z continuity packet chain is also present in docs/ through later packet letters.

---

## 3. Repo Truth Classification Standard

Each surface is classified as one of:

### REAL-PRESENT
Repo contains:
- route or endpoint
- named object/store surface
- clear functional purpose
- more than a placeholder shell

### PARTIAL-REAL
Repo contains:
- route or endpoint
- some state mutation or read behavior
- incomplete lifecycle coverage, persistence proof, or parity proof

### SHELL-ONLY
Repo contains:
- page, route, or API wrapper
- weak or absent object truth
- no strong evidence of real operational continuity

### NOT-PROVEN
Repo may imply capability, but current inspection does not prove:
- end-to-end durability
- full state linkage
- live behavior
- credentialed user flow
- transcript/credential/assessment reality

---

## 4. Frontend Shell Truth

Confirmed frontend shell present:
- src/routes.js
- src/pages/website/*
- src/pages/portal/*
- src/pages/academy/*

Confirmed high-level route groups:
- public website routes
- portal routes
- academy routes
- detail routes for opportunities and projects

Conclusion:
- frontend shell is present and broad.
- route-level product framing exists.
- route presence alone does not prove full workflow truth.

---

## 5. Backend Shell Truth

Confirmed backend/auth/store surfaces present:
- api/customer-session.js
- api/customer-login.js
- api/customer-logout.js
- api/auth-boundary.js
- api/workflow-store.js
- api/workspace-read-models.js
- api/academy-store.js
- api/files.js
- api/files-summary.js
- api/leads-store.js
- api/projects.js
- api/finance-store.js
- api/warranty-store.js
- api/commercial-store.js

Conclusion:
- backend shell is present.
- auth boundary exists.
- shared workflow and Academy stores exist.
- existence does not equal full operational proof.

---

## 6. SaaS Repo Truth Inventory

### Confirmed SaaS surfaces/modules in repo

1. Leads
- API: leads.js, leads-store.js, lead-detail.js, lead-qualify.js
- Classification: PARTIAL-REAL

2. Opportunities
- API: opportunities-workspace.js, opportunity-convert.js
- UI: PortalOpportunityDetail.jsx
- Classification: PARTIAL-REAL

3. Bids
- API: bids.js, api/bids/*
- UI: PortalBids.jsx
- Classification: REAL-PRESENT

4. Estimates
- API: estimates.js
- UI: PortalEstimates.jsx
- Classification: PARTIAL-REAL

5. Projects / Project Spine
- API: projects.js, projects-workspace.js, api/projects/*
- UI: PortalProjects.jsx, PortalProjectDetail.jsx
- Classification: PARTIAL-REAL

6. Files / File Spine
- API: files.js, files-summary.js
- UI: PortalFiles.jsx
- Classification: PARTIAL-REAL

7. Audit
- API: audit-events-summary.js, workflow-audit.js
- UI: PortalAudit.jsx
- Classification: PARTIAL-REAL

8. Billing / Finance
- API: billing-summary.js, finance-store.js, job-cost.js, pay-apps.js
- UI: PortalBilling.jsx
- Classification: PARTIAL-REAL

9. Proposals
- API: proposals.js
- UI: PortalProposals.jsx
- Classification: PARTIAL-REAL

10. Change Orders
- API: change-orders.js
- Classification: PARTIAL-REAL

11. Warranty
- API: warranty-cases.js, warranty-store.js
- Website/portal-linked surface present
- Classification: PARTIAL-REAL

12. Closeout Packages
- API: closeout-packages.js
- Classification: PARTIAL-REAL

13. Customer Messaging / Notifications
- UI: PortalMessages.jsx, PortalNotifications.jsx
- Classification: SHELL-ONLY to PARTIAL-REAL

14. Support / Auricrux / Operations / Admin / Profile
- UI: PortalSupport.jsx, PortalAuricrux.jsx, PortalOperations.jsx, PortalAdmin.jsx, PortalProfile.jsx
- Classification: SHELL-ONLY to PARTIAL-REAL depending on endpoint backing

### SaaS count conclusion
The repo clearly contains **8 or more SaaS surfaces/tools/modules**.

### SaaS truth conclusion
However, the repo does **not yet prove** that all required flagship workflows are fully real end-to-end for:
- takeoff
- permit
- field supervisor
- RFI
- scheduling
- QC
- closeout
- full finance lifecycle

Those remain **partially present or not yet proven** from current inspection.

---

## 7. LMS / Academy Repo Truth Inventory

### Confirmed Academy infrastructure
- API: academy-store.js
- API: academy-lms.js
- API: academy-remediation-summary.js
- API: remediation-links.js
- API: remediation-store.js
- UI: AcademyHome.jsx
- UI: AcademyCatalog.jsx
- Data: src/academyCatalog.js

### Confirmed catalog/program count in repo data
The inspected catalog data currently proves **4 programs**:
1. ops-core
2. precon-estimating
3. project-controls
4. field-readiness

### Confirmed Academy state structures in repo
academy-store.js contains seeded in-memory structures for:
- learners
- enrollments
- certificates
- program assignment
- progress advancement
- certificate issuance

### Academy truth classification
1. Program catalog: PARTIAL-REAL
2. Enrollment assignment: PARTIAL-REAL
3. Progress mutation: PARTIAL-REAL
4. Certificate issuance: PARTIAL-REAL
5. Transcript-grade-assessment-depth: NOT-PROVEN
6. Degree pathway reality: NOT-PROVEN
7. Licensure pathway reality: NOT-PROVEN
8. Apprenticeship cohort/admin reality at scale: NOT-PROVEN

### LMS count conclusion
The repo does **not prove 8 complete LMS courses**.
Current repo-truth evidence proves:
- 4 catalog programs
- seeded learner/enrollment/progress/certificate mechanics
- remediation and parity scaffolding

It does **not yet prove**:
- 8 complete courses
- full assessment engines
- transcript system depth
- degree-pathway operations
- licensure-pathway operations
- apprenticeship administration depth

---

## 8. SaaS vs LMS Truth Delta

### What is stronger right now
SaaS repo breadth is stronger than LMS course completeness.

### What is weaker right now
Academy content depth and pathway proof are weaker than SaaS surface breadth.

### Current mismatch
The user expectation is:
- real SaaS doing the job truly
- real LMS teaching the job truly

Current repo truth is closer to:
- broad SaaS shell + several partial-real workflow surfaces
- Academy shell + 4 program catalog entries + seeded progress/certificate logic

This is progress, but it is **not yet full parity with the stated target**.

---

## 9. Required Correction Order

### M2A-1 — Lock truth wording
Do not claim:
- 8 complete LMS courses
- fully real end-to-end all-module SaaS truth
until verified.

### M2A-2 — Promote first real SaaS vertical slice
Required proof chain:
Lead → Opportunity → Estimate → Bid → Project → Files → Audit

### M2A-3 — Promote first real Academy vertical slice
Required proof chain:
Program → Enrollment → Lesson/Progress → Assessment → Credential/Transcript

### M2A-4 — Expand Academy from 4 to 8 real courses
Target next four course completions should be operationally linked to live SaaS workflows, not editorially added for count inflation.

### M2A-5 — Enforce DO/TEACH parity
Each promoted SaaS workflow must map to Academy instruction.
Each Academy course must map to a real SaaS workflow or real trade/credential pathway.

---

## 10. Exact Truth Statement Locked

As of this packet:
- 061Z work: preserved
- post-061Z work: present in repo
- frontend shell: present
- backend shell: present
- 8+ SaaS modules/surfaces: present in repo
- 8 complete LMS courses: not proven
- fully real SaaS across all named construction domains: not proven
- fully real LMS across apprenticeship/certification/degree/licensure: not proven

This statement is now the canonical repo-truth baseline for next implementation work.

---

## 11. Next Packet

Next required packet:
**M2B — Auth Truth Hardening + Session Contract Normalization Audit**

Scope:
- normalize customer-session / customer-login / customer-logout response truth
- remove auth contract drift between frontend and backend
- align session truth for Portal and Academy
- prepare for first real SaaS and Academy vertical-slice enforcement
