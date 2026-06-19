import { LegalEffective, LegalNotice, LegalH3, LegalH4, LegalP, LegalUl, LegalTable, LegalContact } from "../../legal/LegalProse";

export default function SecurityContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Security program</LegalH3>
      <LegalP>
        FCA maintains administrative, technical, and organizational safeguards for Customer Data. We are on a roadmap toward
        SOC 2 Type II attestation.
      </LegalP>
      <LegalH3>2. Infrastructure</LegalH3>
      <LegalTable
        headers={["Control", "Implementation"]}
        rows={[
          ["Hosting", "Microsoft Azure (U.S. regions by default)"],
          ["Encryption in transit", "TLS 1.2+"],
          ["Encryption at rest", "Azure platform encryption"],
          ["Tenant isolation", "Logical workspace separation"],
        ]}
      />
      <LegalH3>3. Key controls</LegalH3>
      <LegalUl
        items={[
          "RBAC, SSO via Microsoft Entra ID, MFA for FCA production access",
          "Secure SDLC, dependency scanning, OWASP-aligned web controls",
          "Centralized logging, monitoring, and incident response",
          "Annual penetration testing (summary available to enterprise customers under NDA)",
        ]}
      />
      <LegalH3>4. Customer responsibilities</LegalH3>
      <LegalUl
        items={[
          "Strong passwords and MFA for your users",
          "User provisioning and deprovisioning",
          "Appropriate data classification",
        ]}
      />
      <LegalH3>5. Data location</LegalH3>
      <LegalP>
        Default U.S. processing. See [Subprocessors](/subprocessors). Enterprise regional options available upon request.
      </LegalP>
      <LegalH3>6. Incident response</LegalH3>
      <LegalP>
        Personal data breaches are notified per our DPA (72-hour GDPR-aligned timeline where applicable).
      </LegalP>
      <LegalContact email="security@futurecontractorsofamerica.com" label="Security inquiries" />
      <LegalContact email="security@futurecontractorsofamerica.com" label="Vulnerability reports" />
    </>
  );
}
