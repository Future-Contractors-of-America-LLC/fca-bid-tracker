# Implementation Packet 048V — Quarantine Superseded Local Academy Record Store and Mark Transitional Lesson Truth

## Classification
Repo-ready convergence packet.

## Issue
After Packet 048U, transcript, cohort, and credential issuance surfaces now converge on the Academy API-backed LMS spine. However, repo truth still needed an explicit quarantine boundary so the old local Academy record model would not silently re-expand.

## Risk
Without an explicit quarantine boundary, future work could accidentally rebuild split-brain Academy persistence by reusing superseded local record helpers. That would weaken the single coordinated release gate and make Academy truth harder to audit.

## Fix
This packet does three things:

1. Leaves lesson-progress behavior in a small, explicitly transitional local store.
2. Marks the lesson route with a visible truth-boundary notice.
3. Quarantines the old broader local Academy record pattern by keeping transcript/cohort/credential surfaces on the API-backed spine.

## Files
- `src/pages/academy/AcademyLessonView.jsx`
- `src/academyProgressStore.js`

## Truth boundary
Lesson start/completion remains browser-local **only** as a temporary instructional interaction model. Transcript, cohort, and credential surfaces should no longer be treated as local-truth systems.

## Decision
Do not expand local Academy record storage. Continue replacing remaining transitional lesson progress with shared API-backed progression objects in the next packet.

## Next recommended packet
Packet 048W — shared lesson-progression API contract and frontend convergence so lesson-level progress joins the same durable Academy LMS spine.
