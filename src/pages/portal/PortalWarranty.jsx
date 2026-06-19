import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import ProductProofSection from "../../components/ProductProofSection";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { warrantyItems, warrantyProof } from "../../content/warrantyContent";
import { ctaPrimaryStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalWarranty() {
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Warranty and service continuity workspace active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Warranty & Service Continuity"
      subtitle="Post-handover service, maintenance opportunities, and retention workflows tied to support, files, messaging, and your active project context."
      activeHref="/portal/warranty"
      currentJourney="coordination"
      primaryHref="/portal/support"
      primaryLabel="Open Support"
      workspaceState={state}
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Service continuity</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Warranty stays inside your FCA workspace</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Track service requests, access closeout artifacts, and keep customer follow-through connected to {state.project.name || "your active project"}.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
        {warrantyItems.map((item) => (
          <div key={item.label} style={cardStyle}>
            <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{item.label}</div>
            <strong>{item.value}</strong>
            <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0 }}>{item.detail}</p>
          </div>
        ))}
      </div>

      <ProductProofSection
        eyebrow="Warranty actions"
        title="Demonstrate post-handover continuity from your workspace"
        detail="Use support, files, and messages to show how FCA keeps service visible and actionable after handoff."
        highlights={warrantyProof}
      />

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>What warranty continuity covers</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
          <li>Post-occupancy service intake and response</li>
          <li>Access to closeout, as-built, and turnover artifacts</li>
          <li>Message continuity between customer, field, and operations</li>
          <li>Escalation into maintenance, renewal, and repeat-project pathways</li>
        </ul>
        <a href="/portal/support" style={{ ...ctaPrimaryStyle, marginTop: 16, display: "inline-flex", marginRight: 12 }}>Open Support Workspace</a>
        <a href="/warranty" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Public warranty overview ?</a>
      </div>
    </PortalShell>
  );
}
