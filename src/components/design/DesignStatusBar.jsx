export default function DesignStatusBar({ projectId, fileName, sheetName, markupCount, zoomLabel, mode = "markup" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 14px", background: "#0f172a", color: "#e2e8f0", borderRadius: 10, fontSize: 12 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span><strong>Project</strong> {projectId}</span>
        <span><strong>File</strong> {fileName || "—"}</span>
        <span><strong>Sheet</strong> {sheetName || "—"}</span>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span><strong>Mode</strong> {mode}</span>
        <span><strong>Markups</strong> {markupCount}</span>
        {zoomLabel ? <span><strong>Zoom</strong> {zoomLabel}</span> : null}
      </div>
    </div>
  );
}
