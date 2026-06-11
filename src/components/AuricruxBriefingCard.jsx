const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  marginTop: 12,
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  background: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
  color: "#1d4ed8",
};

function hasBriefing(file = {}) {
  const status = `${file.status || ""} ${file.evidenceStatus || ""} ${file.action || ""}`.toLowerCase();
  return status.includes("briefing");
}

function buildRecommendedNextActions(file = {}, project = {}) {
  const actions = [];

  if (!(file.linkedEvidenceTarget || "").trim()) {
    actions.push("Link this file to a governed evidence target before downstream estimate or project decisions.");
  }

  if (!String(file.status || "").toLowerCase().includes("linked")) {
    actions.push("Confirm the file is attached to the correct project object so continuity stays anchored to the same project spine.");
  }

  if (String(file.category || "").toLowerCase() === "permit") {
    actions.push("Route permit findings into project setup and mobilization readiness checks.");
  }

  if (String(file.category || "").toLowerCase() === "bid") {
    actions.push("Use the briefing output to verify bid assumptions and handoff scope before estimate/proposal progression.");
  }

  if (!actions.length) {
    actions.push(`Advance ${project.id || "the active project"} using this briefing as a governed evidence reference.`);
  }

  return actions.slice(0, 3);
}

export default function AuricruxBriefingCard({ file, project }) {
  if (!hasBriefing(file)) return null;

  const summary =
    file.note ||
    `Auricrux generated a governed briefing for ${file.name} and attached it to ${project.id || "the active project root"}.`;

  const recommendedNextActions = buildRecommendedNextActions(file, project);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ color: "#2563eb", fontWeight: 800 }}>Auricrux Briefing Artifact</div>
        <div style={badgeStyle}>{file.evidenceStatus || "Briefing generated"}</div>
      </div>

      <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>{file.name}</div>
      <div style={{ color: "#334155", lineHeight: 1.7 }}>{summary}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Governed context</div>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>Project:</strong> {project.id || file.ownerObjectId || "Active project"}</div>
            <div><strong>Category:</strong> {file.category || "Document"}</div>
            <div><strong>Discipline:</strong> {file.discipline || "Document Control"}</div>
            <div><strong>Version:</strong> {file.versionLabel || "Rev 1"}</div>
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Recommended next actions</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            {recommendedNextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
