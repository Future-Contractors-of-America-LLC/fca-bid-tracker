import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { pageShellStyle } from "../../publicShellStyles";
import { ACADEMY_CATALOG_CTE_TOTAL } from "../../academyDesignSystem";

const cardStyle = {
  border: "1px solid #dbe3f0",
  borderRadius: 12,
  background: "#fff",
  padding: 20,
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
};

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  background: "#0c2340",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
};

const secondaryLinkStyle = {
  ...linkStyle,
  background: "#fff",
  color: "#0c2340",
  border: "1px solid #cbd5e1",
};

/**
 * Honest CTE entry — not a fake multi-role login carousel.
 * Track A CTE programs live in Academy (VDOE CTE lane). Full role workspaces ship with Track B / ecosystem LMS.
 */
export default function CteProgramPortal() {
  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA CTE"
        title="Career & Technical Education"
        subtitle={`${ACADEMY_CATALOG_CTE_TOTAL} VDOE-aligned CTE programs are available in the FCA Academy catalog. Role-specific teacher/admin classrooms continue to expand — use Academy for curriculum today.`}
        primaryHref="/academy/catalog?pathway=vdoe-cte"
        primaryLabel="Open CTE catalog"
        secondaryHref="/contact?topic=cte"
        secondaryLabel="Contact CTE team"
        showTopNav
        topNavMode="public"
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 48px", display: "grid", gap: 16 }}>
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>What is live now</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            <li>{ACADEMY_CATALOG_CTE_TOTAL} CTE programs in Academy (pathway: VDOE CTE)</li>
            <li>Syllabus and module lessons via Academy program pages</li>
            <li>Learner dashboard and credentials for enrolled accounts</li>
          </ul>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <a href="/academy/catalog?pathway=vdoe-cte" style={linkStyle}>Browse CTE programs</a>
            <a href="/academy/dashboard" style={secondaryLinkStyle}>Learner dashboard</a>
            <a href="/login?next=/academy/dashboard" style={secondaryLinkStyle}>Sign in</a>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>What this page is not</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0 }}>
            This is not a separate commercial SaaS package page, and it does not invent teacher/admin/substitute
            workspaces that loop back to themselves. For district rollout, partnership, or classroom provisioning,
            contact the CTE team.
          </p>
          <div style={{ marginTop: 16 }}>
            <a href="/contact?topic=cte" style={linkStyle}>Contact CTE team</a>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Related</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/academy/catalog" style={secondaryLinkStyle}>Full Academy catalog (1,245)</a>
            <a href="/academy" style={secondaryLinkStyle}>Academy home</a>
            <a href="/platform" style={secondaryLinkStyle}>Platform overview</a>
          </div>
        </section>
      </div>

      <ShellFooter />
    </div>
  );
}
