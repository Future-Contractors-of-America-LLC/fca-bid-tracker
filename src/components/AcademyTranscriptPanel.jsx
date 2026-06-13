import { buildApiBackedTranscript } from "../academyApiViewModels";
import AcademyProviderTelemetryPanel from "./AcademyProviderTelemetryPanel";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const buttonStyle = {
  border: "1px solid #2563eb",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function AcademyTranscriptPanel({ academyLms, refreshKey = null }) {
  const { academyState, meta, loading, mutationState, issueCertificate } = academyLms;
  const transcript = buildApiBackedTranscript(academyState);
  const degraded = loading || !meta.authoritativeState || Boolean(meta.warning || mutationState.error);

  return (
    <div style={cardStyle} key={refreshKey || "academy-transcript"}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Learner transcript</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Transcript, cohort, and credential issuance now read from the Academy API spine</h2>
        </div>
        <AcademyProviderTelemetryPanel
          meta={meta}
          loading={loading}
          mutationState={mutationState}
          title="Transcript panel telemetry"
        />
      </div>

      {degraded ? (
        <div style={{ marginBottom: 16, border: "1px solid #f59e0b", background: "#fffbeb", color: "#78350f", borderRadius: 12, padding: 14, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Transcript truth caution</div>
          <div>
            Transcript, cohort, and credential posture are visible for continuity, but they should not be treated as final operational truth until the Academy API provider returns to authoritative health.
          </div>
        </div>
      ) : null}
      <div style={{ display: "grid", gap: 16 }}>
        {transcript.map((entry) => (
          <div id={entry.programKey} key={entry.programKey} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div style={{ color: "#2563eb", fontWeight: 700 }}>{entry.credentialTitle}</div>
                <h3 style={{ marginTop: 6, marginBottom: 6 }}>{entry.title}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{entry.percentComplete}%</div>
                <div style={{ color: "#475569" }}>{entry.completedLessons}/{entry.totalLessons} lessons complete</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
              <div><strong>Courses complete:</strong> {entry.completedCourses}/{entry.totalCourses}</div>
              <div><strong>Cohort:</strong> {entry.cohortTitle}</div>
              <div><strong>Cohort status:</strong> {entry.cohortStatus}</div>
              <div><strong>Credential posture:</strong> {entry.issuedCredential ? "Issued" : entry.credentialReady ? "Ready for issuance" : "In progress"}</div>
            </div>
            {entry.issuedCredential ? (
              <div style={{ border: "1px solid #c7d2fe", borderRadius: 12, padding: 14, background: "#eef2ff", color: "#312e81" }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Completion certificate active</div>
                <div><strong>Credential ID:</strong> {entry.issuedCredential.credentialId}</div>
                <div><strong>Issued:</strong> {entry.issuedCredential.issuedAt}</div>
                <div><strong>Issuer:</strong> {entry.issuedCredential.issuer}</div>
                <div><strong>Honors:</strong> {entry.issuedCredential.honors}</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => entry.enrollmentId && issueCertificate(entry.enrollmentId)}
                  disabled={loading || mutationState.activeAction !== null || !meta.authoritativeState || !entry.credentialReady || !entry.enrollmentId}
                  style={{
                    ...buttonStyle,
                    background: !loading && !mutationState.activeAction && meta.authoritativeState && entry.credentialReady && entry.enrollmentId ? "#2563eb" : "#e2e8f0",
                    color: !loading && !mutationState.activeAction && meta.authoritativeState && entry.credentialReady && entry.enrollmentId ? "#fff" : "#64748b",
                    borderColor: !loading && !mutationState.activeAction && meta.authoritativeState && entry.credentialReady && entry.enrollmentId ? "#2563eb" : "#cbd5e1",
                    cursor: !loading && !mutationState.activeAction && meta.authoritativeState && entry.credentialReady && entry.enrollmentId ? "pointer" : "not-allowed",
                  }}
                >
                  Generate completion certificate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
