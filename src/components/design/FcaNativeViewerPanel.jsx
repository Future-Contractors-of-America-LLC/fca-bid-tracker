export default function FcaNativeViewerPanel({ viewerSession, fileFormat }) {
  const sheets = viewerSession?.sheets || [];
  const engine = viewerSession?.engine || "fca-native";

  return (
    <div style={{ color: "#334155", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>FCA Native Design Engine</div>
      <p style={{ marginTop: 0 }}>
        Complete sovereign viewing for {String(fileFormat || "plan").toUpperCase()} — governed extract, sheet manifest, markup, takeoff, and BIM coordination without third-party dependence.
      </p>
      <div><strong>Engine:</strong> {engine}</div>
      <div><strong>Status:</strong> {viewerSession?.translationStatus || "native-ready"}</div>
      <div><strong>Sheets:</strong> {viewerSession?.sheetCount ?? sheets.length}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
        {viewerSession?.viewerHint || viewerSession?.message || "Markup tools run directly on the native surface."}
      </div>
    </div>
  );
}
