import { getAcademyAuthoritySnapshot } from "../academyAuthorityVocabulary";

const baseShellStyle = {
  minWidth: 260,
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 12,
  background: "#f8fbff",
};

export default function AcademyProviderTelemetryPanel({
  meta,
  loading,
  mutationState,
  title = "Provider telemetry",
  style = {},
}) {
  const authority = getAcademyAuthoritySnapshot({ meta, loading, mutationState });

  return (
    <div style={{ ...baseShellStyle, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ color: "#64748b", fontWeight: 700 }}>{title}</div>
        <div style={{ background: authority.badgeBackground, color: authority.badgeColor, borderRadius: 999, padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>
          {authority.badgeLabel}
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
