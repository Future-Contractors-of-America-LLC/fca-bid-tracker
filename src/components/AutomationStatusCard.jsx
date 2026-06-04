import { useEffect, useState } from "react";

const sectionStyle = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
};

const labelStyle = {
  color: "#64748b",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.3,
  fontWeight: 700,
};

const initialStatus = {
  controller: "Auricrux system service",
  status: "Checking",
  preferredPath: "Guided automation",
  lastRunUtc: null,
  lastMode: null,
  lastOutcome: null,
};

export default function AutomationStatusCard({
  title = "System status",
  eyebrow = "Platform reliability",
  detail = "FCA keeps a lightweight live status view available so customers can see that guided system support is active.",
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const response = await fetch("/auricrux/control-plane/index.json", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) {
          setStatus({
            ...initialStatus,
            ...payload,
          });
        }
      } catch {
        // best-effort customer-visible status only
      }
    }

    loadStatus();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={sectionStyle}>
      <div style={{ ...labelStyle, marginBottom: 8 }}>{eyebrow}</div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>{detail}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, color: "#334155" }}>
        <div>
          <div style={labelStyle}>Service</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{status.controller}</div>
        </div>
        <div>
          <div style={labelStyle}>Status</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{status.status}</div>
        </div>
        <div>
          <div style={labelStyle}>Current mode</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{status.lastMode || "Standard guided support"}</div>
        </div>
        <div>
          <div style={labelStyle}>Latest result</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{status.lastOutcome || "No check recorded yet"}</div>
        </div>
      </div>

      <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.7 }}>
        <div><strong>System path:</strong> {status.preferredPath}</div>
        <div><strong>Recent system check:</strong> {status.lastRunUtc || "Awaiting the first published status check"}</div>
      </div>
    </div>
  );
}
