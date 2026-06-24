import { useEffect, useMemo, useRef, useState } from "react";
import { centralApi } from "../../api/backendBase";

function drawAnnotations(ctx, annotations, width, height) {
  if (!annotations?.length) return;
  const bounds = annotations.reduce(
    (acc, item) => {
      (item.coordinates || []).forEach(([x, y]) => {
        acc.minX = Math.min(acc.minX, x);
        acc.minY = Math.min(acc.minY, y);
        acc.maxX = Math.max(acc.maxX, x);
        acc.maxY = Math.max(acc.maxY, y);
      });
      return acc;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  const spanX = Math.max(bounds.maxX - bounds.minX, 1);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1);
  const padding = 48;

  const project = (x, y) => [
    padding + ((x - bounds.minX) / spanX) * (width - padding * 2),
    height - padding - ((y - bounds.minY) / spanY) * (height - padding * 2),
  ];

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.5;
  annotations.forEach((annotation) => {
    const coords = annotation.coordinates || [];
    if (annotation.kind === "line" && coords.length >= 2) {
      const [start, end] = coords;
      const [x1, y1] = project(start[0], start[1]);
      const [x2, y2] = project(end[0], end[1]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });
}

export default function FcasPlanViewer({
  fileId,
  activeSheet,
  markups = [],
  activeTool = "select",
  scaleLabel = "",
  onMarkupComplete,
}) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading FCA FCAS sheet…");
  const [fcasDocument, setFcasDocument] = useState(null);

  const sheet = useMemo(() => {
    const sheets = fcasDocument?.sheets || [];
    if (!sheets.length) return activeSheet;
    const match = sheets.find((item) => item.sheetId === activeSheet?.sheetId);
    return match || sheets[activeSheet?.pageIndex ?? 0] || sheets[0];
  }, [fcasDocument, activeSheet]);

  useEffect(() => {
    if (!fileId) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setStatus("Loading FCA FCAS canonical sheet…");
        const response = await fetch(centralApi(`/api/files/${encodeURIComponent(fileId)}/fcas-stream`), {
          credentials: "include",
        });
        if (!response.ok) throw new Error("FCAS stream unavailable.");
        const document = await response.json();
        if (!cancelled) {
          setFcasDocument(document);
          setStatus(document?.fcaNative ? "FCA FCAS — source of truth" : "FCAS sheet loaded");
        }
      } catch (error) {
        if (!cancelled) setStatus(error.message || "Unable to load FCAS.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet) return undefined;

    const width = sheet.width || 3024;
    const height = sheet.height || 2160;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const rasterTile = (sheet.tiles || []).find((tile) => tile.tileStreamPath || tile.blobKey);
    if (rasterTile?.tileStreamPath) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        ctx.drawImage(image, 0, 0, width, height);
        drawAnnotations(ctx, sheet.annotations || [], width, height);
      };
      image.src = centralApi(rasterTile.tileStreamPath);
      return undefined;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.fillText(sheet.name || "FCA Sheet", 48, 96);
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(sheet.discipline || "General", 48, 140);
    if (scaleLabel || sheet.scale) {
      ctx.fillText(`Scale: ${scaleLabel || sheet.scale}`, 48, 180);
    }

    drawAnnotations(ctx, sheet.annotations || [], width, height);

    markups.forEach((markup) => {
      const coords = markup.geometry?.coordinates || [];
      if (!coords.length) return;
      ctx.fillStyle = "#2563eb";
      coords.forEach(([x, y]) => {
        const px = x <= 1 ? x * width : x;
        const py = y <= 1 ? y * height : y;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    return undefined;
  }, [sheet, markups, scaleLabel]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: 640,
        border: "1px solid #dbe3ef",
        borderRadius: 12,
        overflow: "auto",
        background: "#f8fafc",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", color: "#334155", fontSize: 13 }}>
        <strong>FCA FCAS</strong> · {status}
      </div>
      <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
        <canvas
          ref={canvasRef}
          onClick={(event) => {
            if (activeTool === "select") return;
            const rect = event.currentTarget.getBoundingClientRect();
            const point = [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
            onMarkupComplete?.({ type: activeTool, geometry: { coordinates: [point] }, label: activeTool });
          }}
          style={{
            width: "min(960px, 100%)",
            height: "auto",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            cursor: activeTool === "select" ? "default" : "crosshair",
            background: "#fff",
          }}
        />
      </div>
    </div>
  );
}
