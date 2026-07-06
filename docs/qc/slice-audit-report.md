# Slice Audit Report

- Generated: 2026-07-04T18:05:51.651Z
- Status: FAIL

## Slice Results
- BLOCKED finance-ops: Missing readiness keys: FCA_BANK_NAME, FCA_BANK_ROUTING_FINGERPRINT, FCA_BANK_ACCOUNT_FINGERPRINT, FCA_PAYOUT_DESTINATION_ID, FCA_PAYROLL_EMPLOYEE_MICHAEL_ID, FCA_PAYROLL_EMPLOYEE_AMANDA_ID
- PASS commerce-journey: Native payments journey checks passed.
- PASS central-runtime: Central spine smoke checks passed.
- PASS central-api-contract: Central API route verification passed.
- PASS identity-graph-tenant: M365/Graph connection readiness proven from deployed settings and route health.
- PASS code-integrity: Strict integrity gate passed.

## Blocked Slices
- finance-ops: FCA_BANK_NAME | FCA_BANK_ROUTING_FINGERPRINT | FCA_BANK_ACCOUNT_FINGERPRINT | FCA_PAYOUT_DESTINATION_ID | FCA_PAYROLL_EMPLOYEE_MICHAEL_ID | FCA_PAYROLL_EMPLOYEE_AMANDA_ID

