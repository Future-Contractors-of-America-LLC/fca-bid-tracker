const baseShellStyle = {
  minWidth: 260,
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 12,
  background: "#f8fbff",
};

const toneMap = {
  ready: {
    label: "Authoritative provider active",
    badgeBackground: "#dcfce7",
    badgeColor: "#166534",
  },
  warning: {
    label: "Fallback / caution state",
    badgeBackground: "#fef3c7",
    badgeColor: "#92400e",
  },
  loading: {
    label: "Provider syncing",
    badgeBackground: "#dbeafe",
    badgeColor: "#1d4ed8",
  },
};

function resolveTone({ loading, authoritativeState, warning, mutationError, activeAction }) {
  if (loading) return toneMap.loading;
  if (!authoritativeState || warning || mutationError) return toneMap.warning;
  if (activeAction) return { ...toneMap.loading, label: `Mutation active · ${activeAction}` };
  return toneMap.ready;
}

export default function AcademyProviderTelemetryPanel({
  meta,
  loading,
  mutationState,
  title = "Provider telemetry",
  style = {},
}) {
  const tone = resolveTone({
    loading,
    authoritativeState: meta?.authoritativeState,
    warning: meta?.warning,
    mutationError: mutationState?.error,
    activeAction: mutationState?.activeAction,
  });

  return (
    <div style={{ ...baseShellStyle, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ color: "#64748b", fontWeight: 700 }}>{title}</div>
        <div style={{ background: tone.badgeBackground, color: tone.badgeColor, borderRadius: 999, padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>
          {tone.label}
        </div>
      </div>
      <div style={{ display: "grid", gap: 6, color: "#334155", lineHeight: 1.6 }}>
        <div><strong>Backing source:</strong> {meta?.backingSource || "unavailable"}</div>
        <div><strong>Persistence:</strong> {meta?.persistenceState || "Unknown"}</div>
        <div><strong>Authority:</strong> {meta?.authoritativeState ? "Authoritative API state" : "Fallback / non-authoritative state"}</div>
        <div><strong>Last sync:</strong> {meta?.lastSyncedAt || "Pending initial sync"}</div>
        <div><strong>Active action:</strong> {mutationState?.activeAction || "None"}</div>
        <div><strong>Last action:</strong> {mutationState?.lastAction || "None yet"}</div>
        <div><strong>Warning:</strong> {meta?.warning || "None"}</div>
        <div><strong>Error:</strong> {mutationState?.error || "None"}</div>
      </div>
    </div>
  );
}
