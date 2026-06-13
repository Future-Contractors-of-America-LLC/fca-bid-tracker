import { useAcademyLmsContext } from "../context/AcademyLmsContext";

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

const telemetryCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
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

const statusTone = {
  ready: {
    badge: "#dcfce7",
    color: "#166534",
    label: "Provider active",
  },
  warning: {
    badge: "#fef3c7",
    color: "#92400e",
    label: "Fallback active",
  },
  loading: {
    badge: "#dbeafe",
    color: "#1d4ed8",
    label: "Syncing academy spine",
  },
};

function resolveTelemetryState({ loading, meta, mutationState }) {
  if (loading) return statusTone.loading;
  if (!meta?.authoritativeState || meta?.warning || mutationState?.error) return statusTone.warning;
  return statusTone.ready;
}

export default function AcademyLmsControlPanel() {
  const {
    academyState,
    meta,
    loading,
    mutationState,
    assignProgram,
    advanceProgress,
    issueCertificate,
  } = useAcademyLmsContext();
  const learners = academyState.learners || [];
  const enrollments = academyState.enrollments || [];
  const certificates = academyState.certificates || [];
  const summary = academyState.summary || {};
  const telemetryState = resolveTelemetryState({ loading, meta, mutationState });

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Real Academy LMS spine</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Assignments, learner progress, and credential issuance now route through one provider-backed LMS state</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 900 }}>
            The academy control surface now reads the same provider state as the rest of the Academy route. This removes duplicate fetches, keeps control actions bound to one authoritative workspace state, and exposes telemetry directly where mutations happen.
          </div>
        </div>
        <div style={{ ...telemetryCardStyle, minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Provider telemetry</div>
            <div style={{ background: telemetryState.badge, color: telemetryState.color, borderRadius: 999, padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>
              {telemetryState.label}
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{meta.backingSource}</div>
          <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 10 }}>{meta.persistenceState}</div>
          <div style={{ display: "grid", gap: 6, color: "#334155", fontSize: 14 }}>
            <div><strong>Authority:</strong> {meta.authoritativeState ? "Authoritative API state" : "Fallback / non-authoritative state"}</div>
            <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
            <div><strong>Active action:</strong> {mutationState.activeAction || "None"}</div>
            <div><strong>Last action:</strong> {mutationState.lastAction || "None yet"}</div>
            <div><strong>Mutation error:</strong> {mutationState.error || "None"}</div>
            <div><strong>Warning:</strong> {meta.warning || "None"}</div>
          </div>
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
                    <button type="button" style={buttonStyle("primary")} disabled={loading || mutationState.activeAction === "assign-program"} onClick={() => assignProgram(learner.learnerId, learner.assignedProgramKey || "ops-core")}>Assign Program</button>
                    {enrollment ? <button type="button" style={buttonStyle()} disabled={loading || mutationState.activeAction === "advance-progress"} onClick={() => advanceProgress(enrollment.enrollmentId, 20, "Advance next live module")}>Advance Progress</button> : null}
                    {enrollment ? <button type="button" style={buttonStyle()} disabled={loading || mutationState.activeAction === "issue-certificate"} onClick={() => issueCertificate(enrollment.enrollmentId)}>Issue Credential</button> : null}
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
