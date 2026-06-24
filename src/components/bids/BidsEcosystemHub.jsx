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

export default function BidsEcosystemHub({ bidsActions = [], selectedBid = null }) {
  const estimateHref = selectedBid?.id ? `/portal/estimates?bidId=${encodeURIComponent(selectedBid.id)}` : "/portal/estimates";
  const pipelineHref = selectedBid?.id ? `/portal/pipeline?bidId=${encodeURIComponent(selectedBid.id)}` : "/portal/pipeline";
  const projectHref = selectedBid?.linkedProjectId
    ? `/portal/projects/${encodeURIComponent(selectedBid.linkedProjectId)}`
    : "/portal/projects";

  return (
    <div style={cardStyle}>
      <strong style={{ color: "#0f172a" }}>Preconstruction ecosystem spine</strong>
      <p style={{ color: "#64748b", lineHeight: 1.65, marginBottom: 12 }}>
        Qualification, commercial pipeline, estimates, and project delivery share the same governed workflow store.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Intake continuity</div>
          <a href="/portal/leads" style={linkStyle}>Lead Intelligence</a>
          <a href="/portal/bids" style={linkStyle}>Qualification board</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Commercial handoff</div>
          <a href={pipelineHref} style={linkStyle}>Commercial pipeline</a>
          <a href={estimateHref} style={linkStyle}>Estimate studio</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Delivery continuity</div>
          <a href={projectHref} style={linkStyle}>Project hub</a>
          <a href="/portal/design" style={linkStyle}>Design workspace</a>
        </div>
        {bidsActions.length ? (
          <div>
            <div style={{ fontWeight: 700, color: "#334155" }}>Auricrux next actions</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#475569", lineHeight: 1.7 }}>
              {bidsActions.slice(0, 4).map((action) => (
                <li key={action.id}>
                  <a href={action.href || "/portal/bids"} style={{ color: "#2563eb", fontWeight: 600 }}>
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
