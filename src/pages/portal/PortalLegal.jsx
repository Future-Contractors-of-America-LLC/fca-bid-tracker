import PortalShell from "../../components/PortalShell";
import { routeStateOverlays } from "../../systemState";

const panelStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
};

const checklist = [
  { id: "entity", label: "Virginia entity formation and registered agent", status: "Review" },
  { id: "dpor", label: "DPOR license class and qualifier on record", status: "Required" },
  { id: "coi", label: "General liability and workers comp COIs", status: "Required" },
  { id: "contracts", label: "Executed customer MSA / subcontract templates", status: "Review" },
  { id: "lien", label: "Lien waiver and pay-app discipline", status: "Active" },
  { id: "osha", label: "OSHA 30 and jobsite safety program evidence", status: "Academy track" },
];

export default function PortalLegal() {
  return (
    <PortalShell
      title="Contractor Legal Command"
      subtitle="Entity formation, Virginia licensure, agreements, lien waivers, insurance COIs, and compliance checklist continuity."
      activeHref="/portal/legal"
      routeOverlay={routeStateOverlays.legal}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={panelStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>FCA Legal Workspace</div>
          <h1 style={{ margin: "8px 0 12px" }}>Compliance readiness</h1>
          <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
            Legal execution stays on the governed file spine. Auricrux flags missing DPOR, insurance, or contract steps
            and routes teams to Academy legal tracks.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <a href="/portal/files" style={{ textDecoration: "none", border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 12px", fontWeight: 700 }}>
              File spine
            </a>
            <a href="/legal/contractor-resources" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", fontWeight: 700, color: "#334155" }}>
              Contractor legal resources
            </a>
            <a href="/portal/academy" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", fontWeight: 700, color: "#334155" }}>
              Academy legal tracks
            </a>
          </div>
        </div>
        <div style={panelStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Compliance checklist</div>
          <div style={{ display: "grid", gap: 10 }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                <span>{item.label}</span>
                <span style={{ color: "#64748b", fontWeight: 700, fontSize: 13 }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
