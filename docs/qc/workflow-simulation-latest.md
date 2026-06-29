# FCA Workflow Simulation

- **When:** 2026-06-29T07:30:06.503Z
- **Run ID:** SIM-1782718176386
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 16/16 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_c3885b59
- **PASS** Qualify lead: opp_lead_c3885b59
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_c3885b59
- **PASS** Create RFI: RFI-1782718187232
- **PASS** Create change order: CO-1782718189878
- **PASS** Create field task: FT-1782718194873
- **PASS** Payment intake: INTAKE-1782718197391
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782718200722
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
