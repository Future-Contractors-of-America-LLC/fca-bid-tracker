import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { centralApi } from "../../api/backendBase";
import { distanceBetween, formatScaleDistance } from "../../utils/designMarkupUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

function renderMarkups(ctx, markups, width, height) {
  markups.forEach((markup) => {
    const geometry = markup.geometry || {};
    const coords = geometry.coordinates || [];
    const style = markup.style || {};
    ctx.strokeStyle = style.color || "#2563eb";
    ctx.fillStyle = style.color || "#2563eb";
    ctx.lineWidth = style.strokeWidth || 2;

    if (markup.type === "pen" && coords.length > 1) {
      ctx.beginPath();
      coords.forEach((point, index) => {
        const x = point[0] * width;
        const y = point[1] * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    if (markup.type === "cloud" && coords.length > 2) {
      ctx.beginPath();
      coords.forEach((point, index) => {
        const x = point[0] * width;
        const y = point[1] * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    if ((markup.type === "punch" || markup.type === "callout" || markup.type === "count") && coords[0]) {
      const x = coords[0][0] * width;
      const y = coords[0][1] * height;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = markup.type === "punch" ? "#dc2626" : markup.type === "count" ? "#d97706" : "#2563eb";
      ctx.fill();
      if (markup.label) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "12px Inter, sans-serif";
        ctx.fillText(markup.label, x + 12, y + 4);
      }
    }

    if (markup.type === "dimension" && coords.length > 1) {
      const start = coords[0];
      const end = coords[1];
      const x1 = start[0] * width;
      const y1 = start[1] * height;
      const x2 = end[0] * width;
      const y2 = end[1] * height;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const label = markup.label || formatScaleDistance(distanceBetween(start, end));
      ctx.fillStyle = "#0f172a";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 6);
    }
  });
}

export default function PdfPlanViewer({
  fileId,
  pageNumber = 1,
  markups = [],
  activeTool = "select",
  scaleLabel = "",
  onMarkupComplete,
  onViewportChange,
}) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 960, height: 640 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draftPoints, setDraftPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dragRef = useRef(null);

  useEffect(() => {
    if (!fileId) return undefined;
    let cancelled = false;
    async function loadPdf() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(centralApi(`/api/files/${encodeURIComponent(fileId)}/stream`), {
          credentials: "omit",
        });
        if (!response.ok) throw new Error("Unable to load plan stream.");
        const buffer = await response.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (!cancelled) setPdfDoc(doc);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "PDF load failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return undefined;
    let cancelled = false;

    async function renderPage() {
      const page = await pdfDoc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current?.clientWidth || 960;
      const fitScale = (containerWidth - 32) / baseViewport.width;
      const renderScale = fitScale * zoom;
      const viewport = page.getViewport({ scale: renderScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setViewportSize({ width: viewport.width, height: viewport.height });
      onViewportChange?.({ width: viewport.width, height: viewport.height, pageNumber });

      await page.render({ canvasContext: context, viewport }).promise;
      if (cancelled) return;

      const overlay = overlayRef.current;
      if (overlay) {
        overlay.width = viewport.width;
        overlay.height = viewport.height;
        const octx = overlay.getContext("2d");
        octx.clearRect(0, 0, viewport.width, viewport.height);
        renderMarkups(octx, markups, viewport.width, viewport.height);
        if (draftPoints.length) {
          octx.strokeStyle = "#f59e0b";
          octx.lineWidth = 2;
          octx.beginPath();
          draftPoints.forEach((point, index) => {
            const x = point[0] * viewport.width;
            const y = point[1] * viewport.height;
            if (index === 0) octx.moveTo(x, y);
            else octx.lineTo(x, y);
          });
          octx.stroke();
        }
      }
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, markups, draftPoints, zoom, onViewportChange]);

  function normalizedPoint(event) {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
  }

  function handleOverlayClick(event) {
    if (activeTool === "select" || activeTool === "pan") return;
    const point = normalizedPoint(event);
    if (!point) return;

    const instantTools = ["punch", "callout", "count"];
    if (instantTools.includes(activeTool)) {
      onMarkupComplete?.({
        type: activeTool,
        geometry: { coordinates: [point] },
        label: activeTool === "punch" ? "Punch item" : activeTool === "count" ? "Count" : "Callout",
      });
      setDraftPoints([]);
      return;
    }

    const next = [...draftPoints, point];
    setDraftPoints(next);

    if (activeTool === "dimension" && next.length >= 2) {
      const dist = distanceBetween(next[0], next[1]);
      onMarkupComplete?.({
        type: "dimension",
        geometry: { coordinates: next.slice(0, 2) },
        label: formatScaleDistance(dist, scaleLabel),
      });
      setDraftPoints([]);
      return;
    }

    if (activeTool === "cloud" && next.length >= 3) {
      onMarkupComplete?.({
        type: "cloud",
        geometry: { coordinates: next },
        label: "Revision cloud",
      });
      setDraftPoints([]);
      return;
    }

    if (activeTool === "pen" && next.length >= 2 && event.detail === 2) {
      onMarkupComplete?.({
        type: "pen",
        geometry: { coordinates: next },
        label: "Markup",
      });
      setDraftPoints([]);
    }
  }

  function handlePointerDown(event) {
    if (activeTool !== "pan") return;
    dragRef.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return;
    setPan({ x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", minHeight: 480, background: "#0f172a", borderRadius: 12, overflow: "auto" }}>
      {loading ? <div style={{ color: "#e2e8f0", padding: 24 }}>Loading governed plan set…</div> : null}
      {error ? <div style={{ color: "#fecaca", padding: 24 }}>{error}</div> : null}
      <div
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, transformOrigin: "top center", padding: 16, display: "grid", placeItems: "center" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div style={{ position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          <canvas ref={canvasRef} style={{ display: "block", background: "#fff" }} />
          <canvas
            ref={overlayRef}
            onClick={handleOverlayClick}
            onPointerDown={handlePointerDown}
            style={{
              position: "absolute",
              inset: 0,
              cursor: activeTool === "pan" ? "grab" : activeTool === "select" ? "default" : "crosshair",
            }}
          />
        </div>
      </div>
      <div style={{ position: "sticky", bottom: 0, display: "flex", gap: 8, justifyContent: "flex-end", padding: 12, background: "rgba(15,23,42,0.92)" }}>
        <button type="button" onClick={() => setZoom((value) => Math.min(value + 0.1, 3))} style={controlBtnStyle}>Zoom +</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(value - 0.1, 0.5))} style={controlBtnStyle}>Zoom −</button>
        <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={controlBtnStyle}>Fit</button>
        <span style={{ color: "#cbd5e1", alignSelf: "center", fontSize: 12 }}>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}

const controlBtnStyle = {
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  borderRadius: 8,
  padding: "6px 10px",
  fontWeight: 600,
  cursor: "pointer",
};
