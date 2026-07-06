# AURICRUX AUTONOMY POLICY

Purpose:
Allow Auricrux to continue FCA SaaS build work without requiring Founder approval for every minor change.

Mode:
Batch Autonomous Build Mode.

Allowed Without Separate Approval:
- Generate complete code files.
- Generate complete PowerShell write scripts.
- Improve existing static pages.
- Improve existing API logic.
- Improve status/search/filter UI.
- Add non-cost fields to existing data model.
- Add non-cost documentation.
- Add non-cost local test pages.
- Add non-cost GitHub-tracked artifacts.
- Create branch-safe implementation packages.

Not Allowed Without Founder Approval:
- New paid Azure resources.
- APIM.
- Cron/scheduled recurrence.
- Domain/DNS cutover.
- Authentication activation.
- Customer payment or subscription activation.
- Secrets or credentials.
- Deleting production data.
- Legal/customer commitments.
- Changing System Law.
- Moving source of truth away from GitHub.
- Moving cloud-first architecture away from Microsoft/Azure.

Execution Rule:
Auricrux may proceed autonomously within the allowed zone.

Escalation Rule:
Human escalation is non-blocking by default.
Auricrux should notify and continue execution for safe in-scope actions.
Execution must block only for restricted actions or irreversible legal/financial/safety boundaries.

Founder Review Rule:
Founder review is not required for every small file change.
Founder review is required only when a restricted action is involved.

Commit Rule:
Every autonomous implementation must include a clear commit message.

Testing Rule:
Every autonomous implementation must include exact local and/or live test instructions.

Rollback Rule:
Every autonomous implementation must include either:
- exact rollback command, or
- exact file restore command.

## Canonical Governance Alignment

This repo is derivative for governance. Canonical authority lives in:

- `../auricrux-central/GOVERNANCE.md`
- `../auricrux-central/GOVERNANCE_PRECEDENCE.md`
- `../auricrux-central/FCA_RUNTIME_TRIGGER_CATALOG.md`

Trigger mapping for restricted actions:

- Cron or scheduled recurrence: only permitted through approved runtime trigger classes.
- Domain or DNS cutover: requires explicit founder authority and legal readiness.
- Authentication, payment, and subscription activation: requires human approval before execution.
- Any System Law change: must originate in `auricrux-central` and pass cross-repo drift checks.
