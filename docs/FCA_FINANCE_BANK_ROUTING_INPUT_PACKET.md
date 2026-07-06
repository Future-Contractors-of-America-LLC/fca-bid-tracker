# FCA Finance Bank Routing Input Packet

Purpose: collect the exact operational data needed so FCA/Auricrux can receive receipts, run payroll, pay vendors, handle taxes, and issue refunds with validated controls.

## 1. Banking Destination (Wells Fargo)
Provide these fields through secure secret storage, not in git.

- bankLegalEntityName: Future Contractors of America LLC
- bankName: Wells Fargo
- accountType: business-checking
- accountOwnership: sole-account or multi-signer
- routingNumber: masked in documentation (last4 only)
- accountNumber: masked in documentation (last4 only)
- accountFingerprint: provider hash or tokenized fingerprint
- payoutDestinationId: provider destination id (for example Stripe external account id)
- settlementTimezone: for daily close and reconciliation windows
- settlementCurrency: USD unless otherwise specified
- expectedSettlementCadence: daily, T+1, etc.

## 2. Commerce Receipt Routing
- commerceProvider: Stripe (or alternate)
- stripeAccountMode: standard account or connect setup
- stripeAccountId: masked id permitted in docs
- payoutSchedule: daily/weekly/manual
- negativeBalancePolicy: how disputes/refunds are funded
- chargebackOwnerEmail: who handles chargebacks/disputes

## 3. Payroll (Michael Bartholomew and Amanda Bartholomew)
- payrollProvider: provider name
- payrollCompanyId: provider company id
- payrollSchedule: weekly/biweekly/semimonthly
- employeeMichaelProviderId: payroll provider employee id
- employeeAmandaProviderId: payroll provider employee id
- payrollFundingAccount: reference to Wells destination
- payrollApprovalOwner: approver name/email
- payrollBackupApprover: backup approver name/email
- filingMode: provider-files or in-house

## 4. Accounts Payable (Invoices/Services)
- apProvider: provider/system name
- apCompanyId: company id in AP platform
- paymentMethodsEnabled: ACH/check/wire/card
- defaultApprovalThresholds: amount thresholds and approvers
- vendorOnboardingPolicy: verification/KYB/KYC requirements
- remittanceEmailSource: mailbox for vendor remittance notices

## 5. Taxes
- taxProvider: provider/system name
- taxAccountId: provider account id
- einLast4: masked only
- filingJurisdictions: federal + state/local list
- filingFrequencies: monthly/quarterly/annual by tax type
- taxPaymentFundingAccount: reference to Wells destination
- taxNoticeMailbox: mailbox monitored for tax notices

## 6. Refund Operations
- refundMode: manual-approval or policy-automatic
- refundThresholdAutoLimit: dollar limit for auto-refunds
- refundApprovalOwner: owner email
- refundSlaHours: required turnaround
- refundFundingSource: receipts balance / operating account
- refundReasonCodes: required codes for audit

## 7. Governance and Security
- financeControllerEmail: primary responsible owner
- securityAdminEmail: key management owner
- secretsStorageLocation: Azure App Settings / Key Vault details
- auditRetentionPolicyDays: retention period
- reconciliationCadence: daily/weekly/monthly
- monthEndCloseOwner: owner email

## 8. What to Provide Here vs Secure Channel
Use this markdown packet for non-sensitive metadata only.

Do not place these in source control:
- full routing number
- full bank account number
- API secrets
- webhook secrets
- payroll/tax credentials

## 9. Mapping to Runtime Environment Keys
Set these as secure environment variables in Azure and CI secret stores:

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
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

## 10. Readiness Command
After secrets/metadata are configured, run:

```bash
npm run validate:finance-ops-readiness
```

This will emit:
- docs/qc/finance-ops-readiness-report.json
- docs/qc/finance-ops-readiness-report.md
