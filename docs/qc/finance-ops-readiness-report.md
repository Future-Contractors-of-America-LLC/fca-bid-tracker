# Finance Ops Readiness Report

- Generated: 2026-07-05T20:26:05.265Z
- Status: PASS
- Required: 17
- Present: 17
- Missing: 0
- Mode: Standard mode: key can be present in local shell env or Function App settings.

## Domain Summary
- PASS commerce-receipts (2/2)
- PASS bank-routing (4/4)
- PASS payroll (4/4)
- PASS payables (2/2)
- PASS tax (2/2)
- PASS refunds (2/2)
- PASS governance (1/1)

## Missing Inputs
- none

## Notes
- This validator checks presence only; it does not print or persist sensitive secret values.
- Function App evidence loaded from Auricrux_group/Auricrux-Central.
- Strict mode is intended for production release checks and CI policy lanes tied to secure secret stores.
- Provide banking and provider values through secure secret storage, not source-controlled files.

