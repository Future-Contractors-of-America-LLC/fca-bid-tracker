import { useState } from "react";
import { runBidDoTeachWorkflow, submitAuricruxAction } from "../../api/auricruxActionsClient";
import { portalButtonPrimary, portalTokens } from "../../portalDesignTokens";

export default function AuricruxOperatePanel({
  bidId,
  packageLabel = "this bid",
  sourceRoute = "/portal/bids",
  onComplete,
  variant = "bid-doteach",
  capabilityId,
  mode = "execute",
  targetObjectType = "Bid",
  targetObjectId,
  buttonLabel,
  description,
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resolvedTargetId = targetObjectId || bidId;
  const isWorkflow = variant === "bid-doteach";
  const defaultDescription = isWorkflow
    ? "Run the governed Do→Teach workflow: register plan evidence, generate briefing, execute bid intake, and deliver academy teach-back on the spine."
    : `Execute governed ${capabilityId || "capability"} on ${targetObjectType} ${resolvedTargetId}.`;
  const defaultButtonLabel = isWorkflow
    ? `Run ${packageLabel} with Auricrux`
    : buttonLabel || `Run ${capabilityId || "governed action"} with Auricrux`;

  async function handleRun() {
    if (busy || (isWorkflow ? !bidId : !resolvedTargetId)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (isWorkflow) {
        const payload = await runBidDoTeachWorkflow({
          bidId,
          sourceRoute,
          rationale: `Run governed ${packageLabel} intake, briefing, execute, and teach-back.`,
        });
        const result = payload?.result || {};
        setMessage(
          `Auricrux completed ${result.package || packageLabel}: project ${result.projectId || "linked"}, briefing generated, intake executed, teach-back delivered.`,
        );
        onComplete?.(payload);
        return;
      }

      const payload = await submitAuricruxAction({
        mode,
        capabilityId,
        targetObjectType,
        targetObjectId: resolvedTargetId,
        rationale: description || defaultDescription,
        sourceRoute,
      });
      const guidance = payload?.guidance?.reply || payload?.guidance || "";
      setMessage(
        typeof guidance === "string" && guidance.trim()
          ? guidance.trim()
          : `Auricrux ${mode === "teach" ? "delivered teach-back" : "executed"} ${capabilityId} on ${resolvedTargetId}.`,
      );
      onComplete?.(payload);
    } catch (err) {
      setError(err.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        border: `1px solid #bfdbfe`,
        borderRadius: 14,
        padding: 16,
        background: "linear-gradient(180deg, #eff6ff 0%, #fff 100%)",
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 800, color: portalTokens.primaryInk, marginBottom: 8 }}>Auricrux Operator</div>
      <p style={{ margin: "0 0 12px", color: "#475569", lineHeight: 1.6, fontSize: 14 }}>
        {description || defaultDescription}
      </p>
      <button type="button" onClick={handleRun} disabled={busy || (isWorkflow ? !bidId : !resolvedTargetId)} style={portalButtonPrimary}>
        {busy ? "Auricrux operating…" : defaultButtonLabel}
      </button>
      {message ? (
        <p style={{ marginTop: 12, color: "#047857", fontSize: 13, lineHeight: 1.5 }}>{message}</p>
      ) : null}
      {error ? <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
    </div>
  );
}
