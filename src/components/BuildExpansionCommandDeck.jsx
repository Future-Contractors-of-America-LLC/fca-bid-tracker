const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 20,
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginTop: 16,
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

const actionLinkStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginTop: 16,
  marginRight: 10,
};

const defaultTracks = [
  {
    key: "automation",
    eyebrow: "Build automation",
    title: "Validation workflow is now part of the expansion path.",
    detail: "Lint and production build execution are treated as first-class system signals so website, SaaS, academy, and comms changes ship together.",
  },
  {
    key: "saas",
    eyebrow: "SaaS continuity",
    title: "Shared shell behavior reduces route-level drift.",
    detail: "Commercial and operating signals stay reusable instead of fragmenting into disconnected one-off surfaces.",
  },
  {
    key: "website",
    eyebrow: "Website conversion",
    title: "Public framing stays tied to real workspace state.",
    detail: "Founder and buyer messaging remains connected to the same next-action story shown deeper in the platform.",
  },
  {
    key: "academy",
    eyebrow: "Academy readiness",
    title: "Training is presented as deployment follow-through, not a side route.",
    detail: "Enablement and certification stay attached to the same operational motion as onboarding and rollout.",
  },
  {
    key: "comms",
    eyebrow: "Comms development",
    title: "Communication now closes the loop instead of living outside delivery.",
    detail: "Messages are framed as execution continuity tied to approvals, billing, and learner assignment state.",
  },
];

export default function BuildExpansionCommandDeck({
  title = "Build expansion command deck",
  detail = "Auricrux is expanding the system as one connected build across automation, SaaS, website, academy, and communications surfaces.",
  primaryHref = "/portal/platform",
  primaryLabel = "Open platform command state",
  secondaryHref = "/contact",
  secondaryLabel = "Request founder review",
  tracks = defaultTracks,
}) {
  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Expansion in progress</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0, maxWidth: 860 }}>{detail}</p>
        </div>
        <div style={{ minWidth: 190, textAlign: "right" }}>
          <div style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 }}>Operating scope</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginTop: 4 }}>5-track build</div>
          <div style={{ color: "#475569", marginTop: 6 }}>Automation + SaaS + Website + Academy + Comms</div>
        </div>
      </div>

      <div style={gridStyle}>
        {tracks.map((track) => (
          <div key={track.key} style={cardStyle}>
            <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
              {track.eyebrow}
            </div>
            <div style={{ color: "#111827", fontWeight: 700, marginBottom: 8 }}>{track.title}</div>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>{track.detail}</div>
          </div>
        ))}
      </div>

      <div>
        <a href={primaryHref} style={actionLinkStyle}>{primaryLabel}</a>
        <a href={secondaryHref} style={{ ...actionLinkStyle, background: "#e5e7eb", color: "#111827" }}>{secondaryLabel}</a>
      </div>
    </div>
  );
}
