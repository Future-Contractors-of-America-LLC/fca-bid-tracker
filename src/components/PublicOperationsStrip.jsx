import { resolveActionPair } from "../ctaBehavior";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";
import AuricruxTrustInsight from "./AuricruxTrustInsight";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 20,
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
  gap: 14,
  marginTop: 16,
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

export default function PublicOperationsStrip({
  eyebrow = "Operating continuity",
  title = "The public shell should read like the real system",
  detail = "Public routes need to preserve clear next actions, rollout posture, and customer continuity instead of resetting the story on each page.",
  statusLabel = "Current posture",
  statusValue = "Production continuity active",
  items = [],
  primaryHref = "/portal/platform",
  primaryLabel = "Open platform dashboard",
  secondaryHref = "/contact",
  secondaryLabel = "Request rollout review",
}) {
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const { primary, secondary } = resolveActionPair(
    { href: primaryHref, label: primaryLabel },
    { href: secondaryHref, label: secondaryLabel },
    currentPath
  );

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0, maxWidth: 860 }}>{detail}</p>
        </div>
        <div style={{ minWidth: 220, textAlign: "right" }}>
          <div style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 }}>{statusLabel}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 4 }}>{statusValue}</div>
          <div style={{ color: "#475569", marginTop: 6 }}>Shared across platform, pricing, contact, and billing</div>
        </div>
      </div>

      <div style={gridStyle}>
        {items.map((item) => (
          <div key={item.label} style={cardStyle}>
            <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ color: "#111827", fontWeight: 700, marginBottom: 8 }}>{item.value}</div>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>{item.detail}</div>
          </div>
        ))}
      </div>

      {primary ? <AuricruxTrustInsight mode="operations" primaryHref={primary.href} primaryLabel={primary.label} /> : null}

      {primary || secondary ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          {primary ? <a href={primary.href} style={ctaPrimaryStyle}>{primary.label}</a> : null}
          {secondary ? <a href={secondary.href} style={ctaLightStyle}>{secondary.label}</a> : null}
        </div>
      ) : null}
    </div>
  );
}
