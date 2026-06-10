# FCA Managed Auth Activation Runbook

Status: Active deployment runbook  
Scope: Safe live activation of managed customer authentication for `Future-Contractors-of-America-LLC/fca-bid-tracker`

---

## Objective

Promote FCA customer login from seeded-only fallback behavior to a managed customer account model without breaking current workspace access.

This runbook assumes the repo already contains:

- managed customer account store logic
- auth-boundary truth reporting
- customer login endpoint wired to the managed account validator
- seeded fallback retained as a temporary safety net

---

## Activation Strategy

Use a two-step rollout:

### Phase 1 — Safe activation
- turn on managed accounts
- keep seeded fallback available
- verify managed login works

### Phase 2 — Truthful cutover
- disable seeded fallback
- verify only managed credentials work on the normal login path

---

## Required Environment Variables

### 1. `FCA_CUSTOMER_ACCOUNTS_JSON`

JSON array of managed customer accounts.

Minimum structure:

```json
[
  {
    "email": "owner@customercompany.com",
    "password": "ReplaceThisWithStrongCustomerPassword1!",
    "company": "Customer Company LLC",
    "role": "Owner / Admin",
    "customerId": "CUST-CUSTOMER-001",
    "workspaceLabel": "Customer Company Workspace",
    "selectedPlan": "enterprise",
    "enabledProducts": {
      "saas": true,
      "lms": true,
      "auricrux": true
    },
    "enabledComms": {
      "chat": true,
      "sms": true,
      "phone": true,
      "email": true,
      "teams": true,
      "conference": true,
      "lecture": true
    }
  }
]
```

Preferred stronger format:

```json
[
  {
    "email": "owner@customercompany.com",
    "passwordHash": "PUT_SHA256_HEX_HERE",
    "company": "Customer Company LLC",
    "role": "Owner / Admin",
    "customerId": "CUST-CUSTOMER-001",
    "workspaceLabel": "Customer Company Workspace",
    "selectedPlan": "enterprise",
    "enabledProducts": {
      "saas": true,
      "lms": true,
      "auricrux": true
    },
    "enabledComms": {
      "chat": true,
      "sms": true,
      "phone": true,
      "email": true,
      "teams": true,
      "conference": true,
      "lecture": true
    }
  }
]
```

### 2. `FCA_SESSION_SECRET`

Use a long random string.

Example:

```text
r9X3vK2mQ8pL7wZ1cD4uN6sT0yH5bJ8eF2qM1aP9xR7
```

### 3. `FCA_ALLOW_SEEDED_LOGIN_FALLBACK`

For safe activation, start with:

```text
true
```

After verification, switch to:

```text
false
```

---

## Azure Static Web Apps / App Settings Activation Steps

If the site is deployed on Azure Static Web Apps with Functions:

### Step 1 — Open Azure portal
- Sign in to Azure portal
- Open the FCA deployment resource for the live shell / Static Web App

### Step 2 — Open configuration
- Go to **Environment** or **Configuration** / **Application settings** depending on the surface available
- Locate the settings area used by the Functions runtime

### Step 3 — Add `FCA_CUSTOMER_ACCOUNTS_JSON`
- Add a new app setting named:
  - `FCA_CUSTOMER_ACCOUNTS_JSON`
- Paste the JSON array as a single-line JSON value

### Step 4 — Add `FCA_SESSION_SECRET`
- Add a new app setting named:
  - `FCA_SESSION_SECRET`
- Paste the long random secret value

### Step 5 — Add seeded fallback flag
- Add a new app setting named:
  - `FCA_ALLOW_SEEDED_LOGIN_FALLBACK`
- Set value to:
  - `true`

### Step 6 — Save configuration
- Save settings
- Confirm the environment restarts or redeploys as required

### Step 7 — Wait for runtime pickup
- Wait for the configuration change to propagate
- If needed, trigger a redeploy from GitHub or restart the environment from Azure

---

## Phase 1 Validation Checklist

### Validation 1 — Auth state endpoint
Open:

```text
/api/customer-auth-state
```

