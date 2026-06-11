# FCA Contractor Command — Live Shell Remediation Packet v1

Status: Active Draft  
Scope: Packet 037 live-shell truth repair

## Purpose

This packet translates the live route gap audit into concrete remediation work for the currently exposed shell.

It does **not** pretend the missing backend execution spine is finished.
It defines the minimum UI truth guards required so current live routes stop overstating readiness.

## Remediation Priorities

### P1 — Repair public intake truth posture
Target route:
- `/contact`

### P2 — Add explicit fallback-state disclosure
Target routes:
- `/portal/projects`
- `/portal/files`
- `/portal/audit`

### P3 — Prepare missing flagship routes
Target future routes:
- `/portal/opportunities/:opportunityId`
- `/portal/projects/:projectId`

## 1. Contact Route Remediation

### Current defect
`/contact` currently provisions walkthrough sessions directly into portal surfaces without creating a governed `Lead` object.

### Immediate truth-safe remediation
Until governed lead creation is live, the route must:
- explicitly state that walkthrough activation is a demo/session path
- avoid implying tracked intake or CRM-style submission
- avoid implying qualification already occurred
- distinguish between "demo access" and "governed lead intake"

### Required UI copy guard
Use language such as:
- "Walkthrough session activation"
- "Demo access path"
- "Guided workspace preview"

Do **not** use language such as:
- "Your request has been submitted"
- "Your lead has been created"
- "Your project is now being tracked"

unless real lead creation is wired.

### Required route warning surface
Add a visible warning/info card near the primary walkthrough action center:

**Suggested title:** `Walkthrough activation is not yet governed lead intake`

**Suggested body:**
`This route currently activates a guided workspace session for demonstration and planning. It does not yet create a governed Lead record, qualification decision, or tracked intake object in the Contractor Command execution spine.`

### Exit condition
This warning remains required until `/contact` performs:
- `POST /api/leads`
- durable lead confirmation
- `lead-created` audit truth

## 2. Fallback-State Disclosure Contract

### Purpose
Projects, Files, and Audit currently attempt backend reads but can fall back to local or seeded state.
That fallback must be visible to the user.

### Rule
If route meta indicates fallback state, the route must display a visible disclosure banner.

### Trigger conditions
Show fallback banner when:
- `meta.backingSource !== "api-workflow-store"`
- or equivalent source-of-truth indicator is not API-backed

### Required banner fields
Every fallback banner should include:
- `title`
- `status`
- `what is live`
- `what is not live yet`
- `source currently in use`

### Shared fallback banner copy pattern
**Title:** `This workspace is using fallback continuity state`

**Status:** `Shell continuity active`

**What is live:**
`Route layout, shared context, and continuity scaffolding are active.`

**What is not live yet:**
`This surface is not currently reading or mutating fully governed backend workflow state for all actions.`

**Source currently in use:**
`Current source: local continuity / seeded continuity / non-API fallback.`

## 3. `/portal/projects` Remediation

### Current issue
Route uses meaningful project continuity but can fall back to localStorage-backed state without clearly saying so.

### Required banner variant
**Title:** `Project continuity shell is active`

**What is live:**
- active project selection
- shared workspace context
- continuity-oriented project presentation

**What is not live yet:**
- fully verified API-backed project mutation for all route actions
- flagship project detail deep-link route

### Required route note
This route should also state:
`Use this route as the project selector and continuity launcher. The governed project detail home will live at /portal/projects/:projectId.`

## 4. `/portal/files` Remediation

### Current issue
Route models governed file actions but can fall back to seeded state and uses non-canonical create behavior.

### Required banner variant
**Title:** `File spine shell is active`

**What is live:**
- active project-aware file context
- owner-linkage modeling
- continuity-oriented file review surfaces

**What is not live yet:**
- verified canonical file register/upload behavior for all actions
- full API-backed file persistence for all visible actions
- full document intelligence capability

### Required action guard
When fallback is active, file action controls should avoid implying durable backend mutation.
Use wording such as:
- `Simulate review state`
- `Mark shell classification state`
- `Stage evidence link`

Avoid wording such as:
- `Saved permanently`
- `Uploaded to governed record`
- `Linked in production`

unless verified.

## 5. `/portal/audit` Remediation

### Current issue
Route can display seeded audit history without clearly disclosing fallback sourcing.

### Required banner variant
**Title:** `Audit continuity shell is active`

**What is live:**
- audit timeline layout
- project scoping controls
- actor/event filtering shell

**What is not live yet:**
- fully verified governed audit truth for all displayed records when fallback is active
- full correction/reversal lifecycle support

### Required route note
Add a visible note:
`When API-backed audit evidence is unavailable, this route shows continuity scaffolding and fallback audit history for workspace validation only.`

## 6. Shared UI Artifact To Add

### New component
Recommended component:
- `src/components/ExecutionTruthBanner.jsx`

### Suggested props
```js
{
  title,
  status,
  source,
  whatIsLive,
  whatIsNotLiveYet,
  tone
}
```

### Usage targets
- `src/pages/website/Contact.jsx`
- `src/pages/portal/PortalProjects.jsx`
- `src/pages/portal/PortalFiles.jsx`
- `src/pages/portal/PortalAudit.jsx`

## 7. Missing Flagship Route Preparation

These routes remain absent and should be introduced next with missing-wiring truth built in from day one:

### `/portal/opportunities/:opportunityId`
Must begin with:
- governed opportunity identity
- estimate/file continuity blocks
- explicit missing backend action notices where necessary

### `/portal/projects/:projectId`
Must begin with:
- route-param project binding
- project header context
- file summary
- audit summary
- Auricrux next-action summary
- explicit fallback disclosure if not API-backed

## 8. Acceptance Gates For Packet 037

Packet 037 is complete only when:
- `/contact` no longer implies governed lead intake when it is not live
- `/portal/projects` shows visible fallback disclosure when not API-backed
- `/portal/files` shows visible fallback disclosure when not API-backed
- `/portal/audit` shows visible fallback disclosure when not API-backed
- all new copy remains truthful to verified repo/runtime state

## 9. Next Build Step

Convert this packet into actual code changes:

1. add `ExecutionTruthBanner` component
2. patch `/contact`
3. patch `/portal/projects`
4. patch `/portal/files`
5. patch `/portal/audit`
6. then introduce first missing `/portal/opportunities/:opportunityId` shell
