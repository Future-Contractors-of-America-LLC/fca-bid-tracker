# M365 Graph Live Probe (read scope)

- When: 2026-07-12T23:22:32.353Z
- API base: https://api.futurecontractorsofamerica.com
- SWA origin: https://www.futurecontractorsofamerica.com
- Scope: read (no Graph writes)
- Result: PASS (0 failure(s))
- Ban: AURICRUX_BAN_FOUNDRY_AOAI=1

## Findings
- **PASS** live m365/status: HTTP 200
- **PASS** live m365/status shape: microsoft-365-graph
- **PASS** live m365/sharepoint/status: HTTP 200
- **PASS** live m365/sharepoint/status shape: sharepoint_configuration_mapped
- **PASS** live m365/sharepoint/folder (read): HTTP 200
- **PASS** live sharepoint folder read: HTTP 200
- **PASS** swa same-origin m365/status residual: HTTP 404; canonical m365 plane is https://api.futurecontractorsofamerica.com
