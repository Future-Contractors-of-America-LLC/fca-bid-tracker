import { readCommercialLog } from "../sessionCommercialLog";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const itemStyle = {
  borderBottom: `1px solid ${portalTokens.border}`,
  padding: "10px 0",
};

export default function CommercialContinuityFeed({ title = "Commercial activity", detail = "Recent billing, rollout, and workspace changes." }) {
  const items = readCommercialLog();

  if (!items.length) return null;

  return (
    <div style={portalCardStyle}>
      <div style={portalEyebrowStyle}>Revenue activity</div>
      <h2 style={{ marginTop: 6, marginBottom: 6, fontSize: 17 }}>{title}</h2>
      {detail ? <div style={{ color: portalTokens.body, lineHeight: 1.55, marginBottom: 10, fontSize: 14 }}>{detail}</div> : null}

      {items.slice(0, 6).map((item, index) => (
        <div key={item.id} style={{ ...itemStyle, borderBottom: index === Math.min(items.length, 6) - 1 ? "none" : itemStyle.borderBottom }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, color: portalTokens.ink, fontSize: 14 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: portalTokens.primaryInk, fontWeight: 700 }}>{item.type}</div>
          </div>
          <div style={{ color: portalTokens.body, lineHeight: 1.55, marginTop: 4, fontSize: 13 }}>{item.detail}</div>
          <div style={{ color: portalTokens.muted, fontSize: 12, marginTop: 4 }}>{item.route} · {item.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
