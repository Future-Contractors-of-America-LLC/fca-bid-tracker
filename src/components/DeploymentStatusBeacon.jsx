import { useEffect, useMemo, useState } from "react";

const panelStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
};

function formatGitRef(gitRef = "unknown") {
  return gitRef.replace("refs/heads/", "").replace("refs/tags/", "");
}

function formatSha(gitSha = "unknown") {
  return gitSha === "pending-build" || gitSha === "local" ? gitSha : gitSha.slice(0, 7);
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
      } catch (error) {
        if (!active) return;
        setDeployment({ error: error.message });
        setStatus("failed");
      }
    }

    loadDeploymentStatus();
    return () => {
      active = false;
    };
  }, []);

  const posture = useMemo(() => {
    if (status === "loading") {
      return {
        label: "Checking live deployment",
        color: "#1d4ed8",
        detail: "Auricrux is reading the public build manifest so deployment drift is visible inside the shell instead of hiding behind the hosting layer.",
      };
    }

    if (status === "failed") {
      return {
        label: "Deployment verification unavailable",
        color: "#b91c1c",
        detail: deployment?.error || "The public shell could not read deployment-status.json.",
      };
    }

    const pendingBuild = deployment?.gitSha === "pending-build" || deployment?.generatedAt === "pending-build";
    const localBuild = deployment?.gitSha === "local";

    if (pendingBuild || localBuild) {
      return {
        label: "Stale or non-governed build exposed",
        color: "#b45309",
        detail: "The public manifest does not show a governed GitHub Actions build identity yet, which usually means the live shell is stale or was built outside the expected deployment path.",
      };
    }

    return {
      label: "Live build identity exposed",
      color: "#0f766e",
      detail: "The public shell is exposing its deployed Git SHA, ref, and workflow run so stale login or API deployments can be identified without opening the repository.",
    };
  }, [deployment, status]);

  return (
    <div style={panelStyle}>
      <div style={{ color: posture.color, fontWeight: 700, marginBottom: 8 }}>{posture.label}</div>
      <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>{posture.detail}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Git SHA</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{status === "ready" ? formatSha(deployment?.gitSha) : "Loading…"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Git ref</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{status === "ready" ? formatGitRef(deployment?.gitRef) : "Loading…"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Run ID</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{status === "ready" ? deployment?.runId || "unknown" : "Loading…"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Build source</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{status === "ready" ? deployment?.source || "unknown" : "Loading…"}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a href="/login" style={linkStyle}>Open live login route</a>
        <a href="/deployment-status.json" style={linkStyle}>Open deployment manifest</a>
        <a href="/api/customer-login" style={linkStyle}>Open customer login API route</a>
      </div>
    </div>
  );
}
