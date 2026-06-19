import DeploymentStatusBeacon from "./DeploymentStatusBeacon";
import FcaBrandMark from "./FcaBrandMark";

export default function ShellFooter() {
  return (
    <footer
      style={{
        marginTop: 48,
        padding: "32px 0 16px",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 200 }}>
          <FcaBrandMark compact />
          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 12, maxWidth: 320 }}>
            Future Contractors of America — commercial contractor operating system for lead flow, job control, and workforce readiness.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Legal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <a href="/terms" style={{ color: "#334155", textDecoration: "none" }}>Terms of Service</a>
            <a href="/privacy" style={{ color: "#334155", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/refunds" style={{ color: "#334155", textDecoration: "none" }}>Refunds & Billing</a>
            <a href="/ip" style={{ color: "#334155", textDecoration: "none" }}>Intellectual Property</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Contact</div>
          <a href="mailto:support@futurecontractorsofamerica.com" style={{ color: "#1d4ed8", textDecoration: "none", fontSize: 14 }}>
            support@futurecontractorsofamerica.com
          </a>
        </div>

        <DeploymentStatusBeacon />
      </div>

      <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, marginTop: 24, marginBottom: 0 }}>
        Copyright (c) 2026 Future Contractors of America LLC. FCA and Auricrux are trademarks of Future Contractors of America LLC.
      </p>
    </footer>
  );
}
