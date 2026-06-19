# Copyright Filing Preparation

**Owner:** Future Contractors of America LLC  
**Registration type:** Literary / visual arts / computer programs (as applicable per work)  
**Portal:** https://www.copyright.gov/registration/

---

## Works to register (recommended separate applications or group as collection)

### 1. FCA & Auricrux visual identity (priority)

| Work title | Deposit files | Type |
|------------|---------------|------|
| FCA Hex Mark | `brand-assets/fca/fca-hex-mark.svg`, `fca-hex-mark-transparent.svg` | Visual art |
| Auricrux Crux Mark | `brand-assets/auricrux/auricrux-crux-mark.svg` | Visual art |
| Auricrux Crux Pulse (motion) | `brand-assets/animations/auricrux-crux-pulse.svg` + exported MP4 | Audiovisual |
| FCA / Auricrux wordmarks | `fca-wordmark.svg`, `auricrux-wordmark.svg` | Visual art |

**Author:** Future Contractors of America LLC  
**Work made for hire:** Yes (if all designers are employees or signed IP assignment)  
**Year of completion:** 2026  
**Publication:** https://futurecontractorsofamerica.com (note first public date)

### 2. FCA Contractor Command web application UI

| Deposit | Path |
|---------|------|
| Source (volume) | `src/pages/**`, `src/components/**` (React SPA) |
| Screenshots (PDF) | Capture: Home, Login, Portal Platform, Academy, Pricing at 1920x1080 |
| Build output sample | `dist/index.html` + one JS chunk hash file listing |

**Title suggestion:** "FCA Contractor Command Web Application, version 1.0"

### 3. Auricrux-Central backend (optional separate registration)

| Deposit | Path |
|---------|------|
| Source excerpt | `auricrux-central-work/core/**`, `customer-login/`, API route handlers |
| Title suggestion | "Auricrux Central API Software, version 1.0" |

### 4. FCA Academy curriculum catalog

| Deposit | Path |
|---------|------|
| Catalog text | `auricrux-central-work/core/academy.py` (ACADEMY_CATALOG) |
| UI | `src/pages/academy/AcademyHome.jsx` screenshots |

**Title suggestion:** "FCA Academy Electrical Apprenticeship Catalog, version 1.0"

### 5. Mobile application

| Deposit | Path |
|---------|------|
| MAUI source | `fca-mobile-maui-work/src/FcaMobile/**` |
| Screenshots | Welcome, Command Center, Leads, Training |

---

## Deposit packaging checklist

- [ ] Export all SVG to PDF (required by eCO for some categories) — use Inkscape or browser print-to-PDF
- [ ] Combine UI screenshots into single PDF titled `FCA-UI-Screenshots-2026.pdf`
- [ ] ZIP source code excluding `node_modules`, `bin`, `obj` — max 500MB per upload; use first/last 25 pages rule if source is huge
- [ ] Include `BRAND_MANIFEST.json` in deposit notes as ownership index
- [ ] List **one** copyright claimant: Future Contractors of America LLC

---

## Copyright notice (use on all published works)

```
Copyright (c) 2026 Future Contractors of America LLC. All rights reserved.
```

Already embedded in `brand-assets/**/*.svg` comments. Add to:
- Website footer (done via `/ip` page)
- App about screens
- Academy PDF exports

---

## Assignment gap to close before filing

If any logo, animation, or code was created by **non-employee** contractors:

1. Execute **IP Assignment Agreement** assigning all rights to Future Contractors of America LLC
2. Store signed PDFs in secure folder (not in public repo)
3. Note assignment date in `BRAND_MANIFEST.json` `authorship.notes`

---

## eCO filing tips

| Field | Value |
|-------|-------|
| Author | Future Contractors of America LLC |
| Copyright claimant | Future Contractors of America LLC |
| Nature of authorship | Text, artwork, computer program (check all that apply) |
| Limitation of claim | Exclude third-party open-source libraries (MIT/React/etc.) — claim only original expression |

**Fee:** Check current copyright.gov fee schedule (~$45–65 online per work).

---

## After registration

- Record registration number in `BRAND_MANIFEST.json` under new `copyrightRegistrations` array
- Optional: add `(c) Reg. No. TXu-____` on legal page
