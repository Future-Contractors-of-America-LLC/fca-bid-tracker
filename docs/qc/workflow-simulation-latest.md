# FCA Workflow Simulation

- **When:** 2026-07-01T05:22:59.427Z
- **Run ID:** SIM-1782883321214
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 16/16 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_b6d4f315
- **PASS** Qualify lead: opp_lead_b6d4f315
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_b6d4f315
- **PASS** Create RFI: RFI-1782883342348
- **PASS** Create change order: CO-1782883352718
- **PASS** Create field task: FT-1782883363640
- **PASS** Payment intake: INTAKE-1782883370136
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782883376517
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
