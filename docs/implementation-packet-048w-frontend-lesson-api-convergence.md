# Implementation Packet 048W Frontend — Lesson Progression API Convergence

## Classification
Repo-ready frontend convergence packet.

## Issue
Lesson view and progress displays were still the main surfaced holdout from the Academy API-backed LMS spine.

## Fix
This packet converges lesson-facing surfaces onto the shared Academy API path by:

- adding API-backed lesson/program/course progress view-model helpers
- extending `useAcademyLms` with `startLesson` and `completeLesson`
- moving `AcademyLessonView` onto API-backed lesson status
- moving `AcademyProgressPanel` onto API-backed progress derivation
- further quarantining the old local lesson-progress fallback

## Truth boundary
This is frontend repo truth only. Live end-to-end behavior still depends on the backend lesson-progression API packet being merged and deployed.

## Next recommended packet
Packet 048X — remove or archive superseded local lesson fallback pathways once backend deployment and API-backed lesson progression are verified.
