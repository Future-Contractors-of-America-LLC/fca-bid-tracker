import { useEffect, useRef, useState } from "react";
import { centralApi } from "../../api/backendBase";
import { distanceBetween, formatScaleDistance } from "../../utils/designMarkupUtils";

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

export default function NativeSheetViewer({
  fileId,
  sheetId,
  activeSheet,
  fileFormat,
  markups = [],
  activeTool = "select",
  scaleLabel = "",
  onMarkupComplete,
}) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 960, height: 720 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draftPoints, setDraftPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dragRef = useRef(null);

  const previewUrl = fileId && sheetId
    ? centralApi(`/api/files/${encodeURIComponent(fileId)}/sheets/${encodeURIComponent(sheetId)}/preview`)
    : "";

  useEffect(() => {
    if (!previewUrl) return undefined;
    let cancelled = false;
    async function probePreview() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(previewUrl, { credentials: "omit" });
        if (!response.ok) throw new Error("Unable to load FCA native sheet preview.");
        if (!cancelled) {
          const width = activeSheet?.width || 960;
          const height = activeSheet?.height || 720;
          setViewportSize({ width, height });
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Native preview load failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    probePreview();
    return () => {
      cancelled = true;
    };
  }, [previewUrl, activeSheet, sheetId]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return undefined;
    const width = viewportSize.width * zoom;
    const height = viewportSize.height * zoom;
    overlay.width = width;
    overlay.height = height;
    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    renderMarkups(ctx, markups, width, height);
    if (draftPoints.length) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      draftPoints.forEach((point, index) => {
        const x = point[0] * width;
        const y = point[1] * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [markups, draftPoints, viewportSize, zoom]);

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
      onMarkupComplete?.({
        type: "dimension",
        geometry: { coordinates: next.slice(0, 2) },
        label: formatScaleDistance(distanceBetween(next[0], next[1]), scaleLabel),
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
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", minHeight: 480, background: "#0f172a", borderRadius: 12, overflow: "auto" }}>
      {loading ? <div style={{ color: "#e2e8f0", padding: 24 }}>Loading FCA native sheet…</div> : null}
      {error ? <div style={{ color: "#fecaca", padding: 24 }}>{error}</div> : null}
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, padding: 16, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={activeSheet?.name || "FCA native sheet"}
              style={{
                display: "block",
                width: viewportSize.width * zoom,
                height: viewportSize.height * zoom,
                background: "#fff",
              }}
            />
          ) : null}
          <canvas
            ref={overlayRef}
            onClick={handleOverlayClick}
            onPointerDown={(event) => {
              if (activeTool !== "pan") return;
              dragRef.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return;
              setPan({ x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y });
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              cursor: activeTool === "pan" ? "grab" : activeTool === "select" ? "default" : "crosshair",
            }}
          />
        </div>
      </div>
      <div style={{ position: "sticky", bottom: 0, display: "flex", gap: 8, justifyContent: "space-between", padding: 12, background: "rgba(15,23,42,0.92)", color: "#cbd5e1", fontSize: 12 }}>
        <span>FCA Native Design Engine · {String(fileFormat || "sheet").toUpperCase()}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setZoom((value) => Math.min(value + 0.1, 3))} style={controlBtnStyle}>Zoom +</button>
          <button type="button" onClick={() => setZoom((value) => Math.max(value - 0.1, 0.5))} style={controlBtnStyle}>Zoom −</button>
          <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={controlBtnStyle}>Fit</button>
        </div>
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
