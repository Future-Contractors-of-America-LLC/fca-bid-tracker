export default function ForgeViewerPanel({ viewerSession, fileFormat }) {
  if (!viewerSession) return null;

  if (!viewerSession.configured) {
    return (
      <div style={{ color: "#475569", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Enterprise CAD/BIM viewer</div>
        <p>FCA transitional extract engine is active for {String(fileFormat).toUpperCase()} sheets. Configure APS credentials to enable Autodesk Viewer for native DWG/RVT fidelity.</p>
      </div>
    );
  }

  return (
    <div style={{ color: "#475569", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Autodesk Platform Services</div>
      <div><strong>Mode:</strong> {viewerSession.mode}</div>
      <div><strong>Translation:</strong> {viewerSession.translationStatus || "pending"}</div>
      <div style={{ marginTop: 8 }}>{viewerSession.viewerHint || viewerSession.message}</div>
      {viewerSession.urn ? <div style={{ marginTop: 8, fontSize: 12 }}>URN: {viewerSession.urn}</div> : null}
    </div>
  );
}
