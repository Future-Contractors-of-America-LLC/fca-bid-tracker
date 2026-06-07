import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import useCustomerSession from "../../hooks/useCustomerSession";
import { resolveCustomerProduct } from "../../customerSession";
import { pageShellStyle, cardStyle } from "../../publicShellStyles";

const productLabels = {
  saas: "SaaS workspace",
  lms: "Academy / LMS",
  auricrux: "Auricrux guidance",
  public: "Public access",
};

const commsLabels = ["chat", "sms", "phone", "email", "teams", "conference", "lecture"];

export default function AccessRestricted({ requestedPath = "/portal/platform" }) {
  const { session } = useCustomerSession();
  const product = resolveCustomerProduct(requestedPath);
  const productLabel = productLabels[product] || "Requested product";
  const products = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };

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
          <AccessCell label="SaaS workspace" enabled={products.saas} href="/portal/platform" />
          <AccessCell label="Academy / LMS" enabled={products.lms} href="/academy" />
          <AccessCell label="Auricrux guidance" enabled={products.auricrux} href="/portal/auricrux" />
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Enabled communications lanes</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {commsLabels.map((channel) => (
            <AccessCell key={channel} label={channel.toUpperCase()} enabled={enabledComms[channel]} href={`/portal/messages#${channel}`} />
          ))}
        </div>
      </div>

      <CustomerCommsLaunchpad session={session} title="Launch enabled communications lanes" />

      <PublicActionRail
        title="Continue inside the live customer shell"
        detail="Use the profile, platform, and communications surfaces to confirm enabled product layers across SaaS workspace, Academy/LMS, Auricrux guidance, and the comms control plane."
      />

      <ShellFooter />
    </div>
  );
}

function AccessCell({ label, enabled, href }) {
  return (
    <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{enabled ? "Enabled" : "Pending"}</div>
      <a href={enabled ? href : "/portal/profile"} style={{ color: enabled ? "#1d4ed8" : "#475569", fontWeight: 700, textDecoration: "none" }}>
        {enabled ? "Open route" : "Return to profile"}
      </a>
    </div>
  );
}
