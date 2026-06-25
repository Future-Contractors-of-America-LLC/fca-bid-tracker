# FCA Workflow Simulation

- **When:** 2026-06-25T20:04:05.869Z
- **Run ID:** SIM-1782417821696
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_27ae6cca
- **PASS** Qualify lead: opp_lead_27ae6cca
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_27ae6cca
- **PASS** Create RFI: RFI-1782417827477
- **PASS** Create change order: CO-1782417828902
- **PASS** Create field task: FT-1782417833199
- **PASS** Payment intake: INTAKE-1782417837285
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782417843060
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
