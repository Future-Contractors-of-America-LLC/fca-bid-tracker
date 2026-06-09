# FCA Coverage Matrix — Contractor Command v1

## Purpose
This matrix enforces no-gap execution for the FCA flagship product while preserving broader ecosystem alignment.

## Product Scope
**Flagship:** FCA Contractor Command

## Core Continuity Spine
Every applicable capability must connect to:
- Tenant / Customer
- Users / Roles
- Opportunity or Project
- Files / Evidence
- Audit / Event Log
- Financial relevance where applicable
- Auricrux action trace

## Lifecycle Matrix

| Lifecycle Stage | Required Objects | Required Outputs | Minimum Auricrux Role | Gap If Missing |
|---|---|---|---|---|
| Lead | Lead, Client, Site | intake record, source, next action | classify, route, summarize | no structured intake |
| Qualified | Opportunity, Client | qualification status, assumptions | detect missing fields, propose next step | no decision state |
| Bid | Opportunity, Estimate, Drawing Set | estimate draft, scope notes, exclusions | summarize docs, detect scope gaps | estimate not tied to evidence |
| Awarded/Declined | Opportunity, Contract | award/decline record, handoff action | update state, log rationale | no closure path |
| Project Setup | Project, Contract, Schedule | project record, links, kickoff packet | create continuity summary | bid and project disconnected |
| Active | Project, Files, RFI, Change Event | logs, files, issue records | detect missing evidence, draft outputs | work not traceable |
| QA/Closeout | Inspection, Punch Item, Closeout Package | reports, punch, closeout bundle | review completeness | no finish-state artifact |
| Warranty | Warranty Case | service record, response trail | assess recurrence, link to prior evidence | no post-close continuity |

## Module Matrix

| Module | Primary UI Surface | Core API / Object Need | Evidence Requirement | Output Requirement | Audit Required |
|---|---|---|---|---|---|
| Intake | lead/opportunity screens | Lead, Opportunity | intake attachments if present | intake record | yes |
| Qualification | opportunity detail | Opportunity | source docs/notes | qualification result | yes |
| Project Spine | project detail/workspace | Project | linked bid/contract docs | project record | yes |
| Files | project files tab | Drawing Set, File Package | all uploads versioned | briefing/export/package | yes |
| Estimating | estimate workspace | Estimate | plans/specs/source docs | estimate/proposal | yes |
| Client Portal | customer workspace | Client, Project, Estimate | customer-visible files | visible status/actions | yes |
| Auricrux Guidance | side panel / command layer | Telemetry Event, Action Log | referenced evidence | recommendation/correction | yes |
| Closeout | project closeout | Punch Item, Closeout Package | punch/photos/warranty docs | closeout package | yes |
| Academy Linkage | contextual learning links | Training Record, Credential | task-linked lesson refs | assigned lesson/checklist | yes |

## Mandatory Enforcement Rules
Every module must:
- attach to Project/Job or Opportunity where applicable
- accept file input where applicable
- produce output
- log Auricrux actions
- be reviewable and correctable

## Failure Conditions
A system gap exists if any applicable module lacks:
- project/opportunity linkage
- file/evidence linkage
- output generation
- audit history
- visible next state
- correction path

## Next Technical Packet
**Packet:** Project + File Spine Hardening

### Immediate Deliverables
1. Project object definition
2. bid-to-project conversion path
3. project files tab
4. upload metadata shape
5. Auricrux document briefing output
6. upload/conversion audit events

## Validation Checklist
- Can a bid become a project without manual data loss?
- Can a project hold files with versioned metadata?
- Can Auricrux produce a briefing from uploaded materials?
- Can a customer see truthful status?
- Is every step auditable?
