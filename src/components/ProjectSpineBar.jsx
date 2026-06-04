import AuricruxSpineInsight from "./AuricruxSpineInsight";

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#fff",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

export default function ProjectSpineBar({ tenant, project }) {
  if (!tenant || !project) return null;

  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project / Job Spine</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{project.name}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            This workspace is anchored to a persistent tenant and project context so files, communications,
            billing, academy continuity, and Auricrux actions can all attach to the same operational record.
          </div>
        </div>
        <div style={{ display: "grid", gap: 10, minWidth: 260 }}>
          <div style={badgeStyle}><span>Tenant</span><span>{tenant.name}</span></div>
          <div style={badgeStyle}><span>Project ID</span><span>{project.id}</span></div>
          <div style={badgeStyle}><span>Stage</span><span>{project.stage}</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Linked customer</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{project.customer}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{tenant.roleSummary}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>File spine</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{project.fileSetLabel}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{project.fileSpineStatus}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Audit spine</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{project.auditLabel}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{project.auditStatus}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Auricrux context</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{project.auricruxMode}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{project.auricruxSummary}</div>
        </div>
      </div>

      <AuricruxSpineInsight tenant={tenant} project={project} />
    </div>
  );
}
