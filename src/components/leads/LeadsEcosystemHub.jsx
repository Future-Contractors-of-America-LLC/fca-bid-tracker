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

export default function LeadsEcosystemHub({ leadsActions = [], selectedLead = null }) {
  const opportunityHref = selectedLead?.opportunityId
    ? `/portal/opportunities/${encodeURIComponent(selectedLead.opportunityId)}`
    : "/portal/pipeline";

  return (
    <div style={cardStyle}>
      <strong style={{ color: "#0f172a" }}>FCA ecosystem spine</strong>
      <p style={{ color: "#64748b", lineHeight: 1.65, marginBottom: 12 }}>
        Lead intake, qualification, bids, estimates, and project delivery share the same governed CRM and audit spine.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Intake &amp; qualification</div>
          <a href="/intake" style={linkStyle}>Public intake</a>
          <a href="/portal/bids" style={linkStyle}>Bid workspace</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Commercial handoff</div>
          <a href={opportunityHref} style={linkStyle}>Opportunity / pipeline</a>
          <a href="/portal/estimates" style={linkStyle}>Estimate studio</a>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#334155" }}>Delivery continuity</div>
          <a href="/portal/projects" style={linkStyle}>Project hub</a>
          <a href="/portal/design" style={linkStyle}>Design workspace</a>
        </div>
        {leadsActions.length ? (
          <div>
            <div style={{ fontWeight: 700, color: "#334155" }}>Auricrux next actions</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#475569", lineHeight: 1.7 }}>
              {leadsActions.slice(0, 4).map((action) => (
                <li key={action.id}>
                  <a href={action.href || "/portal/leads"} style={{ color: "#2563eb", fontWeight: 600 }}>
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
