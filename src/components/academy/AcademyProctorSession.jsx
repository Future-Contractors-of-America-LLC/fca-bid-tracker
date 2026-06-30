import { useEffect, useState } from "react";

const card = { border: "1px solid #bfdbfe", borderRadius: 12, padding: 16, background: "#eff6ff" };

export default function AcademyProctorSession({ assessment, enrollmentId, learnerId, onStart, onComplete, proctorSession, busy = false }) {
  const [message, setMessage] = useState("");
  const delivery = assessment?.delivery || {};
  const vendor = proctorSession?.vendorSession || {};

  useEffect(() => {
    if (vendor.status === "vendor_pending_configuration") {
      setMessage(vendor.configurationHint || "Live proctor vendor pending configuration.");
    }
  }, [vendor]);

  if (!assessment || !delivery.proctorRequired) return null;

  async function handleStart() {
    setMessage("");
    try {
      const session = await onStart?.({ enrollmentId, learnerId, assessmentId: assessment.id, assessmentKind: assessment.kind || "exams" });
      if (session?.vendorSession?.launchUrl) setMessage("Proctor session initialized. Launch the secure browser window to continue.");
    } catch (error) {
      setMessage(error.message || "Unable to start proctor session.");
    }
  }

  return (
    <section style={{ ...card, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: "#1d4ed8" }}>Live proctored assessment</h3>
      <p style={{ color: "#334155", lineHeight: 1.65 }}>{assessment.title || assessment.id} requires identity verification, browser lockdown, and cheat-prevention monitoring.</p>
      <ul style={{ color: "#475569", lineHeight: 1.7 }}>
        <li>Provider: {vendor.provider || "fca_native"}</li>
        <li>Webcam required: {String(delivery.webcamRequired ?? true)}</li>
        <li>Browser lockdown: {String(delivery.browserLockdown ?? true)}</li>
      </ul>
      {!proctorSession ? (
        <button type="button" disabled={busy} onClick={handleStart} style={{ border: "1px solid #1d4ed8", background: "#1d4ed8", color: "#fff", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
          {busy ? "Starting..." : "Start proctor session"}
        </button>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ color: "#15803d", fontWeight: 700 }}>Session {proctorSession.sessionId} ({proctorSession.status})</div>
          {vendor.launchUrl ? <a href={vendor.launchUrl} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontWeight: 700 }}>Open proctor launch window</a> : null}
          <button type="button" onClick={() => onComplete?.(proctorSession)} style={{ width: "fit-content", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Mark proctor checks complete</button>
        </div>
      )}
      {message ? <p style={{ color: "#b45309", marginBottom: 0 }}>{message}</p> : null}
    </section>
  );
}
