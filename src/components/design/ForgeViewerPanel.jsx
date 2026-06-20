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
      if (!document.querySelector('link[data-fca-forge-viewer="css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = VIEWER_CSS;
        link.setAttribute("data-fca-forge-viewer", "css");
        document.head.appendChild(link);
      }
      const existing = document.querySelector('script[data-fca-forge-viewer="js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = VIEWER_JS;
      script.async = true;
      script.setAttribute("data-fca-forge-viewer", "js");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Autodesk Viewer SDK."));
      document.head.appendChild(script);
    });
  }
  return viewerAssetsPromise;
}

export default function ForgeViewerPanel({ viewerSession, fileFormat, onQueueTranslation, queueBusy = false }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [viewerError, setViewerError] = useState("");

  useEffect(() => {
    if (!viewerSession?.configured || viewerSession?.mode !== "aps-viewer" || !viewerSession?.accessToken || !viewerSession?.urn) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadViewerAssets();
        if (cancelled || !containerRef.current || !window.Autodesk?.Viewing) return;

        const getAccessToken = (onToken) => {
          onToken(viewerSession.accessToken, 3600);
        };

        await new Promise((resolve) => {
          window.Autodesk.Viewing.Initializer({ env: "AutodeskProduction", getAccessToken }, resolve);
        });

        if (cancelled || !containerRef.current) return;

        const viewer = new window.Autodesk.Viewing.GuiViewer3D(containerRef.current);
        viewerRef.current = viewer;
        viewer.start();
        setViewerError("");

        const documentId = viewerSession.urn.startsWith("urn:") ? viewerSession.urn : `urn:${viewerSession.urn}`;
        window.Autodesk.Viewing.Document.load(
          documentId,
          (doc) => {
            if (cancelled || !viewerRef.current) return;
            const defaultModel = doc.getRoot().getDefaultGeometry();
            viewerRef.current.loadDocumentNode(doc, defaultModel);
          },
          (code, message) => {
            if (!cancelled) setViewerError(`${code}: ${message || "Unable to load translated model."}`);
          },
        );
      } catch (error) {
        if (!cancelled) setViewerError(error.message || "Unable to initialize Autodesk Viewer.");
      }
    })();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [viewerSession?.accessToken, viewerSession?.mode, viewerSession?.urn]);

  if (!viewerSession) return null;

  if (!viewerSession.configured) {
    return (
      <div style={{ color: "#475569", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Enterprise CAD/BIM viewer</div>
        <p>
          FCA transitional extract engine is active for {String(fileFormat || "sheet").toUpperCase()} sheets. Configure APS credentials to enable Autodesk Viewer for native DWG/RVT fidelity.
        </p>
      </div>
    );
  }

  const canMountViewer = viewerSession.mode === "aps-viewer" && viewerSession.accessToken && viewerSession.urn;

  return (
    <div style={{ color: "#475569", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Autodesk Platform Services</div>
      <div><strong>Mode:</strong> {viewerSession.mode}</div>
      <div><strong>Translation:</strong> {viewerSession.translationStatus || viewerSession.translation?.status || "pending"}</div>
      <div style={{ marginTop: 8 }}>{viewerSession.viewerHint || viewerSession.message}</div>

      {!canMountViewer && onQueueTranslation ? (
        <button
          type="button"
          onClick={onQueueTranslation}
          disabled={queueBusy}
          style={{
            marginTop: 12,
            background: "#1d4ed8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 700,
            cursor: queueBusy ? "wait" : "pointer",
          }}
        >
          {queueBusy ? "Queueing translation…" : "Queue APS translation"}
        </button>
      ) : null}

      {viewerError ? (
        <div style={{ marginTop: 12, color: "#991b1b", fontSize: 14 }}>{viewerError}</div>
      ) : null}

      {canMountViewer ? (
        <div
          ref={containerRef}
          style={{
            marginTop: 16,
            width: "100%",
            height: 420,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            background: "#0f172a",
          }}
        />
      ) : null}
    </div>
  );
}
