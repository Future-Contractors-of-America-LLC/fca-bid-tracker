import useCustomerSession from "../hooks/useCustomerSession";
import { navigateTo } from "../navigation";
import { auricruxRail, currentProject, workspaceContext } from "../systemState";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 16,
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const buttonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

export default function CustomerSessionBar({
  requestedPath,
  mode = "portal",
}) {
  const { session, isAuthenticated, logout } = useCustomerSession();

  if (!isAuthenticated || !session) return null;

  const resolvedPath = requestedPath || session.nextHref || "/portal/platform";
  const detail = mode === "login"
    ? `Customer access is live. Auricrux is preserving continuity from login into ${resolvedPath} for ${session.company}, with SaaS workspace, Academy/LMS, and Auricrux guidance enabled in the same customer shell.`
    : `Customer access is live for ${session.company}. Auricrux is preserving ${workspaceContext.currentNextAction.toLowerCase()} and ${auricruxRail.currentBlocker.toLowerCase()} inside the active workspace.`;

  function handleLogout() {
    logout();
    navigateTo("/login");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live customer session</div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{session.workspaceLabel}</h3>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>{detail}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <a href={resolvedPath} style={buttonStyle}>Open Active Workspace</a>
          <a href="/academy" style={{ ...buttonStyle, background: "#1d4ed8" }}>Open Academy / LMS</a>
          <a href="/portal/auricrux" style={{ ...buttonStyle, background: "#7c3aed" }}>Open Auricrux</a>
          <button onClick={handleLogout} style={{ ...buttonStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
        <SessionCell label="Customer email" value={session.email} />
        <SessionCell label="Customer ID" value={session.customerId || "CUST-FCA-LIVE-001"} />
        <SessionCell label="Workspace role" value={session.role || "Owner / Admin"} />
        <SessionCell label="Workspace route" value={resolvedPath} />
        <SessionCell label="Next action" value={workspaceContext.currentNextAction} />
        <SessionCell label="SaaS access" value={session.enabledProducts?.saas ? "Enabled" : "Pending"} />
        <SessionCell label="LMS access" value={session.enabledProducts?.lms ? "Enabled" : "Pending"} />
        <SessionCell label="Auricrux access" value={session.enabledProducts?.auricrux ? "Enabled" : "Pending"} />
        <SessionCell label="Auricrux continuity" value={`${currentProject.id} · ${auricruxRail.nextRecommendedAction}`} />
      </div>
    </div>
  );
}

function SessionCell({ label, value }) {
  return (
    <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#fff" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "#111827", lineHeight: 1.5, fontSize: 14 }}>{value}</div>
    </div>
  );
}
