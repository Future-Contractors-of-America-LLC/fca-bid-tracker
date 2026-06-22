import { useEffect, useRef, useState } from "react";

const buttonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#1d4ed8",
  color: "#fff",
};

export default function FieldPhotoCapture({ onCapture, busy = false, author = "field-user" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setError(err.message || "Camera unavailable — use file upload instead.");
      setCameraOn(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onCapture?.({ contentBase64: dataUrl.split(",")[1], previewUrl: dataUrl, notes, capturedBy: author, mimeType: "image/jpeg" });
    stopCamera();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = String(dataUrl).split(",")[1] || "";
      onCapture?.({ contentBase64: base64, previewUrl: dataUrl, notes, capturedBy: author, mimeType: file.type || "image/jpeg" });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#fff" }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Capture field photo</div>
      {error ? <div style={{ color: "#991b1b", marginBottom: 10 }}>{error}</div> : null}
      {cameraOn ? (
        <video ref={videoRef} playsInline muted style={{ width: "100%", maxHeight: 320, borderRadius: 12, background: "#0f172a" }} />
      ) : (
        <div style={{ padding: 24, borderRadius: 12, background: "#f8fafc", color: "#64748b", textAlign: "center" }}>
          Use camera or upload from device gallery.
        </div>
      )}
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Superintendent notes for this photo…"
        rows={2}
        style={{ width: "100%", marginTop: 12, borderRadius: 10, border: "1px solid #cbd5e1", padding: 10, boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {!cameraOn ? (
          <button type="button" style={buttonStyle} disabled={busy} onClick={startCamera}>Open camera</button>
        ) : (
          <>
            <button type="button" style={buttonStyle} disabled={busy} onClick={captureFrame}>Take picture</button>
            <button type="button" style={{ ...buttonStyle, background: "#64748b" }} onClick={stopCamera}>Close camera</button>
          </>
        )}
        <button type="button" style={{ ...buttonStyle, background: "#0f766e" }} disabled={busy} onClick={() => fileRef.current?.click()}>
          Upload photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
      </div>
    </div>
  );
}
