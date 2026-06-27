import { useState } from "react";
import { runBidDoTeachWorkflow } from "../api/auricruxActionsClient";
import { portalButtonPrimary, portalTokens } from "../portalDesignTokens";

export default function AuricruxOperatePanel({
  bidId,
  packageLabel = "this bid",
  sourceRoute = "/portal/bids",
  onComplete,
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRunWorkflow() {
    if (!bidId || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = await runBidDoTeachWorkflow({
        bidId,
        sourceRoute,
        rationale: `Run governed Package ${packageLabel} intake, briefing, execute, and teach-back.`,
      });
      const result = payload?.result || {};
      setMessage(
        `Auricrux completed ${result.package || packageLabel}: project ${result.projectId || "linked"}, briefing generated, intake executed, teach-back delivered.`,
      );
      onComplete?.(payload);
    } catch (err) {
      setError(err.message || "Workflow failed.");
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
        Run the governed Do→Teach workflow: register plan evidence, generate briefing, execute bid intake, and deliver
        academy teach-back on the spine.
      </p>
      <button type="button" onClick={handleRunWorkflow} disabled={busy || !bidId} style={portalButtonPrimary}>
        {busy ? "Auricrux operating…" : `Run ${packageLabel} with Auricrux`}
      </button>
      {message ? (
        <p style={{ marginTop: 12, color: "#047857", fontSize: 13, lineHeight: 1.5 }}>{message}</p>
      ) : null}
      {error ? <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
    </div>
  );
}
