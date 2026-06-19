# Revenue Sprint — Preservation Rules

**Policy:** The 7-day revenue sprint is **additive only**. It must not undo, revert, or replace completed work.

## Locked deliverables (do not modify without explicit founder request)

| ID | Area | Protected paths |
|----|------|-----------------|
| IP-MKT-001 | Brand & trademark | `brand-assets/`, `public/brand/`, `/ip`, `IpNotice.jsx` |
| IP-MKT-002 | Legal & founder docs | `docs/legal/`, `docs/FOUNDER_*` |
| IP-MKT-003 | Marketing web & QC | `src/pages/website/Home.jsx`, `npm run qc:market` |
| IP-MKT-004 | Mobile & backend access | MAUI icon, `launch.customer` LMS |
| MNCL-001–003 | Machine-native spine | Project/file/audit baseline work |

## Automation rules

1. **`work_queue.json`** uses `preservationLock: true` — agents must not replace the queue with a revenue-only list.
2. **Revenue sprint items** use lane `revenue-sprint` and sit alongside `ip-market` and `machine-native` items.
3. **Control plane** must merge queue updates, never shrink locked items.
4. **No regressions** to customer-facing home, legal pages, or brand specimens.
5. **New revenue features** (`/products`, table persistence, Stripe scripts) extend the platform; they do not replace IP or founder prep.

## What sprint adds (safe to merge)

- `/products` digital catalog
- Table-backed `fcaRuntimeStore` (with memory fallback)
- `npm run qc:revenue-sprint`
- `docs/revenue-sprint/*` and bootstrap audit

## Founder checklist still authoritative

IP filings, Stripe keys, and store enrollment remain in `docs/FOUNDER_ONLY_CHECKLIST.md` — revenue sprint does not supersede those.
