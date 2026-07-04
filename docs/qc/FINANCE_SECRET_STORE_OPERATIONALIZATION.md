# Finance Secret Store Operationalization

This runbook hardens finance readiness so release decisions do not depend on temporary shell overrides.

## Required production keys

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- FCA_BANK_NAME
- FCA_BANK_ROUTING_FINGERPRINT
- FCA_BANK_ACCOUNT_FINGERPRINT
- FCA_PAYOUT_DESTINATION_ID
- FCA_PAYROLL_PROVIDER
- FCA_PAYROLL_COMPANY_ID
- FCA_PAYROLL_EMPLOYEE_MICHAEL_ID
- FCA_PAYROLL_EMPLOYEE_AMANDA_ID
- FCA_AP_PROVIDER
- FCA_AP_COMPANY_ID
- FCA_TAX_PROVIDER
- FCA_TAX_ACCOUNT_ID
- FCA_REFUND_POLICY_MODE
- FCA_REFUND_APPROVER_EMAIL
- FCA_FINANCE_CONTROLLER_EMAIL

## Policy

- Store all keys in Azure Function App application settings for the production runtime.
- Do not rely on local terminal environment values for release approvals.
- Rotate sensitive values through approved secret-management process only.

## Strict validation command

Run this gate in a context with Azure CLI access to the target Function App:

npm run validate:finance-ops-readiness:strict

Strict mode behavior:

- Requires every key to exist in Function App settings.
- Ignores local shell values.
- Emits evidence to docs/qc/finance-ops-readiness-report.json and docs/qc/finance-ops-readiness-report.md.

## Recommended CI policy lane

Use a release or pre-prod approval workflow with these variables configured:

- FCA_READINESS_FUNCTIONAPP_NAME
- FCA_READINESS_FUNCTIONAPP_RG

And with Azure authentication enabled for the workflow identity before running the strict validator.

## Approval checklist

- Strict validator status is PASS.
- Missing count is 0.
- Finance report timestamp is within the current release window.
- Controller and payroll IDs are present and non-placeholder.
