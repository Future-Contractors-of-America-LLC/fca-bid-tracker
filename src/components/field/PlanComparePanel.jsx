export default function PlanComparePanel({ compare, photo, onOpenDesign }) {
  if (!compare && !photo?.compareResult) return null;
  const payload = compare || photo?.compareResult || {};
  const regions = payload.diffRegions || [];

  return (
    <div style={{ border: "1px solid #fde68a", borderRadius: 14, padding: 16, background: "linear-gradient(180deg, #fffbeb 0%, #fff 100%)" }}>
      <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 8 }}>Plan compare results</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>{payload.summary || "Compare complete."}</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <Metric label="Match score" value={`${payload.matchScore ?? "—"}%`} />
        <Metric label="Variance zones" value={regions.length} />
        <Metric label="Sheet" value={payload.sheetId || photo?.sheetId || "—"} />
      </div>
      {regions.length ? (
        <div style={{ display: "grid", gap: 8 }}>
          {regions.map((region) => (
            <div key={region.id} style={{ border: "1px solid #fcd34d", borderRadius: 10, padding: 10, background: "#fff" }}>
              <strong>{region.label}</strong>
              <div style={{ color: "#64748b", fontSize: 13 }}>Severity: {region.severity || "medium"}</div>
            </div>
          ))}
        </div>
      ) : null}
      {photo?.fileId && photo?.sheetId ? (
        <button
          type="button"
          onClick={() => onOpenDesign?.(photo)}
          style={{ marginTop: 12, border: "1px solid #d97706", background: "#fef3c7", color: "#92400e", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Open plan redlines in Design Workspace
        </button>
      ) : null}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ border: "1px solid #fde68a", borderRadius: 10, padding: 10, minWidth: 100, background: "#fff" }}>
      <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
