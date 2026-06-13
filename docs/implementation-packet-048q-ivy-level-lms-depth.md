# Implementation Packet 048Q — Ivy-Level LMS Depth, Lesson Progression, and Portal Readiness

## Classification
Repo-ready implementation packet.

## Issue
Academy still had a shallow content model and route surface. The existing catalog shape was inconsistent with the rendering expectations, and the repository lacked true program → course → lesson depth plus visible learner progression.

## Risk
If left unchanged, FCA Academy would continue to read like a branded academic summary instead of a serious LMS with instructional depth, progression state, and live product linkage.

## Fix
This packet hardens Academy into a deeper LMS layer by adding:

- structured program/course/lesson catalog depth
- helper functions for program/course/lesson routing
- real program/course/lesson pages
- lesson started/completed state via localStorage-backed learner progress
- credential-progress and project-linked training readiness panels
- portal visibility for training posture and pathway-to-product continuity
- verification script for LMS depth expectations

## Files
- `src/academyCatalog.js`
- `src/academyProgressStore.js`
- `src/components/AcademyProgressPanel.jsx`
- `src/components/TrainingReadinessPanel.jsx`
- `src/pages/academy/AcademyCatalog.jsx`
- `src/pages/academy/AcademyProgramDetail.jsx`
- `src/pages/academy/AcademyCourseDetail.jsx`
- `src/pages/academy/AcademyLessonView.jsx`
- `src/routes.js`
- `src/pages/portal/PortalHome.jsx`
- `scripts/verify-real-lms-depth.mjs`
- `package.json`

## Truth boundary
This packet upgrades repo truth. It does **not** claim verified production deployment or durable backend transcript storage. Progress state is currently browser-local persistence, which is truthful, useful, and bounded, but not yet tenant-grade backend durability.

## Validation target
- `/academy/catalog` renders a structured catalog.
- `/academy/programs/:programKey` renders program detail.
- `/academy/programs/:programKey/courses/:courseKey` renders course detail.
- `/academy/programs/:programKey/courses/:courseKey/lessons/:lessonKey` renders lesson detail and progression controls.
- Portal overview displays project-linked training readiness and pathway links.
- `npm run verify:real-lms-depth` passes.

## Next recommended packet
Packet 048R — transcript view, cohort enrollment state, completion certificate surface, and admin-facing credential issuance ledger.
