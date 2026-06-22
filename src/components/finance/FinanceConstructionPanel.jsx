import { useMemo, useState } from "react";
import { PortalEmptyState, PortalQuickStats } from "../portal/PortalPrimitives";
import FinancePanelShell from "./FinancePanelShell";
import {
  financeCardStyle,
  financeInputStyle,
  financePrimaryButton,
  financeSecondaryButton,
  financeSectionTitle,
  financeTdStyle,
  financeThStyle,
  financeTableStyle,
} from "./financeStyles";

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
  const payAppId = useMemo(() => pkg.payApps?.[0]?.payAppId || "", [pkg.payApps]);

  async function handleGenerateDoc() {
    const result = await onGeneratePayAppDoc?.(projectId, payAppId);
    const html = result?.document?.html || "";
    if (html && typeof window !== "undefined") {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    }
  }

  const statItems = [
    { label: "Contract", value: metrics.contractValue || "—" },
    { label: "Earned to date", value: metrics.earnedToDate || "—" },
    { label: "Billed to date", value: metrics.billedToDate || "—" },
    { label: "Retention", value: `${metrics.retentionPct || 10}%` },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FinancePanelShell
        eyebrow="Job billing"
        title="Pay applications & schedule of values"
        detail="Track SOV progress, create pay apps, and generate G702/G703 documents."
        actions={
          <>
            <label style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              Project
              <input value={projectId} onChange={(e) => onProjectChange?.(e.target.value)} style={{ ...financeInputStyle, minWidth: 120 }} />
            </label>
            <button type="button" style={financePrimaryButton} disabled={busy} onClick={() => onCreatePayApp?.(projectId)}>
              Create pay app from SOV
            </button>
            <button type="button" style={financeSecondaryButton} disabled={busy || !payAppId} onClick={handleGenerateDoc}>
              Generate G702/G703
            </button>
          </>
        }
      />

      <PortalQuickStats items={statItems} />

      {sov ? (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 0" }}>
            <div style={financeSectionTitle}>Schedule of Values — {sov.sovId}</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={financeTableStyle}>
              <thead>
                <tr>
                  <th style={financeThStyle}>Cost code</th>
                  <th style={financeThStyle}>Description</th>
                  <th style={financeThStyle}>Scheduled</th>
                  <th style={financeThStyle}>% Complete</th>
                  <th style={financeThStyle}>Billed</th>
                  <th style={financeThStyle}></th>
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
        <PortalEmptyState title="No schedule of values" detail="Select a project with an active SOV to manage job billing." />
      )}

      <div style={financeCardStyle}>
        <div style={financeSectionTitle}>Pay applications</div>
        {!(pkg.payApps || []).length ? (
          <PortalEmptyState title="No pay applications yet" detail="Create a pay app from the SOV to start billing this project." />
        ) : (
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
                    <button type="button" style={{ ...financePrimaryButton, marginTop: 8, fontSize: 12 }} disabled={busy} onClick={() => onAdvancePayApp?.(app.payAppId, "Submitted")}>
                      Submit
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pkg.jobCost ? (
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Job cost rollup</div>
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
    <tr>
      <td style={financeTdStyle}>{line.costCode}</td>
      <td style={financeTdStyle}>{line.description}</td>
      <td style={financeTdStyle}>${Number(line.scheduledValue || 0).toLocaleString()}</td>
      <td style={financeTdStyle}>
        <input
          type="number"
          min="0"
          max="100"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          style={{ ...financeInputStyle, width: 72, padding: "6px 8px" }}
        />
      </td>
      <td style={financeTdStyle}>${Number(line.billedToDate || 0).toLocaleString()}</td>
      <td style={financeTdStyle}>
        <button
          type="button"
          style={{ ...financePrimaryButton, fontSize: 12, padding: "6px 10px" }}
          disabled={busy}
          onClick={() => onUpdateSovLine?.({ projectId, lineId: line.lineId, percentComplete: Number(percent), scheduledValue: line.scheduledValue, costCode: line.costCode, description: line.description })}
        >
          Save
        </button>
      </td>
    </tr>
  );
}
