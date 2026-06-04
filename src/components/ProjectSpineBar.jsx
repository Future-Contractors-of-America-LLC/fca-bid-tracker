import AuricruxSpineInsight from "./AuricruxSpineInsight";
import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";

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

  const liveTenant = resolveLiveTenantIdentity(tenant);
  const liveProject = resolveLiveProjectIdentity(project);

  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project / Job Spine</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{liveProject.name}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            This workspace is anchored to a persistent tenant and project context so files, communications,
            billing, academy continuity, and Auricrux actions can all attach to the same operational record.
          </div>
        </div>
        <div style={{ display: "grid", gap: 10, minWidth: 260 }}>
          <div style={badgeStyle}><span>Tenant</span><span>{liveTenant.name}</span></div>
          <div style={badgeStyle}><span>Project ID</span><span>{liveProject.id}</span></div>
          <div style={badgeStyle}><span>Stage</span><span>{liveProject.stage}</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Linked customer</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{liveProject.customer}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{liveTenant.roleSummary}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>File spine</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{liveProject.fileSetLabel}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{liveProject.fileSpineStatus}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Audit spine</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{liveProject.auditLabel}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{liveProject.auditStatus}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Auricrux context</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{liveProject.auricruxMode}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{liveProject.auricruxSummary}</div>
        </div>
      </div>

      <AuricruxSpineInsight tenant={liveTenant} project={liveProject} />
    </div>
  );
}
