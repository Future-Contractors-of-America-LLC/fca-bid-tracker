import {
  LegalEffective,
  LegalNotice,
  LegalH3,
  LegalH4,
  LegalP,
  LegalUl,
  LegalTable,
  LegalContact,
} from "../../legal/LegalProse";

export default function PrivacyContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Introduction</LegalH3>
      <LegalP>
        Future Contractors of America LLC (&quot;FCA&quot;) explains here how we collect, use, disclose, and protect personal
        information when you use our Services. Enterprise customers may also have a Data Processing Agreement; where a DPA
        applies to Customer Personal Data, the DPA controls.
      </LegalP>

      <LegalH3>2. Information We Collect</LegalH3>
      <LegalH4>Information you provide</LegalH4>
      <LegalUl
        items={[
          "Account data: name, email, phone, job title, company, credentials",
          "Workspace content: projects, bids, files, communications",
          "Support messages and billing metadata (payments processed by Stripe)",
        ]}
      />
      <LegalH4>Automatic collection</LegalH4>
      <LegalUl
        items={[
          "Usage data, logins, feature interactions",
          "IP address, browser, device, time zone",
          "Cookies per our [Cookie Policy](/cookies)",
        ]}
      />
      <LegalH4>Third-party sources</LegalH4>
      <LegalUl items={["SSO providers (e.g., Microsoft Entra ID)", "Payment processor (Stripe)", "Integrations you authorize"]} />

      <LegalH3>3. How We Use Information</LegalH3>
      <LegalUl
        items={[
          "Provide, secure, and improve the Services",
          "Authenticate users and process payments",
          "Deliver academy content and support",
          "Comply with law and prevent fraud",
          "B2B marketing with opt-out where required",
        ]}
      />
      <LegalP>
        <strong>We do not sell personal information</strong> as defined under CCPA/CPRA.
      </LegalP>

      <LegalH3>4. Legal Bases (EEA/UK)</LegalH3>
      <LegalTable
        headers={["Purpose", "Legal basis"]}
        rows={[
          ["Contract performance", "Art. 6(1)(b) GDPR"],
          ["Security and product improvement", "Art. 6(1)(f) legitimate interest"],
          ["Non-essential cookies / certain marketing", "Art. 6(1)(a) consent"],
          ["Legal compliance", "Art. 6(1)(c)"],
        ]}
      />

      <LegalH3>5. Sharing</LegalH3>
      <LegalP>
        We share data with [subprocessors](/subprocessors), advisors, and as required by law. We require subprocessors to
        protect data by contract.
      </LegalP>

      <LegalH3>6. International Transfers</LegalH3>
      <LegalP>
        Data may be processed in the United States. For EEA/UK data we use appropriate safeguards including Standard
        Contractual Clauses per our enterprise DPA.
      </LegalP>

      <LegalH3>7. Retention</LegalH3>
      <LegalTable
        headers={["Category", "Typical retention"]}
        rows={[
          ["Active account data", "Subscription term + export window"],
          ["Billing records", "7 years"],
          ["Security logs", "12-24 months"],
          ["Support tickets", "3 years after closure"],
        ]}
      />

      <LegalH3>8. Security</LegalH3>
      <LegalP>
        See our [Security overview](/security). Report concerns to security@futurecontractorsofamerica.com.
      </LegalP>

      <LegalH3>9. Your Rights</LegalH3>
      <LegalUl
        items={[
          "Access, correct, or delete personal data via privacy@futurecontractorsofamerica.com",
          "EEA/UK: access, rectification, erasure, restriction, portability, objection, supervisory authority complaint",
          "California: know, delete, correct, opt-out of sale/sharing (we do not sell)",
          "Enterprise end-user requests: contact your organization administrator",
        ]}
      />

      <LegalH3>10. Children</LegalH3>
      <LegalP>Services are not directed to children under 13. We do not knowingly collect children's data.</LegalP>

      <LegalH3>11. Changes</LegalH3>
      <LegalP>Material changes will be notified via the Services or email with reasonable notice.</LegalP>

      <LegalContact email="privacy@futurecontractorsofamerica.com" label="Privacy / DPO contact" />
      <LegalContact email="legal@futurecontractorsofamerica.com" label="Enterprise DPA requests" />
    </>
  );
}
