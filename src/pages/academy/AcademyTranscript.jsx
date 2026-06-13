import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import AcademyTranscriptPanel from "../../components/AcademyTranscriptPanel";
import AcademyCohortPanel from "../../components/AcademyCohortPanel";
import AcademyStateAuthorityBanner from "../../components/AcademyStateAuthorityBanner";
import useCustomerSession from "../../hooks/useCustomerSession";
import useAcademyLms from "../../hooks/useAcademyLms";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyTranscript() {
  const { session } = useCustomerSession();
  const { meta, mutationState, loading } = useAcademyLms();

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="FCA Academy Transcript"
        title="Transcript, cohort, and credential control"
        subtitle="This surface now routes transcript, cohort, and completion-certificate truth through the shared Academy API-backed LMS spine."
        primaryHref="/portal/academy"
        primaryLabel="Open Academy"
        secondaryHref="/portal/admin"
        secondaryLabel="Open Admin Ledger"
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 18, padding: "14px 16px", border: "1px solid #dbe3ef", borderRadius: 18, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
        <FcaBrandMark compact />
        <AuricruxBrandMark compact />
      </div>

      <AcademyStateAuthorityBanner meta={meta} mutationState={mutationState} loading={loading} />

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Learner identity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.7 }}>
          <div><strong>Company:</strong> {session?.company || "FCA Workspace"}</div>
          <div><strong>Learner:</strong> {session?.email || "guest@fca.academy"}</div>
          <div><strong>Role:</strong> {session?.role || "Learner"}</div>
          <div><strong>Plan:</strong> {session?.selectedPlan || "startup"}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <AcademyTranscriptPanel />
      </div>

      <AcademyCohortPanel />

      <ShellFooter />
    </div>
  );
}
