import { useEffect, useMemo, useRef, useState } from "react";
import { clearCustomerSession, readCustomerSession } from "../customerSession";
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

const actionButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
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
  publicActionCatalog.workspace,
  publicActionCatalog.platformOverview,
  publicActionCatalog.contact,
];

const portalQuickLinks = [
  { label: "Profile", href: "/portal/profile", variant: "primary" },
  publicActionCatalog.projects,
  publicActionCatalog.messages,
  publicActionCatalog.billing,
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return "/";
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

function resolveRouteCue(pathname, mode) {
  if (mode === "portal") {
    if (pathname.startsWith("/portal/profile")) return "Route cue: customer profile active";
    if (pathname.startsWith("/portal/messages")) return "Route cue: message continuity active";
    if (pathname.startsWith("/portal/projects")) return "Route cue: project execution active";
    if (pathname.startsWith("/portal/files")) return "Route cue: document spine active";
    if (pathname.startsWith("/portal/billing")) return "Route cue: revenue continuity active";
    if (pathname.startsWith("/portal/academy")) return "Route cue: academy continuity active";
    if (pathname.startsWith("/portal/support")) return "Route cue: support continuity active";
    if (pathname.startsWith("/portal/admin")) return "Route cue: admin control surface active";
    if (pathname.startsWith("/portal/platform")) return "Route cue: unified platform summary active";
    return "Route cue: customer workspace overview active";
  }

  if (pathname === "/platform") return "Route cue: public platform framing active";
  if (pathname === "/auricrux") return "Route cue: Auricrux public guidance active";
  if (pathname === "/pricing") return "Route cue: rollout and pricing posture active";
  if (pathname === "/contact") return "Route cue: conversion and rollout review active";
  if (pathname === "/login") return "Route cue: live customer entry active";
  if (pathname === "/academy") return "Route cue: academy public continuity active";
  return "Route cue: public shell entry active";
}

function renderQuickBadge(item, mode) {
  if (mode !== "portal") return null;
  if (item.href === "/portal/profile") return "Live";
  if (item.href === "/portal/messages") return portalMessages.length;
  if (item.href === "/portal/projects") return currentProject.id;
  if (item.href === "/portal/billing") return "Live";
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
  const profileHref = session?.authenticated ? "/portal/profile" : "/login";
  const profileLabel = session?.authenticated ? session.company : "Profile";
  const profileInitial = session?.authenticated ? session.company.charAt(0).toUpperCase() : "↗";
  const currentPath = typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);
  const navRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navGroups = mode === "portal" ? portalNavGroups : publicNavGroups;
  const quickLinks = mode === "portal" ? portalQuickLinks : publicQuickLinks;
  const routeCue = resolveRouteCue(currentPath, mode);
  const workspaceLabel = resolveWorkspaceLabel(session, mode);
  const continuityStamp = resolveContinuityStamp(session);
  const notificationCount = portalMessages.length;

  const profileMenu = useMemo(
    () => [
      {
        href: profileHref,
        label: session?.authenticated ? "Open Customer Profile" : "Open Login",
      },
      {
        href: mode === "portal" ? "/portal/platform" : "/platform",
        label: mode === "portal" ? "Open Platform Dashboard" : "Open Platform Overview",
      },
      {
        href: mode === "portal" ? "/portal/academy" : "/academy",
        label: mode === "portal" ? "Open Academy Continuity" : "Open Academy",
      },
    ],
    [mode, profileHref, session]
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
    window.location.assign("/login");
  }

  const menuVisible = !isMobile || mobileOpen;
  const sessionBadgeText = session?.authenticated
    ? `Live session: ${session.company}`
    : mode === "portal"
      ? "Portal continuity shell"
      : "Public continuity shell";

  return (
    <div style={navShellStyle} ref={navRef}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flex: "1 1 640px" }}>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            style={{ ...triggerButtonStyle, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span>Menu</span>
            <span>{mobileOpen ? "−" : "+"}</span>
          </button>

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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
              {quickLinks.map((item) => {
                const isActive = normalizePath(item.href) === currentPath;
                const quickBadge = renderQuickBadge(item, mode);
                return (
                  <a
                    key={item.href}
                    href={item.href}
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

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
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

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              fontWeight: 700,
              fontSize: 12,
              maxWidth: isMobile ? "100%" : 280,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workspaceLabel}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e5d3a1",
              background: "#fffaf0",
              color: "#8a6a14",
              fontWeight: 700,
              fontSize: 12,
              maxWidth: isMobile ? "100%" : 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {routeCue} · {workspaceContext.currentNextAction}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #dbe3ef",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 12,
              maxWidth: isMobile ? "100%" : 280,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {continuityStamp}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
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

          <a href="/login" style={actionButtonStyle}>{session?.authenticated ? "Switch Workspace" : "Login"}</a>

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
                  const itemPath = normalizePath(item.href);
                  const isActive = itemPath === currentPath;
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
    </div>
  );
}