Expected result after correct configuration:

- `ok: true`
- `authBoundary.activeMode` should be either:
  - `managed-server-session`
  - or `managed-server-session-with-fallback-secret`
- `authBoundary.productionAuthReady` should be:
  - `true` if both managed accounts and session secret are set correctly
- message should indicate managed auth is configured

### Validation 2 — Login route
Open:

```text
/login
```

Test with the managed customer email/password you configured.

Expected:
- login succeeds
- no invalid-credentials error
- route advances to `/portal/platform` or appropriate next protected route

### Validation 3 — Session endpoint
After login, verify:

```text
/api/customer-session
```

Expected:
- `authenticated: true`
- account object present
- account should reflect managed customer values
- account mode should not present as plain seeded fallback if managed auth succeeded

### Validation 4 — Profile route truth
Open:

```text
/portal/profile
```

Expected:
- authentication truth boundary displayed
- launch readiness aligned to managed auth state
- selected plan and product access match configured managed account

### Validation 5 — Product access routes
Verify access to:

- `/portal/platform`
- `/portal/projects`
- `/portal/bids`
- `/academy`
- `/portal/auricrux`

Expected:
- access behavior matches `enabledProducts`
- no route mismatch between plan/account config and actual portal access

### Validation 6 — Seeded fallback still works during Phase 1
If fallback remains enabled, verify internal or seeded validation path still works intentionally.

Expected:
- seeded fallback remains available only as a temporary safety behavior
- managed auth should still be the primary intended customer path

---

## Phase 2 Cutover Checklist

Only proceed after Phase 1 passes.

### Step 1 — Disable seeded fallback
Change:

```text
FCA_ALLOW_SEEDED_LOGIN_FALLBACK=false
```

### Step 2 — Save and redeploy
- Save config
- wait for propagation or trigger redeploy

### Step 3 — Re-test managed login
Expected:
- managed account still works
- portal access remains normal

### Step 4 — Re-test seeded credentials on normal path
Expected:
- old seeded credentials should fail on the normal login path
- internal-only test behavior should not leak into customer-facing auth unless explicitly routed

---

## Failure Conditions

Activation is incomplete if any of the following occurs:

- `/api/customer-auth-state` still reports managed auth not configured
- `productionAuthReady` remains `false` after both required env vars were supposedly set
- managed credentials fail but seeded credentials still succeed as the normal path
- login succeeds but `/api/customer-session` shows unauthenticated
- profile still claims sandbox posture after successful managed login
- product access does not match account JSON
- runtime appears to ignore newly set configuration values

---

## Rollback Plan

If managed auth causes a live issue:

### Fast rollback
1. Set:
   - `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true`
2. Save config
3. restart/redeploy if needed
4. verify seeded validation path works again

### Full rollback if necessary
If managed account JSON is malformed or causing runtime failure:
1. temporarily remove or correct `FCA_CUSTOMER_ACCOUNTS_JSON`
2. keep seeded fallback enabled
3. redeploy
4. fix JSON offline before retrying activation

---

## Recommended First Live Account

Use one controlled managed account first:

- one owner/admin
- enterprise plan
- all product surfaces enabled
- all communications enabled

Reason:
- lowest cutover complexity
- easiest truth validation
- fastest market-ready walkthrough path

---

## Post-Activation Next Step

After managed auth is working live:

1. verify runtime truth against repo truth
2. confirm protected routes behave correctly
3. confirm profile/auth truth surfaces remain accurate
4. then move to deeper auth hardening if needed:
   - stronger password handling policy
   - managed onboarding flow
   - credential rotation discipline
   - account administration surface

---

## Operator Summary

If you want the shortest safe path:

1. set `FCA_CUSTOMER_ACCOUNTS_JSON`
2. set `FCA_SESSION_SECRET`
3. set `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true`
4. redeploy
5. test `/api/customer-auth-state`
6. test managed login
7. test `/portal/profile`
8. test protected routes
9. switch `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=false`
10. redeploy and verify seeded credentials no longer act as the normal login path
