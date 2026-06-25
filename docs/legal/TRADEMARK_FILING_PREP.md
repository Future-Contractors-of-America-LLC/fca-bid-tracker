# Trademark Filing Preparation

**Owner:** Future Contractors of America LLC  
**Portal:** https://www.uspto.gov/trademarks  
**Search first:** TESS (Trademark Electronic Search System)

---

## Marks to file (recommended separate applications)

### Word marks

| Mark | Likely classes | Specimen URL (after deploy) |
|------|----------------|----------------------------|
| **FCA** | 9, 42, 35 | Homepage + login showing mark |
| **FUTURE CONTRACTORS OF AMERICA** | 9, 42, 35, 41 | Homepage header |
| **AURICRUX** | 9, 42 | `/auricrux`, portal Auricrux surfaces |
| **FCA CONTRACTOR COMMAND** | 9, 42 | `/portal/platform`, app store listing |

### Design marks

| Mark | File | Description for application |
|------|------|----------------------------|
| **FCA Hex Mark** | `brand-assets/fca/fca-hex-mark.svg` | Blue hexagonal shield with dark center diamond on navy rounded square |
| **FCA Hex (mark only)** | `fca-hex-mark-transparent.svg` | Same geometry without background (alternative specimen) |
| **Auricrux Crux Mark** | `brand-assets/auricrux/auricrux-crux-mark.svg` | Gold circular medallion with star, diamond crux, stem, crossbar |

### Motion mark

| Mark | File | Notes |
|------|------|-------|
| **Auricrux Crux Pulse** | MP4 export per `AURICRUX_CRUX_PULSE_SPEC.md` | USPTO requires video specimen showing continuous loop; describe motion in application |

---

## International class suggestions (counsel to confirm)

| Class | Goods / services | FCA relevance |
|-------|------------------|---------------|
| **9** | Downloadable software; mobile apps | fca-mobile-maui, SaaS client |
| **42** | SaaS; platform as a service | Auricrux-Central hosted API |
| **35** | Business management software; CRM | Lead pipeline, bids |
| **41** | Educational services; training | FCA Academy LMS |
| **36** | *(usually skip unless finance product)* | Billing is operational, not banking |

**Filing basis:**  
- **1(a)** Use in commerce  if live at futurecontractorsofamerica.com (yes)  
- **1(b)** Intent to use  for marks not yet used (mobile app pre-store)

---

## Specimens of use (attach to 1(a) filings)

| Mark | Specimen type | Capture |
|------|---------------|---------|
| FCA Hex | Screenshot of website with mark | Home or login with `FcaBrandMark` visible |
| FCA word | Same screenshot showing "FCA" wordmark | |
| Full name | Footer or header "Future Contractors of America" | |
| Auricrux | `/auricrux` page with crux mark + word | |
| FCA Contractor Command | Portal dashboard title / app name | |
| Motion | MP4 of crux pulse on loading or `/brand/animations/` | |

**Live static specimens (post-deploy):**
- https://futurecontractorsofamerica.com/brand/fca/fca-hex-mark.svg
- https://futurecontractorsofamerica.com/brand/auricrux/auricrux-crux-mark.svg

---

## Distinctiveness strategy

| Mark | Strength | Notes |
|------|----------|-------|
| FCA Hex | Strong (design) | Original geometry; not generic industry icon |
| Auricrux Crux | Strong (design) | Unique star + crux + crossbar combo |
| Auricrux Crux Pulse | Strong (motion) | Non-functional branded animation |
| FCA (letters) | Moderate | Short acronym  may need acquired distinctiveness if examiner cites descriptive refs |
| Future Contractors of America | Moderatestrong | Descriptive of industry but distinctive as full phrase + hex pairing |

**Avoid:** Generic construction clip art; stock icons; colors-only claims without shape.

---

## TM / SM notice (use until registered)

```
FCA, Future Contractors of America, Auricrux, and FCA Contractor Command
are trademarks of Future Contractors of America LLC.
```

After federal registration, replace  with  for registered marks only.

Published at: https://futurecontractorsofamerica.com/ip

---

## USPTO TEAS checklist

For each application:

- [ ] Mark drawing (SVG ? USPTO-required JPG/PNG, or standard character mark for words)
- [ ] Goods/services ID from ID Manual (counsel)
- [ ] Specimen showing mark used on or in connection with services
- [ ] Entity name: Future Contractors of America LLC
- [ ] Signatory with authority to bind LLC
- [ ] Filing fee (~$250350 per class per mark, TEAS Plus vs Standard)

---

## Conflicts to search

Search TESS for:
- AURICRUX (exact and phonetic)
- FCA + software/construction
- "Contractor Command"
- Gold star + crux similar marks in Class 9/42

---

## State trademark (optional)

File duplicate in state of LLC formation (often Delaware or home state) if counsel recommends belt-and-suspenders before federal registration issues.

---

## Ongoing maintenance

| Deadline | Action |
|----------|--------|
| Years 56 | Section 8 declaration of use |
| Year 10 | Renewal |
| Any rebrand | File new application before switching geometry in `BRAND_MANIFEST.json`
