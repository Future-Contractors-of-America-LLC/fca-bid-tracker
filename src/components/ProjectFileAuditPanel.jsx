const sectionStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function ProjectFileAuditPanel({ project, files = [], auditEvents = [] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project File Register</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Files attached to {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((file) => (
            <div key={file.name} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{file.name}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>
                    {file.category} · {file.updated}<br />
                    Linked project: {project.id}
                  </div>
                </div>
                <div style={{ alignSelf: "center", fontWeight: 700, color: "#1d4ed8" }}>{file.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Audit + Auricrux Timeline</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Operational record for {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {auditEvents.map((event) => (
            <div key={`${event.time}-${event.action}`} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{event.time}</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{event.action}</div>
              <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{event.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
