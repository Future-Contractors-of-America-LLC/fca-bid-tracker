# Cross-System Integrity Audit (2026-07-02)

## Scope
- fca-bid-tracker (frontend/static web app)
- auricrux-central (Azure Functions/backend)
- fca-mobile-maui (mobile)
- Azure subscription/resource inventory
- Foundry/OpenAI resources, projects, deployments, agents
- Graph/M365/SharePoint API accessibility

## Executive Status
- Integrity gate status: FAIL
- Reason: runtime external-dependency references and static quality markers remain in product code; optional central/mobile runtime checks partially blocked by local environment prerequisites.
- Command execution failures in strict frontend lanes: 0

## 1) Frontend and Ecosystem Validation
Validated with strict gate and existing deep validators.

- Gate output:
  - docs/qc/fca-total-integrity-report.json
  - docs/qc/fca-total-integrity-report.md
- Result:
  - commandFailures: 0
  - externalDependencyFindings: 6
  - staticQualityFindings: 43
  - moduleScoreFailures: 0

## 2) auricrux-central Repository Presence
- Repository confirmed present locally.
- Path: C:/Users/Auricrux/Documents/GitHub/auricrux-central
- Canonical governance and runtime files present including:
  - README.md
  - FCA_SYSTEM_LAW.md
  - function_app.py

## 3) fca-mobile-maui Repository Presence
- Repository confirmed present locally.
- Path: C:/Users/Auricrux/Documents/GitHub/fca-mobile-maui
- Solution/project detected:
  - FcaMobile.sln
  - src/FcaMobile/FcaMobile.csproj

## 4) Azure Inventory (Live)
Discovered in current subscription context.

- Function Apps (selected):
  - Auricrux-Central (Running)
  - auricrux-bid-api (Running)
  - auricrux-bid-api-node (Running)
- Static Web Apps:
  - fca-frontend
- Storage Accounts:
  - Multiple auricrux* and fca* accounts discovered in Auricrux_group and related resource groups.
- Cognitive/Foundry resources:
  - Auricrux-openai-876c
  - auricrux-core-system-resource
  - auricrux-central-resource
  - opai-auricrux-runtime

## 5) Foundry/OpenAI Validation
Validated using Foundry MCP and Foundry Extensions MCP.

- Auricrux-openai-876c deployments include:
  - gpt-4.1
  - text-embedding-3-small
  - gpt-5.3-codex
  - auricrux-executive-v1
- auricrux-core-system-resource deployments include:
  - gpt-4.1
  - gpt-5.4
  - gpt-5.3-codex
  - model-router
  - whisper
  - gpt-chat-latest
- Foundry project agents visible in auricrux-core-system project, including:
  - auricrux-exec
  - auricrux-utility
  - auricrux-code
  - saas-builder
  - academy-builder
  - website-builder
  - Comms-builder
  - ui-builder
  - and additional officers
- Knowledge index visibility confirmed for auricrux-core-system project.

## 6) Graph / M365 / SharePoint Access State
- Microsoft Graph organization endpoint reachable with current credentials.
- Current tenant context returned:
  - Display Name: Default Directory
  - Tenant Domain: baguba80gmail.onmicrosoft.com
- auricrux-central M365 endpoints tested:
  - /api/m365/status?probe=true => 401
  - /api/m365/sharepoint/write-safe-discovery?... => 401
- FCA customer Entra surface:
  - https://api.futurecontractorsofamerica.com/api/customer-entra => 200

Interpretation:
- M365/SharePoint route surfaces exist, but current credential path is unauthorized for those probes.
- Current Azure/Graph auth context appears not aligned to a named FCA Entra tenant identity.

## 7) Integrity Blockers (Current)
1. Runtime external dependency references remain in product runtime code.
2. Static quality markers (placeholder/tbd/todo-like signals) still present in runtime surfaces.
3. Central Python checks are optional-failed locally due missing Python runtime availability in this shell.
4. Mobile optional check has Android build/toolchain issue in local environment.
5. Tenant-level Graph/M365 validation remains constrained by current tenant/auth context.

## 8) Next Mandatory Remediation Order
1. Remove runtime external dependency references from product code paths (not benchmark/test docs).
2. Eliminate static quality markers from all runtime surfaces flagged by strict report.
3. Restore local central/mobile validation execution prerequisites (Python + mobile toolchain) and rerun strict gate.
4. Confirm and switch to FCA Entra tenant auth context for Graph/M365/SharePoint deep checks.
5. Re-run full cross-system strict gate until status PASS.
