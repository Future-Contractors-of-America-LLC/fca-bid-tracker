import LegalPageShell from "../../components/LegalPageShell";
import { LegalEffective, LegalH3, LegalP } from "../../legal/LegalProse";
import { LEGAL_FOOTER_PAGES } from "../../legal/legalNav";
import { legalLink } from "../../legal/legalStyles";

const resourceTopics = [
  {
    title: "Licensing and registration",
    detail: "Keep contractor licenses, DPOR registrations, and trade credentials current and tied to active jobs.",
    links: [
      { href: "/academy/catalog", label: "FCA Academy licensure prep" },
      { href: "/contact", label: "Discuss rollout licensing support" },
    ],
  },
  {
    title: "Contracts and change control",
    detail: "Use governed contract artifacts, owner agreements, and change-order continuity inside the project spine.",
    links: [
      { href: "/portal/files", label: "Open Files Workspace" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    title: "Liens, waivers, and closeout",
    detail: "Track conditional and unconditional waivers, closeout packages, and warranty handoff evidence.",
    links: [
      { href: "/portal/closeout", label: "Open Closeout Workspace" },
      { href: "/warranty", label: "Warranty continuity" },
    ],
  },
  {
    title: "Insurance and safety compliance",
    detail: "Maintain COI registers, safety documentation, and audit-ready field evidence.",
    links: [
      { href: "/security", label: "Security posture" },
      { href: "/portal/audit", label: "Open Audit workspace" },
    ],
  },
];

export default function ContractorLegalResources() {
  return (
    <LegalPageShell
      title="Contractor Legal Resources"
      eyebrow="Trust & Compliance"
      currentHref="/legal/contractor-resources"
    >
      <LegalEffective />
      <LegalP>
        This page helps commercial contractors locate FCA legal policies and the workspace surfaces where
        compliance artifacts, contracts, lien documentation, and closeout evidence stay attached to live work.
      </LegalP>

      <LegalH3>Operational legal topics</LegalH3>
      <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
        {resourceTopics.map((topic) => (
          <div key={topic.title} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{topic.title}</div>
            <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 10 }}>{topic.detail}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {topic.links.map((link) => (
                <a key={link.href} href={link.href} style={legalLink}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <LegalH3>FCA customer policies</LegalH3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {LEGAL_FOOTER_PAGES.map((page) => (
          <a
            key={page.href}
            href={page.href}
            style={{ ...legalLink, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 600 }}
          >
            {page.label}
          </a>
        ))}
      </div>
    </LegalPageShell>
  );
}
