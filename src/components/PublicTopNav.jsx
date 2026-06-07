import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearCustomerSession,
  readCustomerSession,
  resolveLoginHref,
  resolveProfileHref,
  resolveWorkspaceEntryHref,
} from "../customerSession";
import { navigateTo } from "../navigation";
import { auricruxRail, currentProject, portalMessages, projectAuditEvents, workspaceContext } from "../workspaceState";
import { publicActionCatalog } from "../websiteShell";

const navShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  padding: "12px 14px",
  marginBottom: 18,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  position: "sticky",
  top: 12,
  zIndex: 40,
};

const triggerButtonStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  background: "#fff",
  padding: "10px 12px",
  fontWeight: 700,
  color: "#111827",
  cursor: "pointer",
};

const dropdownMenuStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  minWidth: 220,
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  background: "#fff",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
  overflow: "hidden",
};

const menuLinkStyle = {
  display: "block",
  textDecoration: "none",
  color: "#334155",
  padding: "10px 12px",
  borderTop: "1px solid #eef2f7",
  fontSize: 14,
  lineHeight: 1.5,
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
  background: "#ffffff",
  color: "#111827",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  border: "1px solid #cbd5e1",
};

const profileIconStyle = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#eff6ff",
  color: "#1d4ed8",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  cursor: "pointer",
};

