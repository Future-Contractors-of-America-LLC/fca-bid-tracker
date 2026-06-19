import { useMemo, useState } from "react";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const btn = (primary = false) => ({
  border: primary ? "none" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: primary ? "#2ca01c" : "#fff",
  color: primary ? "#fff" : "#0f172a",
});

export default function FinanceConstructionPanel({
  packageData,
  projectId,
  onProjectChange,
  onCreatePayApp,
  onAdvancePayApp,
  onUpdateSovLine,
  onGeneratePayAppDoc,
  busy,
}) {
  const pkg = packageData || {};
  const sov = pkg.scheduleOfValues;
  const metrics = pkg.metrics || {};
  const [docHtml, setDocHtml] = useState("");

  const payAppId = useMemo(() => pkg.payApps?.[0]?.payAppId || "", [pkg.payApps]);

  async function handleGenerateDoc() {
    const result = await onGeneratePayAppDoc?.(projectId, payAppId);
    const html = result?.document?.html || "";
    setDocHtml(html);
    if (html && typeof window !== "undefined") {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontWeight: 700 }}>Project</label>
        <input
          value={projectId}
          onChange={(e) => onProjectChange?.(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 120 }}
        />
        <button type="button" style={btn(true)} disabled={busy} onClick={() => onCreatePayApp?.(projectId)}>
          Create pay app from SOV
        </button>
        <button type="button" style={btn()} disabled={busy || !payAppId} onClick={handleGenerateDoc}>
          Generate G702/G703
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[["Contract", metrics.contractValue], ["Earned to date", metrics.earnedToDate], ["Billed to date", metrics.billedToDate], ["Retention", `${metrics.retentionPct || 10}%`]].map(([label, value]) => (
          <div key={label} style={card}>
            <div style={{ color: "#64748b", fontSize: 12 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{value || "—"}</div>
          </div>
        ))}
      </div>

      {sov ? (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Schedule of Values — {sov.sovId}</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 6px" }}>Cost code</th>
                  <th style={{ padding: "8px 6px" }}>Description</th>
                  <th style={{ padding: "8px 6px" }}>Scheduled</th>
                  <th style={{ padding: "8px 6px" }}>% Complete</th>
                  <th style={{ padding: "8px 6px" }}>Billed</th>
                  <th style={{ padding: "8px 6px" }}></th>
                </tr>
              </thead>
              <tbody>
                {(sov.lineItems || []).map((line) => (
                  <SovLineRow key={line.lineId} line={line} projectId={projectId} onUpdateSovLine={onUpdateSovLine} busy={busy} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={card}>No schedule of values for this project.</div>
      )}

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Pay applications</div>
        <div style={{ display: "grid", gap: 10 }}>
          {(pkg.payApps || []).map((app) => (
            <div key={app.payAppId} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>#{app.applicationNumber} · {app.period}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{app.status} · Retention {app.retentionHeld}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{app.amountRequested}</div>
                {app.status === "Draft" ? (
                  <button type="button" style={{ ...btn(true), marginTop: 8, fontSize: 12 }} disabled={busy} onClick={() => onAdvancePayApp?.(app.payAppId, "Submitted")}>
                    Submit
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {!(pkg.payApps || []).length ? <div style={{ color: "#64748b" }}>No pay applications yet.</div> : null}
        </div>
      </div>

      {pkg.jobCost ? (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Job cost rollup</div>
          <div style={{ color: "#475569", lineHeight: 1.9 }}>
            <div>Actual cost: <strong>{pkg.jobCost.actualCost}</strong></div>
            <div>Committed: <strong>{pkg.jobCost.committedCost}</strong></div>
            <div>Margin forecast: <strong>{pkg.jobCost.grossMarginForecast}</strong></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SovLineRow({ line, projectId, onUpdateSovLine, busy }) {
  const [percent, setPercent] = useState(String(line.percentComplete ?? 0));
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td style={{ padding: "10px 6px" }}>{line.costCode}</td>
      <td style={{ padding: "10px 6px" }}>{line.description}</td>
      <td style={{ padding: "10px 6px" }}>${Number(line.scheduledValue || 0).toLocaleString()}</td>
      <td style={{ padding: "10px 6px" }}>
        <input
          type="number"
          min="0"
          max="100"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          style={{ width: 72, padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1" }}
        />
      </td>
      <td style={{ padding: "10px 6px" }}>${Number(line.billedToDate || 0).toLocaleString()}</td>
      <td style={{ padding: "10px 6px" }}>
        <button
          type="button"
          style={{ ...btn(true), fontSize: 12, padding: "6px 10px" }}
          disabled={busy}
          onClick={() => onUpdateSovLine?.({ projectId, lineId: line.lineId, percentComplete: Number(percent), scheduledValue: line.scheduledValue, costCode: line.costCode, description: line.description })}
        >
          Save
        </button>
      </td>
    </tr>
  );
}
