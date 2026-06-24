# Founder Workflow Simulations

You do not need construction field experience to know whether FCA works. A **workflow robot** exercises the live product every 6 hours the same way an operator would - creating leads, qualifying, bidding, opening projects, RFIs, change orders, field tasks, payments, warranty cases, and Auricrux guidance.

## Read the latest result

Open **`docs/qc/workflow-simulation-latest.md`** in this repo (updated by CI after each run).

Or in GitHub: **Actions -> FCA Workflow Simulations -> latest run -> Summary**

## Run it yourself (one command)

```powershell
cd fca-bid-tracker-work
$env:FCA_SIM_LOGIN_EMAIL = "founder.test@futurecontractorsofamerica.com"
$env:FCA_SIM_LOGIN_PASSWORD = "<from FOUNDER_PRODUCT_TEST_ACCESS.md>"
npm run sim:workflow
```

Green steps = that workflow worked on the live API. Red = broken; do not sell or demo that path until fixed.

## What gets simulated

| Step | What a contractor would do |
|------|---------------------------|
| Customer login | Operator signs in (2FA supported when dev hint is enabled) |
| Lead intake | Portal intake creates governed lead |
| Qualify lead | Precon qualifies -> opportunity created |
| Advance bid | Estimator completes bid qualification checklist |
| Pipeline update | Stage moves toward estimate |
| Award -> project | Won job converts to active project |
| Create RFI | Field/precon asks a plan question |
| Change order | CO drafted on project |
| Field task | Superintendent assigns work |
| Payment | FCA native checkout intake + completion |
| Warranty | Post-closeout service request |
| Auricrux | Intelligence recommends next action |
| Academy | Training catalog loads |

## Login (required)

Add GitHub secrets (or local env vars before `npm run sim:workflow`):

- `FCA_SIM_LOGIN_EMAIL` - e.g. `founder.test@futurecontractorsofamerica.com`
- `FCA_SIM_LOGIN_PASSWORD` - from `docs/FOUNDER_PRODUCT_TEST_ACCESS.md`

Accounts with 2FA are supported when Central exposes `devVerificationHint` (same as CI auth smoke). Without credentials, the simulation fails at login - that is intentional; public API checks alone do not prove portal workflows work.

## How this differs from Cycle QC

Cycle validators mostly check **code wiring** (files exist, strings match). Workflow simulations check **behavior** - HTTP mutations against the live API. Both matter; only simulations tell you the product actually works for a customer journey.

## Schedule

- Every **6 hours** on `main`
- On every **push to main**
- Manual: **Actions -> FCA Workflow Simulations -> Run workflow**

## Repair loop (FCA/Auricrux law)

Workflow simulations alone **observe** behavior. The repair loop adds **Act** and **Review**:

```powershell
npm run sim:workflow:loop
```

Read `docs/FCA_REPAIR_LOOP_PROTOCOL.md` and `docs/qc/workflow-repair-latest.md`.

On failure the loop retries transient API issues, queues engineering/founder repair items in `auricrux/system/work_queue.json`, and asks Auricrux for review guidance on remaining failures.
