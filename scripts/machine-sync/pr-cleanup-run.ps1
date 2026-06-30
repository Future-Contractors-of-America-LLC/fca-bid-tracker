# PR Queue Cleanup — Run from primary machine
# Prerequisites: gh CLI authenticated as Auricrux with full repo scope
# Usage: powershell -ExecutionPolicy Bypass -File scripts\machine-sync\pr-cleanup-run.ps1
#
# Phases:
#   0 - Close 6 stale/security-risk PRs (#2, #5, #160, #161, #163, #165)
#   1 - Un-draft + merge infra/fix PRs (#164, #167, #169, #162)
#   2 - Merge feature PRs (#59, #38, #27, #31)
#   4 - Bulk close ~60 planning/docs/legacy PRs

$ErrorActionPreference = "Continue"
$REPO = "Future-Contractors-of-America-LLC/fca-bid-tracker"

Write-Host "`n=== PR Queue Cleanup ===" -ForegroundColor Cyan
Write-Host "Repo: $REPO`n"

# Verify gh auth
$authUser = gh auth status 2>&1 | Select-String "Logged in"
if (-not $authUser) {
  Write-Host "ERROR: gh CLI not authenticated. Run: gh auth login" -ForegroundColor Red
  exit 1
}
Write-Host "Auth: $authUser" -ForegroundColor Green

# ============================================================
# PHASE 0 — Close stale bot and security-risk PRs
# ============================================================
Write-Host "`n--- Phase 0: Closing stale + security-risk PRs ---" -ForegroundColor Yellow

$MSG_BOT = "Closing — this autonomous update cycle has been superseded by subsequent heartbeat commits directly to ``main``. The content this PR intended to land is already reflected in the current ``main`` HEAD. Branch is preserved."
foreach ($PR in @(2, 5, 160, 161)) {
  Write-Host "  Closing #$PR..."
  gh pr comment $PR --repo $REPO --body $MSG_BOT 2>&1 | Out-Null
  gh pr close $PR --repo $REPO 2>&1 | Out-Null
  Write-Host "  #$PR done" -ForegroundColor Green
}

$MSG_163 = "Closing without merging. Diagnostic endpoints that surface secret key names — even as presence-only — are not accepted from external contributors for this deployment. If this capability is needed it will be implemented internally behind an authenticated route. Thank you for the contribution. The branch in your fork is preserved."
gh pr comment 163 --repo $REPO --body $MSG_163 2>&1 | Out-Null
gh pr close 163 --repo $REPO 2>&1 | Out-Null
Write-Host "  #163 done" -ForegroundColor Green

$MSG_165 = "Closing without merging. This endpoint exposes partial secret values (including STRIPE_SECRET_KEY prefix/suffix and full STRIPE_PUBLISHABLE_KEY) over an anonymous HTTP endpoint. This is a security risk and is not accepted from external contributors. If a health-check endpoint is needed, it will be implemented internally. Thank you for the contribution. The branch in your fork is preserved."
gh pr comment 165 --repo $REPO --body $MSG_165 2>&1 | Out-Null
gh pr close 165 --repo $REPO 2>&1 | Out-Null
Write-Host "  #165 done" -ForegroundColor Green

Write-Host "Phase 0 complete." -ForegroundColor Green

# ============================================================
# PHASE 1 — Un-draft + merge infra/fix PRs
# ============================================================
Write-Host "`n--- Phase 1: Merging infra/fix PRs ---" -ForegroundColor Yellow

# Wait for no active main runs
Write-Host "  Checking for active workflow runs on main..."
for ($i = 1; $i -le 6; $i++) {
  $count = gh api "repos/$REPO/actions/runs?branch=main&status=in_progress" --jq '.total_count' 2>$null
  if ([int]$count -eq 0) { Write-Host "  No active runs. Proceeding." -ForegroundColor Green; break }
  Write-Host "  $count active run(s). Waiting 30s... ($i/6)"
  Start-Sleep 30
}

# PR #164 — workspace validators + Pages UTF-8
Write-Host "  Merging #164..."
gh pr ready 164 --repo $REPO 2>&1 | Out-Null
Start-Sleep 3
gh pr merge 164 --repo $REPO --squash `
  --subject "fix: workspace validators use local core + Pages UTF-8 containment (#164)" `
  --body "Aligns finance/design validators to local core/ directory. Adds docs/_config.yml excludes to prevent Jekyll UTF-8 failures on non-site markdown."
Write-Host "  #164 done" -ForegroundColor Green

# PR #167 — Jekyll suppression + secret-gated workflows
Write-Host "  Merging #167..."
gh pr ready 167 --repo $REPO 2>&1 | Out-Null
Start-Sleep 3
gh pr merge 167 --repo $REPO --squash `
  --subject "fix: suppress Jekyll on docs/ and gate secret-dependent workflow steps (#167)" `
  --body "Adds root _config.yml exclusions for docs/, *.md, node_modules/. Gates build-validation, lms-repair-loop, frontend-build-loop, and SWA deploy steps on required secret presence."
Write-Host "  #167 done" -ForegroundColor Green

# PR #169 — machine sync utilities (already non-draft)
Write-Host "  Merging #169..."
gh pr merge 169 --repo $REPO --squash `
  --subject "feat: add machine sync utilities for multi-PC workflow (#169)" `
  --body "Adds scripts/machine-sync/ with sync-before-work.ps1, sync-end-session.ps1, and machine-audit.ps1. All 4 Bugbot issues resolved: push exit code check, .git root detection fix, Test-Tool exit code check, and .gitignore for generated audit reports."
