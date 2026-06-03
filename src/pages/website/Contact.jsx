import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { contactPaths } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function Contact() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA Contact"
        title="Move from interest to demo"
        subtitle="This contact surface is structured around the immediate sales objective: converting interest into a founder-led walkthrough, pilot conversation, or broader platform review."
        primaryHref="/login"
        primaryLabel="Open Demo Workspace"
        secondaryHref="/pricing"
        secondaryLabel="Pricing"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {contactPaths.map((path) => (
          <div key={path.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{path.title}</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{path.detail}</p>
            <a
              href={path.cta}
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#111827",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              {path.label}
            </a>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Immediate founder CTA</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          For this stage of the product, the strongest conversion path is still a direct founder-led walkthrough. This page supports that motion while the underlying platform continues to harden.
        </p>
      </div>

      <ShellFooter />
    </div>
  );
}
