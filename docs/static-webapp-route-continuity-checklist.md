# Static Web App Route Continuity Checklist

_Last updated: 2026-06-06_

## Purpose

This checklist turns Static Web App hardening into a route-by-route continuity pass.
It exists to keep public-to-product movement coherent, reduce demo friction, and make customer-facing gaps visible before deployment claims are made.

## Verification Standard

A route passes continuity review only if all of the following are true:

- the route is reachable from the intended navigation path
- the route uses FCA + Auricrux-consistent framing
- the route presents a clear next action
- the route does not dead-end the customer journey
- the route supports believable movement into login, portal, platform, contact, pricing, or bid workflow surfaces

## Priority Route Set

### Public shell core
- `/`
- `/platform`
- `/auricrux`
- `/pricing`
- `/contact`
- `/login`

### Customer continuity shell
- `/portal`
- academy continuity surface(s)
- support/help continuity surface(s)

### Bid workflow continuity
- `/bid-entry/`
- `/bid-status/`
- legacy continuity routes including `/tyler-entry/` and `/tyler-status/` if still present for compatibility or transition

## Route Review Questions

For each route, verify:

1. **Entry clarity**
   - Is it clear what this page is for within 3 to 5 seconds?

2. **Brand continuity**
   - Does the page read like FCA as the platform and Auricrux as the embedded operating layer?

3. **Navigation continuity**
   - Can the user move cleanly to the next logical route without confusion?

4. **CTA continuity**
   - Is there a clear next action that supports conversion, login, platform progression, or customer continuity?

5. **Narrative continuity**
   - Does the page feel like part of one shell rather than an isolated page?

6. **Demo credibility**
   - Would this page help or hurt a founder demo or customer walkthrough right now?

## Failure Classification

### Repo-fixable
Use this class when the issue can be corrected directly in the repository, including:
- missing or weak CTA copy
- broken or unclear route linking
- inconsistent branding language
- shell navigation drift
- dead-end page narrative
- route-local UI continuity problems

### External blocker
Use this class only when the issue depends on something outside repository control, including:
- Azure deployment configuration outside repo scope
- DNS/domain ownership tasks
- missing secrets or environment configuration
- account-level permissions

## Immediate Pass Order

1. Verify public shell core routes
2. Verify login and customer continuity routes
3. Verify bid workflow continuity routes
4. Record any failures as repo-fixable vs external
5. Fix repo-fixable continuity gaps before claiming deployment readiness

## Founder Action Required

**No** — not for route continuity review itself.

Escalate only if a route continuity problem is caused by a true external blocker rather than repository implementation.

## Next Concrete Action

Use this checklist to drive the next verification pass under issue `#20`, with emphasis on:

- public shell route coherence
- clear CTA progression
- believable movement from marketing into workspace/login continuity
- identifying any route that still behaves like a disconnected page instead of part of one FCA operating shell

## Operating Rule

A route is not considered “good enough” because it renders.
It must support continuity, next action clarity, and believable customer movement through the FCA shell.