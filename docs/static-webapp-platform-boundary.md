# Static Web App Platform Boundary

## Decision

Keep Azure Static Web Apps as the frontend hosting platform for the FCA public site, login surface, portal shell, and contractor workspace shell.

Do not treat Azure Static Web Apps as the entire FCA platform.

## Why

FCA Contractor Command requires more than page delivery. The flagship spine requires:

- lead and opportunity intake
- qualification and project context
- file and evidence handling
- bid and estimate workflow
- portal access
- audit trail
- guided Auricrux assistance

A static frontend host can present these surfaces, but it is not by itself the authoritative runtime for workflow execution, durable state, auditability, and cross-object lifecycle enforcement.

## Platform Split

### Frontend shell

Use this repo and Azure Static Web Apps for:

- public website pages
- pricing and onboarding surfaces
- login and account activation routes
- customer portal shell
- contractor workspace shell
- route continuity and user-facing navigation
- embedded Auricrux assistance surfaces

### Backend execution spine

Use backend services for:

- authenticated business actions
- project and job object lifecycle
- file ingestion and evidence linking
- bid, estimate, and proposal logic
- audit event generation
- automation triggers and corrective actions
- subscription, billing, and entitlement enforcement

### Storage spine

Use structured storage for:

- leads
- opportunities
- projects
- files
- audit events
- Auricrux actions
- training links and progress references where required by workflow

## Immediate Build Consequence

Do not replatform the frontend just because the product is early.

Instead:

1. keep Static Web Apps for the shell
2. tighten route continuity and buyer clarity in this repo
3. move execution-critical logic into backend services
4. require every new user-facing surface to declare its backend handoff and source-of-truth object

## Rule Going Forward

No new route or surface is complete unless it clearly answers:

- what object it operates on
- what backend action it requires
- what file or evidence input it accepts
- what output it produces
- what audit event it should emit

If a surface cannot answer those five questions, it is shell-only and must not be represented as completed product capability.
