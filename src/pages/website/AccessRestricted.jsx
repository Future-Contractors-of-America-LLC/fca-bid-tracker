import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicActionRail from "../../components/PublicActionRail";
import useCustomerSession from "../../hooks/useCustomerSession";
import { resolveCustomerProduct } from "../../customerSession";
import { pageShellStyle, cardStyle } from "../../publicShellStyles";

const productLabels = {
  saas: "SaaS workspace",
  lms: "Academy / LMS",
  auricrux: "Auricrux guidance",
  public: "Public access",
};

export default function AccessRestricted({ requestedPath = "/portal/platform" }) {
  const { session } = useCustomerSession();
  const product = resolveCustomerProduct(requestedPath);
  const productLabel = productLabels[product] || "Requested product";
  const products = session?.enabledProducts || { saas: true, lms: true, auricrux: true };

  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="Customer Access Control"
        title="This customer route is not enabled for the current session"
        subtitle="FCA is preserving customer continuity, but the requested product surface is not currently enabled for this authenticated workspace."
        primaryHref="/portal/profile"
        primaryLabel="Open Customer Profile"
        secondaryHref="/portal/platform"
        secondaryLabel="Open Platform Dashboard"
      />

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Access status</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Customer:</strong> {session?.company || "Authenticated customer"}</div>
          <div><strong>Requested route:</strong> {requestedPath}</div>
          <div><strong>Product:</strong> {productLabel}</div>
          <div><strong>Recommended next move:</strong> Review the current product-access profile, then return to an enabled FCA surface.</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Enabled product layers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <AccessCell label="SaaS workspace" status={products.saas ? "Enabled" : "Pending"} href="/portal/platform" />
          <AccessCell label="Academy / LMS" status={products.lms ? "Enabled" : "Pending"} href="/academy" />
          <AccessCell label="Auricrux guidance" status={products.auricrux ? "Enabled" : "Pending"} href="/portal/auricrux" />
        </div>
      </div>

      <PublicActionRail
        title="Continue inside the live customer shell"
        detail="Use the profile and platform surfaces to confirm enabled product layers across SaaS workspace, Academy/LMS, and Auricrux guidance."
      />

      <ShellFooter />
    </div>
  );
}

function AccessCell({ label, status, href }) {
  return (
    <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{status}</div>
      <a href={href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open route</a>
    </div>
  );
}
