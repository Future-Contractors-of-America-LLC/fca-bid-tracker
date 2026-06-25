# Patent Opportunities  Preparation for Counsel Review

**Entity:** Future Contractors of America LLC  
**Disclaimer:** Software and business-method patents are difficult post-*Alice*. This document identifies **invention disclosure candidates** only. Do not file without patent attorney review.

---

## Portfolio strategy (recommended)

| Tier | Action | Cost / timeline |
|------|--------|-----------------|
| **Now** | Trademark + copyright (see other docs) | Lower cost, high brand value |
| **90 days** | Provisional patent on strongest system invention | ~$3k8k with attorney |
| **12 months** | Non-provisional or PCT if product traction validates | Higher cost |

---

## Invention disclosure candidates

### ID-001  Auricrux explain / recommend / execute control loop

**Title:** System and method for AI-guided contractor lifecycle operations with auditable three-phase agent control

**Summary:** A platform where an embedded intelligence layer (Auricrux) inspects tenant/project/file context, produces human-readable explanations, ranked recommendations, and bounded automated execution actions across bid, project, billing, and training modules  with every phase logged to an audit spine.

**Novel elements (for counsel to evaluate):**
- Fixed three-phase contract (explain ? recommend ? execute) applied uniformly across heterogeneous contractor modules
- Cross-module context assembly from table-backed tenant store
- Execution bounded by role, tenant, and policy before side effects

**Key code references:**
- `auricrux-central-work/FCA_COVERAGE_MATRIX.md` (Auricrux Read/Act/Review columns)
- `fca-bid-tracker-work/src/components/AuricruxFrontendDock.jsx`
- Agent registry: `auricrux-central-work/auricrux-core-agent/`

**Prior art risk:** High (generic AI assistants). **Differentiation:** Domain-specific contractor lifecycle + audit spine + three-phase API.

---

### ID-002  Academy remediation linked to field operation blockers

**Title:** System for routing workforce training assignments from detected operational gaps in construction delivery software

**Summary:** When field ops or project readiness detects a missing credential, failed checklist, or RFI blocker, the system automatically assigns targeted Academy programs and tracks remediation completion before allowing downstream workflow transitions.

**Novel elements:**
- Bidirectional link between LMS enrollment state and project gate transitions
- Remediation API (`academy-lms` mutations + remediation routes)

**Key code:** `auricrux-central-work/core/academy.py`, remediation endpoints

**Prior art risk:** Medium (LMS + HR systems exist). **Differentiation:** Tight coupling to commercial contractor job spine.

---

### ID-003  Unified contractor lifecycle audit spine with entity key continuity

**Title:** Method for maintaining cross-module audit and entity continuity in multi-tenant construction operating systems

**Summary:** Single tenant store with normalized entity keys, partition/row conventions, and audit events spanning leads ? projects ? files ? RFIs ? billing without identifier collision across Azure table storage.

**Key code:** `auricrux-central-work/core/table_store.py`, `core/audit.py`

**Prior art risk:** Mediumhigh (standard multi-tenant patterns). **Differentiation:** Specific lifecycle coverage law + Azure Functions route surface.

---

### ID-004  Motion-mark coupled product loading identity

**Title:** Branded non-progress loading animation as product intelligence layer identifier

**Summary:** Distinctive pulsing crux animation (Auricrux Crux Pulse) used consistently at intelligence-layer load boundaries  not a generic spinner  establishing trade dress and UX identity.

**Asset:** `brand-assets/animations/auricrux-crux-pulse.svg`

**Prior art risk:** Low for patent; **stronger as trademark/motion mark**.

---

## Likely **not** patentable (trade secret / copyright instead)

| Item | Protect via |
|------|-------------|
| Pricing tiers and Stripe checkout flows | Trade secret / business terms |
| Marketing copy | Copyright |
| SVG geometry (hex, crux) | Copyright + trademark |
| Customer seed data | N/A |

---

## Provisional patent filing checklist

For each selected ID (counsel picks 12 max for first provisional):

- [ ] Complete [INVENTION_DISCLOSURE_TEMPLATE.md](./INVENTION_DISCLOSURE_TEMPLATE.md)
- [ ] Provide architecture diagram (tenant ? modules ? Auricrux)
- [ ] List inventors (individual humans  LLC cannot be inventor)
- [ ] Assign invention to Future Contractors of America LLC via signed assignment
- [ ] Prior art search (Google Patents, USPTO)
- [ ] File provisional within 12 months of public disclosure (website is public  **clock may be running**)

**Urgent:** If filing is desired, engage counsel promptly because the live website and GitHub repos may constitute public disclosure.

---

## Post-filing

- Mark applications "Patent Pending" only after provisional serial number issued
- Do not claim "patented" until grant
- Track 12-month provisional ? non-provisional deadline in calendar
