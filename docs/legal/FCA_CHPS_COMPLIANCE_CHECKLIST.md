# FCA Academy — CHPS EdTech Compliance Checklist
## For Colonial Heights Public Schools Committee Review

**Version:** 1.0  
**Date:** 2026-06-30  
**Prepared by:** Future Contractors of America LLC

This checklist maps each applicable federal and Virginia law to FCA Academy's implementation status. It is intended for review by the CHPS Innovative Learning Team, VDOE, and any other reviewing body.

---

## Federal Law Compliance

### FERPA — Family Educational Rights and Privacy Act
**Agency:** U.S. Department of Education / Student Privacy Policy Office (SPPO)

| Requirement | Status | Evidence |
|---|---|---|
| Student Data not disclosed without consent | ✅ Compliant | DPA Section 4 — no third-party disclosure |
| School official designation with legitimate educational interest | ✅ Compliant | DPA Section 5 |
| Parent right to inspect/correct student records | ✅ Compliant | DPA Section 10 — 10-day fulfillment SLA |
| No sale of education records | ✅ Compliant | DPA Section 4 |
| Annual notification of parent rights | 🔲 CHPS responsibility | CHPS handles via annual FERPA notice |

### COPPA — Children's Online Privacy Protection Act
**Agency:** Federal Trade Commission (FTC)

| Requirement | Status | Evidence |
|---|---|---|
| No collection of PII from under-13 without consent | ✅ Compliant | DPA Section 6 — school consent exception; no PII collected |
| Verifiable parental consent mechanism | ✅ Compliant | CHPS acts as consent operator; no self-registration |
| Clear privacy policy accessible to parents | 🔲 In Progress | `/privacy` page update planned (auth hardening sprint) |
| No behavioral advertising to children | ✅ Compliant | DPA Section 4 — no advertising use |
| Data minimization | ✅ Compliant | DPA Section 3 — only 6 data elements collected |
| Parental deletion right | ✅ Compliant | DPA Section 10 — via CHPS |

### PPRA — Protection of Pupil Rights Amendment
**Agency:** U.S. Department of Education

| Requirement | Status | Evidence |
|---|---|---|
| Parental consent for surveys collecting personal data | ✅ Compliant | No surveys or personal data collection in FCA Academy Year 1 |
| Annual notification of PPRA rights | 🔲 CHPS responsibility | CHPS handles via annual notice |

---

## Virginia Law Compliance

### SOPIPA — Student Online Personal Information Protection Act
**Authority:** Va. Code § 22.1-287.02 / Virginia Attorney General

| Requirement | Status | Evidence |
|---|---|---|
| No sale of student data | ✅ Compliant | DPA Section 4 |
| No targeted advertising to students | ✅ Compliant | DPA Section 4 |
| Data used solely for educational purposes | ✅ Compliant | DPA Section 4 |
| Reasonable security measures | ✅ Compliant | DPA Section 7 — TLS, encryption, RBAC, audit log |
| Breach notification to district | ✅ Compliant | DPA Section 8 — 72-hour notification |
| No disclosure to third parties | ✅ Compliant | DPA Section 4 |

### VCDPA — Virginia Consumer Data Protection Act
**Authority:** Virginia Attorney General

| Requirement | Status | Evidence |
|---|---|---|
| Data minimization | ✅ Compliant | DPA Section 3 |
| Purpose limitation | ✅ Compliant | DPA Section 4 |
| Security safeguards | ✅ Compliant | DPA Section 7 |
| No sale of sensitive data | ✅ Compliant | DPA Section 4 |
| Consumer rights (access, correction, deletion) | ✅ Compliant | DPA Section 9-10 |

### Virginia Data Privacy Agreement (VDPA)
**Authority:** Virginia Department of Education

