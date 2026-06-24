import { useState } from "react";
import { submitPublicWarrantyIntake } from "../../api/warrantyIntakeClient";
import { warrantySlaLabel } from "../../utils/warrantySla";
import { ctaPrimaryStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  marginTop: 8,
  boxSizing: "border-box",
  fontSize: 15,
};

export default function WarrantyIntakeForm() {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    email: "",
    projectId: "A-117",
    severity: "standard",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Describe the warranty issue before submitting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = await submitPublicWarrantyIntake({
        title: draft.title.trim(),
        description: draft.description.trim(),
        email: draft.email.trim(),
        projectId: draft.projectId.trim(),
        severity: draft.severity,
      });
      setResult(payload);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit warranty intake.");
    } finally {
      setBusy(false);
    }
  }

  if (result?.warrantyCase) {
    const warrantyCase = result.warrantyCase;
    return (
      <div style={{ padding: 16, borderRadius: 14, border: "1px solid #bbf7d0", background: "#f0fdf4" }}>
        <strong>Warranty intake received</strong>
        <div style={{ marginTop: 8, color: "#166534", lineHeight: 1.7 }}>
          Case {warrantyCase.warrantyCaseId} is open on FCA service continuity surfaces.
        </div>
        <div style={{ marginTop: 8, color: "#14532d", fontSize: 14 }}>
          {warrantySlaLabel({ severity: warrantyCase.severity, dueAt: warrantyCase.dueAt, status: warrantyCase.status })}
        </div>
        <a href="/portal/support" style={{ ...ctaPrimaryStyle, marginTop: 12, display: "inline-flex" }}>Open support workspace</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>Submit a warranty service request</h2>
      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        FCA is the service rail. Intake creates a governed warranty case with SLA tracking - no external ticketing silo required.
      </p>
      <label>
        <strong>Issue title</strong>
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={fieldStyle} placeholder="Describe the issue briefly" />
      </label>
      <label>
        <strong>Details</strong>
        <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ ...fieldStyle, minHeight: 96 }} placeholder="Location, symptoms, and when it started" />
      </label>
      <label>
        <strong>Contact email</strong>
        <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={fieldStyle} placeholder="you@company.com" />
      </label>
      <label>
        <strong>Project reference</strong>
        <input value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })} style={fieldStyle} placeholder="A-117" />
      </label>
      <label>
        <strong>Severity</strong>
        <select value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })} style={fieldStyle}>
          <option value="urgent">Urgent (24h SLA)</option>
          <option value="standard">Standard (72h SLA)</option>
          <option value="low">Low (7 day SLA)</option>
        </select>
      </label>
      {error ? <div style={{ color: "#991b1b", marginTop: 12 }}>{error}</div> : null}
      <button type="submit" disabled={busy} style={{ ...ctaPrimaryStyle, marginTop: 14, border: "none", cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Submitting to FCA service lane..." : "Submit warranty intake"}
      </button>
    </form>
  );
}
