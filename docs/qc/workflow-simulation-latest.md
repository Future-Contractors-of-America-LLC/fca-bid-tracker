# FCA Workflow Simulation

- **When:** 2026-06-27T15:13:15.164Z
- **Run ID:** SIM-1782573166838
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** 1 FAILURE(S) - 16/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_718f5438
- **PASS** Qualify lead: opp_lead_718f5438
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_718f5438
- **PASS** Create RFI: RFI-1782573174660
- **PASS** Create change order: CO-1782573178931
- **PASS** Create field task: FT-1782573185390
- **PASS** Payment intake: INTAKE-1782573188662
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782573193149
- **FAIL** Auricrux recommend: HTTP 500
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
