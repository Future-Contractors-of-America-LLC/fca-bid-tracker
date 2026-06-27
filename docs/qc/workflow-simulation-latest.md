# FCA Workflow Simulation

- **When:** 2026-06-27T13:20:57.897Z
- **Run ID:** SIM-1782566429068
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** 1 FAILURE(S) - 16/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_7e07fd2a
- **PASS** Qualify lead: opp_lead_7e07fd2a
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_7e07fd2a
- **PASS** Create RFI: RFI-1782566434929
- **PASS** Create change order: CO-1782566436625
- **PASS** Create field task: FT-1782566441645
- **PASS** Payment intake: INTAKE-1782566443825
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782566448271
- **FAIL** Auricrux recommend: HTTP 500
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
