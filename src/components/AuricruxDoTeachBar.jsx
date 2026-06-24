import { useState } from "react";
import { auricruxPersona } from "../config/auricruxPersona";
import { currentProject } from "../workspaceState";
import {
  executeAuricruxAction,
  runBidDoTeachWorkflow,
} from "../api/auricruxActionsClient";

const barStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 12,
  background: "linear-gradient(135deg, #fffdf7 0%, #ffffff 100%)",
  padding: 10,
  marginTop: 10,
};

const buttonStyle = (variant) => ({
  border: "1px solid",
  borderColor: variant === "execute" ? "#166534" : "#8a6a14",
  background: variant === "execute" ? "#dcfce7" : "#fffaf0",
  color: variant === "execute" ? "#166534" : "#8a6a14",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
});

export default function AuricruxDoTeachBar({
  targetObjectType = "Bid",
  targetObjectId = "BID-1",
  capabilityId = "plan-briefing",
  executeLabel = "Do this — run Package A-117 briefing",
  teachLabel = "Teach me — review scope gaps",
  workflowLabel = "Run full Bid→Teach workflow",
  onResult,
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const sourceRoute = typeof window !== "undefined" ? window.location.pathname : "/portal/bids";

  async function run(mode, rationale) {
    setBusy(true);
    setNote("");
    try {
      const result = await executeAuricruxAction({
        mode,
        targetObjectType,
        targetObjectId,
        capabilityId,
        rationale,
        sourceRoute,
      });
      const message =
        result.guidance ||
        (mode === "execute"
          ? `${auricruxPersona.name} executed ${capabilityId} on ${targetObjectId}.`
          : `${auricruxPersona.name} delivered teach-back for ${capabilityId}.`);
      setNote(message);
      onResult?.(result);
    } catch (error) {
      setNote(error.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runWorkflow() {
    setBusy(true);
    setNote("");
    try {
      const result = await runBidDoTeachWorkflow({
        bidId: targetObjectId,
        sourceRoute,
      });
      setNote(
        `Workflow complete for ${result.result?.package || "Package A-117"} — project ${result.result?.projectId}. Teach-back linked to cert-quantity-takeoff.`
      );
      onResult?.(result);
    } catch (error) {
      setNote(error.message || "Workflow failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={barStyle}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#8a6a14", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {auricruxPersona.title} — RA03 Do / RA04 Teach
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={busy}
          style={buttonStyle("execute")}
          onClick={() =>
            run(
              "execute",
              `Execute ${capabilityId} for ${targetObjectType} ${targetObjectId} on project ${currentProject.id}.`
            )
          }
        >
          {busy ? "Working…" : executeLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          style={buttonStyle("teach")}
          onClick={() =>
            run(
              "teach",
              `Teach scope gap review after Auricrux briefing on ${targetObjectType} ${targetObjectId}.`
            )
          }
        >
          {teachLabel}
        </button>
        {targetObjectType === "Bid" ? (
          <button type="button" disabled={busy} style={buttonStyle("teach")} onClick={runWorkflow}>
            {workflowLabel}
          </button>
        ) : null}
      </div>
      {note ? (
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: "#334155" }}>{note}</div>
      ) : null}
    </div>
  );
}
