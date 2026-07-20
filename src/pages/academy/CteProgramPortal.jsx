import MarketingPageShell from "../../components/MarketingPageShell";
import ProductIllustration from "../../components/ProductIllustration";
import { cardStyle, responsiveGrid, ctaPrimaryStyle, ctaSecondaryStyle } from "../../publicShellStyles";
import { ACADEMY_CATALOG_CTE_TOTAL, academyTheme } from "../../academyDesignSystem";

const audiences = [
  {
    title: "District & school leaders",
    detail: "Stand up VDOE-aligned CTE pathways with enrollment, completion, and workforce outcomes your board can measure.",
    href: "/contact?topic=cte",
    label: "Talk with CTE sales",
    tone: "navy",
  },
  {
    title: "CTE teachers",
    detail: "Browse the 33-program CTE catalog, assign learning, and keep progress tied to jobsite-ready skills.",
    href: "/academy/catalog?pathway=vdoe-cte",
    label: "Browse CTE courses",
    tone: "gold",
  },
  {
    title: "Students",
    detail: "Sign in with the same FCA login. Land in Academy progress — not a separate student skin.",
    href: "/login?next=/portal/academy",
    label: "Student login",
    tone: "blue",
  },
];

const flowSteps = [
  { step: "1", title: "Enter CTE portal", detail: "Schools start here — not the commercial Academy store." },
  { step: "2", title: "Browse CTE catalog", detail: "VDOE pathways only. Isolated from contractor course pricing." },
  { step: "3", title: "Enroll & teach", detail: "Teachers assign modules; students complete labs and credentials." },
  { step: "4", title: "Bridge to the job", detail: "Progress maps into apprenticeship and Contractor Command skills." },
];

const buttonTone = {
  navy: { background: academyTheme.ivyNavy, color: "#fff", border: `1px solid ${academyTheme.ivyNavy}` },
  gold: { background: academyTheme.ivyGold, color: academyTheme.ivyNavy, border: `1px solid ${academyTheme.ivyGold}` },
  blue: { background: "#1d4ed8", color: "#fff", border: "1px solid #1d4ed8" },
};

export default function CteProgramPortal() {
  return (
    <MarketingPageShell
      eyebrow="FCA CTE · Schools"
      title="Career & Technical Education for Virginia schools"
      subtitle={`${ACADEMY_CATALOG_CTE_TOTAL} VDOE-aligned CTE programs — isolated from the commercial Academy catalog and store, with the same FCA login your district already trusts.`}
      primaryHref="/academy/catalog?pathway=vdoe-cte"
      primaryLabel="Browse CTE catalog"
      secondaryHref="/contact?topic=cte"
      secondaryLabel="Contact CTE team"
      illustrationKey="academy"
    >
      <section style={{ ...cardStyle, marginBottom: 24, borderTop: `3px solid ${academyTheme.ivyGold}`, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 70%)" }}>
        <div style={{ color: academyTheme.ivyNavy, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Operational flow
        </div>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontFamily: academyTheme.serif, color: academyTheme.ivyNavy }}>
          From school portal to jobsite skill
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 18, maxWidth: 760 }}>
          CTE is a dedicated school lane. Contractor Academy storefronts stay clean; districts get a clear path from browse → enroll → teach → bridge.
        </p>
        <div style={responsiveGrid(180)}>
          {flowSteps.map((item) => (
            <div key={item.step} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: academyTheme.ivyNavy, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
                {item.step}
              </div>
              <div style={{ fontWeight: 800, color: academyTheme.ivyNavy, marginBottom: 4 }}>{item.title}</div>
              <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...responsiveGrid(240), marginBottom: 24 }}>
        {audiences.map((item) => (
          <article key={item.title} style={{ ...cardStyle, marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginTop: 0, color: academyTheme.ivyNavy }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.65, flex: 1 }}>{item.detail}</p>
            <a
              href={item.href}
              style={{
                ...ctaPrimaryStyle,
                ...buttonTone[item.tone],
                alignSelf: "flex-start",
                marginTop: 8,
              }}
            >
              {item.label}
            </a>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, marginBottom: 8, alignItems: "start" }}>
        <div>
          <ProductIllustration variant="academy" />
        </div>
        <div style={{ ...cardStyle, borderColor: "#dbe3ef", background: "#f8fbff" }}>
          <h3 style={{ marginTop: 0, color: academyTheme.ivyBlue }}>Isolation rules</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.8 }}>
            <li><strong>{ACADEMY_CATALOG_CTE_TOTAL} CTE programs</strong> live under this portal and <code style={{ fontSize: 13 }}>/academy/catalog?pathway=vdoe-cte</code>.</li>
            <li>Commercial Academy catalog and store show <strong>1,212</strong> contractor pathways — no CTE SKUs.</li>
            <li>Student login uses the same <code style={{ fontSize: 13 }}>/login</code> as SaaS and Academy.</li>
            <li>Enrollment for schools is contact-managed — not self-serve store checkout.</li>
          </ul>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <a href="/academy/catalog" style={ctaSecondaryStyle}>Commercial Academy catalog</a>
            <a href="/academy/store" style={ctaSecondaryStyle}>Academy store</a>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
