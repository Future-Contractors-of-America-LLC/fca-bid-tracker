# Managed Auth + Commercial Live Probe

- When: 2026-07-12T10:29:11.255Z
- API base: https://api.futurecontractorsofamerica.com
- SWA origin: https://www.futurecontractorsofamerica.com
- Result: PASS (0 failure(s))
- Ban: AURICRUX_BAN_FOUNDRY_AOAI=1

## Findings
- **PASS** live customer-auth-state: HTTP 200
- **PASS** live authBoundary.productionAuthReady: managed-server-session
- **PASS** live customer-session: HTTP 200
- **PASS** live customer-session shape: authenticated=false
- **PASS** live commercial-pipeline: HTTP 200
- **PASS** live fca-payments/status: HTTP 200
- **PASS** live payments primaryRail: fca-native
- **PASS** live fca-payments/intake: HTTP 201
- **PASS** live commercial intake id: INTAKE-1783852149587
- **PASS** live academy-commerce catalog: HTTP 200
- **PASS** live academy-commerce courses: 1 item(s)
- **PASS** swa same-origin customer-auth-state residual: HTTP 404; canonical auth plane is https://api.futurecontractorsofamerica.com
