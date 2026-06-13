import { academyCoverageMatrix } from "../academyCoverageMatrix";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyCoverageMatrixPanel() {
  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Breadth + depth coverage matrix</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>Offerings are being governed for both breadth and depth before a single coordinated release</h2>
      <p style={{ color: "#334155", lineHeight: 1.7, marginTop: 0 }}>
        {academyCoverageMatrix.releaseRule.detail}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16, marginBottom: 20 }}>
        {academyCoverageMatrix.levels.map((level) => (
          <div key={level.title} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{level.title}</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>{level.description}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        {academyCoverageMatrix.domains.map((domain) => (
          <div key={domain.key} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 6 }}>{domain.title}</h3>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>{domain.depth}</div>
              </div>
              <div style={{ minWidth: 220 }}>
                <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>Linked FCA surfaces</div>
                <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", margin: 0 }}>
                  {domain.linkedSurfaces.map((surface) => (
                    <li key={surface}><a href={surface} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{surface}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>Offering families</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginBottom: 0 }}>
              {domain.offerings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Credential families</div>
          <div style={{ display: "grid", gap: 12 }}>
            {academyCoverageMatrix.credentialFamilies.map((family) => (
              <div key={family.title}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{family.title}</div>
                <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", margin: 0 }}>
                  {family.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Single-release gating principles</div>
          <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", margin: 0 }}>
            {academyCoverageMatrix.gatingPrinciples.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
