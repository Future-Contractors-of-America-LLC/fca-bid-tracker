import { useEffect, useState } from "react";
import { fetchFcamStream, fetchFcasStream } from "../../api/designWorkspaceClient";

export default function FcaNativeViewerPanel({ viewerSession, fileFormat, fileId, onExportNative }) {
  const sheets = viewerSession?.sheets || [];
  const engine = viewerSession?.engine || "fca-native";
  const [nativeStreams, setNativeStreams] = useState({ fcam: null, fcas: null, error: "" });
  const [loadingStreams, setLoadingStreams] = useState(false);

  useEffect(() => {
    if (!fileId) return undefined;
    let cancelled = false;
    async function loadStreams() {
      setLoadingStreams(true);
      try {
        const [fcamPayload, fcasPayload] = await Promise.all([
          fetchFcamStream(fileId),
          fetchFcasStream(fileId),
        ]);
        if (cancelled) return;
        setNativeStreams({
          fcam: fcamPayload?.stream || fcamPayload,
          fcas: fcasPayload?.stream || fcasPayload,
          error: "",
        });
      } catch (error) {
        if (!cancelled) {
          setNativeStreams({ fcam: null, fcas: null, error: error.message || "Native streams unavailable." });
        }
      } finally {
        if (!cancelled) setLoadingStreams(false);
      }
    }
    loadStreams();
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  const fcamCount = nativeStreams.fcam?.elements?.length ?? 0;
  const fcasCount = nativeStreams.fcas?.sheets?.length ?? sheets.length;

  return (
    <div style={{ color: "#334155", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>FCA Native Design Engine</div>
      <p style={{ marginTop: 0 }}>
        Complete sovereign viewing for {String(fileFormat || "plan").toUpperCase()} — governed extract, sheet manifest, markup, takeoff, and BIM coordination without third-party dependence.
      </p>
      <div><strong>Engine:</strong> {engine}</div>
      <div><strong>Status:</strong> {viewerSession?.translationStatus || "native-ready"}</div>
      <div><strong>Sheets:</strong> {viewerSession?.sheetCount ?? sheets.length}</div>
      <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>FCA native format streams</div>
        {loadingStreams ? (
          <div style={{ fontSize: 13, color: "#64748b" }}>Loading governed FCAM / FCAS streams…</div>
        ) : nativeStreams.error ? (
          <div style={{ fontSize: 13, color: "#b45309" }}>{nativeStreams.error}</div>
        ) : (
          <>
            <div><strong>FCAM elements:</strong> {fcamCount}</div>
            <div><strong>FCAS sheets:</strong> {fcasCount}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              Streams served from Auricrux-Central — no external viewer required.
            </div>
          </>
        )}
        {onExportNative ? (
          <button
            type="button"
            onClick={onExportNative}
            style={{
              marginTop: 10,
              borderRadius: 10,
              border: "1px solid #1d4ed8",
              background: "#1d4ed8",
              color: "#fff",
              fontWeight: 700,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Export FCAP package
          </button>
        ) : null}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
        {viewerSession?.viewerHint || viewerSession?.message || "Markup tools run directly on the native surface."}
      </div>
    </div>
  );
}
