import AuricruxStateExplanation from "./AuricruxStateExplanation";
import { resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";
import { portalTenant } from "../workspaceState";

const wrapStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 16,
  background: "#ffffff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const itemStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 12,
  background: "#f8fafc",
};

export default function RouteStateOverlay({ overlay }) {
  if (!overlay) return null;

  const liveTenant = resolveLiveTenantIdentity(portalTenant);

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Route-Level State Overlay</div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{overlay.title}</h3>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>{overlay.summary}</div>
          <div style={{ color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>Authenticated tenant context: {liveTenant.name}</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 700 }}>
          {overlay.status}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Primary focus</div>
          <div style={{ fontWeight: 700 }}>{overlay.primaryFocus}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{overlay.primaryDetail}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Operational dependency</div>
          <div style={{ fontWeight: 700 }}>{overlay.dependency}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{overlay.dependencyDetail}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Auricrux role</div>
          <div style={{ fontWeight: 700 }}>{overlay.auricruxRole}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{overlay.auricruxDetail}</div>
        </div>
      </div>

      <AuricruxStateExplanation
        mode="overlay"
        overlay={overlay}
      />
    </div>
  );
}
