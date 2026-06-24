# Legal Documents � Folder Guide

**Entity:** Future Contractors of America LLC  
**Last updated:** 2026-06-19

---

## Folder structure

```
docs/legal/
??? README.md                          ? this file
??? IP_MASTER_INDEX.md                 ? trademark, copyright, patent filing prep
??? COPYRIGHT_FILING_PREP.md
??? TRADEMARK_FILING_PREP.md
??? PATENT_OPPORTUNITIES_PREP.md
??? INVENTION_DISCLOSURE_TEMPLATE.md
??? enterprise/                        ? Fortune 100 procurement corpus
?   ??? LEGAL_ENTERPRISE_INDEX.md      ? start here
?   ??? TERMS_OF_SERVICE.md
?   ??? PRIVACY_POLICY.md
?   ??? DATA_PROCESSING_AGREEMENT.md
?   ??? MASTER_SERVICES_AGREEMENT.md
?   ??? ? (see index for full list)
??? contractor/                        ? contractor legal templates & checklists
    ??? CONTRACTOR_LEGAL_INDEX.md      ? start here
    ??? ? (agreements, lien waivers, formation)
```

---

## Which folder to use

| Need | Location |
|------|----------|
| USPTO / copyright.gov filings | `docs/legal/` (IP prep) |
| Calyndra IP packets | `calyndra-ip/` repo |
| Customer contracts, DPA, MSA, policies | `docs/legal/enterprise/` |
| **Contractor legal templates** (lien waivers, owner contracts, formation) | `docs/legal/contractor/` |
| Published website legal pages | `src/pages/website/` + `src/legal/content/` |
| Internal Calyndra governance | `calyndra-system-law/` (not customer contracts) |

---

## Before publication or execution

1. Attorney reviews documents in `enterprise/`
2. Record counsel approval date in `LEGAL_ENTERPRISE_INDEX.md` version history
3. Sync Tier 1 docs to `src/legal/content/*.jsx` (published at `/legal`, `/terms`, `/privacy`, etc.)
4. Execute MSA/DPA/NDA with signed Order Forms only

---

## Governing law default

Virginia (Commonwealth) � LLC formed in Virginia. Counsel may confirm per customer segment.
