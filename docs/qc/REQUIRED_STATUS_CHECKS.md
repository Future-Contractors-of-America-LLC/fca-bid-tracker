# Required Status Checks

Use this file as the canonical source for GitHub branch protection required checks.

## Branch target

- main

## Required workflows and job checks

1. Workflow: Module QC Required Gates
- Job check name: required-module-qc-gates
- Workflow file: .github/workflows/module-qc-required-gates.yml
- Purpose: blocks merges unless module capability coverage, competitive benchmark, ranking, standards freeze, and executive/release artifact generation all pass.

2. Workflow: FCA Build Validation
- Job check name: validate
- Workflow file: .github/workflows/build-validation.yml
- Purpose: broad build and governance validation lane.

3. Workflow: Workflow Lint
- Job check name: Validate workflow files
- Workflow file: .github/workflows/workflow-lint.yml
- Purpose: prevents invalid workflow YAML from entering main.

## Enforcement notes

- Keep the job check names above stable. If a job name changes, update branch protection immediately.
- Prefer requiring job checks rather than workflow names because protection rules match check-run names.
- If additional required gates are added later, append them here before enabling in branch protection.

## Current applied state

- Applied on: 2026-07-04
- Branch protection: enabled on main
- Strict status checks: enabled
- Required approvals: 1
- Dismiss stale reviews: enabled
- Require conversation resolution: enabled
- Require linear history: enabled
- Enforce for admins: enabled
