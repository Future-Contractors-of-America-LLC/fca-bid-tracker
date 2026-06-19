import { useEffect, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { shellJourney } from "../../websiteShell";
import { navigateTo } from "../../navigation";
import { readCustomerRecord } from "../../api/intakeClient";
import { pageShellStyle, cardStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
  fontSize: 15,
};

export default function Checkout() {
  const [record, setRecord] = useState(null);
  const [promo, setPromo] = useState("");
  const [promoStatus, setPromoStatus] = useState("Enter your activation or promo code if provided.");

  useEffect(() => {
    setRecord(readCustomerRecord());
  }, []);

  function applyCode() {
    if (promo.trim()) {
      setPromoStatus("Code applied.");
      return;
    }
    setPromoStatus("Enter a code to apply.");
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Step 2"
        title="Apply your code and continue to workspace login"
        subtitle="Activation completes your rollout path into the branded FCA workspace."
        primaryHref="/login"
        primaryLabel="Continue to Login"
        secondaryHref="/intake"
        secondaryLabel="Back to Intake"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <section style={{ ...cardStyle, maxWidth: 720, margin: "0 auto" }}>
        {record ? (
          <div style={{ marginBottom: 16, lineHeight: 1.8 }}>
            <div><strong>Plan:</strong> {record.plan}</div>
            <div><strong>Company:</strong> {record.company}</div>
            <div><strong>Email:</strong> {record.email}</div>
          </div>
        ) : (
          <p>No intake record found. Start at intake first.</p>
        )}

        <label>
          <strong>Activation code</strong>
          <input value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Enter your code" style={fieldStyle} />
        </label>
        <p style={{ color: "#64748b" }}>{promoStatus}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={applyCode} style={{ border: "1px solid #1d4ed8", background: "#1d4ed8", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
            Apply Code
          </button>
          <button type="button" onClick={() => navigateTo("/login")} style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
            Continue to Login
          </button>
        </div>
      </section>

      <ShellFooter />
    </div>
  );
}
