# FCA System Security Hardening

This hardening layer applies across the SaaS platform, FCA Academy, CTE shadow environment, and Auricrux integrations.

## Control Plane

- Encryption posture: all production data stores, backups, generated evidence, and audit trails must use AES-256 or stronger encryption at rest. Public and service boundaries must enforce TLS 1.3+ and reject plaintext or downgrade paths at the edge.
- DLP posture: sensitive financial data, contractor intellectual property, Academy records, and minor-related PII are deny-by-default for export, scraping, bulk extraction, or lateral movement unless an explicit security authorization marker is present.
- Disaster recovery posture: SaaS transactions, Academy records, and Auricrux logs must be backed by immutable WORM storage in an isolated region. Production deployments should bind the tamper-evident audit chain to Azure Confidential Ledger or WORM-enabled isolated storage.
- Zero-trust posture: no human user, service account, or Auricrux agent receives default trust. Mutating live operations require a fresh signed server session or a trusted managed-identity bearer proof with a short access window.
- Audit posture: critical actions produce hash-chained, tamper-evident audit entries with sensitive payloads redacted or hashed before storage. Audit records are modeled as append-only WORM entries with no update or delete application path.

## Runtime Enforcement

- [api/_lib/runtime/securityHardeningControls.js](../../api/_lib/runtime/securityHardeningControls.js) is the shared hardening middleware used by Central proxy routes, Auricrux routes, and payment checkout.
- [api/_lib/proxyToCentral.js](../../api/_lib/proxyToCentral.js) and [api/central-proxy.js](../../api/central-proxy.js) run DLP, zero-trust, and lockdown checks before constructing or calling live Central API targets.
- CTE/minor traffic remains in `cte-shadow-staging`; any CTE-to-live or minor-live Auricrux attempt triggers the automated lockdown protocol.
- Auricrux live routes require a dedicated scoped service account for the target environment before execution. CTE shadow mock execution remains isolated from live production APIs.
- Stripe checkout is DLP-audited and CTE requests receive simulated checkout responses without loading or calling the live Stripe SDK path.

## Phase 3 Zero-Trust IAM

- Continuous authentication uses the signed `fca_session` HttpOnly cookie as the trust anchor. Each session carries `issuedAt`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `authEpoch`, and `sessionVersion` in the signed payload.
- The access window is 10 minutes and is refreshed through the existing secure cookie refresh flow. Stale access windows are denied before mutating API work is performed.
- Direct role headers are never sufficient trust proof. Mutating routes require either a valid signed session or a trusted bearer/service proof from Microsoft Entra, managed identity, or an FCA token broker with a short access window.
- API-level RBAC is enforced in the shared middleware before DLP or live proxy forwarding. Current route families separate SaaS financial APIs, Academy records/admin APIs, Auricrux execution APIs, and SaaS operations APIs.
- CTE/minor users may reach allowed training routes only when the target environment resolves to `cte` and no live-production intent is present.

## Auricrux Service Accounts

- Live Auricrux execution requires `x-fca-agent: auricrux`, an environment-specific service account, and an environment-specific execution scope.
- Accepted executor accounts are `auricrux-saas-executor`, `auricrux-academy-executor`, and `auricrux-cte-shadow-executor`.
- Auricrux service identities are denied if they carry super-admin, root, wildcard, all-access, or global-admin scope markers.
- Audit telemetry records Auricrux prompt, context, action, target object, service account, and target environment as hashes only. Raw prompt and raw context text are not persisted in security audit entries.

## WORM Audit Schema

- `WORM_AUDIT_LOG_SCHEMA` defines the append-only audit contract in [api/_lib/runtime/securityHardeningControls.js](../../api/_lib/runtime/securityHardeningControls.js).
- Each event includes `schemaVersion`, `previousHash`, `eventHash`, `tenantHash`, `actorHash`, `targetEnvironment`, `payloadHash`, optional Auricrux telemetry hashes, `wormAppendOnly`, `updateAllowed: false`, and `deleteAllowed: false`.
- Production sinks must use Azure Confidential Ledger or Azure Storage immutable blob containers with time-based retention and legal hold.
- Required Azure storage controls include managed-identity writes, private endpoint or network restriction, secure transfer, public blob access disabled, shared key access disabled where supported, blob versioning and soft delete, encryption, and diagnostics to Log Analytics.

## Anomaly Detection

- Rapid successive API calls emit `security_threshold_alert` events after the configured per-actor route threshold is exceeded.
- Multiple failed authentication attempts emit threshold alerts and keep the failed proofs in hashed/redacted audit form.
- Repeated mass export attempts emit threshold alerts in addition to DLP blocks.
- CTE-to-live, cross-environment lateral movement, and minor-live Auricrux execution attempts trigger lockdown rather than only alerting.

## Disaster Recovery Requirements

Production infrastructure must configure:

- immutable blob versioning or WORM containers for backups;
- isolated-region backup replication for SaaS transactions, Academy records, and Auricrux logs;
- Key Vault-backed key rotation and managed identity access for backup writers;
- `FCA_IMMUTABLE_AUDIT_ENABLED=1` only when the external immutable sink is provisioned;
- `FCA_SECURITY_LOCKDOWN=1` as an emergency manual lock while automated lockdown evidence is reviewed.

## Validation

Run `npm run validate:system-security-hardening` to verify the control policy, DLP block behavior, zero-trust denial behavior, automated lockdown, Auricrux suspension, hash-chained audit events, and SWA security headers.

Run `npm run validate:phase3-zero-trust-audit` to verify short-lived access-token denial, route-level RBAC, CTE-to-live blocking, scoped Auricrux service accounts, hashed Auricrux telemetry, WORM audit semantics, and threshold alerts.