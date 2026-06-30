import {
  LegalEffective,
  LegalNotice,
  LegalH3,
  LegalH4,
  LegalP,
  LegalUl,
  LegalTable,
  LegalContact,
  LegalPostalAddress,
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

      <LegalH3>10. Student and Children&apos;s Privacy</LegalH3>

      <LegalH4>COPPA — Children&apos;s Online Privacy Protection Act</LegalH4>
      <LegalP>
        FCA does not knowingly collect personal information (as defined by COPPA) from children under 13 without
        verifiable parental consent or the educational institution consent exception. When FCA is deployed in a K-12
        school context, the partnering school or district acts as the agent for parental consent per the school
        consent exception (16 C.F.R. § 312.5(b)(1)). FCA collects only the minimum information necessary to provide
        educational services. If you believe a child under 13 has provided personal information without proper consent,
        contact us at privacy@futurecontractorsofamerica.com and we will delete the data within 10 business days.
      </LegalP>

      <LegalH4>FERPA — Family Educational Rights and Privacy Act</LegalH4>
      <LegalP>
        When FCA is engaged by an educational institution under a data privacy agreement, FCA acts as a &quot;school
        official&quot; with a legitimate educational interest as defined under 34 C.F.R. § 99.31(a)(1). FCA uses student
        education records solely to provide the contracted educational services and does not disclose education records
        to third parties without written consent from the school or district, except as required by law. Parents and
        eligible students may contact the school or district to exercise FERPA rights (access, correction, deletion)
        over education records held by FCA.
      </LegalP>

      <LegalH4>SOPIPA — Student Online Personal Information Protection Act (Va. Code § 22.1-287.02)</LegalH4>
      <LegalP>
        FCA complies with Virginia&apos;s student data privacy requirements. FCA does not:
      </LegalP>
      <LegalUl
        items={[
          "Sell student personal information",
          "Use student data for targeted advertising or to build profiles for non-educational purposes",
          "Disclose student information to third parties except subprocessors necessary to provide the Services, bound by contract",
          "Retain student data beyond the end of the contracted term without written authorization from the school",
        ]}
      />

      <LegalH4>What student data FCA collects</LegalH4>
      <LegalP>For K-12 school deployments, FCA collects only:</LegalP>
      <LegalUl
        items={[
          "Non-identifying username (e.g., student-001) — no real name collected",
          "Role (student, cte-student, cte-instructor)",
          "Enrolled course or program",
          "Course progress, module completions, and quiz scores",
          "Session activity timestamps (for idle-timeout enforcement only)",
        ]}
      />

      <LegalH4>What FCA does NOT collect from students</LegalH4>
      <LegalUl
        items={[
          "Legal name, preferred name, or nickname",
          "Date of birth or age",
          "Email address or phone number",
          "Home address, school address, or GPS location",
          "Social Security Number or government-issued ID",
          "Photographs, biometric data, or likeness",
          "Financial information",
          "Health or disability information",
        ]}
      />

      <LegalH4>Data retention and deletion</LegalH4>
      <LegalP>
        Student data is retained only for the duration of the school year or contracted term. At term end, student
        data is deleted or returned to the district on request within 30 days. To request deletion of a specific
        student account, contact privacy@futurecontractorsofamerica.com with the student username and district name.
        Requests are fulfilled within 10 business days.
      </LegalP>

      <LegalH4>Breach notification</LegalH4>
      <LegalP>
        In the event of a data breach involving student information, FCA will notify the affected school or district
        within 72 hours of discovery, consistent with Virginia breach notification requirements (Va. Code § 18.2-186.6)
        and SOPIPA obligations. Notification will include the nature of the breach, data affected, steps taken, and
        recommended actions.
      </LegalP>

      <LegalH4>VCDPA — Virginia Consumer Data Protection Act</LegalH4>
      <LegalP>
        Virginia residents may exercise rights under the VCDPA including the right to access, correct, delete, and
        obtain a portable copy of personal data, and the right to opt out of sale of personal data (FCA does not sell
        personal data). Student education records subject to FERPA are partially exempted from VCDPA per
        Va. Code § 59.1-575(B), but FCA applies reasonable security safeguards to all data regardless.
        Submit VCDPA requests to privacy@futurecontractorsofamerica.com.
      </LegalP>

      <LegalH3>11. Changes</LegalH3>
      <LegalP>Material changes will be notified via the Services or email with reasonable notice.</LegalP>

      <LegalContact email="privacy@futurecontractorsofamerica.com" label="Privacy / DPO contact" />
      <LegalContact email="legal@futurecontractorsofamerica.com" label="Enterprise DPA requests" />
      <LegalPostalAddress />
    </>
  );
}
