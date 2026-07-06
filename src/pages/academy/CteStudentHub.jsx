import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import useCustomerSession from "../../hooks/useCustomerSession";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  background: "#ffffff",
  padding: 20,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

export default function CteStudentHub() {
  const { session } = useCustomerSession();
  const learnerName = session?.company || session?.email || "CTE Learner";

  return (
    <div style={{ ...pageShellStyle, minHeight: "100vh", background: "#f8fafc" }}>
      <ShellHeader
        compact
        eyebrow="CTE Student Portal"
        title="Protected CTE Learning Pathway"
        subtitle="Minor-compliant student access area for CTE coursework, progress, and credential milestones."
        primaryHref="/academy/pathway?pathway=certification"
        primaryLabel="Open CTE pathways"
        secondaryHref="/academy/catalog"
        secondaryLabel="View catalog"
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Student workspace active</h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
            Signed in as <strong style={{ color: "#0f172a" }}>{learnerName}</strong>. This session is intentionally
            scoped to CTE-only learning surfaces.
          </p>
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>What you can access</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            <li>CTE pathway training and coursework views</li>
            <li>Credential and competency-aligned academy resources</li>
            <li>Student-safe content and progress checkpoints</li>
          </ul>
        </section>
      </main>

      <ShellFooter />
    </div>
  );
}
