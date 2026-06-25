# FCA Live Auth Verification Checklist

Status: Active live-verification artifact  
Scope: Post-deploy validation of managed customer authentication and protected workspace access

---

## Purpose

Use this checklist immediately after deploying managed auth environment variables so repo truth and live runtime truth can be verified cleanly.

This checklist assumes the following were already set in the deployment environment:

- `FCA_CUSTOMER_ACCOUNTS_JSON`
- `FCA_SESSION_SECRET`
- `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true` for first-pass safe activation

---

## Success Criteria

Managed auth is considered live-ready only if all of the following are true:

1. `/api/customer-auth-state` reports managed auth mode correctly
2. `/login` accepts managed customer credentials
3. `/api/customer-session` returns authenticated session data after login
4. `/portal/profile` displays truthful auth posture and correct customer/account data
5. protected routes work according to enabled products
6. seeded fallback behaves only as intended during transition

---

## Test Data You Should Have Ready

Before testing, have these values ready:

- managed customer email
- managed customer password
- expected customer company name
- expected workspace label
- expected plan
- expected product access settings
- expected communications settings

---

## Phase 1 â€” Runtime Truth Check

### Check 1 â€” Auth state endpoint

Open:

```text
/api/customer-auth-state
```

### Expected

- `ok` = `true`
- `authBoundary.activeMode` should be one of:
  - `managed-server-session`
  - `managed-server-session-with-fallback-secret`
- `authBoundary.productionAuthReady` should be:
  - `true` if both managed accounts and secret are correctly loaded
- `authBoundary.identityProvider` should remain `fca-native-auth`
- message should indicate managed auth is configured or nearly configured

### Fail if

- endpoint still says managed auth is not configured
- `productionAuthReady` is `false` when both env vars were supposedly set
- active mode still reads like seeded-only auth

---

## Phase 2 â€” Managed Login Verification

### Check 2 â€” Open login page

Open:

```text
/login
```

### Verify visually

- page loads normally
- no stale shell error
- no broken redirect loop
- no internal-only copy on the normal customer route

### Check 3 â€” Sign in with managed customer account

Use the managed customer credentials from `FCA_CUSTOMER_ACCOUNTS_JSON`.

### Expected

- no invalid credentials error
- customer is routed into workspace
- no fallback-looking error state

### Fail if

- valid managed credentials fail
- only seeded credentials work
- login succeeds but does not route into protected workspace

---

## Phase 3 â€” Session Verification

### Check 4 â€” Verify session endpoint after login

Open:

```text
/api/customer-session
```

### Expected

- `authenticated` = `true`
- `account.email` matches managed account
- `account.company` matches configured company
- `account.customerId` matches configured customer ID
- `account.workspaceLabel` matches configured workspace label
- `account.selectedPlan` matches configured plan
- `enabledProducts` matches configured products
- `enabledComms` matches configured comms
- `session.sessionSource` should align with managed auth, not anonymous/none

### Fail if

- returns unauthenticated after successful login
- account fields do not match the configured managed account
- session shape is incomplete or contradictory

---

## Phase 4 â€” Profile Truth Surface Verification

### Check 5 â€” Open profile

Open:

```text
/portal/profile
```

### Expected

Profile should display:

- correct customer company
- correct customer ID
- correct email
- correct workspace label
- correct selected plan
- correct product access state
- correct communications access state
- truthful auth boundary section

### Specific truth checks

- if managed auth is live, profile should not imply seeded-only posture
- if secret is missing, profile should still truthfully show fallback-secret mode
- account source and launch readiness should not misrepresent production readiness

### Fail if

- profile says production-ready when `/api/customer-auth-state` does not
- profile still presents sandbox posture after managed login is working
- product access shown in profile does not match configured account data

---

## Phase 5 â€” Protected Route Access Verification

### Check 6 â€” SaaS route

Open:

```text
/portal/platform
```

Expected:
- loads successfully if `enabledProducts.saas = true`

### Check 7 â€” Projects route

Open:

```text
/portal/projects
```

Expected:
- loads successfully if SaaS is enabled

### Check 8 â€” Bids route

Open:

```text
/portal/bids
```

Expected:
- loads successfully if SaaS is enabled

### Check 9 â€” Academy route

Open:

```text
/academy
```

Expected:
- loads successfully if `enabledProducts.lms = true`
- should restrict or redirect truthfully if LMS is disabled

### Check 10 â€” Auricrux route

Open:

```text
/portal/auricrux
```

Expected:
- loads successfully if `enabledProducts.auricrux = true`

### Fail if

- route protection ignores product config
- disabled product still grants full access
- enabled product is blocked incorrectly

---

## Phase 6 â€” Communications Access Verification

### Check 11 â€” Verify comms-linked surfaces

Primary route:

```text
/portal/profile
```

Then inspect comms controls and related routes such as:

```text
/portal/messages
```

### Expected

- enabled comms lanes appear as enabled
- disabled comms lanes appear as pending/unavailable
- profile reflects actual account config

### Fail if

- comms state shown in UI differs from configured account JSON
- toggles or displayed states are contradictory after login

---

## Phase 7 â€” Seeded Fallback Verification

Only do this during first safe activation when:

```text
FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true
```

### Check 12 â€” Verify fallback still exists intentionally

Try the seeded validation path only if you intentionally want it available during transition.

### Expected

- seeded path works only as transition safety behavior
- managed auth remains primary customer path
- truth surfaces still reflect actual auth mode accurately

### Fail if

- seeded path is still effectively the main login path
- managed auth works inconsistently while seeded flow dominates

---

## Phase 8 â€” Cutover Verification After Disabling Fallback

After Phase 1 succeeds, set:

```text
FCA_ALLOW_SEEDED_LOGIN_FALLBACK=false
```

Redeploy, then test again.

### Check 13 â€” Managed login still works

Expected:
- managed credentials still work normally

### Check 14 â€” Seeded login on normal path fails

Expected:
- old seeded credentials should no longer authenticate on the normal login path

### Fail if

- seeded accounts still log in normally after fallback is disabled
- managed accounts regress after disabling fallback

---

## Failure Triage Table

| Symptom | Likely Cause | Immediate Action |
|---|---|---|
| `/api/customer-auth-state` still says not configured | env vars not loaded or malformed | re-check app settings and redeploy |
| managed login fails but seeded works | managed JSON missing/bad, fallback masking issue | validate JSON, keep fallback on, retest |
| session endpoint unauthenticated after login | cookie not set or not persisted | inspect response headers and runtime cookie behavior |
| profile shows wrong auth posture | stale state or auth truth mismatch | refresh profile after re-login, confirm auth-state endpoint |
| protected routes ignore product settings | session state not aligned with account config | verify session payload fields and route guards |

---

## Pass / Fail Summary Block

Use this after testing.

```text
Auth state endpoint: PASS / FAIL
Managed login: PASS / FAIL
Session endpoint: PASS / FAIL
Profile truth surface: PASS / FAIL
Protected SaaS routes: PASS / FAIL
Academy route: PASS / FAIL
Auricrux route: PASS / FAIL
Comms state: PASS / FAIL
Seeded fallback transition behavior: PASS / FAIL
Fallback disabled cutover: PASS / FAIL
```

---

## Final Acceptance Rule

Managed auth is accepted only if:

- auth state endpoint is truthful
- managed login works
- session persists correctly
- profile truth matches runtime truth
- route protection matches account entitlements
- seeded fallback is removable without regression

If any one of those fails, activation is incomplete.
