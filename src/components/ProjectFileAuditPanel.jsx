import AuricruxFileAuditInsight from "./AuricruxFileAuditInsight";
import AuditEventCard from "./AuditEventCard";
import AuricruxBriefingCard from "./AuricruxBriefingCard";

const sectionStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #dbe3ef",
  background: "#eff6ff",
  fontSize: 12,
  fontWeight: 700,
  color: "#1d4ed8",
};

const actionButtonStyle = {
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function ProjectFileAuditPanel({ project, files = [], auditEvents = [], onRegisterReview, onClassifyFile, onLinkEvidence, onCreateBriefing, busyFileId = null, targetedFileId = "" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project File Register</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Files attached to {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((file) => {
            const isTargeted = targetedFileId && file.fileId === targetedFileId;

            return (
              <div
                key={file.fileId || file.name}
                style={{
                  border: isTargeted ? "1px solid #2563eb" : "1px solid #dbe3ef",
                  borderRadius: 12,
                  padding: 14,
                  background: isTargeted ? "#eff6ff" : "#f8fafc",
                  boxShadow: isTargeted ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{file.name}</div>
                    <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>
                      {file.category} · {file.updated}<br />
                      Linked project: {file.ownerObjectId || project.id}
                    </div>
                  </div>
                  <div style={{ alignSelf: "center", fontWeight: 700, color: "#1d4ed8" }}>{file.action}</div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {isTargeted ? <div style={badgeStyle}>Deep-linked target</div> : null}
                  {file.versionLabel ? <div style={badgeStyle}>Version {file.versionLabel}</div> : null}
                  {file.evidenceStatus ? <div style={badgeStyle}>{file.evidenceStatus}</div> : null}
                  {file.ownerObjectType ? <div style={badgeStyle}>{file.ownerObjectType} linked</div> : null}
                </div>

                <div style={{ color: "#0f172a", lineHeight: 1.7, marginTop: 10 }}>
                  {file.discipline ? <div><strong>Discipline:</strong> {file.discipline}</div> : null}
                  {file.status ? <div><strong>Status:</strong> {file.status}</div> : null}
                  {file.owner ? <div><strong>Owner:</strong> {file.owner}</div> : null}
                  {file.ownerObjectType ? <div><strong>Owner object:</strong> {file.ownerObjectType} · {file.ownerObjectId || project.id}</div> : null}
                  {file.linkedEvidenceTarget ? <div><strong>Evidence target:</strong> {file.linkedEvidenceTarget}</div> : null}
                </div>

                {file.note ? (
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 10 }}>{file.note}</div>
                ) : null}

                <AuricruxBriefingCard file={file} project={project} />

                {(onRegisterReview || onClassifyFile || onLinkEvidence || onCreateBriefing) ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {onRegisterReview ? (
                      <button type="button" style={actionButtonStyle} disabled={busyFileId === file.fileId} onClick={() => onRegisterReview(file)}>
                        {busyFileId === file.fileId ? "Working…" : "Register review"}
                      </button>
                    ) : null}
                    {onClassifyFile ? (
                      <button type="button" style={actionButtonStyle} disabled={busyFileId === file.fileId} onClick={() => onClassifyFile(file)}>
                        {busyFileId === file.fileId ? "Working…" : "Classify"}
                      </button>
                    ) : null}
                    {onLinkEvidence ? (
                      <button type="button" style={actionButtonStyle} disabled={busyFileId === file.fileId} onClick={() => onLinkEvidence(file)}>
                        {busyFileId === file.fileId ? "Working…" : "Link evidence"}
                      </button>
                    ) : null}
                    {onCreateBriefing ? (
                      <button type="button" style={actionButtonStyle} disabled={busyFileId === file.fileId} onClick={() => onCreateBriefing(file)}>
                        {busyFileId === file.fileId ? "Working…" : "Create briefing"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Audit + Auricrux Timeline</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Operational record for {project.id}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {auditEvents.map((event) => (
            <AuditEventCard key={`${event.time}-${event.action}`} event={event} />
          ))}
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <AuricruxFileAuditInsight project={project} files={files} auditEvents={auditEvents} />
      </div>
    </div>
  );
}
