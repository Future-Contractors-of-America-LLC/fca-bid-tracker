import LegalPageShell from "../../components/LegalPageShell";
import { LegalEffective, LegalP, LegalH3 } from "../../legal/LegalProse";
import { LEGAL_PAGES } from "../../legal/legalNav";
import { legalLink } from "../../legal/legalStyles";

const contractorTopics = [
  {
    title: "Virginia DPOR licensure",
    detail: "Class A/B/C contractor license requirements, qualifier discipline, and renewal evidence stored on the FCA file spine.",
  },
  {
    title: "Lien waiver discipline",
    detail: "Conditional and unconditional waivers aligned to pay-app milestones, AIA G702/G703 continuity, and billing events.",
  },
  {
    title: "Insurance certificates (COI)",
    detail: "General liability, workers compensation, and auto coverage tracked per project with expiration alerts.",
  },
  {
    title: "Subcontractor agreements",
    detail: "Scope, indemnity, insurance, and payment terms executed before field mobilization.",
  },
  {
    title: "OSHA and jobsite safety",
    detail: "Site-specific plans, toolbox talks, and Academy CTIN 410 lab evidence attached to project records.",
  },
];

export default function ContractorLegalResources() {
  return (
    <LegalPageShell title="Contractor Legal Resources" eyebrow="Virginia · Commercial Construction">
      <LegalEffective />
      <LegalP>
        Future Contractors of America publishes contractor-facing legal guidance for Virginia commercial builders.
        This page complements the{" "}
        <a href="/portal/legal" style={legalLink}>
          portal legal command workspace
        </a>{" "}
        where executed documents live on the governed file spine.
      </LegalP>

      <LegalH3>Contractor compliance topics</LegalH3>
      <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
        {contractorTopics.map((topic) => (
          <div key={topic.title} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{topic.title}</div>
            <div style={{ color: "#475569", lineHeight: 1.65 }}>{topic.detail}</div>
          </div>
        ))}
      </div>

      <LegalH3>Customer-facing policies</LegalH3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {LEGAL_PAGES.filter((page) => page.href !== "/legal").map((page) => (
          <a key={page.href} href={page.href} style={{ ...legalLink, padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 600 }}>
            {page.label}
          </a>
        ))}
      </div>

      <LegalP>
        Legal execution requests:{" "}
        <a href="mailto:legal@futurecontractorsofamerica.com" style={legalLink}>
          legal@futurecontractorsofamerica.com
        </a>
      </LegalP>
    </LegalPageShell>
  );
}
