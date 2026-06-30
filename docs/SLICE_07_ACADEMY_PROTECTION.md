# Slice 07 (Academy / LMS) Protection State

Status: Active
Owner (laptop role): triage + PR factory
Owner (canonical fix): Primary machine + `auricrux-central`
Branch of record: `cursor/slice-07-academy-protective-measures-1f17`

---

## Why this doc exists

Per `auricrux/system/lms_repair_state.json`, the FCA Academy LMS repair loop
has reported **94 consecutive failures** since 2026-06-25 (last run
`LMS-WFR-1782784956312` at 2026-06-30T02:05Z). Every round reports the same
four failures, at 169/173 (~97.7%) of steps passing:

1. `script:validate-academy-native-commerce-journey.mjs`
2. SWA route `/academy` — "shell OK but API probe error: Unexpected end of JSON input"
3. SWA route `/academy/catalog` — same
4. SWA route `/academy/store` — same

For comparison, `auricrux/system/workflow_repair_state.json` reports **48
consecutive successes** for the general SaaS workflow loop, and
`frontend_loop_state.json` reports 4/4 frontend validators green. Slice 07 is
the only slice currently outside parity.

## Laptop scope vs Primary / Central scope

Per `.cursor/rules/three-machine-workload.mdc` and `AGENTS.md`, this laptop is
**witness + optional PR factory**. The four blockers above split as follows:

| Blocker | Root cause | Repo to fix | Owner |
|---|---|---|---|
| `validate-academy-native-commerce-journey.mjs` | `/api/fca-payments/intake` returns no `data.intake.intakeId` | `auricrux-central` | Primary |
| `/academy` API probe empty body | `/api/academy-lms` returning empty body | `auricrux-central` | Primary |
| `/academy/catalog` API probe empty body | `/api/academy-commerce` returning empty body | `auricrux-central` | Primary |
| `/academy/store` API probe empty body | `/api/academy-commerce` returning empty body | `auricrux-central` | Primary |
| SWA redeploy auto-repair blocked | PAT lacks `workflows` scope (HTTP 403 on `actions/workflows/2`) | repo settings | Primary |

None of the root-cause fixes are inside this repo's authority. This PR
delivers **customer-facing protection** so the outage stops bleeding into the
public SWA shell while the canonical fix is in flight.

## Protective measures applied in this PR

### 1. Client error classification (`src/api/academyResponseGuard.js`)

A shared helper that recognizes the exact upstream failure mode reported by
the LMS repair loop (empty body, non-JSON body, upstream 5xx) and produces a
tagged `academy-degraded` Error with a customer-friendly message.

Used by:

- `src/api/academyClient.js` (`fetchAcademyLms`, `fetchAcademyProgram`, `mutateAcademyLms`)
- `src/api/academyCommerceClient.js` (`fetchAcademyCommerceCatalog`, `fetchAcademyCommerceItem`, `postCommerce`, `submitAcademyContactSales`, `enrollAfterAcademyPurchase`)

`fetchAcademyProgram` retains its existing catalog fallback for program detail
reads — degraded classification only triggers when even the catalog fallback
cannot serve a result.

### 2. Customer-facing banner (`src/components/AcademyServiceStatusBanner.jsx`)

Renders nothing when academy services are healthy. When degraded, shows:

- A clear, customer-comprehension-positive headline
  ("Your account, orders, and progress are safe")
- Safe fallback CTAs to `/portal`, `/portal/support`, `/pricing`
- ARIA `role="status"` + `aria-live="polite"` for accessibility

Wired into the three SWA routes the LMS repair loop probes:

- `/academy` → `src/pages/academy/AcademyHome.jsx`
- `/academy/catalog` → `src/pages/academy/AcademyCatalog.jsx`
- `/academy/store` → `src/pages/academy/store/AcademyStore.jsx`

`AcademyStore` additionally swaps its existing red error line for the banner
when the failure is classified as `academy-degraded`, so customers do not see
two error messages stacked.

### 3. LMS-TRIAGE playbook mapping (`scripts/lib/lmsRepairPlaybooks.mjs`)

Adds an `lms-academy-ctas` playbook entry so failures of
`validate-academy-ctas.mjs` are auto-routed to `LMS-CTA-FIX` (engineering
queue, fca-bid-tracker, product lane, medium priority) instead of repeatedly
re-creating a generic `LMS-TRIAGE` work-queue item.

## Continuity contract — what this PR does NOT do

This PR **does not**:

- modify `auricrux-central` or any of its commerce / LMS endpoints
- dispatch a SWA redeploy workflow
- change any FCA secret, Stripe key, Azure config, or PAT scope
- alter the canonical academy catalog, lesson media, or storefront pricing
- change behavior of any non-Academy slice (workflow loop stays green)

## Verification

Run from `/workspace` once dependencies are installed (Primary machine):

```bash
npm ci
npm run build            # SPA build must stay green
npm run qc:saas          # slice 07 + supporting slices
node scripts/validate-platform-slices.mjs
node scripts/validate-academy-ctas.mjs
```

Then re-run the LMS repair loop:

```bash
npm run sim:lms
```

Expected post-PR state:

- SPA build: green
- `validate-platform-slices.mjs`: green (no slice 07 regression)
- Customer experience on `/academy*` routes when upstream is degraded:
  banner + safe CTAs, never a blank or raw-error screen
- LMS repair loop: still reports the 4 known upstream failures **until** the
  Primary machine ships the central commerce / academy-lms fixes — but any
  future `validate-academy-ctas.mjs` failure will now auto-route to
  `LMS-CTA-FIX` instead of generic `LMS-TRIAGE`

## Closeout signal

Slice 07 returns to parity with the other slices when:

- `auricrux/system/lms_repair_state.json` shows `consecutiveFailures: 0` and
  at least one successful run
- `docs/qc/lms-repair-latest.md` reports `Result: GREEN`
- `auricrux/system/work_queue.json` no longer has `LMS-COMMERCE-FIX`,
  `LMS-SWA-REDEPLOY`, `LMS-MEDIA-FIX`, or `LMS-TRIAGE` in `status: queued`

Once that happens, the `AcademyServiceStatusBanner` will self-suppress
because `useAcademyLms()` will report
`persistenceState: "API academy LMS spine active"` — no further code change
is required to "turn off" protection.
