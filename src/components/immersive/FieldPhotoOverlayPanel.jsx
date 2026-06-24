import { useEffect, useRef, useState } from "react";
import { fetchFieldOverlays, saveFieldOverlay } from "../../api/immersiveClient";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 12,
  boxSizing: "border-box",
};

export default function FieldPhotoOverlayPanel({ projectId, planFiles = [], author = "portal-user" }) {
  const canvasRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [planFileId, setPlanFileId] = useState(planFiles[0]?.fileId || "");
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [title, setTitle] = useState("Site plan overlay");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [savedOverlays, setSavedOverlays] = useState([]);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;
    fetchFieldOverlays(projectId)
      .then((payload) => setSavedOverlays(payload.items || []))
      .catch(() => setSavedOverlays([]));
  }, [projectId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoDataUrl) return undefined;

    const ctx = canvas.getContext("2d");
    const photo = new Image();
    photo.onload = () => {
      canvas.width = photo.width;
      canvas.height = photo.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(photo, 0, 0);
      if (planFileId) {
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.scale(transform.scale, transform.scale);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.85)";
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, canvas.width * 0.55, canvas.height * 0.55);
        ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
        ctx.fillRect(40, 40, canvas.width * 0.55, canvas.height * 0.55);
        ctx.restore();
      }
    };
    photo.src = photoDataUrl;
    return undefined;
  }, [photoDataUrl, planFileId, transform]);

  function onPhotoSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function onCanvasPointerDown(event) {
    dragRef.current = { startX: event.clientX, startY: event.clientY, base: { ...transform } };
  }

  function onCanvasPointerMove(event) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setTransform({
      ...dragRef.current.base,
      x: dragRef.current.base.x + dx,
      y: dragRef.current.base.y + dy,
    });
  }

  function onCanvasPointerUp() {
    dragRef.current = null;
  }

  async function handleSave() {
    if (!projectId || !photoDataUrl) {
      setMessage("Add a site photo before saving.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const payload = await saveFieldOverlay(projectId, {
        title,
        notes,
        photoDataUrl,
        planFileId,
        transform,
        author,
      });
      setSavedOverlays((prev) => [payload.overlay, ...prev]);
      setMessage("Overlay saved to FCA project evidence.");
    } catch (error) {
      setMessage(error.message || "Unable to save overlay.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>FCA Field Plan Overlay</div>
      <p style={{ color: "#64748b", lineHeight: 1.65, marginTop: 0 }}>
        Align a governed plan reference over a site photo. All data stays on FCA — no external AR services.
      </p>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Site photo
        <input type="file" accept="image/*" capture="environment" onChange={onPhotoSelected} style={inputStyle} />
      </label>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Plan file reference
        <select value={planFileId} onChange={(event) => setPlanFileId(event.target.value)} style={inputStyle}>
          <option value="">Select plan file</option>
          {planFiles.map((file) => (
            <option key={file.fileId} value={file.fileId}>{file.name || file.fileId}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Overlay title
        <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Scale ({transform.scale.toFixed(2)})
        <input
          type="range"
          min="0.3"
          max="2"
          step="0.05"
          value={transform.scale}
          onChange={(event) => setTransform((prev) => ({ ...prev, scale: Number(event.target.value) }))}
          style={{ width: "100%" }}
        />
      </label>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Rotation ({transform.rotation}°)
        <input
          type="range"
          min="-45"
          max="45"
          step="1"
          value={transform.rotation}
          onChange={(event) => setTransform((prev) => ({ ...prev, rotation: Number(event.target.value) }))}
          style={{ width: "100%" }}
        />
      </label>

      <label style={{ display: "block", fontWeight: 600, color: "#334155" }}>
        Notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} style={inputStyle} />
      </label>

      {photoDataUrl ? (
        <canvas
          ref={canvasRef}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onPointerLeave={onCanvasPointerUp}
          style={{ width: "100%", maxHeight: 360, borderRadius: 12, border: "1px solid #cbd5e1", touchAction: "none" }}
        />
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={handleSave}
        style={{
          marginTop: 12,
          background: "#1d4ed8",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 16px",
          fontWeight: 700,
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Saving…" : "Save overlay to project"}
      </button>

      {message ? <div style={{ marginTop: 12, color: message.includes("Unable") ? "#991b1b" : "#15803d" }}>{message}</div> : null}

      {savedOverlays.length ? (
        <div style={{ marginTop: 16 }}>
          <strong>Saved overlays ({savedOverlays.length})</strong>
          <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 1.7 }}>
            {savedOverlays.slice(0, 5).map((item) => (
              <li key={item.id}>{item.title} · {item.createdAt?.slice(0, 10) || item.id}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
