# Azure Functions Truth Gate Attestation

- Overall: PASS
- Function App: Auricrux-Central
- Resource Group: Auricrux_group
- Base URL: https://auricrux-central.azurewebsites.net
- Latest Deployment ID: n/a

## Immutable Package Attestation
- WEBSITE_RUN_FROM_PACKAGE=1
- Result: PASS

## Artifact vs Live File Attestation
- index.mjs: PASS (local 5411dc8b1f527a5d78a4463f3dcdbfac5a9423ea7a550b09ea07d04e727f6efe, live 5411dc8b1f527a5d78a4463f3dcdbfac5a9423ea7a550b09ea07d04e727f6efe)
- admin-payroll-profile.js: PASS (local b78d005de2eed767df4bd314c797c34fa4946b43ba4880d85b5a02323257db8f, live b78d005de2eed767df4bd314c797c34fa4946b43ba4880d85b5a02323257db8f)
- admin-payroll-directory.js: PASS (local 947add1838ea5f70e8355c3f4d3e0593aa6ab914a158f623e5118d40e4755bc0, live 947add1838ea5f70e8355c3f4d3e0593aa6ab914a158f623e5118d40e4755bc0)
- admin-students.js: PASS (local 67b52f52882c764d571d1dfabbea1c82e8166ed3948545229fd6cd670f458d8e, live 67b52f52882c764d571d1dfabbea1c82e8166ed3948545229fd6cd670f458d8e)
- internal-company-profile.js: PASS (local e0f72550fdead2823d47e7b88c5bc65f9675f57733757a5ff9ab5915e52fe134, live e0f72550fdead2823d47e7b88c5bc65f9675f57733757a5ff9ab5915e52fe134)
- internal-employee-directory.js: PASS (local ee89d10af346c99bc1e81b6d612693a71caab4e1517de67c89cfc6aefffbace3, live ee89d10af346c99bc1e81b6d612693a71caab4e1517de67c89cfc6aefffbace3)
- internal-record-audit.js: PASS (local dd22772b0de90dd6784a3a2ada0ee6d053a9d754ea5c9c1235c71bfde925daa7, live dd22772b0de90dd6784a3a2ada0ee6d053a9d754ea5c9c1235c71bfde925daa7)
- internal-admin-ping-v4.js: PASS (local 55a3b382aeb9f6831d4c31bc24eddd1e7dae12d6c33506e6b2d04da0cedb716e, live 55a3b382aeb9f6831d4c31bc24eddd1e7dae12d6c33506e6b2d04da0cedb716e)

## Route Manifest Attestation
- PASS: expected routes are present with expected methods.

## Intent Checks
- diag canary reachable: PASS (GET /api/diag-canary, status=200)
- projects route auth boundary: PASS (GET /api/projects, status=403)
- auricrux route auth boundary: PASS (GET /api/auricrux, status=403)
- customer login contract: PASS (POST /api/customer-login, status=401)
- internal-admin ping reachable: PASS (GET /api/internal-admin/ping, status=200)
- internal-admin payroll profile boundary: PASS (GET /api/internal-admin/payroll-profile, status=401)
