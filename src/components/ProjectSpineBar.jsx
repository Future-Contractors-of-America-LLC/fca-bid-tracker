import AuricruxSpineInsight from "./AuricruxSpineInsight";
import useProjectWorkspace from "../hooks/useProjectWorkspace";
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

const quickLinkStyle = {
  textDecoration: "none",
  color: "#1d4ed8",
  fontWeight: 700,
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
};

export default function ProjectSpineBar({ tenant, project, compact = false }) {
  const { projects, activeProject, selectActiveProject } = useProjectWorkspace();

  if (!tenant || !project) return null;

  const liveTenant = resolveLiveTenantIdentity(tenant);
  const liveProject = resolveLiveProjectIdentity(activeProject || project);
  const projectId = liveProject?.id || "";

  if (!projectId) {
    return (
      <div style={{ ...cardStyle, marginBottom: compact ? 16 : 24, padding: compact ? 14 : 18 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Project / Job Spine</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>No active live project</div>
        <div style={{ color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>
          Bind a live project root before files, takeoff, RFI, and invoice lanes share one id.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/portal/proof" style={quickLinkStyle}>Founder Proof Path</a>
          <a href="/portal/projects" style={quickLinkStyle}>Projects</a>
        </div>
      </div>
    );
  }

  async function handleProjectChange(event) {
    const nextId = event.target.value;
    if (!nextId || nextId === projectId) return;
    await selectActiveProject(nextId, "Project context switched from spine bar.");
    window.location.href = `/portal/projects/${encodeURIComponent(nextId)}`;
  }

  const quickLinks = [
    { label: "Proof path", href: "/portal/proof" },
    { label: "Project hub", href: `/portal/projects/${encodeURIComponent(projectId)}` },
    { label: "Files", href: `/portal/files?projectId=${encodeURIComponent(projectId)}` },
    { label: "Field", href: `/portal/field-supervision?projectId=${encodeURIComponent(projectId)}` },
    { label: "RFIs", href: `/portal/rfis?project=${encodeURIComponent(projectId)}` },
    { label: "Design", href: `/portal/design?projectId=${encodeURIComponent(projectId)}` },
  ];

  if (compact) {
    return (
      <div style={{ ...cardStyle, marginBottom: 16, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Active project</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{liveProject.name}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{liveProject.stage} · {liveTenant.name}</div>
          </div>
          {projects.length > 0 ? (
            <label style={{ display: "grid", gap: 4, minWidth: 200 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Switch project</span>
              <select
                value={projectId}
                onChange={handleProjectChange}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 600 }}
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.id}</option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} style={quickLinkStyle}>{link.label}</a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project / Job Spine</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{liveProject.name}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            Files, communications, billing, field photos, and Auricrux actions attach to this project context.
          </div>
        </div>
        <div style={{ display: "grid", gap: 10, minWidth: 260 }}>
          <div style={badgeStyle}><span>Tenant</span><span>{liveTenant.name}</span></div>
          {projects.length > 0 ? (
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Active project</span>
              <select
                value={projectId}
                onChange={handleProjectChange}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 600 }}
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.id}</option>
                ))}
              </select>
            </label>
          ) : (
            <div style={badgeStyle}><span>Project ID</span><span>{liveProject.id}</span></div>
          )}
          <div style={badgeStyle}><span>Stage</span><span>{liveProject.stage}</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {quickLinks.map((link) => (
          <a key={link.href} href={link.href} style={quickLinkStyle}>{link.label}</a>
        ))}
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