| Requirement | Status | Evidence |
|---|---|---|
| Signed DPA with LEA before data processing | 🔲 Pending Signature | Online sign: `/legal/chps-dpa-sign.html` — transmittal to Chrissy Carr |
| DPA includes data use limitations | ✅ Compliant | DPA Sections 3, 4 |
| DPA includes security provisions | ✅ Compliant | DPA Section 7 |
| DPA includes breach notification | ✅ Compliant | DPA Section 8 |
| DPA includes retention/deletion | ✅ Compliant | DPA Section 9 |

---

## CHPS-Specific Requirements

### Colonial Heights Public Schools Innovative Learning Team

| Requirement | Status | Notes |
|---|---|---|
| Software submitted for CHPS vetting process | 🔲 In Progress | Committee review is the vetting step |
| Privacy policy accessible and current | 🔲 In Progress | Update in auth hardening sprint |
| No unauthorized data sharing with third parties | ✅ Compliant | Azure US-East only |
| Compliance with CHPS Acceptable Use Policy | 🔲 Pending review | Awaiting CHPS AUP document |

---

## Technical Security Status

| Control | Status | Notes |
|---|---|---|
| Session-based authentication (no ambient login) | 🔲 In Progress | Auth hardening sprint — `chps/auth-hardening` branch |
| HttpOnly + Secure + SameSite=Strict cookies | 🔲 In Progress | Auth hardening sprint |
| 30-minute idle timeout for student accounts | 🔲 In Progress | Auth hardening sprint |
| HTTP 401 on unauthenticated protected routes | 🔲 In Progress | Auth hardening sprint (seeded fallback removal) |
| Audit log for login/logout/session events | 🔲 In Progress | Auth hardening sprint |
| TLS 1.2+ on all endpoints | ✅ Compliant | Azure SWA enforces TLS |
| AES-256 encryption at rest | ✅ Compliant | Azure Table Storage default |
| No student PII in URL parameters | ✅ Compliant | Routes use non-identifying account IDs |
| RBAC — students see only their own data | 🔲 In Progress | Auth hardening sprint |

---

## Student Account System (Year 1 Pilot)

| Item | Status | Notes |
|---|---|---|
| 80 generic student accounts provisioned | 🔲 Planned | `chps/student-accounts` branch |
| Accounts contain no PII | ✅ Designed | Username format: `student-NNN` |
| Access via admin-issued access codes | 🔲 Planned | `chps/student-accounts` branch |
| No student self-registration | ✅ Designed | Admin-only provisioning |
| Progress stored under account ID only | ✅ Designed | No name or identifier linkage |

---

## Guidance Resources Referenced

| Resource | URL |
|---|---|
| FERPA (SPPO) | https://studentprivacy.ed.gov |
| COPPA (FTC) | https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa |
| PPRA (PTAC) | https://studentprivacy.ed.gov/resources/ppra-general-guidance |
| PTAC (Privacy Technical Assistance Center) | https://studentprivacy.ed.gov |
| VDOE Student Privacy | https://www.doe.virginia.gov/programs-services/student-services/student-records |
| Va. Code § 22.1-287.02 | https://law.lis.virginia.gov/vacode/title22.1/chapter14/section22.1-287.02/ |
| VCDPA | https://law.lis.virginia.gov/vacode/title59.1/chapter53/ |
| CHPS Technology & Innovative Learning | https://www.colonialhts.net/page/technology-innovation/ |

---

## Open Items Before Committee Submission

- [ ] Complete auth hardening sprint (`chps/auth-hardening`) — closes all 🔲 Technical Security items
- [ ] Provision 80 student accounts + access code generator (`chps/student-accounts`)
- [ ] Update `/privacy` and `/terms` pages with COPPA/SOPIPA/FERPA disclosures
- [ ] Obtain CHPS countersignature on DPA
- [ ] Confirm CHPS Acceptable Use Policy alignment
- [ ] Deploy updated build to live site
- [ ] Share committee review URL: `https://futurecontractorsofamerica.com/academy`

---

*Maintained by Future Contractors of America LLC. Last updated: 2026-06-30.*
