const railStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 16,
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const itemStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

export default function AuricruxStatusRail({ project, rail }) {
  if (!project || !rail) return null;

  return (
    <div style={railStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Auricrux Status Rail</div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Operational guidance for {project.id}</h3>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            Auricrux remains embedded across the shell as the visible intelligence layer for state awareness,
            next-action sequencing, blocker visibility, and continuity readiness.
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#2563eb", display: "inline-block" }} />
          {rail.systemState}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 16 }}>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current recommendation</div>
          <div style={{ fontWeight: 700 }}>{rail.nextRecommendedAction}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{rail.recommendationReason}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current blocker</div>
          <div style={{ fontWeight: 700 }}>{rail.currentBlocker}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{rail.blockerImpact}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Last Auricrux action</div>
          <div style={{ fontWeight: 700 }}>{rail.lastAction}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{rail.lastActionResult}</div>
        </div>
        <div style={itemStyle}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Readiness state</div>
          <div style={{ fontWeight: 700 }}>{rail.readinessState}</div>
          <div style={{ color: "#475569", marginTop: 4, lineHeight: 1.6 }}>{rail.readinessSummary}</div>
        </div>
      </div>
    </div>
  );
}
