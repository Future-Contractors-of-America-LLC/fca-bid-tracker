import { getAcademyAuthoritySnapshot } from "../academyAuthorityVocabulary";

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
  const authority = getAcademyAuthoritySnapshot({ meta, loading, mutationState });

  return (
    <div style={bannerStyle(authority.bannerTone)}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {authority.bannerTitle}
      </div>
      <div>{authority.bannerDetail}</div>
      <div style={{ marginTop: 8 }}>
        <strong>Source:</strong> {meta?.backingSource || "unavailable"} · {meta?.persistenceState || "unknown"}
      </div>
    </div>
  );
}
