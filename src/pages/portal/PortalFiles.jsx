import PortalShell from "../../components/PortalShell";
import { currentProject, portalFiles } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalFiles() {
  return (
    <PortalShell
      title="Files, Plans, and Customer Documents"
      subtitle="Document shell proving that bids, permits, onboarding packets, and project artifacts live in one connected workspace."
      activeHref="/portal/files"
      currentJourney="coordination"
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File Spine Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Project:</strong> {currentProject.name}</div>
          <div><strong>Project ID:</strong> {currentProject.id}</div>
          <div><strong>File set:</strong> {currentProject.fileSetLabel}</div>
          <div>{currentProject.fileSpineStatus}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {portalFiles.map((file) => (
          <div key={file.name} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{file.name}</h3>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Category: {file.category}<br />
                  Updated: {file.updated}<br />
                  Linked project: {currentProject.id}
                </div>
              </div>
              <div style={{ alignSelf: "center", fontWeight: 700 }}>{file.action}</div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
