# Backend SaaS Cross-Reference Check

Date: 2026-07-01
Scope checked: shell routes, connector clients, FCA matrix coverage targets.

## Sources checked

1. FCA matrix: FCA_COVERAGE_MATRIX.md
2. Shell routes: src/routes.js
3. Shell CTA/state surfaces: src/websiteShell.js, src/portalShell.js, src/workspaceState.js
4. Connector clients: src/api/*.js

## Coverage status summary

Covered with clear shell + connector evidence:
1. Lead and opportunity flow
2. Bid, estimate, proposal, and project flow
3. Document/files and evidence surfaces
4. Takeoff and RFI surfaces
5. Redline-related flow signals
6. Change order and closeout surfaces
7. Scheduling and field operations surfaces
8. Billing, finance, and job cost surfaces
9. Warranty and support surfaces
10. Customer portal, admin, website conversion, and audit/governance continuity surfaces
11. VR/immersive surface presence

Partially covered or naming/contract gaps to close:
1. Award is present conceptually but not strongly represented as an explicit route/connector stage.
2. Project setup is present via project flows but not explicitly represented as a named contract surface.
3. Quality control is present in artifacts and lane language but weakly represented as explicit shell/connector naming.
4. Pay applications appear in backend handler inventory, but frontend connector exposure is not explicit in src/api client inventory.
5. Accounting is represented indirectly via finance and job cost, but explicit accounting contract naming is weak.
6. Punch is present as a route surface, but connector/domain contract explicitness should be tightened.

## Delta actions added to execution queue

1. Add explicit award and project-setup workflow contracts with named connector endpoints.
2. Add QC and punch contract surfaces with explicit client methods and continuity assertions.
3. Add pay-application connector client coverage and route-level integration checks.
4. Add explicit accounting contract namespace (even if implemented via finance/job-cost services).
5. Add matrix-to-route and matrix-to-connector parity validator in CI.

## Result

The plan covers the non-LMS platform breadth, including BIM/CAD, redlines, VR/immersive, scheduling, field evidence, warranty, leads, and finance.

The main remaining risk is not missing domain intent, but inconsistent explicitness between matrix language and shell/connector contract naming. This is now tracked for closure in execution.
