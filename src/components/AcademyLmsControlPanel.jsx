import useAcademyLms from "../hooks/useAcademyLms";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const buttonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

export default function AcademyLmsControlPanel() {
  const { academyState, meta, assignProgram, advanceProgress, issueCertificate } = useAcademyLms();
  const learners = academyState.learners || [];
  const enrollments = academyState.enrollments || [];
  const certificates = academyState.certificates || [];
  const summary = academyState.summary || {};

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Real Academy LMS spine</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Assignments, learner progress, and credential issuance now route through an API-backed LMS layer</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 900 }}>
            Academy is now moving beyond narrative-only continuity. Learners, enrollments, progress, and certificates are managed as durable LMS objects through the backend workflow surface.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 260 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Persistence source</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{meta.backingSource}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{meta.persistenceState}</div>
          <div style={{ color: "#64748b", marginTop: 8 }}>Last sync: {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Learners</div><div style={{ fontSize: 28, fontWeight: 700 }}>{summary.learnerCount || 0}</div></div>
        <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active enrollments</div><div style={{ fontSize: 28, fontWeight: 700 }}>{summary.activeEnrollmentCount || 0}</div></div>
        <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Completions</div><div style={{ fontSize: 28, fontWeight: 700 }}>{summary.completedEnrollmentCount || 0}</div></div>
        <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Issued credentials</div><div style={{ fontSize: 28, fontWeight: 700 }}>{summary.issuedCertificateCount || 0}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {learners.map((learner) => {
            const enrollment = enrollments.find((item) => item.learnerId === learner.learnerId);
            return (
              <div key={learner.learnerId} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{learner.role}</div>
                    <h3 style={{ margin: "0 0 8px 0" }}>{learner.fullName}</h3>
                    <div style={{ color: "#475569", lineHeight: 1.7 }}>
                      <div><strong>Project:</strong> {learner.assignedProjectId}</div>
                      <div><strong>Status:</strong> {learner.status}</div>
                      <div><strong>Program:</strong> {enrollment?.programTitle || learner.assignedProgramKey || "Not assigned"}</div>
                      <div><strong>Progress:</strong> {learner.progressPercent}%</div>
                      <div><strong>Credential:</strong> {learner.certificateStatus}</div>
                    </div>
                  </div>
                  <div style={{ minWidth: 230, display: "grid", gap: 10, alignContent: "start" }}>
                    <button type="button" style={buttonStyle("primary")} onClick={() => assignProgram(learner.learnerId, learner.assignedProgramKey || "ops-core")}>Assign Program</button>
                    {enrollment ? <button type="button" style={buttonStyle()} onClick={() => advanceProgress(enrollment.enrollmentId, 20, "Advance next live module")}>Advance Progress</button> : null}
                    {enrollment ? <button type="button" style={buttonStyle()} onClick={() => issueCertificate(enrollment.enrollmentId)}>Issue Credential</button> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={cardStyle}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Enrollment queue</div>
            <div style={{ display: "grid", gap: 10 }}>
              {enrollments.map((enrollment) => (
                <div key={enrollment.enrollmentId} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
                  <div style={{ fontWeight: 700 }}>{enrollment.programTitle}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6 }}>
                    <div><strong>Status:</strong> {enrollment.status}</div>
                    <div><strong>Progress:</strong> {enrollment.progressPercent}% · {enrollment.completedModules}/{enrollment.totalModules} modules</div>
                    <div><strong>Next lesson:</strong> {enrollment.nextLesson}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Issued credentials</div>
            {certificates.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {certificates.map((certificate) => (
                  <div key={certificate.certificateId} style={{ borderLeft: "3px solid #0f766e", paddingLeft: 12 }}>
                    <div style={{ fontWeight: 700 }}>{certificate.title}</div>
                    <div style={{ color: "#475569", lineHeight: 1.6 }}>
                      <div><strong>Status:</strong> {certificate.status}</div>
                      <div><strong>Issued:</strong> {certificate.issuedAt}</div>
                      <div><strong>Renewal:</strong> {certificate.renewal}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#475569", lineHeight: 1.7 }}>No credentials issued yet. Complete learner progress and issue certificates here when readiness is real.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
