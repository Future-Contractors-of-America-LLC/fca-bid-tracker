import { useEffect, useRef, useState } from "react";
import { probeImmersiveVrSupport } from "../../api/immersiveClient";

const panel = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 16,
  background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0f766e 100%)",
  color: "#f8fafc",
  minHeight: 220,
};

export default function ImmersiveVrViewport({ active, vrMode, onVrModeChange }) {
  const canvasRef = useRef(null);
  const [support, setSupport] = useState({ webXr: false, immersiveVr: false, recommendedMode: "desktop-simulation" });
  const [entering, setEntering] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    probeImmersiveVrSupport().then((result) => {
      if (!cancelled) setSupport(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let frame = 0;
    let rafId = 0;
    const draw = () => {
      frame += 1;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.5, "#1d4ed8");
      gradient.addColorStop(1, "#0f766e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 8; i += 1) {
        const y = ((frame * 2 + i * 40) % (height + 80)) - 40;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + 24);
        ctx.stroke();
      }
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText(sessionActive ? "VR session active — field overlay grid" : "Desktop simulation preview", 16, 28);
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(`Mode: ${vrMode}`, 16, 50);
      rafId = window.requestAnimationFrame(draw);
    };
    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [active, sessionActive, vrMode]);

  async function handleEnterVr() {
    setError("");
    if (!support.immersiveVr || !navigator.xr) {
      onVrModeChange?.("desktop-simulation");
      setSessionActive(true);
      return;
    }
    setEntering(true);
    try {
      const xrSession = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor"],
      });
      onVrModeChange?.("immersive-vr");
      setSessionActive(true);
      xrSession.addEventListener("end", () => {
        setSessionActive(false);
        onVrModeChange?.("field-overlay-lab");
      });
    } catch (vrError) {
      setError(vrError.message || "Unable to start WebXR session.");
      onVrModeChange?.("field-overlay-lab");
      setSessionActive(true);
    } finally {
      setEntering(false);
    }
  }

  return (
    <div style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>VR / field overlay viewport</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            WebXR {support.webXr ? (support.immersiveVr ? "ready" : "limited") : "unavailable"} — falls back to desktop simulation
          </div>
        </div>
        <button
          type="button"
          onClick={handleEnterVr}
          disabled={entering || !active}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            fontWeight: 700,
            cursor: active ? "pointer" : "not-allowed",
            background: "#f8fafc",
            color: "#0f172a",
          }}
        >
          {entering ? "Starting…" : support.immersiveVr ? "Enter VR lab" : "Launch simulation"}
        </button>
      </div>
      <canvas ref={canvasRef} width={960} height={220} style={{ width: "100%", height: 220, borderRadius: 10, display: "block" }} />
      {error ? <div style={{ marginTop: 10, color: "#fecaca", fontSize: 13 }}>{error}</div> : null}
    </div>
  );
}
