import { useEffect, useRef, useState } from "react";

const VIEWER_JS = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js";
const VIEWER_CSS = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css";

let viewerAssetsPromise = null;

function loadViewerAssets() {
  if (typeof window !== "undefined" && window.Autodesk?.Viewing) {
    return Promise.resolve();
  }
  if (!viewerAssetsPromise) {
    viewerAssetsPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-fca-aps-interop="css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = VIEWER_CSS;
        link.setAttribute("data-fca-aps-interop", "css");
        document.head.appendChild(link);
      }
      const existing = document.querySelector('script[data-fca-aps-interop="js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = VIEWER_JS;
      script.async = true;
      script.setAttribute("data-fca-aps-interop", "js");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load optional Autodesk interop SDK."));
      document.head.appendChild(script);
    });
  }
  return viewerAssetsPromise;
}

export default function ApsInteropPanel({ viewerSession, fileFormat, onQueueTranslation, queueBusy = false }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [viewerError, setViewerError] = useState("");

  const interop = viewerSession?.interop || {};
  const interopSession = interop.session || {};
  const interopEnabled = Boolean(interop.enabled);

  useEffect(() => {
    if (!interopEnabled || interopSession?.mode !== "aps-viewer" || !interopSession?.accessToken || !interopSession?.urn) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadViewerAssets();
        if (cancelled || !containerRef.current || !window.Autodesk?.Viewing) return;

        const getAccessToken = (onToken) => {
          onToken(interopSession.accessToken, 3600);
        };

        await new Promise((resolve) => {
          window.Autodesk.Viewing.Initializer({ env: "AutodeskProduction", getAccessToken }, resolve);
        });

        if (cancelled || !containerRef.current) return;

        const viewer = new window.Autodesk.Viewing.GuiViewer3D(containerRef.current);
        viewerRef.current = viewer;
        viewer.start();
        setViewerError("");

        const documentId = interopSession.urn.startsWith("urn:") ? interopSession.urn : `urn:${interopSession.urn}`;
        window.Autodesk.Viewing.Document.load(
          documentId,
          (doc) => {
            if (cancelled || !viewerRef.current) return;
            const defaultModel = doc.getRoot().getDefaultGeometry();
            viewerRef.current.loadDocumentNode(doc, defaultModel);
          },
          (code, message) => {
            if (!cancelled) setViewerError(`${code}: ${message || "Unable to load optional interop model."}`);
          },
        );
      } catch (error) {
        if (!cancelled) setViewerError(error.message || "Optional Autodesk interop viewer failed.");
      }
    })();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [interopEnabled, interopSession?.accessToken, interopSession?.mode, interopSession?.urn]);

  if (!interopEnabled) {
    return (
      <div style={{ color: "#64748b", lineHeight: 1.7, fontSize: 13 }}>
        <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Optional Autodesk interop</div>
        <p>
          FCA is a complete design system on the native engine. Autodesk interop is disabled and not required for plan room, markup, takeoff, or BIM coordination.
        </p>
      </div>
    );
  }

  const canMountViewer = interopSession.mode === "aps-viewer" && interopSession.accessToken && interopSession.urn;

  return (
    <div style={{ color: "#475569", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Optional Autodesk interop</div>
      <p style={{ marginTop: 0 }}>
        Migration lane for customers with existing Autodesk investments. The FCA native viewer remains the primary surface for {String(fileFormat || "CAD").toUpperCase()} work.
      </p>
      <div><strong>Interop status:</strong> {interopSession.translationStatus || interop.translation?.status || "not queued"}</div>
      <div style={{ marginTop: 8 }}>{interopSession.viewerHint || interopSession.message}</div>

      {!canMountViewer && onQueueTranslation ? (
        <button
          type="button"
          onClick={onQueueTranslation}
          disabled={queueBusy}
          style={{
            marginTop: 12,
            background: "#334155",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 12px",
            fontWeight: 700,
            cursor: queueBusy ? "wait" : "pointer",
          }}
        >
          {queueBusy ? "Queueing interop translation…" : "Queue optional interop translation"}
        </button>
      ) : null}

      {viewerError ? <div style={{ color: "#b91c1c", marginTop: 12 }}>{viewerError}</div> : null}
      {canMountViewer ? (
        <div
          ref={containerRef}
          style={{ marginTop: 16, minHeight: 320, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}
        />
      ) : null}
    </div>
  );
}
