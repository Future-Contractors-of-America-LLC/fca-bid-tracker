import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { academyCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyCredentials() {
  const { session } = useCustomerSession();
  const { academyState } = useAcademyLms();
  const learnerId = session?.email || session?.customerId;
  const learnerName = session?.displayName || session?.email || "Learner";

  const certificates = useMemo(
    () => (academyState.certificates || []).filter((item) => !learnerId || item.learnerId === learnerId),
    [academyState.certificates, learnerId],
  );

  const enrollments = useMemo(
    () => (academyState.enrollments || []).filter((item) => !learnerId || item.learnerId === learnerId),
    [academyState.enrollments, learnerId],
  );

  const readyToIssue = enrollments.filter(
    (item) => item.progressPercent >= 100 && !certificates.some((cert) => cert.programKey === item.programKey),
  );

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title="Credentials and certificates"
        subtitle="View issued credentials, renewal requirements, and program completion records."
        primaryHref="/academy/dashboard"
        primaryLabel="Learner dashboard"
        secondaryHref="/academy/catalog"
        secondaryLabel="Browse catalog"
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #bfdbfe" }}>
          <div style={{ color: "#64748b", fontSize: 14 }}>Credential holder</div>
          <strong style={{ fontSize: 20 }}>{learnerName}</strong>
          <div style={{ color: "#475569", marginTop: 8 }}>
            {certificates.length} credential{certificates.length === 1 ? "" : "s"} on record
          </div>
        </div>

        {readyToIssue.length > 0 ? (
          <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #fde68a", background: "#fffbeb" }}>
            <strong style={{ color: "#b45309" }}>Programs ready for credential issuance</strong>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
              {readyToIssue.map((item) => (
                <li key={item.enrollmentId}>{item.programTitle} - 100% complete</li>
              ))}
            </ul>
          </div>
        ) : null}

        {certificates.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ color: "#64748b", lineHeight: 1.65 }}>
              No credentials issued yet. Enroll in a program, complete all modules with passing knowledge checks, and your certificate will appear here.
            </p>
            <a href="/academy/catalog" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              Browse programs
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {certificates.map((cert) => (
              <article
                key={cert.certificateId}
                style={{
                  ...cardStyle,
                  border: "2px solid #2563eb",
                  background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
                }}
              >
                <div style={{ textAlign: "center", padding: "12px 0 20px", borderBottom: "1px solid #dbeafe" }}>
                  <div style={{ color: "#1d4ed8", fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>FCA ACADEMY</div>
                  <h2 style={{ margin: "8px 0", fontSize: "1.25rem" }}>{cert.title}</h2>
                  <div style={{ color: "#64748b" }}>Certificate of Completion</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 16 }}>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>Status</div>
                    <strong>{cert.status}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>Issued</div>
                    <strong>{cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "Pending"}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>Renewal</div>
                    <strong>{cert.renewal || "See program requirements"}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>Certificate ID</div>
                    <strong>{cert.certificateId}</strong>
                  </div>
                </div>
                <a
                  href={`/academy/programs/${cert.programKey}`}
                  style={{ display: "inline-block", marginTop: 16, color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}
                >
                  View program details
                </a>
              </article>
            ))}
          </div>
        )}
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
