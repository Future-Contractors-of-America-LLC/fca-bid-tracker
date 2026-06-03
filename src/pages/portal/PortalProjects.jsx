import PortalShell from "../../components/PortalShell";
import { portalProjects } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalProjects() {
  return (
    <PortalShell
      title="Project Flow and Customer Visibility"
      subtitle="Execution-stage shell showing how FCA carries a customer from awarded work into delivery, accountability, and closeout."
      activeHref="/portal/projects"
      primaryHref="/portal/files"
      primaryLabel="Open Files"
    >
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Project Lifecycle</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            "Lead captured",
            "Bid built",
            "Customer approved",
            "Project mobilized",
            "Billing and closeout",
          ].map((step) => (
            <div key={step} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {portalProjects.map((project) => (
          <div key={project.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{project.id} · {project.customer}</h3>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Current stage: <strong>{project.stage}</strong><br />
                  Next action: {project.nextAction}
                </div>
              </div>
              <div style={{ minWidth: 180 }}>
                <div><strong>Owner:</strong> {project.owner}</div>
                <div><strong>Due:</strong> {project.due}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
