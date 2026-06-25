# Service Level Agreement

**Future Contractors of America LLC**  
**Exhibit A to Master Services Agreement**  
**Version:** 1.0  
**Effective Date:** June 19, 2026  

> **Prepared for legal review — not legal advice.** Applies to enterprise Order Forms that reference this SLA.

---

## 1. Scope

This Service Level Agreement ("**SLA**") applies to production hosted Services identified in the Order Form ("**Covered Services**"). Beta, preview, and on-premise components are excluded unless stated.

---

## 2. Uptime Commitment

### 2.1 Monthly Uptime Percentage

FCA will use commercially reasonable efforts to achieve **99.9% Monthly Uptime Percentage** for Covered Services.

**Monthly Uptime Percentage** =  
`(Total Minutes in Month ? Downtime Minutes) / Total Minutes in Month × 100`

### 2.2 Downtime Definition

"Downtime" means material unavailability of the production application login or core API for Customer's subscribed region, excluding Exclusions below. Downtime is measured from FCA's monitoring systems.

### 2.3 Exclusions

Downtime does not include unavailability due to:

- Scheduled maintenance (notified ? 48 hours in advance, ? 4 hours/month)
- Emergency maintenance for security
- Customer or third-party equipment, software, or connectivity
- Force majeure
- Suspension per AUP or non-payment
- Customer-configured integrations or custom code
- DDoS or attacks mitigated within industry-standard time

---

## 3. Service Credits

If Monthly Uptime falls below 99.9%, Customer may request service credits:

| Monthly Uptime | Service Credit (% of monthly fees for Covered Services) |
|----------------|------------------------------------------------------|
| 99.0% – 99.89% | 10% |
| 95.0% – 98.99% | 25% |
| Below 95.0% | 50% |

### 3.1 Credit Request

Customer must request credits within thirty (30) days after the month in which Downtime occurred, with reasonable detail. Credits apply to future invoices only; no cash refunds unless required by law. Maximum credits per month: 50% of monthly fees for Covered Services.

### 3.2 Sole Remedy

Service credits are Customer's sole and exclusive remedy for failure to meet uptime commitment unless otherwise required by law.

---

## 4. Support

### 4.1 Enterprise Support (if purchased)

| Severity | Definition | Initial response target |
|----------|------------|-------------------------|
| **P1 – Critical** | Production down; no workaround | 1 hour (24×7) |
| **P2 – High** | Major feature impaired | 4 business hours |
| **P3 – Medium** | Non-critical defect | 1 business day |
| **P4 – Low** | Question / enhancement | 2 business days |

**Business hours:** Monday–Friday, 9:00 AM–6:00 PM US Eastern, excluding U.S. federal holidays.

**Contact:** support@futurecontractorsofamerica.com (or dedicated portal if provided)

### 4.2 Standard Support

Self-serve and startup tiers: email support with commercially reasonable response times; no guaranteed response SLA unless upgraded.

---

## 5. Backups and Recovery

FCA maintains automated backups of Customer Data. Recovery Point Objective (RPO) target: **24 hours**. Recovery Time Objective (RTO) target: **48 hours** for catastrophic platform failure affecting multi-tenant infrastructure.

Customer is responsible for exporting critical data for independent backup if required by internal policy.

---

## 6. Reporting

Enterprise customers may request monthly uptime summary upon written request. Public status page: *[URL to be published at /status]*

---

## 7. Changes

FCA may update this SLA with ninety (90) days' notice. Material reductions to uptime commitment do not apply during a current paid term without Customer's consent.

---

*Document ID: FCA-LEGAL-SLA-v1.0*
