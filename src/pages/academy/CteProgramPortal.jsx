import MarketingPageShell from "../../components/MarketingPageShell";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";
import { ACADEMY_CATALOG_CTE_TOTAL, academyTheme } from "../../academyDesignSystem";

const audiences = [
  {
    title: "School & district leaders",
    detail: "Launch VDOE-aligned CTE pathways with clear enrollment, completion, and workforce outcomes.",
    href: "/contact?topic=cte",
    label: "Talk with CTE sales",
  },
  {
    title: "CTE teachers",
    detail: "Browse live CTE courses, assign learning, and keep student progress connected to job-ready skills.",
    href: "/academy/catalog?pathway=vdoe-cte",
    label: "Browse CTE courses",
  },
  {
    title: "Students & apprentices",
    detail: "Open enrolled CTE programs, complete modules, and earn credentials inside FCA Academy.",
    href: "/login?next=/academy/dashboard",
    label: "Sign in to learn",
  },
];

const proofCards = [
  {
    title: `${ACADEMY_CATALOG_CTE_TOTAL} VDOE CTE programs`,
    detail: "Aligned Career & Technical Education pathways inside the same Academy catalog contractors already use.",
  },
  {
    title: "Same FCA brand experience",
    detail: "CTE sits beside Contractor Command and Academy — not a disconnected school portal with different branding.",
  },
  {
    title: "From classroom to jobsite",
    detail: "Training progresses into real workspace skills: estimating, field delivery, safety, and project coordination.",
  },
];

export default function CteProgramPortal() {
  return (
    <MarketingPageShell
      eyebrow="FCA CTE"
      title="Career & Technical Education built for schools and the trades"
      subtitle={`${ACADEMY_CATALOG_CTE_TOTAL} VDOE-aligned CTE programs live inside FCA Academy — ready for districts, teachers, and students who need jobsite-ready training.`}
      primaryHref="/academy/catalog?pathway=vdoe-cte"
      primaryLabel="Browse CTE catalog"
      secondaryHref="/contact?topic=cte"
      secondaryLabel="Contact CTE team"
      illustrationKey="academy"
    >
      <section style={{ ...cardStyle, marginBottom: 20, borderTop: `3px solid ${academyTheme.ivyGold}`, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 70%)" }}>
        <div style={{ color: academyTheme.ivyNavy, fontWeight: 700, marginBottom: 8 }}>Why schools choose FCA CTE</div>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontFamily: academyTheme.serif, color: academyTheme.ivyNavy }}>
          Academy quality with contractor outcomes
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0, maxWidth: 760 }}>
          FCA CTE combines the polish of FCA Academy with the operating context of Future Contractors of America —
          so learners train on the same platform contractors use to win and deliver work.
        </p>
      </section>

      <section style={{ ...responsiveGrid(240), marginBottom: 20 }}>
        {audiences.map((item) => (
          <article key={item.title} style={{ ...cardStyle, marginBottom: 0 }}>
            <h3 style={{ marginTop: 0, color: academyTheme.ivyNavy }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.65 }}>{item.detail}</p>
            <a
              href={item.href}
              style={{
                display: "inline-flex",
                textDecoration: "none",
                background: academyTheme.ivyNavy,
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {item.label}
            </a>
          </article>
        ))}
      </section>

      <section style={{ ...responsiveGrid(220), marginBottom: 8 }}>
        {proofCards.map((item) => (
          <article key={item.title} style={{ ...cardStyle, marginBottom: 0, borderColor: "#dbe3ef", background: "#f8fbff" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.05rem", color: academyTheme.ivyBlue }}>{item.title}</h3>
            <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: 0 }}>{item.detail}</p>
          </article>
        ))}
      </section>
    </MarketingPageShell>
  );
}
