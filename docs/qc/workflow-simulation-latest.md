# FCA Workflow Simulation

- **When:** 2026-07-02T21:04:50.015Z
- **Run ID:** SIM-1783026259025
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 16/16 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_e1e460aa
- **PASS** Qualify lead: opp_lead_e1e460aa
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_e1e460aa
- **PASS** Create RFI: RFI-1783026267261
- **PASS** Create change order: CO-1783026271246
- **PASS** Create field task: FT-1783026278541
- **PASS** Payment intake: INTAKE-1783026283050
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1783026287743
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
