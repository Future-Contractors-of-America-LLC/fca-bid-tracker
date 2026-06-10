import {
  clearCustomerSession,
  readCustomerSession,
  resolveLoginHref,
  resolveProfileHref,
  resolveWorkspaceEntryHref,
} from "../customerSession";
import { navigateTo } from "../navigation";
import { portalModules, workspaceContext } from "../systemState";

const navShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  background: "#ffffff",
  padding: "14px 16px",
  marginBottom: 20,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
  position: "sticky",
  top: 12,
  zIndex: 30,
};

const utilityLinkStyle = {
  textDecoration: "none",
  color: "#475569",
  fontWeight: 700,
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 10,
};

const activeUtilityLinkStyle = {
  ...utilityLinkStyle,
  background: "#eff6ff",
  color: "#1d4ed8",
};

const taskLinkStyle = {
  textDecoration: "none",
  color: "#334155",
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid transparent",
};

const activeTaskLinkStyle = {
  ...taskLinkStyle,
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
};

const primaryButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
};

const secondaryButtonStyle = {
  textDecoration: "none",
  background: "#fff",
  color: "#0f172a",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  border: "1px solid #cbd5e1",
};

const publicPrimaryLinks = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "Pricing", href: "/pricing" },
  { label: "Academy", href: "/academy" },
  { label: "Contact", href: "/contact" },
];

const portalPrimaryLinks = [
  { label: "Dashboard", href: "/portal/platform" },
  { label: "Projects", href: "/portal/projects" },
  { label: "Bids", href: "/portal/bids" },
  { label: "Files", href: "/portal/files" },
  { label: "Messages", href: "/portal/messages" },
  { label: "Billing", href: "/portal/billing" },
  { label: "Academy", href: "/portal/academy" },
  { label: "Support", href: "/portal/support" },
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return "/";
  const stripped = value.split("#")[0].split("?")[0];
  return stripped.endsWith("/") && stripped !== "/" ? stripped.slice(0, -1) : stripped;
}

function isActivePath(currentPath, href) {
  const normalizedCurrent = normalizePath(currentPath);
  const normalizedHref = normalizePath(href);
  return normalizedCurrent === normalizedHref;
}

export default function PublicTopNav({ mode = "public" }) {
  const session = readCustomerSession();
  const currentPath = typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);
  const loginHref = resolveLoginHref();
  const workspaceHref = resolveWorkspaceEntryHref(session, "/portal/platform");
  const profileHref = resolveProfileHref(session);
  const primaryLinks = mode === "portal" ? portalPrimaryLinks : publicPrimaryLinks;
  const workspaceLabel = session?.authenticated
    ? session.workspaceLabel || session.company
    : mode === "portal"
      ? "Portal workspace"
      : "Future Contractors of America";

  function handleLogout(event) {
    event.preventDefault();
    clearCustomerSession();
    navigateTo(loginHref);
  }

  return (
    <div style={navShellStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: "#111827", marginBottom: 4 }}>{workspaceLabel}</div>
          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
            {mode === "portal" ? workspaceContext.currentNextAction : "Construction operating system"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {session?.authenticated ? <a href={profileHref} style={secondaryButtonStyle}>Profile</a> : null}
          <a href={session?.authenticated ? workspaceHref : loginHref} style={primaryButtonStyle}>
            {session?.authenticated ? "Open Workspace" : "Customer Login"}
          </a>
          {session?.authenticated ? (
            <a href={loginHref} onClick={handleLogout} style={secondaryButtonStyle}>Logout</a>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }} aria-label={mode === "portal" ? "Portal primary navigation" : "Primary navigation"}>
          {primaryLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={isActivePath(currentPath, link.href) ? activeTaskLinkStyle : taskLinkStyle}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {mode === "portal" ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {portalModules.slice(0, 3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={isActivePath(currentPath, item.href) ? activeUtilityLinkStyle : utilityLinkStyle}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <a href="/auricrux" style={isActivePath(currentPath, "/auricrux") ? activeUtilityLinkStyle : utilityLinkStyle}>Auricrux</a>
            <a href="/login" style={isActivePath(currentPath, "/login") ? activeUtilityLinkStyle : utilityLinkStyle}>Login</a>
          </div>
        )}
      </div>
    </div>
  );
}
