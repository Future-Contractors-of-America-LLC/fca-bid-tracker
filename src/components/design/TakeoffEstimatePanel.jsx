export default function TakeoffEstimatePanel({ continuity, loading, error, onSyncAll, onTetherOne, onPriceEstimate, busy }) {
  const untethered = continuity?.untetheredTakeoffs || [];
  const status = continuity?.continuityStatus || "open";
  const pricingStatus = continuity?.pricingStatus || "open";
  const unpricedCount = continuity?.unpricedLineCount || 0;

  const statusColor = status === "complete" ? "#059669" : status === "partial" ? "#d97706" : "#64748b";
  const pricingColor = pricingStatus === "complete" ? "#059669" : pricingStatus === "partial" ? "#d97706" : "#64748b";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>Takeoff → Estimate</div>
        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, textTransform: "uppercase" }}>{status}</span>
      </div>

      {loading ? <div style={{ color: "#64748b", fontSize: 13 }}>Loading continuity…</div> : null}
      {error ? <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>{error}</div> : null}

      {continuity ? (
        <div style={{ display: "grid", gap: 8, fontSize: 13, color: "#475569", marginBottom: 12 }}>
          <div><strong>Estimate:</strong> {continuity.estimateId || "—"} · {continuity.estimateStatus || "Not linked"}</div>
          <div><strong>Takeoffs:</strong> {continuity.tetheredTakeoffCount || 0} / {continuity.takeoffCount || 0} tethered</div>
          <div><strong>Pricing:</strong> <span style={{ color: pricingColor, fontWeight: 700 }}>{pricingStatus}</span>{unpricedCount ? ` · ${unpricedCount} unpriced` : ""}</div>
          <div><strong>Design lines:</strong> {continuity.designLineItemCount || 0}</div>
          <div style={{ color: "#334155" }}>{continuity.nextAction}</div>
        </div>
      ) : null}

      {untethered.length ? (
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {untethered.map((takeoff) => (
            <div key={takeoff.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{takeoff.description}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {takeoff.quantity} {takeoff.unit} · {takeoff.id}
              </div>
              <button
                type="button"
                onClick={() => onTetherOne?.(takeoff.id)}
                disabled={busy}
                style={{
                  marginTop: 8,
                  border: "1px solid #2563eb",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontWeight: 700,
                  cursor: busy ? "wait" : "pointer",
                  fontSize: 12,
                }}
              >
                Tether to estimate
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onSyncAll?.()}
          disabled={busy || !untethered.length}
          style={{
            border: "1px solid #1d4ed8",
            background: "#1d4ed8",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontWeight: 700,
            cursor: busy || !untethered.length ? "not-allowed" : "pointer",
            opacity: untethered.length ? 1 : 0.5,
            fontSize: 13,
          }}
        >
          Sync all to estimate
        </button>
        <button
          type="button"
          onClick={() => onPriceEstimate?.()}
          disabled={busy || !unpricedCount}
          style={{
            border: "1px solid #059669",
            background: "#ecfdf5",
            color: "#047857",
            borderRadius: 8,
            padding: "8px 12px",
            fontWeight: 700,
            cursor: busy || !unpricedCount ? "not-allowed" : "pointer",
            opacity: unpricedCount ? 1 : 0.5,
            fontSize: 13,
          }}
        >
          Apply unit pricing
        </button>
        {continuity?.estimateId ? (
          <a
            href={`/portal/estimates?estimateId=${encodeURIComponent(continuity.estimateId)}`}
            style={{
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#334155",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Open estimate
          </a>
        ) : null}
      </div>
    </div>
  );
}
