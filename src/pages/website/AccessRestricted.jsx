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

      <PublicActionRail
        title="Continue inside the live customer shell"
        detail="Use the profile and platform surfaces to confirm enabled product layers across SaaS workspace, Academy/LMS, and Auricrux guidance."
      />

      <ShellFooter />
    </div>
  );
}
