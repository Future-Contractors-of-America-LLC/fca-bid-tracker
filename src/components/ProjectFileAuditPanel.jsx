import AuricruxFileAuditInsight from "./AuricruxFileAuditInsight";

const sectionStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function ProjectFileAuditPanel({ project, files = [], auditEvents = [], briefings = [] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project File Register</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Files attached to {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((file) => (
            <div key={file.id || file.name} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{file.name}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>
                    {file.category} · {file.updated}<br />
                    Linked project: {project.id}
                  </div>
                </div>
                <div style={{ alignSelf: "center", fontWeight: 700, color: "#1d4ed8" }}>{file.action}</div>
              </div>
              <div style={{ color: "#0f172a", lineHeight: 1.7, marginTop: 10 }}>
                {file.discipline ? <div><strong>Discipline:</strong> {file.discipline}</div> : null}
                {file.status ? <div><strong>Status:</strong> {file.status}</div> : null}
                {file.owner ? <div><strong>Owner:</strong> {file.owner}</div> : null}
                {file.revisionLabel ? <div><strong>Revision:</strong> {file.revisionLabel}</div> : null}
              </div>
              {file.note ? (
                <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 10 }}>{file.note}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Audit + Auricrux Timeline</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Operational record for {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {auditEvents.map((event) => (
            <div key={`${event.time}-${event.action}`} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{event.time}</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{event.action}</div>
              {event.discipline ? <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700, marginTop: 4 }}>{event.discipline}</div> : null}
              <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{event.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {briefings.length ? (
        <div style={{ ...sectionStyle, gridColumn: "1 / -1" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Document Briefings</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux file intelligence for {project.id}</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {briefings.map((briefing) => (
              <div key={briefing.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700 }}>{briefing.packageLabel}</div>
                <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 8 }}>{briefing.summary}</div>
                <div style={{ marginTop: 10, color: "#0f172a", lineHeight: 1.7 }}>
                  <div><strong>Missing items:</strong> {briefing.missingItems.length ? briefing.missingItems.join(", ") : "No critical missing items detected"}</div>
                  <div><strong>Revision cues:</strong> {briefing.revisionSignals.length ? briefing.revisionSignals.join(" · ") : "No revision cues recorded"}</div>
                  <div><strong>Next actions:</strong> {briefing.recommendedNextActions.length ? briefing.recommendedNextActions.join(" · ") : "No next action recorded"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ gridColumn: "1 / -1" }}>
        <AuricruxFileAuditInsight project={project} files={files} auditEvents={auditEvents} />
      </div>
    </div>
  );
}
