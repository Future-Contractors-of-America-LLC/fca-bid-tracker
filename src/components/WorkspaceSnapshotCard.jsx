import { useEffect, useState } from "react";
import AuricruxNarrativeInsight from "./AuricruxNarrativeInsight";
import useWorkspaceState from "../hooks/useWorkspaceState";

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 20,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 0.3,
  textTransform: "uppercase",
};

const linkStyle = {
  display: "inline-block",
  marginTop: 14,
  textDecoration: "none",
  fontWeight: 700,
  color: "#111827",
};

const controlPlaneStyle = {
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

const initialControlPlane = {
  controller: "auricrux-control-plane",
  status: "checking",
  preferredPath: "github-actions-control-plane",
  lastRunUtc: null,
  lastMode: null,
  lastOutcome: null,
};

export default function WorkspaceSnapshotCard({
  title = "Live workspace snapshot",
  detail = "This public shell now previews the same persisted tenant and project context used inside the portal.",
  ctaHref = "/portal/platform",
  ctaLabel = "Open platform dashboard",
}) {
  const { state } = useWorkspaceState();
  const [controlPlane, setControlPlane] = useState(initialControlPlane);

  useEffect(() => {
    let active = true;

    async function loadControlPlane() {
      try {
        const response = await fetch("/auricrux/control-plane/index.json", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) {
          setControlPlane({
            ...initialControlPlane,
            ...payload,
          });
        }
      } catch {
        // keep shell continuity without blocking the public route
      }
    }

    loadControlPlane();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={cardStyle}>
      <div style={pillStyle}>Persisted shell state</div>
      <h2 style={{ marginTop: 14, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: "#334155", lineHeight: 1.7, marginTop: 0 }}>{detail}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
        <div>
          <div style={labelStyle}>Tenant</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.tenant.name}</div>
        </div>
        <div>
          <div style={labelStyle}>Project</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.project.name}</div>
        </div>
        <div>
          <div style={labelStyle}>Stage</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.project.stage}</div>
        </div>
        <div>
          <div style={labelStyle}>Auricrux</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.auricrux.systemState || state.auricrux.readinessState}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, color: "#475569", lineHeight: 1.7 }}>
        <div><strong>Next action:</strong> {state.auricrux.nextRecommendedAction}</div>
        <div><strong>Backing source:</strong> {state.meta.backingSource}</div>
        {state.meta.authenticatedCustomer ? <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer}</div> : null}
      </div>

      <div style={controlPlaneStyle}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Automation control plane</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, color: "#334155" }}>
          <div>
            <div style={labelStyle}>Controller</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{controlPlane.controller}</div>
          </div>
          <div>
            <div style={labelStyle}>Status</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{controlPlane.status}</div>
          </div>
          <div>
            <div style={labelStyle}>Last mode</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{controlPlane.lastMode || "Awaiting first governed run"}</div>
          </div>
          <div>
            <div style={labelStyle}>Last outcome</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{controlPlane.lastOutcome || "Not recorded yet"}</div>
          </div>
        </div>
        <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.7 }}>
          <div><strong>Preferred path:</strong> {controlPlane.preferredPath}</div>
          <div><strong>Last run:</strong> {controlPlane.lastRunUtc || "No heartbeat recorded yet"}</div>
        </div>
      </div>

      <AuricruxNarrativeInsight mode="snapshot" ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <a href={ctaHref} style={linkStyle}>{ctaLabel}</a>
    </div>
  );
}
