# Product Quality Control

Run before deploy or after major SaaS/LMS changes.

| Command | Scope |
|---------|--------|
| `npm run qc:saas` | Portal routes, API health, client modules, route validation |
| `npm run qc:lms` | Academy catalog depth, lesson media slots, LMS API, CTA continuity |
| `npm run qc:product` | Both passes |

Reports are written to this folder:

- `saas-qc-report.md` / `.json`
- `lms-qc-report.md` / `.json`

## SaaS surfaces checked

All `/portal/*` tools, workflow/portal API clients, and live endpoints on auricrux-central.

## LMS depth checked

- Program metadata, course lesson counts, title alignment
- `lessonMedia[]` slots per lesson (lecture, lab demo, performance eval)
- Backend academy-lms enrollment snapshot
- Academy page CTA continuity

Media warnings (`productionStatus: pending`) are expected until Foundry fills video URLs.
