# FCA Workflow Simulation

- **When:** 2026-06-27T03:54:13.978Z
- **Run ID:** SIM-1782532428314
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** 1 FAILURE(S) - 16/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_68e0e1ba
- **PASS** Qualify lead: opp_lead_68e0e1ba
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_68e0e1ba
- **PASS** Create RFI: RFI-1782532433494
- **PASS** Create change order: CO-1782532434887
- **PASS** Create field task: FT-1782532438487
- **PASS** Payment intake: INTAKE-1782532440463
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782532445524
- **FAIL** Auricrux recommend: HTTP 500
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
