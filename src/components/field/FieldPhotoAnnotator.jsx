import { useEffect, useMemo, useRef, useState } from "react";

export default function FieldPhotoAnnotator({ imageUrl, annotations = [], onChange, readOnly = false }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [draftPoints, setDraftPoints] = useState([]);
  const [localAnnotations, setLocalAnnotations] = useState(annotations);

  const displayAnnotations = useMemo(() => (readOnly ? annotations : localAnnotations), [annotations, localAnnotations, readOnly]);

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      for (const item of displayAnnotations) {
        drawAnnotation(ctx, canvas.width, canvas.height, item);
      }
      if (draftPoints.length > 1) {
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;
        ctx.beginPath();
        draftPoints.forEach((point, index) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    };
    img.src = imageUrl;
  }

  useEffect(() => {
    redraw();
  }, [imageUrl, displayAnnotations, draftPoints]);

  function drawAnnotation(ctx, width, height, item) {
    const color = item?.style?.color || "#dc2626";
    ctx.strokeStyle = color;
    ctx.fillStyle = `${color}33`;
    ctx.lineWidth = item?.style?.strokeWidth || 2;
    const geom = item.geometry || {};
    if (geom.kind === "cloud" || item.type === "cloud") {
      const x = (geom.x || 0) * width;
      const y = (geom.y || 0) * height;
      const w = (geom.width || 0.2) * width;
      const h = (geom.height || 0.2) * height;
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);
    } else if (geom.points?.length) {
      ctx.beginPath();
      geom.points.forEach((point, index) => {
        const px = point.x * width;
        const py = point.y * height;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    if (item.label) {
      ctx.fillStyle = color;
      ctx.font = "bold 14px Inter, Arial, sans-serif";
      ctx.fillText(item.label, (geom.x || 0.02) * width, (geom.y || 0.02) * height - 4);
    }
  }

  function handlePointerDown(event) {
    if (readOnly) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (tool === "cloud") {
      const next = [
        ...localAnnotations,
        {
          id: `ANN-${Date.now()}`,
          type: "cloud",
          label: "Field note",
          geometry: { kind: "cloud", x: Math.max(0, x - 0.08), y: Math.max(0, y - 0.06), width: 0.16, height: 0.12 },
          style: { color: "#dc2626", strokeWidth: 2 },
        },
      ];
      setLocalAnnotations(next);
      onChange?.(next);
      return;
    }
    setDraftPoints([{ x, y }]);
  }

  function handlePointerMove(event) {
    if (readOnly || tool !== "pen" || !draftPoints.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDraftPoints((points) => [...points, { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }]);
  }

  function handlePointerUp() {
    if (readOnly || tool !== "pen" || draftPoints.length < 2) {
      setDraftPoints([]);
      return;
    }
    const next = [
      ...localAnnotations,
      {
        id: `ANN-${Date.now()}`,
        type: "pen",
        label: "",
        geometry: { kind: "polyline", points: draftPoints },
        style: { color: "#2563eb", strokeWidth: 3 },
      },
    ];
    setLocalAnnotations(next);
    onChange?.(next);
    setDraftPoints([]);
  }

  if (!imageUrl) return null;

  return (
    <div>
      {!readOnly ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button type="button" onClick={() => setTool("pen")} style={{ fontWeight: 700, padding: "8px 12px", borderRadius: 8, border: tool === "pen" ? "2px solid #2563eb" : "1px solid #cbd5e1", background: "#fff" }}>Pen</button>
          <button type="button" onClick={() => setTool("cloud")} style={{ fontWeight: 700, padding: "8px 12px", borderRadius: 8, border: tool === "cloud" ? "2px solid #2563eb" : "1px solid #cbd5e1", background: "#fff" }}>Cloud</button>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxHeight: 420, borderRadius: 12, border: "1px solid #e2e8f0", touchAction: "none" }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          handlePointerDown({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}
