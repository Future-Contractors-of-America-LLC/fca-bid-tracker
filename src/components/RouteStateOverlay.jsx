import { portalCardStyle, portalEyebrowStyle, portalStatusPill, portalTokens } from "../portalDesignTokens";

export default function RouteStateOverlay({ overlay, compact = true }) {
  if (!overlay) return null;

  if (compact) {
    return (
      <div
        style={{
          ...portalCardStyle,
          marginBottom: 14,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ ...portalEyebrowStyle, marginBottom: 4 }}>{overlay.title}</div>
          <div style={{ fontSize: 14, color: portalTokens.body, lineHeight: 1.45 }}>{overlay.primaryFocus || overlay.summary}</div>
        </div>
        <span style={portalStatusPill(true)}>{overlay.status}</span>
      </div>
    );
  }

  return (
    <div style={{ ...portalCardStyle, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ ...portalEyebrowStyle, marginBottom: 6 }}>Route focus</div>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.125rem" }}>{overlay.title}</h3>
          <div style={{ color: portalTokens.body, lineHeight: 1.55, maxWidth: 720 }}>{overlay.summary}</div>
        </div>
        <span style={portalStatusPill(true)}>{overlay.status}</span>
      </div>
    </div>
  );
}
