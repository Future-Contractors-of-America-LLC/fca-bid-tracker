import DeploymentStatusBeacon from "./DeploymentStatusBeacon";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import { LEGAL_FOOTER_PAGES } from "../legal/legalNav";

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
            <a href="/legal" style={{ color: "#334155", textDecoration: "none", fontWeight: 600 }}>Legal Center</a>
            {LEGAL_FOOTER_PAGES.map((page) => (
              <a key={page.href} href={page.href} style={{ color: "#334155", textDecoration: "none" }}>
                {page.label}
              </a>
            ))}
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

      <div style={{ marginTop: 20 }}>
        {/* Auricrux embedded in footer */}
        <AuricruxPresenceLayer surfaceKey="landing" compact showDoTeach={false} />
      </div>
    </footer>
  );
}
