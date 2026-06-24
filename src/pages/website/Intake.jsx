import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import ProductIllustration from "../../components/ProductIllustration";
import { shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { navigateTo } from "../../navigation";
import {
  checkoutUrlForPlan,
  readCustomerRecord,
  saveCustomerRecord,
  submitGovernedIntake,
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
  const [status, setStatus] = useState("Complete your company profile to activate your FCA workspace.");
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
    setStatus("Saving your company profile and creating governed intake records...");

    try {
      await submitGovernedIntake(record);
      saveCustomerRecord(record);
      setStatusTone("success");
      setStatus("Profile saved. Continuing to activation...");
      navigateTo(checkoutUrlForPlan(plan, record.intakeId, record.email));
    } catch (error) {
      setStatusTone("warn");
      setStatus(error.message || "Unable to complete intake. Fix the fields above and try again.");
    }
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Step 1"
        title="Submit your company profile and start pilot onboarding"
        subtitle="Tell us about your company. We will stand up your lead pipeline, job controls, and customer portal."
        primaryHref={shellHeaderCtaSets.conversion.primaryHref}
        primaryLabel={shellHeaderCtaSets.conversion.primaryLabel}
        secondaryHref="/pricing"
        secondaryLabel="View Plans"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ maxWidth: 920, margin: "0 auto 24px" }}>
        <ProductIllustration variant="intake" compact />
      </div>

      <section style={{ ...cardStyle, maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["Company profile", "Plan selection", "Secure checkout"].map((step, index) => (
            <div
              key={step}
              style={{
                flex: "1 1 140px",
                padding: "10px 12px",
                borderRadius: 10,
                background: index === 0 ? "#eff6ff" : "#f8fafc",
                border: index === 0 ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
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
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={fieldStyle} autoComplete="new-password" />
          </label>
          <label>
            <strong>Confirm password</strong>
            <input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={fieldStyle} autoComplete="new-password" />
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
