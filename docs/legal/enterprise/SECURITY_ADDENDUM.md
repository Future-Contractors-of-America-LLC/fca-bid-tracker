# Security Addendum

**Future Contractors of America LLC**  
**Exhibit B to Master Services Agreement**  
**Version:** 1.0  
**Effective Date:** June 19, 2026  

> **Prepared for legal review — not legal advice.** Publish summary at https://futurecontractorsofamerica.com/security after counsel approval.

---

## 1. Purpose

This Security Addendum describes administrative, technical, and organizational safeguards FCA maintains to protect Customer Data processed in the Services. It supports security questionnaires, vendor risk reviews, and the [Data Processing Agreement](./DATA_PROCESSING_AGREEMENT.md).

---

## 2. Security Program

FCA maintains a security program that includes:

- Designated security ownership and incident response procedures
- Risk assessment and treatment for the Services
- Vendor security review for subprocessors
- Security awareness for personnel with data access
- Roadmap toward SOC 2 Type II attestation (see FOUNDER_ONLY_CHECKLIST)

---

## 3. Infrastructure

| Control area | Implementation |
|--------------|----------------|
| **Hosting** | Microsoft Azure (U.S. regions by default) |
| **Network** | TLS 1.2+ for data in transit; private networking where applicable |
| **Encryption at rest** | Azure platform encryption for databases and storage |
| **Segmentation** | Logical tenant separation in multi-tenant architecture |
| **Availability** | Redundant hosting; backup per [SLA](./SERVICE_LEVEL_AGREEMENT.md) |

---

## 4. Technical and Organizational Measures (DPA Annex II Summary)

### 4.1 Access Control

- Unique user IDs; SSO via Microsoft Entra ID where configured
- Role-based access control (RBAC) in application and cloud consoles
- Multi-factor authentication required for FCA production systems
- Principle of least privilege; access reviews periodically

### 4.2 Application Security

- Secure development lifecycle practices
- Dependency and vulnerability scanning in CI/CD
- Input validation and OWASP-aligned controls for web surfaces
- Session management and CSRF protections

### 4.3 Data Protection

- Customer Data logically isolated per workspace/tenant
- Data minimization in logs (no unnecessary PII in application logs)
- Secure deletion procedures per retention policy

### 4.4 Operations

- Centralized logging and monitoring
- Automated alerting for anomalous activity
- Patch management for managed infrastructure
- Change management for production deployments

### 4.5 Personnel

- Background checks for employees with production access (where permitted by law)
- Confidentiality agreements
- Offboarding access revocation

### 4.6 Incident Response

Per [Incident Response and Breach Notification Policy](./INCIDENT_RESPONSE_AND_BREACH_NOTIFICATION_POLICY.md)

---

## 5. Vulnerability Management

- Regular dependency and infrastructure vulnerability assessment
- Critical vulnerabilities prioritized for remediation per internal SLA
- Coordinated disclosure: security@futurecontractorsofamerica.com

---

## 6. Penetration Testing

FCA will conduct or commission third-party penetration tests at least **annually** for production Services. Executive summary available to enterprise customers under NDA upon request.

---

## 7. Customer Security Responsibilities

Customer is responsible for:

- Strong passwords and MFA for user accounts
- Managing user provisioning and deprovisioning
- Configuring SSO and access policies
- Classifying Customer Data appropriately
- Not sharing admin credentials
- Compliance with Customer's industry regulations (e.g., government contracting rules)

---

## 8. Audit and Certifications

| Artifact | Availability |
|----------|--------------|
| SOC 2 Type II report | Upon completion; under NDA |
| Penetration test summary | Enterprise customers under NDA |
| Completed security questionnaires | Reasonable commercial effort |
| Subprocessor list | Public at /subprocessors |

---

## 9. Data Location

Default U.S. processing. See [Data Residency and Transfers Policy](./DATA_RESIDENCY_AND_TRANSFERS_POLICY.md) for regional options and transfer mechanisms.

---

## 10. Contact

**Security inquiries:** security@futurecontractorsofamerica.com  
**Vulnerability reports:** security@futurecontractorsofamerica.com (PGP key to be published)

---

*Document ID: FCA-LEGAL-SECURITY-v1.0*
