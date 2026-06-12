import {
  clearCustomerSession,
  readCustomerSession,
  resolveLoginHref,
  resolveProfileHref,
  resolveWorkspaceEntryHref,
} from "../customerSession";
import { navigateTo } from "../navigation";
import { portalModules, workspaceContext as systemWorkspaceContext } from "../systemState";
import { publicActionCatalog } from "../websiteShell";

const navShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  background: "#ffffff",
  padding: "14px 16px",
  marginBottom: 20,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
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

const publicNavGroups = [
  {
    key: "public-primary",
    label: "Public",
    items: [
      { label: "Home", href: "/" },
      { label: "Platform", href: "/platform" },
      { label: "Pricing", href: "/pricing" },
      { label: "Academy", href: "/academy" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const portalNavGroups = [
  {
    key: "portal-primary",
    label: "Portal",
    items: [
      { label: "Dashboard", href: "/portal/platform" },
      { label: "Projects", href: "/portal/projects" },
      { label: "Bids", href: "/portal/bids" },
      { label: "Estimates", href: "/portal/estimates" },
      { label: "Proposals", href: "/portal/proposals" },
      { label: "Files", href: "/portal/files" },
      { label: "Messages", href: "/portal/messages" },
      { label: "Billing", href: "/portal/billing" },
      { label: "Academy", href: "/portal/academy" },
      { label: "Support", href: "/portal/support" },
    ],
  },
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

function resolveRouteCue(pathname, mode) {
  if (mode === "portal") {
    if (pathname.startsWith("/portal/projects")) return "Project continuity active";
    if (pathname.startsWith("/portal/estimates")) return "Estimate continuity active";
    if (pathname.startsWith("/portal/proposals")) return "Proposal continuity active";
    if (pathname.startsWith("/portal/messages")) return "Communications continuity active";
    if (pathname.startsWith("/portal/billing")) return "Revenue continuity active";
    if (pathname.startsWith("/portal/academy")) return "Academy continuity active";
    return "Workspace continuity active";
  }

  if (pathname === "/platform") return "Platform framing active";
  if (pathname === "/pricing") return "Commercial rollout active";
  if (pathname === "/academy") return "Academy continuity active";
  if (pathname === "/contact") return "Guided contact route active";
  if (pathname === "/login") return "Customer login route active";
  return "Public shell entry active";
}

export default function PublicTopNav({ mode = "public" }) {
  const session = readCustomerSession();
  const currentPath = typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);
  const loginHref = resolveLoginHref();
  const workspaceHref = resolveWorkspaceEntryHref(session, "/portal/platform");
  const profileHref = resolveProfileHref(session);
  const navGroups = mode === "portal" ? portalNavGroups : publicNavGroups;
  const primaryLinks = navGroups[0]?.items || [];
  const workspaceLabel = session?.authenticated
    ? session.workspaceLabel || session.company
    : mode === "portal"
      ? "Portal workspace"
      : "Future Contractors of America";
  const routeCue = resolveRouteCue(currentPath, mode);
  const actionHref = session?.authenticated ? workspaceHref : loginHref;
  const actionLabel = session?.authenticated ? "Open Workspace" : "Customer Login";
  const internalQuickLinks = [publicActionCatalog.liveTestLogin, publicActionCatalog.instantTestWorkspace];
  const showInternalLinks = currentPath.startsWith("/login") && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "internal";
  const portalUtilityLinks = portalModules.filter((item) => ["/portal/platform", "/portal", "/portal/estimates", "/portal/proposals"].includes(item.href));

  async function handleLogout(event) {
    event.preventDefault();
    await clearCustomerSession({ server: true });
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
            {mode === "portal" ? systemWorkspaceContext.currentNextAction : "Construction operating system"}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {routeCue}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {session?.authenticated ? <a href={profileHref} style={secondaryButtonStyle}>Profile</a> : null}
          <a href={actionHref} style={primaryButtonStyle}>
            {actionLabel}
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
            {portalUtilityLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={isActivePath(currentPath, item.href) ? activeUtilityLinkStyle : utilityLinkStyle}
                title={item.description || item.label}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {showInternalLinks
              ? internalQuickLinks.map((item) => {
                  const resolvedHref = item.href === "/login" || item.href === "/login?seeded=1" ? actionHref : item.href;
                  return (
                    <a key={item.href} href={resolvedHref} style={utilityLinkStyle}>{item.label}</a>
                  );
                })
              : null}
            <a href="/auricrux" style={isActivePath(currentPath, "/auricrux") ? activeUtilityLinkStyle : utilityLinkStyle}>Auricrux</a>
            <a href="/login" style={isActivePath(currentPath, "/login") ? activeUtilityLinkStyle : utilityLinkStyle}>Login</a>
          </div>
        )}
      </div>
    </div>
  );
}
