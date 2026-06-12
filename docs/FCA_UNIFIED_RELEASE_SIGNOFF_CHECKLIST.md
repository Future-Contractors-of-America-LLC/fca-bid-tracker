# FCA Unified Release Signoff Checklist

## Decision rule
Do not approve release unless every gate below is affirmatively satisfied.

## auth gate
- [ ] customer login works
- [ ] customer session sync works
- [ ] logout works
- [ ] route protection works
- [ ] entitlements govern SaaS, LMS, and Auricrux consistently

## flagship continuity gate
- [ ] lead intake creates governed record
- [ ] qualification creates governed opportunity
- [ ] opportunity reaches proposal-ready or equivalent governed state
- [ ] award/handoff creates canonical project
- [ ] project is visible in project list and project workspace

## file/evidence gate
- [ ] files can be uploaded or registered
- [ ] files attach to canonical project root
- [ ] file evidence state is visible
- [ ] Auricrux document briefing path exists

## academy gate
- [ ] Academy loads under authenticated customer context
- [ ] assignments are project-linked
- [ ] progress persists in governed form
- [ ] readiness state is visible in Academy and project workspace
- [ ] feature gate effect is represented where applicable

## auricrux gate
- [ ] Auricrux appears in SaaS and LMS surfaces
- [ ] explain / recommend / execute posture is consistent
- [ ] auditability of actions exists

## deployment gate
- [ ] repo-side unified single-release validation passes
- [ ] build validation workflow includes unified release validation
- [ ] preview/staging validation is defined
- [ ] production/live verification remains truthful and bounded

## Signoff outcome
- [ ] Approved for unified single release
- [ ] Blocked pending additional spine hardening
