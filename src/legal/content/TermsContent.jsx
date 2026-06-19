import {
  LegalEffective,
  LegalNotice,
  LegalH3,
  LegalH4,
  LegalP,
  LegalUl,
  LegalContact,
} from "../../legal/LegalProse";

export default function TermsContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Agreement</LegalH3>
      <LegalP>
        These Terms of Service govern use of Future Contractors of America LLC (&quot;FCA&quot;) products, website, portal,
        mobile applications, academy, and APIs (the &quot;Services&quot;). By using the Services you agree to these Terms,
        our [Privacy Policy](/privacy), [Acceptable Use Policy](/acceptable-use), and [Cookie Policy](/cookies).
      </LegalP>
      <LegalP>
        Enterprise customers may be governed by a separate Master Services Agreement. If an MSA is in effect, the MSA
        controls in case of conflict.
      </LegalP>

      <LegalH3>2. Services</LegalH3>
      <LegalP>
        FCA provides cloud-based contractor operations software, bid tracking, project workspace, academy content, and
        Auricrux-guided workflows as described at purchase or in an Order Form. We may improve the Services with reasonable
        notice of material adverse changes to paid features.
      </LegalP>
      <LegalP>Beta and preview features are provided as-is and are excluded from SLA commitments unless stated in writing.</LegalP>

      <LegalH3>3. Accounts and Security</LegalH3>
      <LegalP>You must be at least 18 and provide accurate information. You are responsible for credentials and all account activity.</LegalP>
      <LegalP>
        Report unauthorized access to [security@futurecontractorsofamerica.com](mailto:security@futurecontractorsofamerica.com).
      </LegalP>

      <LegalH3>4. License and Restrictions</LegalH3>
      <LegalP>
        FCA grants a limited, non-exclusive, non-transferable license to use the Services during your subscription for internal
        business purposes. You may not reverse engineer, resell, sublicense, use to build competing products, or train external AI
        models on FCA proprietary content without written consent.
      </LegalP>

      <LegalH3>5. Customer Data</LegalH3>
      <LegalP>You retain ownership of data you submit. You grant FCA a license to host and process it to provide the Services.</LegalP>
      <LegalP>
        FCA does not use Customer Data to train general-purpose AI models for other customers unless you opt in per our
        [AI Data Use Policy](/ai-policy).
      </LegalP>

      <LegalH3>6. Fees and Payment</LegalH3>
      <LegalP>
        Paid plans are billed through Stripe. Subscriptions renew until cancelled. Refunds are governed by our
        [Refunds & Billing Policy](/refunds).
      </LegalP>

      <LegalH3>7. Service Levels</LegalH3>
      <LegalP>
        Enterprise uptime commitments are in our Service Level Agreement. Self-serve plans are provided on commercially
        reasonable efforts unless otherwise stated.
      </LegalP>

      <LegalH3>8. Intellectual Property</LegalH3>
      <LegalP>
        FCA, Auricrux, and related marks and software are owned by Future Contractors of America LLC. See our
        [Intellectual Property Notice](/ip).
      </LegalP>

      <LegalH3>9. Privacy</LegalH3>
      <LegalP>
        See [Privacy Policy](/privacy). Enterprise customers may execute a Data Processing Agreement upon request.
      </LegalP>

      <LegalH3>10. Warranties and Disclaimers</LegalH3>
      <LegalP>
        For paid subscriptions, FCA warrants material conformance to documented functionality. OTHERWISE THE SERVICES ARE
        PROVIDED &quot;AS IS&quot; WITHOUT IMPLIED WARRANTIES. FCA does not provide legal, engineering, or safety advice.
      </LegalP>

      <LegalH3>11. Limitation of Liability</LegalH3>
      <LegalP>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY IS LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES. AGGREGATE LIABILITY
        IS LIMITED TO FEES PAID IN THE TWELVE MONTHS PRECEDING THE CLAIM, EXCEPT FOR PAYMENT OBLIGATIONS, CONFIDENTIALITY/IP
        BREACHES, FRAUD, OR LIABILITIES THAT CANNOT BE LIMITED BY LAW.
      </LegalP>

      <LegalH3>12. Indemnification</LegalH3>
      <LegalP>
        You indemnify FCA for claims arising from your data or misuse. FCA indemnifies you for third-party claims that the
        Services infringe U.S. IP rights, subject to standard exclusions.
      </LegalP>

      <LegalH3>13. Term and Termination</LegalH3>
      <LegalP>
        You may cancel per your plan. We may suspend for breach or security risk. Upon termination you may export data for
        thirty (30) days.
      </LegalP>

      <LegalH3>14. Governing Law</LegalH3>
      <LegalP>
        Commonwealth of Virginia, USA. Exclusive venue in Virginia courts. Disputes require thirty (30) days good-faith
        negotiation first.
      </LegalP>

      <LegalH3>15. Export</LegalH3>
      <LegalP>Use must comply with U.S. export laws. See [Export Compliance](/security) in our Security overview.</LegalP>

      <LegalContact email="legal@futurecontractorsofamerica.com" label="Legal inquiries" />
    </>
  );
}
