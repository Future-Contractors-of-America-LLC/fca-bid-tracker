import LegalPageShell from "../../components/LegalPageShell";
import { LegalEffective, LegalP, LegalH3, LegalPostalAddress } from "../../legal/LegalProse";
import { LEGAL_PAGES, ENTERPRISE_DOCS } from "../../legal/legalNav";
import { legalLink } from "../../legal/legalStyles";

export default function LegalHub() {
  return (
    <LegalPageShell title="Legal Center" eyebrow="Trust & Compliance">
      <LegalEffective />
      <LegalP>
        Future Contractors of America LLC (Virginia) publishes the policies below for customers, prospects, and enterprise
        procurement teams. Canonical drafts are maintained in <code>docs/legal/enterprise/</code> for counsel review.
      </LegalP>

      <LegalH3>Customer-facing policies</LegalH3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {LEGAL_PAGES.filter((p) => p.href !== "/legal").map((page) => (
          <a
            key={page.href}
            href={page.href}
            style={{
              ...legalLink,
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            {page.label}
          </a>
        ))}
      </div>

      <LegalH3>Enterprise procurement (upon request)</LegalH3>
      <LegalP>
        Fortune 100 and enterprise buyers may request executed agreements including:
      </LegalP>
      <ul style={{ lineHeight: 1.8 }}>
        {ENTERPRISE_DOCS.map((doc) => (
          <li key={doc.label}>{doc.label}</li>
        ))}
        <li>Security Addendum and completed security questionnaires</li>
        <li>SOC 2 report (when available)</li>
      </ul>
      <LegalP>
        Contact{" "}
        <a href="mailto:legal@futurecontractorsofamerica.com" style={legalLink}>
          legal@futurecontractorsofamerica.com
        </a>{" "}
        for MSA, DPA, and SLA execution.
      </LegalP>
      <LegalP>
        Privacy inquiries:{" "}
        <a href="mailto:privacy@futurecontractorsofamerica.com" style={legalLink}>
          privacy@futurecontractorsofamerica.com
        </a>
        . Security:{" "}
        <a href="mailto:security@futurecontractorsofamerica.com" style={legalLink}>
          security@futurecontractorsofamerica.com
        </a>
        .
      </LegalP>
      <LegalP>
        <strong>Contractor legal package:</strong>{" "}
        <a href="/legal/contractor-resources" style={legalLink}>
          Contractor Legal Resources
        </a>
        {" — "}
        <a href="/portal/legal" style={legalLink}>Portal Legal Command</a>
      </LegalP>
      <LegalPostalAddress />
    </LegalPageShell>
  );
}
