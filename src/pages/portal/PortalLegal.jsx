import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { fileGovernance } from "../../fileGovernance";
import { LEGAL_FOOTER_PAGES } from "../../legal/legalNav";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const legalRegister = fileGovernance.registers.find((item) => item.title === "Legal & Compliance Register");

export default function PortalLegal() {
  const { state } = useWorkspaceState();
  const { session } = useCustomerSession();
  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";

  return (
    <PortalShell
      title="Legal & Compliance Command"
      subtitle="Track contracts, lien waivers, COIs, formation certificates, permit evidence, and customer-facing legal continuity from the governed project spine."
      activeHref="/portal/legal"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.files}
      primaryHref="/portal/files"
      primaryLabel="Open Files Workspace"
    >
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Tenant</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{companyName}</div>
        <p style={{ color: "#475569", lineHeight: 1.7, margin: 0 }}>
          {legalRegister?.purpose || "Legal and compliance artifacts remain attached to projects, files, and closeout workflows."}
        </p>
      </div>

      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Tracked artifact types</div>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
            {(legalRegister?.artifacts || []).map((artifact) => (
              <li key={artifact}>{artifact}</li>
            ))}
          </ul>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Connected workspace routes</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/portal/files" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Files</a>
            <a href="/portal/rfis" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>RFIs</a>
            <a href="/portal/closeout" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Closeout</a>
            <a href="/portal/billing" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Billing</a>
            <a href="/legal/contractor-resources" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Contractor legal resources</a>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>FCA policies</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {LEGAL_FOOTER_PAGES.map((page) => (
              <a
                key={page.href}
                href={page.href}
                style={{ color: "#1d4ed8", fontWeight: 600, textDecoration: "none", padding: "8px 0" }}
              >
                {page.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
