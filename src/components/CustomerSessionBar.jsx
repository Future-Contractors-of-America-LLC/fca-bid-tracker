import useCustomerSession from "../hooks/useCustomerSession";
import { navigateTo } from "../navigation";
import { workspaceContext } from "../systemState";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const buttonStyle = {
  textDecoration: "none",
  background: portalTokens.ink,
  color: "#fff",
  padding: "8px 12px",
  borderRadius: portalTokens.radiusSm,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
};

export default function CustomerSessionBar({
  requestedPath,
  compact = false,
}) {
  const { session, isAuthenticated, logout } = useCustomerSession();

  if (!isAuthenticated || !session) return null;

  const resolvedPath = requestedPath || session.nextHref || "/portal/platform";

  function handleLogout() {
    logout();
    navigateTo("/login");
  }

  if (compact) {
    return (
      <div
        style={{
          ...portalCardStyle,
          marginBottom: 14,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ ...portalEyebrowStyle, marginBottom: 2 }}>{session.company}</div>
          <div style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.45 }}>
            {workspaceContext.currentNextAction}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={resolvedPath} style={buttonStyle}>Workspace</a>
          <button
            type="button"
            onClick={handleLogout}
            style={{ ...buttonStyle, background: portalTokens.panel, color: portalTokens.ink, border: `1px solid ${portalTokens.borderStrong}` }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const actions = [
    { label: "Workspace", href: resolvedPath, enabled: session.enabledProducts?.saas !== false },
    { label: "Academy", href: "/academy", enabled: session.enabledProducts?.lms !== false },
    { label: "Auricrux", href: "/portal/auricrux", enabled: session.enabledProducts?.auricrux !== false },
    { label: "Messages", href: "/portal/messages", enabled: true },
  ];

  return (
    <div style={{ ...portalCardStyle, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ ...portalEyebrowStyle, marginBottom: 6 }}>Signed in</div>
          <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: "1.125rem" }}>{session.workspaceLabel || session.company}</h3>
          <div style={{ color: portalTokens.body, lineHeight: 1.5, maxWidth: 640, fontSize: 14 }}>
            {workspaceContext.currentNextAction}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.enabled ? action.href : "/portal/profile"}
              style={{
                ...buttonStyle,
                background: action.enabled ? (action.label === "Auricrux" ? "#7c5313" : action.label === "Academy" ? portalTokens.primaryInk : portalTokens.ink) : "#cbd5e1",
                color: action.enabled ? "#fff" : "#475569",
              }}
            >
              {action.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            style={{ ...buttonStyle, background: portalTokens.panel, color: portalTokens.ink, border: `1px solid ${portalTokens.borderStrong}` }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