const publicNavGroups = [
  {
    key: "explore",
    label: "Explore",
    items: [
      publicActionCatalog.platformOverview,
      publicActionCatalog.auricrux,
      publicActionCatalog.pricing,
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    items: [
      publicActionCatalog.liveTestLogin,
      publicActionCatalog.instantTestWorkspace,
      publicActionCatalog.workspace,
      publicActionCatalog.portal,
      publicActionCatalog.academy,
      publicActionCatalog.platform,
    ],
  },
  {
    key: "company",
    label: "Company",
    items: [
      publicActionCatalog.contact,
      publicActionCatalog.walkthrough,
      publicActionCatalog.bidEntry,
      publicActionCatalog.bidStatus,
    ],
  },
];

const portalNavGroups = [
  {
    key: "workspace",
    label: "Workspace",
    items: [
      publicActionCatalog.portal,
      publicActionCatalog.platform,
      publicActionCatalog.academyContinuity,
      { label: "Open Customer Profile", href: "/portal/profile", variant: "light" },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    items: [
      publicActionCatalog.projects,
      publicActionCatalog.files,
      publicActionCatalog.messages,
      { label: "Open Notifications", href: "/portal/notifications", variant: "light" },
      publicActionCatalog.billing,
    ],
  },
  {
    key: "support",
    label: "Support",
    items: [
      publicActionCatalog.support,
      publicActionCatalog.admin,
      publicActionCatalog.contact,
    ],
  },
];

const publicQuickLinks = [
  publicActionCatalog.liveTestLogin,
  publicActionCatalog.instantTestWorkspace,
  publicActionCatalog.platformOverview,
  publicActionCatalog.contact,
];

const portalQuickLinks = [
  { label: "Profile", href: "/portal/profile", variant: "primary" },
  publicActionCatalog.projects,
  publicActionCatalog.messages,
  { label: "Notifications", href: "/portal/notifications", variant: "secondary" },
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return "/";
  const stripped = value.split("#")[0].split("?")[0];
  return stripped.endsWith("/") && stripped !== "/" ? stripped.slice(0, -1) : stripped;
}

function resolveRouteCue(pathname, mode) {
  if (mode === "portal") {
    if (pathname.startsWith("/portal/profile")) return "Customer profile active";
    if (pathname.startsWith("/portal/notifications")) return "Notification continuity active";
    if (pathname.startsWith("/portal/messages")) return "Message continuity active";
    if (pathname.startsWith("/portal/projects")) return "Project execution active";
    if (pathname.startsWith("/portal/files")) return "Document spine active";
    if (pathname.startsWith("/portal/billing")) return "Revenue continuity active";
    if (pathname.startsWith("/portal/academy")) return "Academy continuity active";
    if (pathname.startsWith("/portal/support")) return "Support continuity active";
    if (pathname.startsWith("/portal/admin")) return "Admin control active";
    if (pathname.startsWith("/portal/platform")) return "Platform summary active";
    return "Workspace overview active";
  }

  if (pathname === "/platform") return "Platform framing active";
  if (pathname === "/auricrux") return "Auricrux guidance active";
  if (pathname === "/pricing") return "Rollout posture active";
  if (pathname === "/contact") return "Rollout review active";
  if (pathname === "/login") return "Login portal active";
  if (pathname === "/academy") return "Academy continuity active";
  return "Public shell entry active";
}

function renderQuickBadge(item, mode) {
  if (mode !== "portal") return null;
  if (item.href === "/portal/profile") return "Live";
  if (item.href === "/portal/notifications") return portalMessages.length + 2;
  if (item.href === "/portal/messages") return portalMessages.length;
  if (item.href === "/portal/projects") return currentProject.id;
  return null;
}

function resolveWorkspaceLabel(session, mode) {
  if (session?.authenticated) return session.workspaceLabel || `${session.company} Workspace`;
  return mode === "portal" ? "Portal Continuity Workspace" : "Public Continuity Workspace";
}

function resolveContinuityStamp(session) {
  if (session?.authenticated && session.lastLoginAt) {
    return `Last login: ${new Date(session.lastLoginAt).toLocaleString()}`;
  }
  return `Continuity stamp: ${projectAuditEvents[projectAuditEvents.length - 1]?.time || "Active"}`;
}

export default function PublicTopNav({ mode = "public" }) {
  const session = readCustomerSession();
  const currentPath = typeof window === "undefined"
    ? "/"
    : normalizePath(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  const navRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navGroups = mode === "portal" ? portalNavGroups : publicNavGroups;
  const quickLinks = mode === "portal" ? portalQuickLinks : publicQuickLinks;
  const routeCue = resolveRouteCue(currentPath, mode);
  const workspaceLabel = resolveWorkspaceLabel(session, mode);
  const continuityStamp = resolveContinuityStamp(session);
  const notificationCount = portalMessages.length + 2;
  const loginHref = resolveLoginHref();
  const workspaceHref = resolveWorkspaceEntryHref(session, mode === "portal" ? currentPath : "/portal/profile");
  const profileHref = resolveProfileHref(session);
  const actionHref = session?.authenticated ? workspaceHref : loginHref;
  const actionLabel = session?.authenticated ? "Open Workspace" : "Open Live Test Login";

  const profileLabel = session?.authenticated ? session.company : "Profile";
  const profileInitial = session?.authenticated ? session.company.charAt(0).toUpperCase() : "↗";

  const profileMenu = useMemo(
    () => [
      {
        href: profileHref,
        label: session?.authenticated ? "Open Customer Profile" : "Open Live Test Login",
      },
      {
        href: mode === "portal" ? "/portal/platform" : "/platform",
        label: mode === "portal" ? "Open Platform Dashboard" : "Open Platform Overview",
      },
      {
        href: mode === "portal" ? "/portal/notifications" : loginHref,
        label: mode === "portal" ? "Open Notifications" : "Instant Test Entry",
      },
      {
        href: mode === "portal" ? "/portal/academy" : "/academy",
        label: mode === "portal" ? "Open Academy Continuity" : "Open Academy",
      },
    ],
    [loginHref, mode, profileHref, session]
  );

  useEffect(() => {
    function handleClickAway(event) {
      if (!navRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }

    function handleResize() {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    }

    handleResize();
    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [currentPath]);

  function handleLogout() {
    clearCustomerSession();
    setOpenMenu(null);
    setMobileOpen(false);
    navigateTo(loginHref);
  }

  const menuVisible = !isMobile || mobileOpen;
  const sessionBadgeText = session?.authenticated
    ? `Live session: ${session.company}`
    : mode === "portal"
      ? "Portal continuity shell"
      : "Public continuity shell";

  return (
    <div style={navShellStyle} ref={navRef}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center", marginBottom: 12 }}>
        <div style={{ display: "grid", gap: 6, minWidth: 0, flex: "1 1 320px" }}>
          <div style={{ color: "#111827", fontWeight: 800, fontSize: 15 }}>{workspaceLabel}</div>
          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>{routeCue} · {workspaceContext.currentNextAction}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: 12,
              maxWidth: isMobile ? "100%" : 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sessionBadgeText}
          </div>

          {mode === "portal" ? (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #dbe3ef",
                background: "#fff",
                color: "#475569",
                fontWeight: 700,
                fontSize: 12,
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span>Notifications</span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {notificationCount}
              </span>
            </div>
          ) : null}

          <a href={actionHref} style={session?.authenticated ? primaryButtonStyle : secondaryButtonStyle}>{actionLabel}</a>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpenMenu((prev) => (prev === "profile" ? null : "profile"))}
              style={profileIconStyle}
              title={profileLabel}
              aria-label={profileLabel}
            >
              {profileInitial}
            </button>

            {openMenu === "profile" ? (
              <div style={{ ...dropdownMenuStyle, right: 0, left: "auto", minWidth: 260 }}>
                <div style={{ padding: "12px 12px 10px", background: "#f8fbff", borderBottom: "1px solid #eef2f7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{profileLabel}</div>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                        {session?.authenticated ? session.email : mode === "portal" ? "Portal visitor profile" : "Public visitor profile"}
                      </div>
                    </div>
                    <div style={{ ...profileIconStyle, cursor: "default" }}>{profileInitial}</div>
                  </div>
                  <div style={{ marginTop: 10, color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                    {session?.authenticated
                      ? `Auricrux is preserving live customer continuity into ${profileHref}.`
                      : mode === "portal"
                        ? "Auricrux is preserving portal continuity across authenticated workspace surfaces."
                        : "Auricrux is preserving public continuity across customer-facing entry surfaces."}
                  </div>
                  <div style={{ marginTop: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
                    Active project spine: {currentProject.id} · {workspaceContext.currentNextAction}
                  </div>
                  <div style={{ marginTop: 8, color: "#1d4ed8", fontSize: 12, lineHeight: 1.5 }}>
                    {continuityStamp} · Auricrux: {auricruxRail.nextRecommendedAction}
                  </div>
                </div>
                {profileMenu.map((item, index) => {
                  const itemPath = item.href.startsWith("mailto:") ? item.href : normalizePath(item.href);
                  const isActive = !item.href.startsWith("mailto:") && itemPath === currentPath;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      style={{
                        ...menuLinkStyle,
                        borderTop: index === 0 ? "none" : menuLinkStyle.borderTop,
                        background: isActive ? "#eff6ff" : "#fff",
                        color: isActive ? "#1d4ed8" : menuLinkStyle.color,
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
                {session?.authenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      borderTop: "1px solid #eef2f7",
                      background: "#fff",
                      color: "#991b1b",
                      padding: "10px 12px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flex: "1 1 520px" }}>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              style={{ ...triggerButtonStyle, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>Menu</span>
              <span>{mobileOpen ? "−" : "+"}</span>
            </button>
          ) : null}

          <div
            style={{
              display: menuVisible ? "flex" : "none",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              flex: "1 1 auto",
              width: isMobile ? "100%" : "auto",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            {navGroups.map((group) => (
              <div key={group.key} style={{ position: "relative", width: isMobile ? "100%" : "auto" }}>
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => (prev === group.key ? null : group.key))}
                  style={{
                    ...triggerButtonStyle,
                    background: openMenu === group.key ? "#eff6ff" : triggerButtonStyle.background,
                    color: openMenu === group.key ? "#1d4ed8" : triggerButtonStyle.color,
                    border: openMenu === group.key ? "1px solid #bfdbfe" : triggerButtonStyle.border,
                    width: isMobile ? "100%" : "auto",
                    textAlign: isMobile ? "left" : "center",
                  }}
                >
                  {group.label}
                </button>

                {openMenu === group.key ? (
                  <div style={{ ...dropdownMenuStyle, position: isMobile ? "relative" : "absolute", top: isMobile ? 8 : dropdownMenuStyle.top, width: isMobile ? "100%" : "auto" }}>
                    {group.items.map((item, index) => {
                      const itemPath = item.href.startsWith("mailto:") ? item.href : normalizePath(item.href);
                      const isActive = !item.href.startsWith("mailto:") && itemPath === currentPath;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenMenu(null)}
                          style={{
                            ...menuLinkStyle,
                            borderTop: index === 0 ? "none" : menuLinkStyle.borderTop,
                            background: isActive ? "#eff6ff" : "#fff",
                            color: isActive ? "#1d4ed8" : menuLinkStyle.color,
                            fontWeight: isActive ? 700 : 500,
                          }}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
          {quickLinks.map((item) => {
            const resolvedHref = item.href === "/login" || item.href === "/login?seeded=1" ? actionHref : item.href;
            const isActive = normalizePath(resolvedHref) === currentPath;
            const quickBadge = renderQuickBadge(item, mode);
            return (
              <a
                key={item.href}
                href={resolvedHref}
                style={{
                  textDecoration: "none",
                  padding: "9px 11px",
                  borderRadius: 999,
                  border: isActive ? "1px solid #bfdbfe" : "1px solid #dbe3ef",
                  background: isActive ? "#eff6ff" : "#fff",
                  color: isActive ? "#1d4ed8" : "#334155",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span>{item.label}</span>
                {quickBadge ? (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {quickBadge}
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
