# FCA Workflow Simulation

- **When:** 2026-06-24T22:58:30.290Z
- **Run ID:** SIM-1782341905980
- **API:** https://api.futurecontractorsofamerica.com
- **Result:** 1 FAILURE(S) - 1/2 passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

- **PASS** API reachable: https://api.futurecontractorsofamerica.com
- **FAIL** Customer login: Invalid FCA customer credentials.

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: `npm run sim:workflow`
- GitHub Actions runs this every 6 hours on `main` (requires `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` secrets).
