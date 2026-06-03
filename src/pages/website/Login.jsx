import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  background: "#fff",
};

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
};

export default function Login() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <ShellHeader
          eyebrow="Auricrux Guided Entry"
          title="Sign in to FCA Workspace"
          subtitle="Demo login for customer portal and academy walkthroughs. This route is intentionally lightweight for pitch and shell validation."
          primaryHref="/portal"
          primaryLabel="Continue to Portal"
        />

        <div style={{ maxWidth: 520, ...cardStyle }}>
          <label>Work Email</label>
          <input style={fieldStyle} defaultValue="pilot@tylerconstruction.com" />

          <label>Company</label>
          <input style={fieldStyle} defaultValue="Tyler Construction" />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <a href="/portal" style={{ padding: "12px 18px", borderRadius: 10, textDecoration: "none", background: "#111827", color: "#fff", fontWeight: 700 }}>
              Continue to Portal
            </a>
            <a href="/academy" style={{ padding: "12px 18px", borderRadius: 10, textDecoration: "none", background: "#e5e7eb", color: "#111827", fontWeight: 700 }}>
              Open Academy Demo
            </a>
          </div>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
