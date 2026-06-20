import { useMemo, useState } from "react";
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

const printStyles = `
  @media print {
    body * { visibility: hidden !important; }
    body.fca-print-certificate .fca-print-target,
    body.fca-print-certificate .fca-print-target * { visibility: visible !important; }
    body.fca-print-certificate .fca-print-target {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 48px 56px;
      border: 3px double #1d4ed8 !important;
      background: #fff !important;
      box-shadow: none !important;
      page-break-inside: avoid;
    }
    body.fca-print-certificate .fca-print-target .fca-cert-seal {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 2px solid #1d4ed8;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #1d4ed8;
    }
  }
`;

function printCertificate(setPrintId, certificateId) {
  setPrintId(certificateId);
  document.body.classList.add("fca-print-certificate");
  requestAnimationFrame(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove("fca-print-certificate");
      setPrintId("");
    }, 500);
  });
}

export default function AcademyCredentials() {
  const { session } = useCustomerSession();
  const { academyState } = useAcademyLms();
  const [printId, setPrintId] = useState("");
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
      <style>{printStyles}</style>
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
            {certificates.map((cert) => {
              const isPrintTarget = printId === cert.certificateId;
              return (
                <article
                  key={cert.certificateId}
                  id={`certificate-${cert.certificateId}`}
                  className={isPrintTarget ? "fca-print-target" : "fca-certificate-card"}
                  style={{
                    ...cardStyle,
                    border: "2px solid #2563eb",
                    background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
                  }}
                >
                  <div className="fca-cert-seal" style={{ display: "none" }}>FCA</div>
                  <div style={{ textAlign: "center", padding: "12px 0 20px", borderBottom: "1px solid #dbeafe" }}>
                    <div style={{ color: "#1d4ed8", fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>FCA ACADEMY</div>
                    <h2 style={{ margin: "8px 0", fontSize: "1.35rem" }}>{cert.title}</h2>
                    <div style={{ color: "#64748b" }}>Certificate of Completion</div>
                    {isPrintTarget ? (
                      <div style={{ marginTop: 16, fontSize: 18, color: "#334155" }}>Awarded to <strong>{learnerName}</strong></div>
                    ) : null}
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
                  {isPrintTarget ? (
                    <div style={{ marginTop: 24, textAlign: "center", color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>
                      Future Contractors of America Academy · futurecontractorsofamerica.com/academy
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                      <a
                        href={`/academy/programs/${cert.programKey}`}
                        style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}
                      >
                        View program details
                      </a>
                      <button
                        type="button"
                        onClick={() => printCertificate(setPrintId, cert.certificateId)}
                        style={{ border: "1px solid #2563eb", background: "#fff", color: "#1d4ed8", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Print certificate
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
