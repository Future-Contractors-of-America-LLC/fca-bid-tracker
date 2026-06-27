import useAuricruxLiveInsight from "../../hooks/useAuricruxLiveInsight";
import AuricruxOperatePanel from "./AuricruxOperatePanel";

export default function AuricruxInsightPanel({
  title = "Auricrux Intelligence",
  nextAction,
  recommendations = [],
  metrics = [],
  children,
  actionHref,
  actionLabel = "Open",
  tone = "amber",
  liveRecommend = true,
  useOperationalChat = true,
  targetObjectType = "Project",
  targetObjectId = "",
  sourceRoute = "",
  rationale = "",
  operateConfig = null,
}) {
  const resolvedRationale =
    rationale || nextAction || `Provide governed next-step guidance for ${targetObjectType} ${targetObjectId || "workspace"}.`;

  const live = useAuricruxLiveInsight({
    enabled: liveRecommend && Boolean(targetObjectId),
    targetObjectType,
    targetObjectId,
    sourceRoute,
    rationale: resolvedRationale,
    fallbackNextAction: nextAction || "",
    useOperationalChat,
  });

  const displayNextAction = live.nextAction || nextAction;

  if (!displayNextAction && !recommendations.length && !children && !operateConfig) return null;

  const palette =
    tone === "blue"
      ? { border: "#bfdbfe", bg: "linear-gradient(180deg, #eff6ff 0%, #fff 100%)", label: "#1d4ed8", btn: "#1d4ed8" }
      : tone === "green"
        ? { border: "#86efac", bg: "linear-gradient(180deg, #ecfdf5 0%, #fff 100%)", label: "#047857", btn: "#047857" }
        : { border: "#fde68a", bg: "linear-gradient(180deg, #fffbeb 0%, #fff 100%)", label: "#92400e", btn: "#d97706" };

  const liveLabel = live.operational
    ? "Live execution brief"
    : live.isLive
      ? "Live recommendation"
      : "Guidance mode";

  return (
    <div style={{ border: `1px solid ${palette.border}`, borderRadius: 14, padding: 16, background: palette.bg, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: palette.label, fontWeight: 800 }}>{title}</div>
        {liveRecommend && targetObjectId ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: live.isLive ? "#047857" : "#64748b" }}>
            {live.loading ? "Auricrux loading…" : liveLabel}
          </span>
        ) : null}
      </div>
      {displayNextAction ? <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>{displayNextAction}</div> : null}
      {metrics.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 12 }}>
          {metrics.map((metric) => (
            <div key={metric.label} style={{ border: `1px solid ${palette.border}`, borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 11, color: palette.label, fontWeight: 700 }}>{metric.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{metric.value}</div>
            </div>
          ))}
        </div>
      ) : null}
      {operateConfig ? (
        <AuricruxOperatePanel
          {...operateConfig}
          sourceRoute={operateConfig.sourceRoute || sourceRoute}
        />
      ) : null}
      {children}
      {recommendations.length ? (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {recommendations.map((item) => (
            <div key={item.action || item.summary} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "#475569" }}>{item.summary}</span>
              {item.href ? (
                <a href={item.href} style={{ color: palette.btn, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {actionLabel}
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {actionHref ? (
        <a href={actionHref} style={{ display: "inline-block", marginTop: 12, border: `1px solid ${palette.btn}`, background: "#fff", color: palette.btn, borderRadius: 10, padding: "8px 12px", fontWeight: 700, textDecoration: "none" }}>
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
