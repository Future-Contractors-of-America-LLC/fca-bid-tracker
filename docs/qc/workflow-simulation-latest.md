# FCA Workflow Simulation

- **When:** 2026-06-25T01:12:52.499Z
- **Run ID:** SIM-1782349960219
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_f2a4eac1
- **PASS** Qualify lead: opp_lead_f2a4eac1
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_f2a4eac1
- **PASS** Create RFI: RFI-1782349964764
- **PASS** Create change order: CO-1782349965858
- **PASS** Create field task: FT-1782349968266
- **PASS** Payment intake: INTAKE-1782349970163
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782349971906
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
