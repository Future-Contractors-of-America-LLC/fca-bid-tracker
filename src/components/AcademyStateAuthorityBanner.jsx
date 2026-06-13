const bannerStyle = (tone = "warning") => ({
  border: tone === "ok" ? "1px solid #2563eb" : "1px solid #f59e0b",
  background: tone === "ok" ? "#eff6ff" : "#fffbeb",
  color: tone === "ok" ? "#1e3a8a" : "#78350f",
  borderRadius: 14,
  padding: 16,
  marginBottom: 24,
  lineHeight: 1.7,
});

export default function AcademyStateAuthorityBanner({ meta, mutationState, loading }) {
  const hasWarning = Boolean(meta?.warning || mutationState?.error);
  const tone = !loading && meta?.authoritativeState && !hasWarning ? "ok" : "warning";

  return (
    <div style={bannerStyle(tone)}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {tone === "ok" ? "Authoritative Academy state active" : "Academy truth boundary / API caution"}
      </div>
      <div>
        {loading
          ? "Academy LMS state is still loading. Do not treat the current surface as fully authoritative until the API sync resolves."
          : tone === "ok"
            ? "Academy transcript, cohort, credential, and lesson progression surfaces are currently reading from the API-backed LMS spine for this session."
            : meta?.warning || mutationState?.error || "Academy API state is degraded or unverified. Treat the current screen as non-authoritative until backend state is restored."}
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Source:</strong> {meta?.backingSource || "unavailable"} · {meta?.persistenceState || "unknown"}
      </div>
    </div>
  );
}
