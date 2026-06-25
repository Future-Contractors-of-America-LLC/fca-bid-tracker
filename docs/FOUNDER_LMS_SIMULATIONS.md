# Founder Academy LMS Simulations

You do not need to manually walk every Academy route to know whether FCA Academy works. An **LMS robot** exercises catalog depth, live learner API mutations, SWA routes, and commerce intake every hour — the same paths a training coordinator would use.

## Read the latest result

Open **`docs/qc/lms-simulation-latest.md`** or **`docs/qc/lms-repair-latest.md`** in this repo (updated by CI after each run).

Or in GitHub: **Actions -> FCA LMS Repair Loop -> latest run -> Summary**

## Run it yourself (one command)

```powershell
cd fca-bid-tracker-work
$env:FCA_SIM_LOGIN_EMAIL = "founder.test@futurecontractorsofamerica.com"
$env:FCA_SIM_LOGIN_PASSWORD = "<from FOUNDER_PRODUCT_TEST_ACCESS.md>"
npm run sim:lms
```

Green steps = that Academy path worked on live surfaces. Red = broken; do not sell or demo that path until fixed.

## What gets simulated

| Phase | What a training coordinator would do |
|-------|--------------------------------------|
| Static QC | Catalog integrity, lesson media, CTAs, commerce wiring |
| Learner login | Sign in with LMS-enabled QA account |
| Catalog summary | Verify program counts and lane integrity |
| LMS snapshot | Load learners and enrollments |
| Progress PATCH | Advance enrollment progress (safe test mutation) |
| Commerce intake | Create academy-course payment intake |
| SWA routes | Confirm `/academy`, catalog, store, portal academy load |
| Central artifacts | Content standards in auricrux-central (when sibling present) |

## Login (required)

Add GitHub secrets (or local env vars before `npm run sim:lms`):

- `FCA_SIM_LOGIN_EMAIL` — e.g. `founder.test@futurecontractorsofamerica.com`
- `FCA_SIM_LOGIN_PASSWORD` — from `docs/FOUNDER_PRODUCT_TEST_ACCESS.md`

Accounts must have **LMS entitlement** (`lms: true`). Without credentials, learner workflow steps fail at login — that is intentional.

## How this differs from Cycle QC

`npm run qc:lms` checks **code wiring and static catalog depth** on push/PR. Academy simulations check **behavior** — HTTP mutations and live SWA routes. Both matter; only simulations tell you the LMS actually works for a learner journey.

## Schedule

- Every **hour at :30** on `main` (staggered from contractor workflow sim at :00)
- On every **push to main**
- Manual: **Actions -> FCA LMS Repair Loop -> Run workflow**

## Repair loop (FCA Academy coverage law)

Academy simulations alone **observe** behavior. The repair loop adds **Act** and **Review**:

```powershell
npm run sim:lms:loop
```

Read `docs/FCA_LMS_REPAIR_LOOP_PROTOCOL.md` and `docs/qc/lms-repair-latest.md`.

On failure the loop retries transient API issues, queues engineering/founder repair items in `auricrux/system/work_queue.json`, writes `auricrux/system/next_action.json` for Cursor sessions, and asks Auricrux for review guidance on remaining failures.

## Local continuous runner

```powershell
.\scripts\testing\run-continuous-lms-repair-loop.ps1
```

Runs `npm run sim:lms:loop` every 30 minutes with machine-scoped receipts under `auricrux/system/testing/machines/{hostname}/`.
