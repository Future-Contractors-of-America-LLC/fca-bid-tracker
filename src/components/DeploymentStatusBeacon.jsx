import { useEffect, useMemo, useState } from "react";

const panelStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
};

const labelStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 700,
};

function deriveAvailabilityState(status, deployment) {
  if (status === "loading") {
    return {
      label: "Checking workspace availability",
      color: "#1d4ed8",
      detail: "Auricrux is validating the public workspace surface so customers see a product status layer instead of engineering internals.",
      systemHealth: "Checking",
      releaseChannel: "Standard release",
      supportState: "Guided support standing by",
    };
  }

  if (status === "failed") {
    return {
      label: "Availability check temporarily limited",
      color: "#b45309",
      detail: "The workspace is still available, but the public status layer could not refresh its latest operating summary.",
      systemHealth: "Needs refresh",
      releaseChannel: "Standard release",
      supportState: "Auricrux guidance available",
    };
  }

  const pendingBuild = deployment?.gitSha === "pending-build" || deployment?.generatedAt === "pending-build";
  const localBuild = deployment?.gitSha === "local";

  if (pendingBuild || localBuild) {
    return {
      label: "Workspace available with guided rollout posture",
      color: "#b45309",
      detail: "The public shell is available and usable, with Auricrux keeping rollout guidance visible while deeper product layers continue advancing.",
      systemHealth: "Available",
      releaseChannel: "Guided rollout",
      supportState: "Auricrux continuity active",
    };
  }

  return {
    label: "Workspace available",
    color: "#0f766e",
    detail: "The public shell is live, customer entry is available, and Auricrux guidance remains active across the workspace surface.",
    systemHealth: "Available",
    releaseChannel: "Live public release",
    supportState: "Auricrux continuity active",
  };
}

export default function DeploymentStatusBeacon() {
  const [deployment, setDeployment] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function loadDeploymentStatus() {
      try {
        const response = await fetch("/deployment-status.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Deployment manifest request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (!active) return;
        setDeployment(payload);
        setStatus("ready");
      } catch {
        if (!active) return;
        setDeployment(null);
        setStatus("failed");
      }
    }

    loadDeploymentStatus();
    return () => {
      active = false;
    };
  }, []);

  const posture = useMemo(() => deriveAvailabilityState(status, deployment), [deployment, status]);

  return (
    <div style={panelStyle}>
      <div style={{ color: posture.color, fontWeight: 700, marginBottom: 8 }}>Workspace availability</div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{posture.label}</h3>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>{posture.detail}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={labelStyle}>System health</div>
          <div style={{ color: "#111827", fontWeight: 700, marginTop: 4 }}>{posture.systemHealth}</div>
        </div>
        <div>
          <div style={labelStyle}>Release channel</div>
          <div style={{ color: "#111827", fontWeight: 700, marginTop: 4 }}>{posture.releaseChannel}</div>
        </div>
        <div>
          <div style={labelStyle}>Guided support</div>
          <div style={{ color: "#111827", fontWeight: 700, marginTop: 4 }}>{posture.supportState}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <a href="/login" style={linkStyle}>Open workspace login</a>
        <a href="/portal/platform" style={linkStyle}>Review platform workspace</a>
        <a href="/contact" style={linkStyle}>Request guided rollout</a>
      </div>
    </div>
  );
}
