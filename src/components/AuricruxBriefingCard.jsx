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

const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #2563eb",
  background: "#ffffff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 700,
  textDecoration: "none",
};

function hasBriefing(file = {}) {
  return Boolean(file.briefing || file.briefingTitle || file.briefingSummary || `${file.status || ""} ${file.evidenceStatus || ""} ${file.action || ""}`.toLowerCase().includes("briefing"));
}

function fallbackBriefing(file = {}, project = {}) {
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

  return {
    title: file.briefingTitle || `Auricrux Briefing — ${file.name || "Governed file"}`,
    summary:
      file.briefingSummary ||
      file.note ||
      `Auricrux generated a governed briefing for ${file.name || "this file"} and attached it to ${project.id || "the active project root"}.`,
    generatedAt: file.briefingGeneratedAt || file.updated,
    generatedBy: file.briefingGeneratedBy || "Auricrux",
    keyFacts: file.briefingKeyFacts?.length
      ? file.briefingKeyFacts
      : [
          `${file.category || "Document"} artifact attached to ${project.id || file.ownerObjectId || "the active project root"}.`,
          `${file.discipline || "Document Control"} continuity remains linked to governed evidence routing.`,
        ],
    detectedGaps: file.briefingDetectedGaps?.length
      ? file.briefingDetectedGaps
      : ["Downstream estimate, schedule, and approval dependencies should be confirmed before advancing execution state."],
    recommendedNextActions: file.briefingRecommendedNextActions?.length
      ? file.briefingRecommendedNextActions
      : actions.slice(0, 3),
  };
}

export default function AuricruxBriefingCard({ file, project }) {
  if (!hasBriefing(file)) return null;

  const briefing = file.briefing || fallbackBriefing(file, project);
  const targetProjectId = project.id || file.ownerObjectId || "active-project";

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ color: "#2563eb", fontWeight: 800 }}>Auricrux Briefing Artifact</div>
        <div style={badgeStyle}>{file.evidenceStatus || "Briefing generated"}</div>
      </div>

      <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>{briefing.title}</div>
      <div style={{ color: "#334155", lineHeight: 1.7 }}>{briefing.summary}</div>

      <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
        Generated {briefing.generatedAt ? new Date(briefing.generatedAt).toLocaleString() : "recently"} by {briefing.generatedBy || "Auricrux"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Governed context</div>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>Project:</strong> {targetProjectId}</div>
            <div><strong>Category:</strong> {file.category || "Document"}</div>
            <div><strong>Discipline:</strong> {file.discipline || "Document Control"}</div>
            <div><strong>Version:</strong> {file.versionLabel || "Rev 1"}</div>
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Key facts</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            {(briefing.keyFacts || []).map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Detected gaps</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            {(briefing.detectedGaps || []).map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Recommended next actions</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            {(briefing.recommendedNextActions || []).map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <a href="/portal/projects" style={actionLinkStyle}>Open Project Spine</a>
        <a href="/portal/audit" style={actionLinkStyle}>Open Audit Timeline</a>
        <a href={`/portal/files?project=${encodeURIComponent(targetProjectId)}`} style={actionLinkStyle}>Stay in File Spine</a>
      </div>
    </div>
  );
}
