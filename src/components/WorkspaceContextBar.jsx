const panelStyle = {
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

export default function WorkspaceContextBar({ tenant, project, workspace }) {
  if (!tenant || !project || !workspace) return null;

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Shared Workspace Context</div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Persistent tenant, project, and action state</h3>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            Every portal route reads from the same tenant and project context so FCA surfaces can keep files,
            communications, billing state, academy continuity, and Auricrux actions attached to one operational record.
          </div>
        </div>
        <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
          <div><strong>Tenant:</strong> {tenant.name}</div>
          <div><strong>Project:</strong> {project.id}</div>
          <div><strong>Stage:</strong> {project.stage}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 16 }}>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current project</div>
          <div style={{ fontWeight: 700 }}>{project.name}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{project.customer}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current stage</div>
          <div style={{ fontWeight: 700 }}>{workspace.currentStageLabel}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{workspace.stageSummary}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current next action</div>
          <div style={{ fontWeight: 700 }}>{workspace.currentNextAction}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{workspace.nextActionOwner}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Audit status</div>
          <div style={{ fontWeight: 700 }}>{workspace.auditStatusLabel}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{workspace.auditSummary}</div>
        </div>
      </div>
    </div>
  );
}
