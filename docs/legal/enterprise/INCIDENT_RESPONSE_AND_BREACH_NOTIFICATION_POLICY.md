# Incident Response and Breach Notification Policy

**Future Contractors of America LLC**  
**Version:** 1.0  
**Effective Date:** June 19, 2026  

> **Prepared for legal review — not legal advice.** Internal operations policy; summary shared with enterprise customers under DPA.

---

## 1. Purpose

This policy defines how FCA detects, responds to, and notifies customers of security incidents and personal data breaches affecting the Services.

---

## 2. Scope

Applies to all FCA personnel, contractors, and subprocessors with access to production systems or Customer Data.

---

## 3. Definitions

- **Security Incident:** Attempted or successful unauthorized access, disclosure, alteration, or destruction of information or systems.
- **Personal Data Breach:** Security incident leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data processed on behalf of a customer.

---

## 4. Incident Response Team

| Role | Responsibility |
|------|----------------|
| **Incident Commander** | Coordinates response, escalation, communications |
| **Security Lead** | Technical investigation, containment, forensics |
| **Engineering Lead** | Remediation, restoration |
| **Legal / Privacy** | Breach notification, regulatory assessment |
| **Executive Sponsor** | Major incident decisions, customer executive comms |

**Primary contact:** security@futurecontractorsofamerica.com

---

## 5. Response Phases

### 5.1 Detection and Reporting

Incidents may be detected via monitoring, employee report, customer report, or subprocessor notification. All personnel report suspected incidents immediately to security@futurecontractorsofamerica.com.

### 5.2 Triage and Classification

| Severity | Criteria |
|----------|----------|
| **SEV-1** | Active breach of Customer Data; production compromise |
| **SEV-2** | Attempted breach; single-tenant issue with data exposure risk |
| **SEV-3** | Security event without confirmed data exposure |
| **SEV-4** | Near-miss, policy violation, low risk |

### 5.3 Containment

Isolate affected systems, revoke compromised credentials, block malicious IPs, preserve forensic evidence.

### 5.4 Eradication and Recovery

Remove threat, patch vulnerabilities, restore from clean backups, validate integrity before resuming service.

### 5.5 Post-Incident Review

Within fourteen (14) business days of SEV-1/SEV-2 closure: root cause analysis, corrective actions, policy updates.

---

## 6. Customer Notification (Personal Data Breach)

### 6.1 Timing

FCA notifies affected enterprise customers **without undue delay** and within **seventy-two (72) hours** of confirming a Personal Data breach affecting that customer's Personal Data (GDPR-aligned).

### 6.2 Content

Notification includes, as available:

- Nature of the breach
- Categories and approximate number of data subjects and records
- Likely consequences
- Measures taken or proposed
- Point of contact for further information

### 6.3 Method

Email to Customer security and privacy contacts on file; follow-up call for SEV-1.

### 6.4 Regulatory

Customer is responsible for notifying supervisory authorities and data subjects where required. FCA provides reasonable assistance per the DPA.

---

## 7. Law Enforcement and Third Parties

FCA may notify law enforcement and affected subprocessors when appropriate and legally permitted.

---

## 8. Documentation

All SEV-1 and SEV-2 incidents are documented with timeline, actions, and outcomes. Records retained minimum three (3) years.

---

## 9. Testing

Tabletop exercises conducted at least **annually**. Runbooks updated after material architecture changes.

---

## 10. Customer Obligations

Customers must report suspected compromise of their accounts promptly and cooperate with investigation.

---

*Document ID: FCA-LEGAL-IR-v1.0*
