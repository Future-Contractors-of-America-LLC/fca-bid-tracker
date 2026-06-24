const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const linkStyle = {
  display: "inline-block",
  marginTop: 8,
  marginRight: 12,
  color: "#2563eb",
  fontWeight: 700,
  textDecoration: "none",
};

export default function ImmersiveEcosystemHub({ projectId = "", immersiveActions = [] }) {
  const designHref = projectId ? `/portal/design?projectId=${encodeURIComponent(projectId)}` : "/portal/design";
  const fieldHref = projectId ? `/portal/field-supervision?projectId=${encodeURIComponent(projectId)}` : "/portal/field-supervision";
  const filesHref = projectId ? `/portal/files?projectId=${encodeURIComponent(projectId)}` : "/portal/files";
  const projectsHref = projectId ? `/portal/projects/${encodeURIComponent(projectId)}` : "/portal/projects";

  return (
    <div style={cardStyle}>
      <strong style={{ color: "#0f172a" }}>FCA ecosystem spine</strong>
      <p style={{ color: "#64748b", lineHeight: 1.65, marginBottom: 12 }}>
        Immersive VR, native plans, and Auricrux guidance share the same project, file, and audit spine.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Plans &amp; 3D</div>
          <a href={designHref} style={linkStyle}>Design Workspace (FCAM/FCAS/FCAP)</a>
          <a href={filesHref} style={linkStyle}>Project files</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Field &amp; execution</div>
          <a href={fieldHref} style={linkStyle}>Field supervision overlays</a>
          <a href={projectsHref} style={linkStyle}>Project hub</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Training &amp; precon</div>
          <a href="/academy/programs" style={linkStyle}>CTIN 410 &amp; academy labs</a>
          <a href="/portal/bids" style={linkStyle}>Bid &amp; estimate spine</a>
        </div>
        {immersiveActions.length ? (
          <div>
            <div style={{ fontWeight: 700, color: "#334155" }}>Auricrux next actions</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#475569", lineHeight: 1.7 }}>
              {immersiveActions.slice(0, 4).map((action) => (
                <li key={action.id}>
                  <a href={action.href || "/portal/immersive"} style={{ color: "#2563eb", fontWeight: 600 }}>
                    {action.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
