# FCA Workflow Simulation

- **When:** 2026-06-28T02:54:01.855Z
- **Run ID:** SIM-1782615110533
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_8f60f6ac
- **PASS** Qualify lead: opp_lead_8f60f6ac
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_8f60f6ac
- **PASS** Create RFI: RFI-1782615118602
- **PASS** Create change order: CO-1782615120582
- **PASS** Create field task: FT-1782615130542
- **PASS** Payment intake: INTAKE-1782615139310
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782615148452
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
