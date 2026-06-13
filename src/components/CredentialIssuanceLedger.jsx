import { buildApiBackedCredentialLedger } from "../academyApiViewModels";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function CredentialIssuanceLedger({ academyLms }) {
  const { academyState, issueCertificate, meta, loading, mutationState } = academyLms;
  const ledger = buildApiBackedCredentialLedger(academyState);
  const degraded = loading || !meta.authoritativeState || Boolean(meta.warning || mutationState.error);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Credential issuance ledger</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Admin now reviews API-backed readiness, cohort posture, and issued credentials</h2>
        </div>
        <div style={{ color: "#475569", lineHeight: 1.6 }}>
          <div><strong>Source:</strong> {meta.backingSource}</div>
          <div>{meta.persistenceState}</div>
        </div>
      </div>

      {degraded ? (
        <div style={{ marginBottom: 16, border: "1px solid #f59e0b", background: "#fffbeb", color: "#78350f", borderRadius: 12, padding: 14, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Credential authority caution</div>
          <div>
            Credential issuance posture is currently degraded or unverified. Do not issue or trust credentials from this surface until Academy API authority is restored.
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {ledger.map((entry) => (
          <div key={entry.programKey} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{entry.title}</div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>{entry.credentialTitle}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{entry.issuedStatus}</div>
                <div style={{ color: "#475569" }}>{entry.percentComplete}% complete</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, color: "#334155", lineHeight: 1.7, marginTop: 10 }}>
              <div><strong>Readiness:</strong> {entry.readiness}</div>
              <div><strong>Cohort status:</strong> {entry.cohortStatus}</div>
              <div><strong>Credential ID:</strong> {entry.issuedCredential?.credentialId || "Pending"}</div>
              <div><strong>Issued at:</strong> {entry.issuedCredential?.issuedAt || "Pending"}</div>
            </div>
            {!entry.issuedCredential && entry.readiness === "Ready for issuance" ? (
              <button type="button" disabled={degraded || !entry.enrollmentId} onClick={() => entry.enrollmentId && issueCertificate(entry.enrollmentId)} style={{ marginTop: 12, border: degraded ? "1px solid #cbd5e1" : "1px solid #2563eb", background: degraded ? "#e2e8f0" : "#2563eb", color: degraded ? "#64748b" : "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: degraded ? "not-allowed" : "pointer" }}>
                Issue credential
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
