import { useState } from "react";
import { ctaPrimaryStyle } from "../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  marginTop: 8,
  boxSizing: "border-box",
  fontSize: 15,
};

const ONLINE_METHODS = ["Card"];

export default function FcaNativeCheckoutPanel({
  intake,
  expectedAmount = "",
  busy = false,
  error = "",
  status = "",
  onBack,
  onSubmit,
}) {
  const [reference, setReference] = useState("");
  const [memo, setMemo] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({
      intakeId: intake?.intakeId,
      method: "Card",
      reference: reference.trim(),
      memo: memo.trim(),
    });
  }

  const displayAmount = expectedAmount || intake?.amount || "";

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>Secure online payment</h2>
      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        Complete your purchase with an online card payment. FCA records the intake, issues your invoice, and activates your workspace or academy access.
      </p>

      <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 800 }}>Order total</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: "#0f172a" }}>{displayAmount}</div>
        <div style={{ fontWeight: 700, marginTop: 8 }}>{intake?.intakeId}</div>
        <div style={{ color: "#475569", marginTop: 4, fontSize: 14 }}>Invoice {intake?.invoiceId}</div>
      </div>

      <label>
        <strong>Card payment confirmation</strong>
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          style={{ ...fieldStyle, marginBottom: 16 }}
          placeholder="Processor confirmation or authorization code"
          required
        />
      </label>

      <label>
        <strong>Memo (optional)</strong>
        <input value={memo} onChange={(event) => setMemo(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }} placeholder="Billing note for your records" />
      </label>

      {status ? (
        <div style={{ padding: 12, borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", marginBottom: 16, lineHeight: 1.6 }}>
          {status}
        </div>
      ) : null}

      {error ? (
        <div style={{ padding: 12, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 16, lineHeight: 1.6 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {onBack ? (
          <button type="button" onClick={onBack} style={{ ...ctaPrimaryStyle, background: "#fff", color: "#1d4ed8", border: "1px solid #93c5fd" }}>
            Back
          </button>
        ) : null}
        <button type="submit" disabled={busy} style={{ ...ctaPrimaryStyle, border: "none", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.85 : 1 }}>
          {busy ? "Confirming payment..." : "Confirm online payment"}
        </button>
      </div>
    </form>
  );
}
