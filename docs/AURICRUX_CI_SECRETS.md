# Auricrux CI secrets

Cross-repo Auricrux automation depends on a single GitHub token shared across **fca-bid-tracker** and **auricrux-central**.

## Required secret: `AURICRUX_GITHUB_TOKEN`

### Recommended setup (org secret)

```bash
gh secret set AURICRUX_GITHUB_TOKEN --org Future-Contractors-of-America-LLC \
  --visibility selected \
  --repos auricrux-central,fca-bid-tracker
```

**Important:** `fca-bid-tracker` workflows read the secret **from the fca-bid-tracker repository**, not from auricrux-central. If you set different values on each repo, cross-repo checkout from fca-bid-tracker will fail even when auricrux-central's copy works.

CI now tries tokens in order: `AURICRUX_GITHUB_TOKEN` → `COPILOT_GITHUB_TOKEN` → `GITHUB_TOKEN` (`github.token`). The last works when **auricrux-central → Settings → Actions → General → Access** allows workflows from `fca-bid-tracker`.

Use the same value in org/enterprise secrets if your runner also reads org-level secrets.

### Token permissions

| Capability | Minimum permission |
|---|---|
| Cross-repo checkout | **Contents: Read** on `auricrux-central` and `fca-bid-tracker` |
| Auto PR creation | **Pull requests: Read and write** |
| Issue labels / comments | **Issues: Read and write** |
| Loop commits to `main` | **Contents: Write** on target repo |

**Simplest option:** classic personal access token with **`repo`** scope, SSO-authorized for `Future-Contractors-of-America-LLC`.

### Repo setting (same-repo PRs)

For workflows that use built-in `GITHUB_TOKEN` only:

**Settings â†’ Actions â†’ General â†’ Workflow permissions â†’ Allow GitHub Actions to create and approve pull requests**

### Workflows that require the token

| Workflow | Repo | Why |
|---|---|---|
| `auricrux-frontend-build-loop.yml` | fca-bid-tracker | Checkout `auricrux-central` for finance spine validation |
| `auricrux-autopr.yml` / `auricrux-runner.yml` | both | Fallback when `GITHUB_TOKEN` cannot open PRs |
| `auricrux-ecosystem-shell.yml` | auricrux-central | Cross-repo clone/push |
| `auricrux-system-brain.yml` | auricrux-central | Cross-repo issue reads |

### Verify locally or in CI

```bash
AURICRUX_GITHUB_TOKEN=ghp_... bash scripts/ci/verify-auricrux-token.sh
```

Scheduled health check: `.github/workflows/auricrux-secrets-health.yml`

### Bootstrap helper (Windows)

```powershell
./scripts/ci/bootstrap-auricrux-secrets.ps1
```

## Local-only: `AURICRUX_TRAINING_DIR`

Not a GitHub secret. Used by **auricrux-central** local training loops to isolate machine-specific SFT artifacts.

See `auricrux-central/scripts/training/README.md`.

## Auth runtime (production)

| Variable | Purpose |
|---|---|
| `FCA_SESSION_SECRET` | HMAC signing for customer session cookies |
| `FCA_CUSTOMER_ACCOUNTS_JSON` | Managed customer accounts |
| `GRAPH_MAIL_SENDER` + Graph app creds | Send login verification email |
| `FCA_VERIFICATION_DEV_EXPOSE_CODE=1` | Dev only â€” return OTP in login response when email is unavailable |
