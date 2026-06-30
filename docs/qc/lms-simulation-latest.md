# FCA Academy LMS Simulation

- **When:** 2026-06-30T02:38:39.405Z
- **Run ID:** LMS-SIM-1782787106627
- **API:** https://api.futurecontractorsofamerica.com
- **SWA:** https://futurecontractorsofamerica.com
- **Result:** 4 FAILURE(S) - 169/173 passed

## What this proves

This robot exercises Academy catalog depth, live learner API mutations, SWA route reachability, and central content artifacts � without manual LMS walkthrough.

## Phases

| Phase | Focus |
|-------|--------|
| 1 | Static/content QC (catalog, media, CTAs, commerce wiring) |
| 2 | Live learner workflow (login, catalog, PATCH progress, commerce intake) |
| 3 | Live SWA routes (/academy, /academy/store, /portal/academy) |
| 4 | Central academy artifacts (when auricrux-central sibling present) |

## Steps

- **PASS** script:validate-academy-ctas.mjs
- **PASS** script:validate-academy-catalog.mjs
- **PASS** script:validate-catalog-balance.mjs
- **PASS** script:validate-academy-media.mjs
- **PASS** script:validate-academy-readiness-overlay.mjs
- **PASS** script:validate-academy-live-api.mjs
- **FAIL** script:validate-academy-native-commerce-journey.mjs
- **PASS** program-meta:fca-workspace-quick-start
- **PASS** program-link:fca-workspace-quick-start: /portal/projects
- **PASS** course-lessons:ONB-001: 4 lessons
- **PASS** course-titles:ONB-001
- **PASS** lesson-media:ONB-001:1: lecture+lab
- **PASS** lesson-media:ONB-001:2: lecture+lab
- **PASS** lesson-media:ONB-001:3: lecture+lab
- **PASS** lesson-media:ONB-001:4: lecture+lab
- **PASS** program-meta:electrical-apprenticeship-year1
- **PASS** program-link:electrical-apprenticeship-year1: /portal/support
- **PASS** course-lessons:APP-ELEC-101: 6 lessons
- **PASS** course-titles:APP-ELEC-101
- **PASS** lesson-media:APP-ELEC-101:1: lecture+lab
- **PASS** lesson-media:APP-ELEC-101:2: lecture+lab
- **PASS** lesson-media:APP-ELEC-101:3: lecture+lab
- **PASS** lesson-media:APP-ELEC-101:4: lecture+lab
- **PASS** lesson-media:APP-ELEC-101:5: lecture+lab
- **PASS** lesson-media:APP-ELEC-101:6: lecture+lab
- **PASS** program-meta:osha30-certification-prep
- **PASS** program-link:osha30-certification-prep: /portal/audit
- **PASS** course-lessons:CERT-OSHA30-201: 6 lessons
- **PASS** course-titles:CERT-OSHA30-201
- **PASS** lesson-media:CERT-OSHA30-201:1: lecture+lab
- **PASS** lesson-media:CERT-OSHA30-201:2: lecture+lab
- **PASS** lesson-media:CERT-OSHA30-201:3: lecture+lab
- **PASS** lesson-media:CERT-OSHA30-201:4: lecture+lab
- **PASS** lesson-media:CERT-OSHA30-201:5: lecture+lab
- **PASS** lesson-media:CERT-OSHA30-201:6: lecture+lab
- **PASS** program-meta:aas-construction-operations-sem1
- **PASS** program-link:aas-construction-operations-sem1: /portal/platform
- **PASS** course-lessons:DEG-AAS-110: 6 lessons
- **PASS** course-titles:DEG-AAS-110
- **PASS** lesson-media:DEG-AAS-110:1: lecture+lab
- **PASS** lesson-media:DEG-AAS-110:2: lecture+lab
- **PASS** lesson-media:DEG-AAS-110:3: lecture+lab
- **PASS** lesson-media:DEG-AAS-110:4: lecture+lab
- **PASS** lesson-media:DEG-AAS-110:5: lecture+lab
- **PASS** lesson-media:DEG-AAS-110:6: lecture+lab
- **PASS** program-meta:virginia-dpor-residential-license-prep
- **PASS** program-link:virginia-dpor-residential-license-prep: /portal/files
- **PASS** course-lessons:LIC-DPOR-301: 6 lessons
- **PASS** course-titles:LIC-DPOR-301
- **PASS** lesson-media:LIC-DPOR-301:1: lecture+lab
- **PASS** lesson-media:LIC-DPOR-301:2: lecture+lab
- **PASS** lesson-media:LIC-DPOR-301:3: lecture+lab
- **PASS** lesson-media:LIC-DPOR-301:4: lecture+lab
- **PASS** lesson-media:LIC-DPOR-301:5: lecture+lab
- **PASS** lesson-media:LIC-DPOR-301:6: lecture+lab
- **PASS** program-meta:fca-contractor-command-user-guide
- **PASS** program-link:fca-contractor-command-user-guide: /portal
- **PASS** course-lessons:GUIDE-FCA-001: 6 lessons
- **PASS** course-titles:GUIDE-FCA-001
- **PASS** lesson-media:GUIDE-FCA-001:1: lecture+lab
- **PASS** lesson-media:GUIDE-FCA-001:2: lecture+lab
- **PASS** lesson-media:GUIDE-FCA-001:3: lecture+lab
- **PASS** lesson-media:GUIDE-FCA-001:4: lecture+lab
- **PASS** lesson-media:GUIDE-FCA-001:5: lecture+lab
- **PASS** lesson-media:GUIDE-FCA-001:6: lecture+lab
- **PASS** program-meta:fca-bids-qualification-estimates
- **PASS** program-link:fca-bids-qualification-estimates: /portal/bids
- **PASS** course-lessons:FCA-BIDS-101: 5 lessons
- **PASS** course-titles:FCA-BIDS-101
- **PASS** lesson-media:FCA-BIDS-101:1: lecture+lab
- **PASS** lesson-media:FCA-BIDS-101:2: lecture+lab
- **PASS** lesson-media:FCA-BIDS-101:3: lecture+lab
- **PASS** lesson-media:FCA-BIDS-101:4: lecture+lab
- **PASS** lesson-media:FCA-BIDS-101:5: lecture+lab
- **PASS** program-meta:fca-projects-stage-control
- **PASS** program-link:fca-projects-stage-control: /portal/projects
- **PASS** course-lessons:FCA-PROJ-201: 5 lessons
- **PASS** course-titles:FCA-PROJ-201
- **PASS** lesson-media:FCA-PROJ-201:1: lecture+lab
- **PASS** lesson-media:FCA-PROJ-201:2: lecture+lab
- **PASS** lesson-media:FCA-PROJ-201:3: lecture+lab
- **PASS** lesson-media:FCA-PROJ-201:4: lecture+lab
- **PASS** lesson-media:FCA-PROJ-201:5: lecture+lab
- **PASS** program-meta:fca-files-audit-governance
- **PASS** program-link:fca-files-audit-governance: /portal/files
- **PASS** course-lessons:FCA-FILE-301: 4 lessons
- **PASS** course-titles:FCA-FILE-301
- **PASS** lesson-media:FCA-FILE-301:1: lecture+lab
- **PASS** lesson-media:FCA-FILE-301:2: lecture+lab
- **PASS** lesson-media:FCA-FILE-301:3: lecture+lab
- **PASS** lesson-media:FCA-FILE-301:4: lecture+lab
- **PASS** program-meta:fca-billing-invoicing
- **PASS** program-link:fca-billing-invoicing: /portal/billing
- **PASS** course-lessons:FCA-BILL-401: 4 lessons
- **PASS** course-titles:FCA-BILL-401
- **PASS** lesson-media:FCA-BILL-401:1: lecture+lab
- **PASS** lesson-media:FCA-BILL-401:2: lecture+lab
- **PASS** lesson-media:FCA-BILL-401:3: lecture+lab
- **PASS** lesson-media:FCA-BILL-401:4: lecture+lab
- **PASS** program-meta:fca-legal-command-workspace
- **PASS** program-link:fca-legal-command-workspace: /portal/legal
- **PASS** course-lessons:FCA-LEGAL-501: 4 lessons
- **PASS** course-titles:FCA-LEGAL-501
- **PASS** lesson-media:FCA-LEGAL-501:1: lecture+lab
- **PASS** lesson-media:FCA-LEGAL-501:2: lecture+lab
- **PASS** lesson-media:FCA-LEGAL-501:3: lecture+lab
- **PASS** lesson-media:FCA-LEGAL-501:4: lecture+lab
- **PASS** program-meta:fca-support-auricrux-operator
- **PASS** program-link:fca-support-auricrux-operator: /portal/support
- **PASS** course-lessons:FCA-SUP-601: 4 lessons
- **PASS** course-titles:FCA-SUP-601
- **PASS** lesson-media:FCA-SUP-601:1: lecture+lab
- **PASS** lesson-media:FCA-SUP-601:2: lecture+lab
- **PASS** lesson-media:FCA-SUP-601:3: lecture+lab
- **PASS** lesson-media:FCA-SUP-601:4: lecture+lab
- **PASS** program-meta:fca-academy-progress-tracking
- **PASS** program-link:fca-academy-progress-tracking: /academy/dashboard
- **PASS** course-lessons:FCA-ACAD-701: 3 lessons
- **PASS** course-titles:FCA-ACAD-701
- **PASS** lesson-media:FCA-ACAD-701:1: lecture+lab
- **PASS** lesson-media:FCA-ACAD-701:2: lecture+lab
- **PASS** lesson-media:FCA-ACAD-701:3: lecture+lab
- **PASS** program-meta:contractor-business-formation-legal
- **PASS** program-link:contractor-business-formation-legal: /portal/legal
- **PASS** course-lessons:LEGAL-FORM-201: 4 lessons
- **PASS** course-titles:LEGAL-FORM-201
- **PASS** lesson-media:LEGAL-FORM-201:1: lecture+lab
- **PASS** lesson-media:LEGAL-FORM-201:2: lecture+lab
- **PASS** lesson-media:LEGAL-FORM-201:3: lecture+lab
- **PASS** lesson-media:LEGAL-FORM-201:4: lecture+lab
- **PASS** program-meta:contractor-construction-law-essentials
- **PASS** program-link:contractor-construction-law-essentials: /portal/legal
- **PASS** course-lessons:LEGAL-CONST-301: 4 lessons
- **PASS** course-titles:LEGAL-CONST-301
- **PASS** lesson-media:LEGAL-CONST-301:1: lecture+lab
- **PASS** lesson-media:LEGAL-CONST-301:2: lecture+lab
- **PASS** lesson-media:LEGAL-CONST-301:3: lecture+lab
- **PASS** lesson-media:LEGAL-CONST-301:4: lecture+lab
- **PASS** pathways: 3 defined
- **PASS** legal-program:contractor-business-formation-legal: Contractor Business Formation & Legal Setup
- **PASS** legal-program:contractor-construction-law-essentials: Construction Law Essentials for Contractors
- **PASS** legal-api:academy-program-modules: program detail builder present
- **PASS** api:academy-lms: programs in API: 1212
- **PASS** api:catalog-integrity: aligned
- **PASS** api:academy-learners: 4 learners
- **PASS** api:academy-enrollments: 11 enrollments
- **PASS** lms-surface:src/pages/academy/AcademyHome.jsx
- **PASS** lms-surface:src/pages/academy/AcademyCatalog.jsx
- **PASS** lms-surface:src/pages/academy/AcademyModuleLesson.jsx
- **PASS** lms-surface:src/pages/academy/AcademyProgramDetail.jsx
- **PASS** lms-surface:src/hooks/useAcademyLms.js
- **PASS** lms-surface:src/api/academyClient.js
- **PASS** Academy API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Academy API health: https://api.futurecontractorsofamerica.com
- **PASS** Academy customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Academy catalog summary: 1212 programs
- **PASS** Academy catalog total: 1212
- **PASS** Academy catalog integrity: aligned
- **PASS** Academy lane apprenticeship: 207
- **PASS** Academy lane certification: 88
- **PASS** Academy lane degree: 803
- **PASS** Academy lane licensure: 82
- **PASS** Academy lane professional: 23
- **PASS** Academy lane fca-how-to: 9
- **PASS** Academy LMS snapshot: 4 learners, 4 enrollments
- **PASS** Academy progress PATCH: ENR-001
- **PASS** Academy lane catalog probe: electrical-core-level-1
- **PASS** Academy commerce intake: INTAKE-1782787118101
- **FAIL** SWA route /academy: shell OK but API probe error: Unexpected end of JSON input
- **FAIL** SWA route /academy/catalog: shell OK but API probe error: Unexpected end of JSON input
- **FAIL** SWA route /academy/store: shell OK but API probe error: Unexpected end of JSON input
- **PASS** SWA route /portal/academy: 200 SPA shell OK
- **PASS** Central academy artifacts: skipped � auricrux-central sibling not present

## For the founder

- Green = Academy worked on live surfaces when this ran.
- Red = repair loop will queue bounded fixes; see `docs/qc/lms-repair-latest.md`.
- Re-run: `npm run sim:lms`
- Full loop: `npm run sim:lms:loop`
