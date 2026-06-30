import { useCallback, useEffect, useRef, useState } from "react";

const styles = {
  page: { margin: 0, fontFamily: '"Segoe UI", system-ui, sans-serif', background: "#f8fafc", color: "#1e293b", lineHeight: 1.55 },
  header: { background: "#0f2744", color: "#fff", padding: "28px 24px" },
  wrap: { maxWidth: 900, margin: "0 auto", padding: "24px 20px 48px" },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 22, marginBottom: 20 },
  cardTitle: { margin: "0 0 12px", fontSize: "1.1rem", color: "#0f2744" },
  agreement: { maxHeight: 420, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 18px", fontSize: "0.92rem", background: "#fafbfc" },
  sigGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  sigBlock: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 },
  preSigned: { fontFamily: '"Segoe Script", "Brush Script MT", cursive', fontSize: "1.35rem", color: "#0f2744", margin: "8px 0" },
  label: { display: "block", fontWeight: 600, fontSize: "0.85rem", margin: "12px 0 4px" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.95rem" },
  canvas: { display: "block", width: "100%", height: 120, border: "1px dashed #e2e8f0", borderRadius: 6, background: "#fff", cursor: "crosshair", touchAction: "none" },
  btn: { background: "#0f2744", color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" },
  btnSecondary: { background: "#64748b", marginLeft: 8 },
  notice: { fontSize: "0.85rem", color: "#64748b" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 12, borderRadius: 8, marginTop: 12 },
  success: { background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46", padding: 16, borderRadius: 8 },
  goldBar: { height: 4, background: "#c9a227" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", margin: "10px 0" },
  th: { border: "1px solid #e2e8f0", padding: "6px 8px", textAlign: "left", background: "#f1f5f9" },
  td: { border: "1px solid #e2e8f0", padding: "6px 8px", textAlign: "left" },
};

function AgreementText() {
  return (
    <div style={styles.agreement}>
      <p>This Data Privacy Agreement governs student data for FCA Academy used by Colonial Heights Public Schools, pursuant to FERPA, COPPA, SOPIPA, VCDPA, and PPRA.</p>
      <p><strong>Collected:</strong> non-identifying username, role, course ID, lesson completion, quiz scores, hashed access timestamps.</p>
      <p><strong>Not collected:</strong> legal name, DOB, SSN, address, phone, email, parent info, biometrics, or geolocation.</p>
      <p><strong>Security:</strong> session auth, 30-minute student idle timeout, TLS, AES-256 at rest, RBAC, audit logging.</p>
      <p><strong>Breach:</strong> CHPS notified within 72 hours. <strong>Deletion:</strong> within 30 days on request. <strong>Law:</strong> Commonwealth of Virginia.</p>
    </div>
  );
}

export default function ChpsDpaSign() {
  const invite = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("invite") || "" : "";
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);
  const [authorized, setAuthorized] = useState(false);
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("Director of Innovative Learning");
  const [signatoryEmail, setSignatoryEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const signDate = new Date().toISOString().slice(0, 10);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = 120 * ratio;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f2744";
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const pos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const submit = async () => {
    setError("");
    if (!invite) return setError("Missing invite link. Use the URL from your transmittal email.");
    if (!authorized) return setError("Please confirm you are authorized to bind the district.");
    if (!signatoryName.trim() || !signatoryTitle.trim() || !signatoryEmail.trim()) return setError("Name, title, and CHPS email are required.");
    if (!hasStrokeRef.current) return setError("Please draw your signature.");
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/chps-dpa-signature?invite=${encodeURIComponent(invite)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatoryName: signatoryName.trim(),
          signatoryTitle: signatoryTitle.trim(),
          signatoryEmail: signatoryEmail.trim(),
          signatureDataUrl: canvas.toDataURL("image/png"),
          authorizedToBind: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Submission failed.");
      setConfirmationId(data.confirmationId);
    } catch (e) {
      setError(e.message || "Unable to submit. Email auricrux@futurecontractorsofamerica.com.");
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.goldBar} />
      <header style={styles.header}>
        <h1 style={{ margin: "0 0 6px", fontSize: "1.45rem" }}>Data Privacy Agreement (DPA)</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Colonial Heights Public Schools × Future Contractors of America LLC</p>
      </header>
      <div style={styles.wrap}>
        <div style={styles.card}><h2 style={styles.cardTitle}>Prepared for countersignature</h2><p style={styles.notice}>FCA has pre-executed the provider signature below.</p></div>
        <div style={styles.card}><h2 style={styles.cardTitle}>Agreement text</h2><AgreementText /></div>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Section 14 — Signatures</h2>
          <div style={styles.sigGrid}>
            <div style={styles.sigBlock}>
              <h3>Future Contractors of America LLC (pre-executed)</h3>
              <div style={styles.preSigned}>Michael J. Bartholomew</div>
              <p><strong>Title:</strong> Founder &amp; CEO<br /><strong>Date:</strong> {signDate}</p>
            </div>
            {!confirmationId && (
              <div style={styles.sigBlock}>
                <h3>Colonial Heights Public Schools</h3>
                <label style={{ display: "flex", gap: 10, fontWeight: 400 }}>
                  <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} />
                  I am authorized to bind CHPS and have read this DPA.
                </label>
                <label style={styles.label}>Printed name</label>
                <input style={styles.input} value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} placeholder="Chrissy Carr" />
                <label style={styles.label}>Title</label>
                <input style={styles.input} value={signatoryTitle} onChange={(e) => setSignatoryTitle(e.target.value)} />
                <label style={styles.label}>CHPS email</label>
                <input style={styles.input} type="email" value={signatoryEmail} onChange={(e) => setSignatoryEmail(e.target.value)} />
                <label style={styles.label}>Signature</label>
                <canvas ref={canvasRef} style={styles.canvas}
                  onMouseDown={(e) => { drawingRef.current = true; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = pos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }}
                  onMouseMove={(e) => { if (!drawingRef.current) return; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = pos(e, c); ctx.lineTo(p.x, p.y); ctx.stroke(); hasStrokeRef.current = true; e.preventDefault(); }}
                  onMouseUp={() => { drawingRef.current = false; }}
                  onTouchStart={(e) => { drawingRef.current = true; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = pos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }}
                  onTouchMove={(e) => { if (!drawingRef.current) return; const c = canvasRef.current; const ctx = c.getContext("2d"); const p = pos(e, c); ctx.lineTo(p.x, p.y); ctx.stroke(); hasStrokeRef.current = true; e.preventDefault(); }}
                  onTouchEnd={() => { drawingRef.current = false; }}
                />
                <button type="button" style={{ ...styles.btn, ...styles.btnSecondary, marginTop: 8 }} onClick={() => { hasStrokeRef.current = false; resizeCanvas(); }}>Clear</button>
                <div style={{ marginTop: 16 }}><button type="button" style={styles.btn} onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit countersignature"}</button></div>
                {error ? <div style={styles.error}>{error}</div> : null}
              </div>
            )}
          </div>
        </div>
        {confirmationId && <div style={{ ...styles.success, ...styles.card }}><h2>DPA executed</h2><p><strong>Confirmation ID:</strong> {confirmationId}</p></div>}
      </div>
    </div>
  );
}
