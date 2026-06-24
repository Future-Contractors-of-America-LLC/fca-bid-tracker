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

const methodOptions = ["ACH", "Wire", "Check", "Card", "Cash", "Other"];

export default function FcaNativeCheckoutPanel({
  intake,
  instructions = {},
  methods = methodOptions,
  busy = false,
  error = "",
  status = "",
  onBack,
  onSubmit,
}) {
  const [method, setMethod] = useState("ACH");
  const [reference, setReference] = useState("");
  const [memo, setMemo] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({
      intakeId: intake?.intakeId,
      method,
      reference: reference.trim(),
      memo: memo.trim(),
    });
  }

  const ach = instructions?.ach || {};
  const wire = instructions?.wire || {};
  const check = instructions?.check || {};

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>FCA native payment</h2>
      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        FCA is the payment rail. Your intake posts to governed invoices and FCA Books - no Stripe or external processor required.
      </p>

      <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 800 }}>Intake reference</div>
        <div style={{ fontWeight: 700, marginTop: 4 }}>{intake?.intakeId}</div>
        <div style={{ color: "#475569", marginTop: 6 }}>Invoice {intake?.invoiceId} · {intake?.amount}</div>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #dbeafe", background: "#eff6ff" }}>
          <strong>{ach.label || "ACH"}</strong>
          <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
            Routing {ach.routing || "-"} · {ach.memo}
          </div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <strong>{wire.label || "Wire"}</strong>
          <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
            {wire.bank || "Governed wire instructions"} · {wire.memo}
          </div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <strong>{check.label || "Check"}</strong>
          <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
            Payable to {check.payableTo || "Future Contractors of America LLC"} · {check.memo}
          </div>
        </div>
      </div>

      <label>
        <strong>Payment method</strong>
        <select value={method} onChange={(event) => setMethod(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }}>
          {(methods.length ? methods : methodOptions).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>

      <label>
        <strong>Reference / confirmation</strong>
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          style={{ ...fieldStyle, marginBottom: 16 }}
          placeholder="ACH trace, wire confirmation, or check number"
        />
      </label>

      <label>
        <strong>Memo (optional)</strong>
        <input value={memo} onChange={(event) => setMemo(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }} placeholder="Additional payment notes" />
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
          {busy ? "Recording payment in FCA Books..." : "Confirm payment in FCA Books"}
        </button>
      </div>
    </form>
  );
}
