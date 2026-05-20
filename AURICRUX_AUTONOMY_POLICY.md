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
