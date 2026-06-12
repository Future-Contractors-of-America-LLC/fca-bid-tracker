# FCA Contractor Command Award Handoff Contract

## Purpose
This contract defines the governed object and state transitions from proposal-ready commercial work into awarded project execution and Academy-linked mobilization readiness.

## Scope
This contract applies to the flagship FCA Contractor Command path:
- lead
- opportunity
- estimate / proposal posture
- award decision
- project creation
- project setup
- Academy readiness for mobilization

## Required transition sequence
1. **Opportunity is proposal-ready**
2. **Opportunity is awarded**
3. **Canonical project/job is created**
4. **Project setup state becomes active**
5. **File and evidence spine attaches to project root**
6. **Academy assignment/readiness attaches to project mobilization**
7. **Auricrux next action routes across both SaaS and LMS**

## Required canonical objects
- Opportunity
- Proposal
- Award Decision
- Project / Job
- File / Evidence records
- Audit Event
- Academy Assignment
- Academy Progress Record
- Project Readiness state
- Auricrux Action Record

## Required state transitions

### Commercial state
- `qualified`
- `proposal-ready`
- `awarded` or `declined`

### Project state
- `project-created`
- `job-setup`
- `execution-ready`

### Academy state
- `assignment-created`
- `in-progress`
- `ready` or `blocked`

## Required outputs
No handoff step is complete without output.

### Proposal-ready output
- governed proposal or proposal-ready object state
- audit record explaining why the opportunity is ready

### Awarded output
- award event
- project creation event
- project root identifier

### Project setup output
- canonical project workspace visibility
- next action for startup / mobilization
- file/evidence attachment posture

### Academy output
- project-linked assignment
- readiness status
- next academy action
- feature gate effect where applicable

## Required audit events
At minimum, the following event families must exist:
- `opportunity-converted`
- `project-created`
- `bid-awarded` or equivalent award event
- `assignment-created`
- `assignment-updated`
- `file-created` / `file-linked` / `file-briefing`
- Auricrux explanation/recommendation/execution records where applicable

## Failure conditions
Award handoff is invalid if any of the following are true:
- award does not create or reconcile into canonical project truth
- project exists but is not visible in workspace routes
- Academy readiness does not attach to project/job context
- Auricrux next action does not cross the SaaS/LMS boundary
- file/evidence posture is missing from the created project root

## Release implication
The unified single release is blocked until this contract is satisfied because award handoff is the flagship expansion bridge from commercial continuity into operations and workforce readiness.
