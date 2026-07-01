# FCA Workflow Simulation

- **When:** 2026-07-01T21:27:49.622Z
- **Run ID:** SIM-1782941222834
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 16/16 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_4873ac8f
- **PASS** Qualify lead: opp_lead_4873ac8f
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_4873ac8f
- **PASS** Create RFI: RFI-1782941241284
- **PASS** Create change order: CO-1782941249301
- **PASS** Create field task: FT-1782941259678
- **PASS** Payment intake: INTAKE-1782941263287
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782941267341
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
