import { useEffect, useMemo, useRef, useState } from "react";
import { clearCustomerSession, readCustomerSession } from "../customerSession";
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

const navGroups = [
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

function normalizePath(value) {
  if (!value || typeof value !== "string") return "/";
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

export default function PublicTopNav() {
  const session = readCustomerSession();
  const profileHref = session?.authenticated ? session.nextHref || "/portal" : "/login";
  const profileLabel = session?.authenticated ? session.company : "Profile";
  const profileInitial = session?.authenticated ? session.company.charAt(0).toUpperCase() : "↗";
  const currentPath = typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);
  const navRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const profileMenu = useMemo(
    () => [
      {
        href: profileHref,
        label: session?.authenticated ? "Open Active Workspace" : "Open Login",
      },
      {
        href: "/portal/platform",
        label: "Open Platform Dashboard",
      },
      {
        href: "/academy",
        label: "Open Academy",
      },
    ],
    [profileHref, session]
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
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
          {session?.authenticated ? (
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
              Live session: {session.company}
            </div>
          ) : null}

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
              <div style={{ ...dropdownMenuStyle, right: 0, left: "auto", minWidth: 260, position: isMobile ? "absolute" : "absolute" }}>
                <div style={{ padding: "12px 12px 10px", background: "#f8fbff", borderBottom: "1px solid #eef2f7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{profileLabel}</div>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                        {session?.authenticated ? session.email : "Public visitor profile"}
                      </div>
                    </div>
                    <div style={{ ...profileIconStyle, cursor: "default" }}>{profileInitial}</div>
                  </div>
                  {session?.authenticated ? (
                    <div style={{ marginTop: 10, color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                      Auricrux is preserving live customer continuity into {profileHref}.
                    </div>
                  ) : null}
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
