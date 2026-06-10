# FCA First Live Managed Auth Inputs

Status: Ready-to-paste activation inputs

## 1. Customer accounts JSON

Use the file:

- `docs/FCA_CUSTOMER_ACCOUNTS_JSON_FIRST_LIVE_TEMPLATE.json`

## 2. Session secret

Create a long random value for:

- `FCA_SESSION_SECRET`

Example format:

```text
r9X3vK2mQ8pL7wZ1cD4uN6sT0yH5bJ8eF2qM1aP9xR7
```

## 3. Safe rollout flag

Start with:

```text
FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true
```

After managed login is verified live, switch to:

```text
FCA_ALLOW_SEEDED_LOGIN_FALLBACK=false
```

## 4. Activation sequence

1. Set `FCA_CUSTOMER_ACCOUNTS_JSON`
2. Set `FCA_SESSION_SECRET`
3. Set `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true`
4. Redeploy
5. Check `/api/customer-auth-state`
6. Test `/login`
7. Test `/api/customer-session`
8. Test `/portal/profile`
9. Test protected routes
10. Disable seeded fallback after managed login is confirmed
