import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { navigateTo } from "../../navigation";
import {
  checkoutUrlForPlan,
  readCustomerRecord,
  saveCustomerRecord,
  submitIntakeBid,
} from "../../api/intakeClient";
import { pageShellStyle, cardStyle } from "../../publicShellStyles";

const PLANS = [
  "startup",
  "starter-team",
  "team",
  "operations",
  "growth",
  "scale-operations",
  "enterprise",
  "pilot",
];

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

export default function Intake() {
  const initialPlan = useMemo(() => {
    if (typeof window === "undefined") return "startup";
    const plan = new URLSearchParams(window.location.search).get("plan");
    return PLANS.includes(plan) ? plan : "startup";
  }, []);

  const [plan, setPlan] = useState(initialPlan);
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Intake posts to Auricrux-Central backend and continues to activation.");
  const [statusTone, setStatusTone] = useState("info");

  useEffect(() => {
    const record = readCustomerRecord();
    if (record?.email) setEmail(record.email);
    if (record?.company) setCompany(record.company);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatusTone("warn");
      setStatus("Passwords do not match.");
      return;
    }

    const record = {
      plan,
      company: company.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      intakeId: `intake-${Date.now()}`,
    };

    setStatusTone("info");
    setStatus("Saving intake to backend...");
    saveCustomerRecord(record);

    try {
      await submitIntakeBid(record);
      setStatusTone("success");
      setStatus("Intake saved to backend. Continuing...");
    } catch {
      setStatusTone("warn");
      setStatus("Local intake saved; backend sync will retry on next visit.");
    }

    const checkout = checkoutUrlForPlan(plan, record.email);
    if (checkout) {
      window.location.href = checkout;
      return;
    }

    if (plan === "startup") {
      navigateTo("/checkout");
      return;
    }

    navigateTo("/login");
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Step 1"
        title="Submit your company profile and start pilot onboarding"
        subtitle="Intake creates your customer record, posts to Auricrux-Central, and routes you to activation or checkout."
        primaryHref={shellHeaderCtaSets.conversion.primaryHref}
        primaryLabel={shellHeaderCtaSets.conversion.primaryLabel}
        secondaryHref="/pricing"
        secondaryLabel="View Plans"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <section style={{ ...cardStyle, maxWidth: 720, margin: "0 auto" }}>
        <form onSubmit={handleSubmit}>
          <label>
            <strong>Plan</strong>
            <select value={plan} onChange={(event) => setPlan(event.target.value)} style={fieldStyle}>
              {PLANS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <strong>Company</strong>
            <input required value={company} onChange={(event) => setCompany(event.target.value)} style={fieldStyle} />
          </label>
          <label>
            <strong>Contact name</strong>
            <input required value={name} onChange={(event) => setName(event.target.value)} style={fieldStyle} />
          </label>
          <label>
            <strong>Email</strong>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={fieldStyle} />
          </label>
          <label>
            <strong>Password</strong>
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={fieldStyle} />
          </label>
          <label>
            <strong>Confirm password</strong>
            <input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={fieldStyle} />
          </label>
          <div
            style={{
              padding: 13,
              borderRadius: 12,
              marginBottom: 16,
              background: statusTone === "success" ? "#ecfdf5" : statusTone === "warn" ? "#fff7ed" : "#eef2ff",
              border: `1px solid ${statusTone === "success" ? "#86efac" : statusTone === "warn" ? "#fdba74" : "#c7d2fe"}`,
            }}
          >
            {status}
          </div>
          <button type="submit" style={{ border: "1px solid #1d4ed8", background: "#1d4ed8", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
            Continue to Activation
          </button>
        </form>
      </section>

      <ShellFooter />
    </div>
  );
}
