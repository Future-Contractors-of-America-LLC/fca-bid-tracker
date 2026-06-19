import { LEGAL_FOOTER_PAGES } from "../legal/legalNav";
import { legalLink } from "../legal/legalStyles";

export default function LegalRelatedNav({ currentHref }) {
  return (
    <nav
      aria-label="Related legal documents"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10, color: "#0f172a", fontSize: 14 }}>Related policies</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8,
          fontSize: 14,
        }}
      >
        {LEGAL_FOOTER_PAGES.filter((p) => p.href !== currentHref).map((page) => (
          <a key={page.href} href={page.href} style={legalLink}>
            {page.label}
          </a>
        ))}
        <a href="/legal" style={legalLink}>
          Legal Center
        </a>
      </div>
    </nav>
  );
}
