# FCA COVERAGE MATRIX (NO-GAP ENFORCEMENT)

## SYSTEM REQUIREMENT

FCA must cover the complete construction lifecycle with no gaps.

## FLAGSHIP PRODUCT SPINE

FCA Contractor Command is the flagship product spine.

Every major implementation must strengthen one or more of:

- Lead / Opportunity intake
- Qualification
- File and evidence handling
- Bid / Estimate workflow
- Client portal access
- Audit trail
- Guided Auricrux assistance

## CORE CONTINUITY OBJECTS

Every applicable feature must connect to:

- Tenant
- User / Role
- Client
- Opportunity
- Project / Job
- File / Evidence
- Auricrux Action
- Audit Event
- Financial Link

If a feature exists but does not connect where applicable, a system gap exists.

## LIFECYCLE COVERAGE

- Lead / Opportunity
- Qualification
- Bid / Estimate
- Proposal
- Award
- Project Setup
- Document Control
- Takeoff / Quantity
- RFIs / Redlines
- Change Events
- Change Orders
- Scheduling
- Field Execution
- Quality Control
- Punch / Closeout
- Billing / Pay Applications
- Job Cost / Accounting
- Warranty / Recurring Work
- Feedback / Growth

## PLATFORM MODULES

- Market Network
- Sales / Preconstruction
- Bid & Estimating
- Documents & Plans
- Takeoffs
- RFIs & Redlines
- Change Management
- QC & Punch
- Finance
- Customer Portal
- Admin Control
- Academy / Training

## REQUIRED RULES

Every module MUST:

- Link to Project/Job where applicable
- Accept file or evidence input where applicable
- Produce output artifacts
- Log Auricrux actions
- Be reviewable and correctable
- Preserve auditability
- Respect valid lifecycle state

## AURICRUX REQUIREMENT

Auricrux must be able to:

- Read all relevant records and files
- Detect missing required structure
- Detect state violations
- Detect file gaps
- Recommend corrections
- Execute allowed corrections
- Record every action

## FAILURE CONDITION

If any applicable workflow is missing:

- project linkage
- file/evidence linkage
- output artifact generation
- audit tracking
- valid lifecycle state
- Auricrux observability

THEN:
SYSTEM GAP EXISTS

Auricrux must detect and report it.

## PHASE 2 ENFORCEMENT TARGET

The next mandatory implementation lane is:

1. Project / Job spine
2. Files / document ingestion spine
3. Auricrux document intelligence
4. Continuity objects:
   - RFI
   - Change Event
   - Change Order
   - QC / Punch
5. Academy linkage to next-action teaching surfaces
