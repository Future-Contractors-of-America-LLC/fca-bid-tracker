# FCA Workflow Simulation

- **When:** 2026-07-03T07:03:13.050Z
- **Run ID:** SIM-1783062114525
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 16/16 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_0bdf52ba
- **PASS** Qualify lead: opp_lead_0bdf52ba
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_0bdf52ba
- **PASS** Create RFI: RFI-1783062148894
- **PASS** Create change order: CO-1783062155252
- **PASS** Create field task: FT-1783062171159
- **PASS** Payment intake: INTAKE-1783062177182
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1783062189966
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