Write-Host "  #169 done" -ForegroundColor Green

# PR #162 — SWA 500MB fix (already approved by Auricrux)
Write-Host "  Merging #162..."
gh pr ready 162 --repo $REPO 2>&1 | Out-Null
Start-Sleep 3
gh pr merge 162 --repo $REPO --squash `
  --subject "fix: strip dist/academy/media from SWA payload to stay under 500 MB (#162)" `
  --body "Adds post-SPA build step to remove dist/academy/media (196 MB of generated course HTML) before SWA upload. Updates staticwebapp.config.json to return 404 for /academy/media/* instead of rewriting to index.html."
Write-Host "  #162 done" -ForegroundColor Green

Write-Host "Phase 1 complete." -ForegroundColor Green

# ============================================================
# PHASE 2 — Merge feature PRs
# ============================================================
Write-Host "`n--- Phase 2: Merging feature PRs ---" -ForegroundColor Yellow

# PR #59 — control-plane proof on live surface
Write-Host "  Merging #59..."
gh pr merge 59 --repo $REPO --squash `
  --subject "feat: expose control-plane proof on live surface (#59)" `
  --body "Adds public home-page and portal platform-dashboard control-plane proof cards with live links to run-digest and deployment-status JSON endpoints."
Write-Host "  #59 done" -ForegroundColor Green

# PR #38 — coverage matrix + portal/audit metadata fix
Write-Host "  Merging #38..."
gh pr merge 38 --repo $REPO --squash `
  --subject "feat: add FCA coverage matrix and fix portal/audit site metadata (#38)" `
  --body "Adds FCA_COVERAGE_MATRIX.md mapping lifecycle stages to route/validation surfaces. Fixes validate:site-metadata CI failure by adding missing /portal/audit entry to siteMetadata.js."
Write-Host "  #38 done" -ForegroundColor Green

# PR #27 — qualification command surface
Write-Host "  Merging #27..."
gh pr merge 27 --repo $REPO --squash `
  --subject "feat: add qualification command surface to bid workspace (#27)" `
  --body "Adds qualification score, state, blocked packages, and won-package handoff readiness to /portal/bids. Surfaces missing evidence needed before bid-to-project conversion."
Write-Host "  #27 done" -ForegroundColor Green

# PR #31 — bid-to-project conversion + project file spine
Write-Host "  Merging #31..."
gh pr merge 31 --repo $REPO --squash `
  --subject "feat: implement bid-to-project conversion and project file spine (#31)" `
  --body "Implements project workspace normalization, project file store/hook, file-package creation with briefings, bid-to-project conversion, active workspace rebinding, portalContinuityStore, and portal shell live-state bridging."
Write-Host "  #31 done" -ForegroundColor Green

Write-Host "Phase 2 complete." -ForegroundColor Green

# ============================================================
# PHASE 4 — Bulk close planning/docs/legacy PRs
# ============================================================
Write-Host "`n--- Phase 4: Bulk closing planning/legacy PRs ---" -ForegroundColor Yellow

$MSG_PLAN = "Closing — this planning packet has been superseded by subsequent implementation work. Closing to reduce PR queue noise. The branch is preserved if the content needs to be referenced."

$BULK_CLOSE = @(
  7, 8, 10, 11, 12, 13, 14,          # Legacy workflow iteration PRs
  33, 34, 35, 36, 37,                  # Implementation packet spine
  45, 52, 53, 54, 57,                  # Audit/docs checkpoints
  68, 69, 70, 71, 72, 73, 74, 75,     # Academy/LMS Packet 048 series
  76, 77, 78, 79, 80,                  # Academy/LMS Packet 048 series cont.
  81, 82, 83, 84, 85, 86, 87, 88,     # Wave 1 execution planning 049P-050A
  89, 90, 91, 92,                      # Wave 1 cont.
  93, 94, 95, 96, 97, 98, 99,         # Wave 2 packets 050B-050H
  100, 101, 102,                       # Wave 2 packets 050I-050K
  103,                                 # Phase A frontend hooks
  111, 112, 113, 114,                  # 062D-062G observation packets
  132, 133, 134, 135, 136              # 062I-062M observation packets
)

foreach ($PR in $BULK_CLOSE) {
  Write-Host "  Closing #$PR..."
  gh pr comment $PR --repo $REPO --body $MSG_PLAN 2>&1 | Out-Null
  gh pr close $PR --repo $REPO 2>&1 | Out-Null
  Write-Host "  #$PR done" -ForegroundColor Green
  Start-Sleep 1
}

Write-Host "Phase 4 complete." -ForegroundColor Green

Write-Host "`n=== ALL PHASES COMPLETE ===" -ForegroundColor Cyan
Write-Host "Remaining open PRs that need code fixes before merging:" -ForegroundColor Yellow
Write-Host "  #55  — CC auth hardening (3 Copilot review issues — Copilot fixing)"
Write-Host "  #139 — Revenue sprint wave 1 (3 HIGH Bugbot issues — Copilot fixing)"
Write-Host "  #170 — Slice 07 Academy (2 Bugbot issues — Copilot fixing)"
Write-Host "`nSync your primary machine: git pull origin main" -ForegroundColor Cyan
