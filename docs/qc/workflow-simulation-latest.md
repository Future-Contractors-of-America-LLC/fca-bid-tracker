# FCA Workflow Simulation

- **When:** 2026-06-28T14:12:46.690Z
- **Run ID:** SIM-1782655918906
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_76d1e965
- **PASS** Qualify lead: opp_lead_76d1e965
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_76d1e965
- **PASS** Create RFI: RFI-1782655929929
- **PASS** Create change order: CO-1782655933743
- **PASS** Create field task: FT-1782655947331
- **PASS** Payment intake: INTAKE-1782655955415
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782655963800
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
