# FCA Workflow Simulation

- **When:** 2026-06-26T18:26:29.068Z
- **Run ID:** SIM-1782498370467
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_473b8f7e
- **PASS** Qualify lead: opp_lead_473b8f7e
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_473b8f7e
- **PASS** Create RFI: RFI-1782498377202
- **PASS** Create change order: CO-1782498378623
- **PASS** Create field task: FT-1782498382540
- **PASS** Payment intake: INTAKE-1782498384728
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782498387084
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
