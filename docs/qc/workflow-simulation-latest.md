# FCA Workflow Simulation

- **When:** 2026-06-25T06:43:06.494Z
- **Run ID:** SIM-1782369772332
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** ALL STEPS PASSED - 17/17 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **PASS** Customer login: 2FA challenge issued
- **PASS** Customer verify: founder.test@futurecontractorsofamerica.com
- **PASS** Customer session
- **PASS** Lead intake: lead_54263183
- **PASS** Qualify lead: opp_lead_54263183
- **PASS** Advance bid qualification: BID-1
- **PASS** Pipeline stage update: estimate
- **PASS** Award -> project: project_opp_lead_54263183
- **PASS** Create RFI: RFI-1782369777931
- **PASS** Create change order: CO-1782369778944
- **PASS** Create field task: FT-1782369781424
- **PASS** Payment intake: INTAKE-1782369783756
- **PASS** Payment checkout: completed
- **PASS** Warranty intake: WAR-1782369785858
- **PASS** Auricrux recommend: guidance returned
- **PASS** Academy catalog: reachable

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every hour on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
