import useProjectWorkspace from "../hooks/useProjectWorkspace";
import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";
import { portalTokens } from "../portalDesignTokens";

const barStyle = {
  border: `1px solid ${portalTokens.border}`,
  borderRadius: portalTokens.radiusMd,
  padding: "12px 14px",
  background: portalTokens.panel,
  marginBottom: 16,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};

const emptyStyle = {
  ...barStyle,
  background: portalTokens.primarySoft,
  border: "1px solid #bfdbfe",
};

const quickLinkStyle = {
  textDecoration: "none",
  color: portalTokens.primaryInk,
  fontWeight: 700,
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #bfdbfe",
  background: portalTokens.primarySoft,
};

/**
 * Single project context strip: name + switcher + a few lane links.
 * Status cards / Auricrux insight live on their own pages — not in every header.
 */
export default function ProjectSpineBar({ tenant, project, compact = false }) {
  const { projects, activeProject, selectActiveProject } = useProjectWorkspace();

  if (!tenant || !project) return null;

  const liveTenant = resolveLiveTenantIdentity(tenant);
  const liveProject = resolveLiveProjectIdentity(activeProject || project);
  const projectId = liveProject?.id || "";

  if (!projectId) {
    return (
      <div style={emptyStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>No active project</div>
          <div style={{ color: portalTokens.muted, fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>
            Bind a live project before files, RFIs, and billing share one id.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/portal/proof" style={quickLinkStyle}>Proof path</a>
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

  const quickLinks = compact
    ? [
        { label: "Proof", href: "/portal/proof" },
        { label: "Files", href: `/portal/files?projectId=${encodeURIComponent(projectId)}` },
        { label: "RFIs", href: `/portal/rfis?project=${encodeURIComponent(projectId)}` },
      ]
    : [
        { label: "Proof", href: "/portal/proof" },
        { label: "Hub", href: `/portal/projects/${encodeURIComponent(projectId)}` },
        { label: "Files", href: `/portal/files?projectId=${encodeURIComponent(projectId)}` },
        { label: "RFIs", href: `/portal/rfis?project=${encodeURIComponent(projectId)}` },
        { label: "Design", href: `/portal/design?projectId=${encodeURIComponent(projectId)}` },
      ];

  return (
    <div style={barStyle}>
      <div style={{ minWidth: 0, flex: "1 1 220px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, overflowWrap: "anywhere" }}>{liveProject.name}</div>
        <div style={{ color: portalTokens.muted, fontSize: 13, marginTop: 2 }}>
          {liveProject.stage} · {liveTenant.name}
        </div>
      </div>

      {projects.length > 0 ? (
        <label style={{ display: "grid", gap: 4, minWidth: 180 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: portalTokens.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Project
          </span>
          <select
            value={projectId}
            onChange={handleProjectChange}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${portalTokens.borderStrong}`, fontWeight: 600 }}
          >
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.name || item.id}</option>
            ))}
          </select>
        </label>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {quickLinks.map((link) => (
          <a key={link.href} href={link.href} style={quickLinkStyle}>{link.label}</a>
        ))}
      </div>
    </div>
  );
}
